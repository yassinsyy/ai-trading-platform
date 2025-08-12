"use client";

import { motion } from "framer-motion";

export default function Cases() {
  return (
    <section className="cases-section" id="cases">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">Кейсы</h2>
          <p className="section-subtitle">
            Реальные проекты и результаты для наших клиентов
          </p>
        </motion.div>
        
        <div className="cases-content">
          <p style={{ textAlign: 'center', color: '#C5C6C7', fontSize: '1.1rem' }}>
            Раздел в разработке
          </p>
        </div>
      </div>
    </section>
  );
} 