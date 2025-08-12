"use client";

import { motion } from "framer-motion";
import { BarChart, FileText, Bot, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; 

const services = [
  {
    title: "BI‑системы под ключ",
    description: "От данных к решениям: проектируем и внедряем BI‑системы, которые помогают собственникам управлять бизнесом на основе цифр. Полная автоматизация процессов принятия решений.",
    icon: <BarChart className="w-8 h-8" />,
    cta: "Узнать кейсы",
    isNew: false,
    badge: "Популярная",
  },
  {
    title: "Автоматизация отчётности",
    description: "Избавляем от рутины: создаём автоматизированные отчёты, которые экономят время и исключают человеческие ошибки. Интеграция с любыми источниками данных.",
    icon: <FileText className="w-8 h-8" />,
    cta: "Смотреть пример отчёта",
    isNew: false,
    badge: "Эффективная",
  },
  {
    title: "AI‑аналитик для бизнеса",
    description: "Автоматически подключается к 1С, Excel, API и вашей базе данных, чтобы собирать, структурировать и анализировать данные — без ручной работы и хаоса.",
    icon: <Bot className="w-8 h-8" />,
    cta: "Подробнее",
    isNew: true,
    badge: "Новая услуга",
  },
  {
    title: "Аналитика продаж",
    description: "Выявляем скрытые возможности: анализируем воронки продаж, сегментируем клиентов, находим точки роста. Прогнозирование и оптимизация продаж.",
    icon: <TrendingUp className="w-8 h-8" />,
    cta: "Узнать кейсы",
    isNew: false,
    badge: "Результативная",
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section className="services-section" id="services">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="services-title">Наши услуги</h2>
          <h3 className="services-subtitle">
            Комплексные BI‑решения для роста вашего бизнеса и прозрачного управления
          </h3>
          
          {/* Dashboard Image */}
          <motion.div
            className="services-dashboard"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <img 
              src="/dashboard.png" 
              alt="BI-аналитика в Казахстане | DIM PARTNERS" 
              className="dashboard-image"
            />
          </motion.div>
        </motion.div>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={`service-card ${service.isNew ? 'new-service' : 'enhanced-service'}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0, 245, 212, 0.2)"
              }}
            >
              <div className="service-badge">{service.badge}</div>
              <div className="service-gradient-line"></div>
              <div className="service-icon">
                {service.icon}
              </div>
              <h3 className="service-title">
                {service.title}
              </h3>
              <p className="service-description">{service.description}</p>
              <motion.button
                onClick={() => {
                  if (service.title === "BI‑системы под ключ") {
                    navigate('/dashboard');
                  } else {
                    // Для других услуг показываем модальное окно
                    const modal = document.querySelector('.modal') as HTMLElement;
                    if (modal) {
                      modal.style.display = 'flex';
                    }
                  }
                }}
                className="btn btn-secondary service-cta"
                whileHover={{ x: 4 }}
              >
                {service.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* CTA блок */}
        <motion.div
          className="services-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="cta-content">
            <h3 className="cta-title">Готовы обсудить внедрение BI?</h3>
            <p className="cta-subtitle">Свяжитесь с нами для консультации</p>
            <motion.a
              href="#contact"
              className="btn btn-primary cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Связаться с нами
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 