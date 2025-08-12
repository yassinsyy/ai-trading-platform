// src/components/QuickContactModal.tsx
import React, { useState, useRef, useEffect } from 'react';

interface QuickContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickContactModal({ isOpen, onClose }: QuickContactModalProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) firstInputRef.current.focus();
    if (isOpen) setStatus('idle');
  }, [isOpen]);

  // Form validation
  const validate = () => {
    const errs: any = {};
    if (!form.name) errs.name = 'Укажите имя';
    if (!form.phone.match(/^(\+7|7|8)[0-9]{10,}$/)) errs.phone = 'Телефон некорректен';
    return errs;
  };

  // Handle submission
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
      const res = await fetch('/send-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: "Главная страница - Позвоните мне"
        }),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({
          name: '',
          phone: '',
        });
        localStorage.setItem("quickPhone", form.phone);
        localStorage.setItem("quickName", form.name);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 mobile-safe-top padding-safe"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-contact-modal-title"
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

        <h2 id="quick-contact-modal-title" className="text-xl font-bold text-white mb-6">Позвоните мне</h2>

        {status === 'sent' ? (
          <div className="text-[#00F5D4] text-center text-lg font-semibold">
            ✅ Ваша заявка успешно отправлена!
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Имя *
              </label>
              <input
                className={`w-full px-4 py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white placeholder-white/40 focus:border-[#00F5D4] focus:outline-none transition-colors ${errors.name ? 'border-red-500' : ''}`}
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                ref={firstInputRef}
                autoFocus
                placeholder="Ваше имя"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <span className="text-xs text-red-500 mt-1" id="name-error">{errors.name}</span>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Телефон *
              </label>
              <input
                className={`w-full px-4 py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white placeholder-white/40 focus:border-[#00F5D4] focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : ''}`}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+7 777 777 77 77"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && <span className="text-xs text-red-500 mt-1" id="phone-error">{errors.phone}</span>}
            </div>

            {serverError && <div className="text-red-500 text-sm mb-4">{serverError}</div>}

            <button
              className={`w-full bg-[#00F5D4] text-black font-semibold rounded-xl py-4 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${status === 'sending' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#18eac2]'}`}
              type="submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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