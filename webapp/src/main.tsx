import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    Telegram: any;
  }
}

const apiBase = (import.meta as any).env.VITE_API_BASE || '';

function useInitData() {
  const [initData, setInitData] = useState<string>('');
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.expand?.();
    setInitData(tg?.initData || '');
  }, []);
  return initData;
}

function App() {
  const initData = useInitData();
  const [contractId, setContractId] = useState<string>('');
  const [type, setType] = useState<'rent'|'loan'>('rent');
  const [locale, setLocale] = useState<'ru'|'kz'>('ru');
  const [fields, setFields] = useState<any>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'X-TG-Init': initData,
  }), [initData]);

  async function createContract() {
    const res = await fetch(`${apiBase}/api/contracts`, {
      method: 'POST', headers,
      body: JSON.stringify({ type, locale })
    });
    const data = await res.json();
    setContractId(data.id);
  }

  async function saveFields() {
    const res = await fetch(`${apiBase}/api/contracts/${contractId}/fields`, {
      method: 'POST', headers,
      body: JSON.stringify({ fields })
    });
    await res.json();
  }

  async function loadPreview() {
    const res = await fetch(`${apiBase}/api/contracts/${contractId}/preview`, {
      method: 'GET', headers
    });
    const html = await res.text();
    setPreviewHtml(html);
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2>Келісім AI</h2>
      {!contractId && (
        <div>
          <div>
            <label>Тип: </label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="rent">Аренда</option>
              <option value="loan">Расписка</option>
            </select>
          </div>
          <div>
            <label>Язык: </label>
            <select value={locale} onChange={(e) => setLocale(e.target.value as any)}>
              <option value="ru">Русский</option>
              <option value="kz">Қазақша</option>
            </select>
          </div>
          <button onClick={createContract}>Создать договор</button>
        </div>
      )}
      {contractId && (
        <div>
          <h4>Поля</h4>
          <textarea placeholder="JSON полей" rows={8} style={{ width: '100%' }}
            value={JSON.stringify(fields, null, 2)}
            onChange={(e) => {
              try { setFields(JSON.parse(e.target.value)); } catch {}
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveFields}>Сохранить поля</button>
            <button onClick={loadPreview}>Превью</button>
          </div>
          {previewHtml && (
            <iframe title="preview" srcDoc={previewHtml} style={{ width: '100%', height: 400, border: '1px solid #ccc', marginTop: 8 }} />
          )}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);