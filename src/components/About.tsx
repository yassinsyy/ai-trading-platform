"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="about-section premium-bg" id="about">
      <div className="container">
        <div className="about-grid">
          {/* Левая колонка */}
          <div className="about-left">
            <div className="section-label">О КОМПАНИИ</div>
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              DIM Partners
            </motion.h2>
            <div className="about-subtitle-text">
              Консалтинг на стыке финансов и аналитики
            </div>
            <div className="about-text">
              <p className="section-text">
                Мы объединяем <span className="highlight">финансовую экспертизу</span> и современные <span className="highlight">аналитические технологии</span>, 
                чтобы превращать <span className="highlight">цифры в стратегию</span>.
              </p>
              <p className="section-text">
                В отличие от типовых BI‑подрядчиков, мы делаем управленческие решения доступными для собственников. 
                Наша команда — это синтез опыта, технологий и практики.
              </p>
            </div>
          </div>
          {/* Правая колонка */}
          <div className="about-right">
            <div className="about-photo-frame">
              <img
                src="/founder.jpg"
                alt="Ерасыл Сейлханов, основатель DIM Partners"
                className="about-photo"
              />
            </div>
            <div className="about-photo-caption">
              Ерасыл Сейлханов, основатель DIM Partners
            </div>
          </div>
        </div>
        
        {/* Второй смысловой блок */}
        <div className="mission-section">
          <div className="mission-content">
            <div className="mission-text">
              Мы объединяем финансы и аналитику для роста бизнеса
            </div>
            <div className="mission-underline"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 