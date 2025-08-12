"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { X, GraduationCap, Phone, Mail, Send } from "lucide-react";

interface EducationContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialForm = {
  name: "",
  phone: "",
  email: "",
  goals: "",
};

export default function EducationContactModal({ isOpen, onClose }: EducationContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Autofocus + ESC
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 200);
      const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
    }
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  // Валидация
  const isPhoneValid = (phone: string) => /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(phone.trim());
  const isEmailValid = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.phone) {
      setError("Заполните обязательные поля");
      setIsSubmitting(false);
      return;
    }
    if (!isPhoneValid(formData.phone)) {
      setError("Введите корректный номер телефона");
      setIsSubmitting(false);
      return;
    }
    if (!isEmailValid(formData.email)) {
      setError("Введите корректный email");
      setIsSubmitting(false);
      return;
    }

    try {
      localStorage.setItem("educationPhone", formData.phone);
      localStorage.setItem("educationName", formData.name);

      const response = await fetch("/send-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "Страница обучения - Power BI" })
      });

      if (response.ok) {
        setSuccess("✅ Ваша заявка отправлена!");
        setFormData(initialForm);
        setTimeout(onClose, 1000);
      } else {
        setError("Ошибка отправки. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI компонент поля
  const Field = ({
    label,
    name,
    type = "text",
    icon,
    ...rest
  }: {
    label: string;
    name: string;
    type?: string;
    icon?: React.ReactNode;
    [key: string]: any;
  }) => (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>}
        <input
          id={name}
          ref={name === "name" ? firstInputRef : undefined}
          type={type}
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleInputChange}
          className={`w-full ${icon ? "pl-12 pr-4" : "px-4"} py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white placeholder-white/40 focus:border-[#00F5D4] focus:outline-none transition-colors`}
          autoComplete={name}
          {...rest}
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#0B0C10] border border-[#00F5D4]/20 rounded-2xl p-6 w-full max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#00F5D4]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Заявка на обучение</h2>
                  <p className="text-sm text-white/60">Курс Power BI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Закрыть"
                type="button"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Ваше имя *" name="name" placeholder="Иван Иванов" required />
              <Field label="Телефон *" name="phone" type="tel" icon={<Phone className="w-4 h-4 text-white/40" />} placeholder="+7 (___) ___-__-__" required />
              <Field label="Email" name="email" type="email" icon={<Mail className="w-4 h-4 text-white/40" />} placeholder="ivan@example.com" />
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="goals">
                  Цели обучения
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1F2833] border border-[#00F5D4]/20 rounded-xl text-white placeholder-white/40 focus:border-[#00F5D4] focus:outline-none transition-colors"
                  rows={2}
                  placeholder="Расскажите, чего хотите достичь на курсе"
                />
              </div>

              {(error || success) && (
                <div className={`text-sm rounded-lg px-4 py-2 ${error ? "bg-red-700/30 text-red-300" : "bg-emerald-700/30 text-emerald-200"}`}>
                  {error || success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00F5D4] text-[#181e1d] font-semibold py-4 px-6 rounded-xl hover:bg-[#18eac2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#181e1d] border-t-transparent rounded-full animate-spin"></div>
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Записаться на курс
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-white/40">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
