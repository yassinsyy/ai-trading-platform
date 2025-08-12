"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import TelegramForm from "./TelegramForm";

export default function StickyCTA() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleOpenForm = () => {
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  return (
    <>
      {/* Sticky CTA кнопка */}
      <div className="sticky-cta">
        <motion.button
          onClick={handleOpenForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Оставить заявку
        </motion.button>
      </div>

      {/* Telegram Form */}
      <TelegramForm 
        isOpen={isFormVisible}
        onClose={handleCloseForm}
        title="Оставить заявку"
        subtitle="Заполните форму и мы свяжемся с вами в течение 24 часов"
        buttonText="Отправить заявку"
      />
    </>
  );
} 