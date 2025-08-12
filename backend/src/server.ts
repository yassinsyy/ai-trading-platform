import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode';

const app = express();
app.use(cors());
app.use(compression());
app.use(bodyParser.json({ limit: '4mb' }));

// In-memory stubs (replace with Postgres)
const contracts: Record<string, any> = {};
const payments: Record<string, any> = {};

// Verify Telegram WebApp init data
function verifyInitData(initData: string, botToken: string): boolean {
  const url = new URLSearchParams(initData);
  const hash = url.get('hash');
  if (!hash) return false;
  url.delete('hash');
  const dataCheckString = Array.from(url.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  const calcHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(calcHash));
  } catch {
    return false;
  }
}

function requireInitData(req: express.Request, res: express.Response, next: express.NextFunction) {
  const initData = (req.headers['x-tg-init'] || req.query.initData || '') as string;
  if (!process.env.TELEGRAM_BOT_TOKEN) return res.status(500).json({ error: 'BOT_TOKEN not set' });
  if (!initData || !verifyInitData(initData, process.env.TELEGRAM_BOT_TOKEN)) {
    return res.status(401).json({ error: 'invalid initData' });
  }
  (req as any).initData = initData;
  next();
}

// Utils
function docHash(payload: any) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

app.post('/api/contracts', requireInitData, (req, res) => {
  const { type, locale } = req.body || {};
  if (!['rent', 'loan'].includes(type)) return res.status(400).json({ error: 'invalid type' });
  const id = randomUUID();
  const publicId = randomUUID();
  const c = {
    id,
    publicId,
    type,
    status: 'draft',
    templateVersion: 'v1.0',
    fields: {},
    locale: locale || 'ru',
    createdAt: new Date().toISOString(),
  };
  contracts[id] = c;
  res.status(201).json(c);
});

app.post('/api/contracts/:id/fields', requireInitData, (req, res) => {
  const c = contracts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  const { fields } = req.body || {};
  // TODO: integrate AI normalization; for now, accept provided fields
  c.fields = fields || {};
  c.status = 'preview';
  res.json(c);
});

app.get('/api/contracts/:id/preview', requireInitData, async (req, res) => {
  const c = contracts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  const hash = docHash({ type: c.type, fields: c.fields, templateVersion: c.templateVersion });
  const qrUrl = `${process.env.TELEGRAM_WEBAPP_URL?.replace(/\/$/, '')}/verify/${c.publicId}`;
  const qrPng = await QRCode.toDataURL(qrUrl);
  const html = `<!doctype html><html><meta charset="utf-8"/><body>
    <h1>Превью договора (${c.type})</h1>
    <pre>${JSON.stringify(c.fields, null, 2)}</pre>
    <p>Контрольная сумма: ${hash}</p>
    <img src="${qrPng}" width="120"/>
    <p>Водяной знак: НЕ ОПЛАЧЕНО</p>
  </body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.post('/api/contracts/:id/pay', requireInitData, (req, res) => {
  const c = contracts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  const payId = randomUUID();
  payments[payId] = { id: payId, contractId: c.id, status: 'pending' };
  // TODO: integrate Telegram Payments or external provider
  const invoiceLink = `https://pay.local/invoice/${payId}`;
  res.json({ invoiceLink });
});

app.post('/webhooks/payments/:provider', (req, res) => {
  const { invoiceId, status } = req.body || {};
  const p = payments[invoiceId];
  if (p && status === 'paid') {
    p.status = 'paid';
    const c = contracts[p.contractId];
    if (c) c.status = 'paid';
  }
  res.json({ ok: true });
});

app.post('/api/contracts/:id/sign/a', requireInitData, (req, res) => {
  const c = contracts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  const { signaturePng, otp } = req.body || {};
  if (!signaturePng || !otp) return res.status(400).json({ error: 'signature and otp required' });
  c.signedA = { at: new Date().toISOString(), method: 'pep_sms' };
  c.status = 'signed_a';
  res.json({ ok: true });
});

app.post('/api/contracts/:id/invite', requireInitData, (req, res) => {
  const c = contracts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  const token = randomUUID();
  c.inviteToken = token;
  const inviteUrl = `${process.env.TELEGRAM_WEBAPP_URL?.replace(/\/$/, '')}/app?sid=${token}`;
  res.json({ inviteUrl });
});

app.post('/api/contracts/:id/sign/b', (req, res) => {
  const c = contracts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  const { token, signaturePng, otp } = req.body || {};
  if (token !== c.inviteToken) return res.status(401).json({ error: 'invalid token' });
  if (!signaturePng || !otp) return res.status(400).json({ error: 'signature and otp required' });
  c.signedB = { at: new Date().toISOString(), method: 'pep_sms' };
  c.status = 'issued';
  res.json({ ok: true });
});

app.get('/verify/:publicId', (req, res) => {
  const c = Object.values(contracts).find((x) => x.publicId === req.params.publicId);
  if (!c) return res.status(404).json({ error: 'not found' });
  const info = {
    type: c.type,
    status: c.status,
    partiesMasked: ['Сторона A', 'Сторона B'],
    signedAt: [c.signedA?.at, c.signedB?.at].filter(Boolean),
    docSha256: docHash({ type: c.type, fields: c.fields, templateVersion: c.templateVersion }),
  };
  res.json(info);
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${port}`);
});