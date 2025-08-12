"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    user_phone: "",
    user_email: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.user_phone) {
      alert("Введите телефон!");
      setIsSubmitting(false);
      return;
    }

    try {
      // Сохраняем телефон в localStorage
      localStorage.setItem("userPhone", formData.user_phone);

      // Отправляем в Telegram
      const response = await fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.user_phone,
          email: formData.user_email,
          comment: formData.message
        })
      });

      if (response.ok) {
        alert("✅ Спасибо! Ваша заявка успешно отправлена.");
        setFormData({
          user_name: "",
          user_phone: "",
          user_email: "",
          message: ""
        });
        onClose();
      } else {
        alert("❌ Ошибка отправки.");
      }
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("❌ Ошибка соединения.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Закрыть">
              ✕
            </button>
            
            <h2>Оставить заявку</h2>
            
            <form id="contactForm" onSubmit={handleSubmit}>
              <input
                type="text"
                name="user_name"
                placeholder="Ваше имя"
                value={formData.user_name}
                onChange={handleInputChange}
                required
              />
              
              <input
                type="tel"
                name="user_phone"
                placeholder="+7 (___) ___-__-__"
                value={formData.user_phone}
                onChange={handleInputChange}
                required
              />
              
              <input
                type="email"
                name="user_email"
                placeholder="Email (опционально)"
                value={formData.user_email}
                onChange={handleInputChange}
              />
              
              <textarea
                name="message"
                placeholder="Комментарий"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? "Отправка..." : "Отправить заявку"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 