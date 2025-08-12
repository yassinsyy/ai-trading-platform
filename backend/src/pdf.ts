import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { createHash } from 'crypto';

export interface PdfInput {
  contractId: string;
  publicId: string;
  type: 'rent'|'loan';
  templateVersion: string;
  fields: Record<string, any>;
  signatures: Array<{ party: string; method: string; at: string }>;
  verifyUrl: string;
}

export async function generateContractPdf(input: PdfInput): Promise<Buffer> {
  const { contractId, publicId, type, templateVersion, fields, signatures, verifyUrl } = input;
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Title
  doc.fontSize(18).text(`Договор: ${type === 'rent' ? 'Аренда' : 'Расписка'}`, { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#666').text(`Версия шаблона: ${templateVersion}`);
  doc.fillColor('#000');
  doc.moveDown();

  // Fields (simple dump for M0)
  doc.fontSize(12).text('Условия:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  Object.entries(fields || {}).forEach(([k, v]) => {
    const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
    doc.text(`${k}: ${val}`);
  });

  doc.addPage();
  // Signature certificate
  doc.fontSize(14).text('Сертификат подписи', { underline: true });
  doc.moveDown(0.5);
  const payloadHash = createHash('sha256')
    .update(JSON.stringify({ type, fields, templateVersion }))
    .digest('hex');
  doc.fontSize(10).text(`Контрольная сумма (SHA-256): ${payloadHash}`);
  doc.text(`Public ID: ${publicId}`);
  doc.moveDown(0.5);

  signatures.forEach((s, i) => {
    doc.text(`Подпись ${i + 1}: сторона=${s.party}, метод=${s.method}, время=${s.at}`);
  });

  const qrDataUrl = await QRCode.toDataURL(verifyUrl);
  const qrBase64 = qrDataUrl.split(',')[1];
  const qrBuf = Buffer.from(qrBase64, 'base64');
  const qrPath = path.join('/tmp', `qr_${contractId}.png`);
  fs.writeFileSync(qrPath, qrBuf);
  doc.moveDown(1);
  doc.text('Проверка подлинности по QR:');
  doc.image(qrPath, { width: 120 });

  doc.end();
  return done;
}