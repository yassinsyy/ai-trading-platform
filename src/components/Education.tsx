import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Award, 
  Star,
  CheckCircle,
  Target,
  Zap,
  Shield,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import EducationContactModal from './EducationContactModal';
import './Education.css';

export default function Education() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="education-page">
      {/* Hero Section */}
      <section className="education-hero-section">
        <div className="container">
          <div className="education-hero-content">
            <div className="education-hero-text">
              <div className="badge">Обучение</div>
              <h1>
                <span className="accent">Power BI обучение</span> с нуля - курсы Power BI онлайн в Казахстане
              </h1>
              <p>
                Сертифицированный курс Power BI для финансистов и бухгалтеров. Обучение аналитике данных, 
                построению дашбордов и автоматизации отчетности. Power BI курсы с сертификатом на русском языке.
              </p>
              <div className="education-hero-buttons">
                <button 
                  className="btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Записаться на курс
                </button>
                <button className="btn-secondary">
                  Узнать программу
                </button>
              </div>
            </div>
            
            <div className="education-hero-visual">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="dashboard-frame">
                  <div className="dashboard-content">
                    <div className="chart"></div>
                    <div className="chart small"></div>
                    <div className="chart"></div>
                  </div>
                </div>
                <div className="dashboard-caption">
                  Пример живого Power BI дашборда
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="target-audience-section">
        <div className="container">
          <h2>Power BI курс для финансистов и бухгалтеров</h2>
          <div className="audience-grid">
            <motion.div 
              className="audience-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Users size={48} />
              </div>
              <h3>Руководители и собственники</h3>
              <p>Хотите принимать обоснованные решения на основе данных и контролировать эффективность бизнеса</p>
            </motion.div>

            <motion.div 
              className="audience-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <BarChart3 size={48} />
              </div>
              <h3>Аналитики и финансисты</h3>
              <p>Обучение аналитике для финансистов. Как автоматизировать отчеты в Excel и строить дашборды в Power BI</p>
            </motion.div>

            <motion.div 
              className="audience-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Target size={48} />
              </div>
              <h3>IT-специалисты</h3>
              <p>Курсы аналитики данных с нуля. Как связать Power BI с 1С и освоить визуализацию данных</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="why-us-section">
        <div className="container">
          <h2>Почему выбирают нас</h2>
          <div className="why-us-grid">
            <motion.div 
              className="why-us-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <TrendingUp size={48} />
              </div>
              <div className="number">50+</div>
              <p>Реализованных проектов в различных отраслях бизнеса</p>
            </motion.div>

            <motion.div 
              className="why-us-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Award size={48} />
              </div>
              <div className="number">5</div>
              <p>Лет опыта в BI-аналитике и управленческом учете</p>
            </motion.div>

            <motion.div 
              className="why-us-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Star size={48} />
              </div>
              <div className="number">4.9</div>
              <p>Средняя оценка от участников наших программ</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEO-optimized Content Section */}
      <section className="seo-content-section">
        <div className="container">
          <h2>Курс Power BI + Excel - Обучение построению отчетов</h2>
          <div className="seo-content-grid">
            <div className="seo-content-card">
              <h3>Как научиться работать в Power BI</h3>
              <p>Наш сертифицированный курс Power BI включает интенсив по Power BI с практическими уроками Power BI. Изучение Power BI пошагово поможет вам освоить визуализацию данных и построение дашбордов.</p>
              <ul>
                <li>Power BI обучение с нуля для начинающих</li>
                <li>Как построить отчеты в Power BI</li>
                <li>Как сделать P&L отчет в Power BI</li>
                <li>Обучение построению KPI дашбордов</li>
              </ul>
            </div>
            
            <div className="seo-content-card">
              <h3>Курс по финансовой аналитике и Power BI</h3>
              <p>Специальный курс для бухгалтеров и финансистов. Аналитика в Power BI для бухгалтеров включает обучение построению управленческой отчетности и автоматизации отчетов из 1С.</p>
              <ul>
                <li>Курс по построению управленческой отчетности</li>
                <li>Аналитика в Power BI для бухгалтеров</li>
                <li>Как автоматизировать отчеты в Excel</li>
                <li>Курсы по визуализации данных</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section className="program-section">
        <div className="container">
          <h2>Программа обучения Power BI</h2>
          <div className="program-grid">
            <motion.div 
              className="program-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <BookOpen size={48} />
              </div>
              <h3>Модуль 1: Основы BI-аналитики</h3>
              <p>Понятие BI-систем, типы аналитики, архитектура решений. Практика: анализ требований к BI-системе</p>
            </motion.div>

            <motion.div 
              className="program-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <BarChart3 size={48} />
              </div>
              <h3>Модуль 2: Power BI</h3>
              <p>Создание дашбордов, работа с данными, визуализация. Практика: построение KPI-дашборда</p>
            </motion.div>

            <motion.div 
              className="program-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Zap size={48} />
              </div>
              <h3>Модуль 3: Управленческая аналитика</h3>
              <p>KPI, метрики, отчетность. Практика: разработка системы показателей</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Format Section */}
      <section className="learning-format-section">
        <div className="container">
          <h2>Формат обучения</h2>
          <div className="format-grid">
            <motion.div 
              className="format-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Clock size={48} />
              </div>
              <h3>Онлайн-формат</h3>
              <p>Учитесь в удобное время из любой точки мира с доступом к материалам 24/7</p>
            </motion.div>

            <motion.div 
              className="format-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Users size={48} />
              </div>
              <h3>Практические задания</h3>
              <p>Реальные кейсы и проекты для закрепления навыков и создания портфолио</p>
            </motion.div>

            <motion.div 
              className="format-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Shield size={48} />
              </div>
              <h3>Поддержка экспертов</h3>
              <p>Консультации с практикующими BI-аналитиками и разбор ваших проектов</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="container">
          <h2>Результаты обучения</h2>
          <div className="results-grid">
            <motion.div 
              className="results-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <CheckCircle size={48} />
              </div>
              <h3>Создание дашбордов</h3>
              <p>Научитесь строить интерактивные KPI-дашборды в Power BI</p>
            </motion.div>

            <motion.div 
              className="results-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Lightbulb size={48} />
              </div>
              <h3>Аналитическое мышление</h3>
              <p>Разовьете навыки анализа данных и принятия решений</p>
            </motion.div>

            <motion.div 
              className="results-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <Award size={48} />
              </div>
              <h3>Сертификат</h3>
              <p>Получите сертификат о прохождении курса и портфолио проектов</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>Отзывы участников</h2>
          <div className="testimonials-grid">
            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p>"Курс полностью изменил мой подход к аналитике. Теперь я могу создавать дашборды, которые действительно помогают принимать решения."</p>
              <div className="testimonial-author">
                <strong>Алексей Петров</strong>
                <span>Финансовый директор, ООО "Розничная сеть"</span>
              </div>
            </motion.div>

            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p>"Практические задания помогли сразу применить знания в работе. Теперь я автоматизирую отчетность и экономлю время."</p>
              <div className="testimonial-author">
                <strong>Мария Сидорова</strong>
                <span>Аналитик, ИП "Производство"</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Готовы начать обучение?</h2>
            <p>Присоединяйтесь к курсу и получите навыки, которые помогут вашему бизнесу расти</p>
            <div className="cta-buttons">
              <button 
                className="btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                Записаться на курс
              </button>
              <button className="btn-secondary">
                Скачать программу
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Education Contact Modal */}
      <EducationContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
} 