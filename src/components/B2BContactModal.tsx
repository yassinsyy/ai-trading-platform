"use client";

import React, { useState, useRef, useEffect } from 'react';

// Опции для услуг
const SERVICE_OPTIONS = [
  { value: '', label: 'Выберите услугу' },
  { value: 'bi', label: 'Внедрение BI-систем' },
  { value: 'outsourcing', label: 'CFO-аутсорсинг' },
  { value: 'training', label: 'Обучение' },
  { value: 'other', label: 'Другое' },
];

// Универсальный Input-компонент
const Input = React.forwardRef<any, any>((
  { label, name, type = 'text', value, onChange, error, required, ...rest },
  ref
) => (
  <label className="block mb-4">
    <span className="text-sm font-medium text-white/80">{label}{required && ' *'}</span>
    <input
      className={`w-full px-4 py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white placeholder-white/40 focus:border-[#00F5D4] focus:outline-none transition-colors mt-1 ${error ? 'border-red-500' : ''}`}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      {...rest}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      ref={ref}
    />
    {error && <span className="text-xs text-red-500 mt-1" id={`${name}-error`}>{error}</span>}
  </label>
));

// Универсальный Select-компонент
const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
}: any) => (
  <label className="block mb-4">
    <span className="text-sm font-medium text-white/80">{label}{required && ' *'}</span>
    <select
      className={`w-full px-4 py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white focus:border-[#00F5D4] focus:outline-none transition-colors mt-1 ${error ? 'border-red-500' : ''}`}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="text-xs text-red-500 mt-1" id={`${name}-error`}>{error}</span>}
  </label>
);

// Сам компонент модального окна
export default function B2BContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    service: '',
    comment: '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) firstInputRef.current.focus();
    if (isOpen) setStatus('idle');
  }, [isOpen]);

  // Валидация формы
  const validate = () => {
    const errs: any = {};
    if (!form.company) errs.company = 'Укажите компанию';
    if (!form.name) errs.name = 'Имя обязательно';
    if (!form.phone.match(/^(\+7|7|8)[0-9]{10,}$/)) errs.phone = 'Телефон некорректен';
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = 'Email некорректен';
    if (!form.service) errs.service = 'Выберите услугу';
    return errs;
  };

  // Обработка отправки
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/send-b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: "Главная страница - B2B заявка"
        }),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({
          company: '',
          name: '',
          phone: '',
          email: '',
          service: '',
          comment: '',
        });
        // Сохраняем данные в localStorage
        localStorage.setItem("b2bPhone", form.phone);
        localStorage.setItem("b2bCompany", form.company);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setServerError(data.message || 'Ошибка отправки');
      }
    } catch {
      setStatus('error');
      setServerError('Ошибка сети');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 mobile-safe-top padding-safe"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="bg-[#0B0C10] border border-[#00F5D4]/20 rounded-2xl p-6 w-full max-w-md mx-auto mobile-container"
        style={{ minWidth: 340 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 text-white/60 hover:text-white focus:outline-none"
          aria-label="Закрыть"
          onClick={onClose}
          disabled={status === 'sending'}
        >
          ×
        </button>
        
        <h2 id="contact-modal-title" className="text-xl font-bold text-white mb-6">Оставьте заявку</h2>
        
        {status === 'sent' ? (
          <div className="text-[#00F5D4] text-center text-lg font-semibold">
            ✅ Ваша заявка успешно отправлена!
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Компания"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              error={errors.company}
              ref={firstInputRef}
              autoFocus
              placeholder="ООО Рога и Копыта"
            />
            <Input
              label="Ваше имя"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              error={errors.name}
              placeholder="Иван Иванов"
            />
            <Input
              label="Телефон"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              type="tel"
              placeholder="+7 777 777 77 77"
              error={errors.phone}
            />
            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              error={errors.email}
              placeholder="ivan@company.com"
            />
            <Select
              label="Услуга"
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              options={SERVICE_OPTIONS}
              error={errors.service}
            />
            <label className="block mb-4">
              <span className="text-sm font-medium text-white/80">Комментарий</span>
              <textarea
                className="w-full px-4 py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white placeholder-white/40 focus:border-[#00F5D4] focus:outline-none transition-colors mt-1 resize-none"
                name="comment"
                value={form.comment}
                onChange={handleChange}
                rows={3}
                maxLength={300}
                aria-label="Комментарий"
                placeholder="Опишите ваши задачи и цели проекта..."
              />
            </label>
            {serverError && <div className="text-red-500 text-sm mb-2">{serverError}</div>}
            <button
              className={`w-full bg-[#00F5D4] text-[#181e1d] font-semibold rounded-xl py-4 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${status === 'sending' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#18eac2]'}`}
              type="submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#181e1d] border-t-transparent rounded-full animate-spin"></div>
                  Отправка...
                </>
              ) : (
                'Отправить заявку'
              )}
            </button>
          </form>
        )}
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
          </p>
        </div>
      </div>
    </div>
  );
} 