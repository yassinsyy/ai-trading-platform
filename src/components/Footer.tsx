"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Linkedin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import ContactModal from "./ContactModal";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Колонка 1: Бренд + ценность */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="DIM Partners" className="logo-img" />
              <span className="logo-text">DIM PARTNERS</span>
            </div>
            <p className="footer-description">
              Помогаем бизнесу расти с помощью BI‑систем и управленческой аналитики.
            </p>
            <p className="footer-stats">
              50+ проектов в ритейле, производстве и сфере услуг.
            </p>
          </div>

          {/* Колонка 2: Навигация */}
          <div className="footer-nav">
            <h4 className="footer-title">Навигация</h4>
            <nav className="footer-menu">
              <a href="#services" className="footer-link">Услуги</a>
              <a href="#about" className="footer-link">О нас</a>
              <a href="#team" className="footer-link">Команда</a>
              <a href="#cases" className="footer-link">Кейсы</a>
              <a href="#contact" className="footer-link">Контакты</a>
            </nav>
          </div>

          {/* Колонка 3: Контакты */}
          <div className="footer-contacts">
            <h4 className="footer-title">Контакты</h4>
            <div className="contact-item">
              <Mail className="contact-icon" />
              <a href="mailto:yerassyl.s@dim-partners.kz" className="contact-link">
                yerassyl.s@dim-partners.kz
              </a>
            </div>
            <div className="contact-item">
              <MapPin className="contact-icon" />
              <span className="contact-text">
                г. Астана, ул. Култегин, 5
              </span>
            </div>
          </div>

          {/* Колонка 4: CTA + соцсети */}
          <div className="footer-cta">
            <h4 className="footer-title">Связаться</h4>
            <motion.button
              className="btn btn-secondary footer-cta-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
            >
              Связаться
            </motion.button>
            
            <div className="social-links">
              <motion.a
                href="https://linkedin.com/company/dim-partners"
                className="social-link"
                whileHover={{ scale: 1.1, color: "#66FCF1" }}
                aria-label="LinkedIn"
              >
                <Linkedin className="social-icon" />
              </motion.a>
              <motion.a
                href="mailto:yerassyl.s@dim-partners.kz"
                className="social-link"
                whileHover={{ scale: 1.1, color: "#66FCF1" }}
                aria-label="Email"
              >
                <MessageCircle className="social-icon" />
              </motion.a>
              <motion.a
                href="tel:+77771234567"
                className="social-link"
                whileHover={{ scale: 1.1, color: "#66FCF1" }}
                aria-label="Phone"
              >
                <Phone className="social-icon" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Нижняя плашка */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © D Partners Co. 2025. Все права защищены.
          </div>
          <div className="footer-legal">
            <a href="/privacy" className="legal-link">Политика конфиденциальности</a>
            <a href="/terms" className="legal-link">Условия использования</a>
          </div>
        </div>
      </div>
      
      {/* Модальное окно */}
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </footer>
  );
} 