"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SEOTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Услуги по регионам",
      content: (
        <div>
          <h3>BI-консалтинг по городам Казахстана:</h3>
          <ul>
            <li><strong>Астана</strong> - головной офис, полный спектр BI-услуг</li>
            <li><strong>Алматы</strong> - региональный центр, CFO-аутсорсинг</li>
            <li><strong>Шымкент</strong> - консультации и внедрение</li>
            <li><strong>Актобе</strong> - аналитические решения</li>
            <li><strong>Караганда</strong> - управленческая аналитика</li>
          </ul>
        </div>
      )
    },
    {
      title: "Отрасли",
      content: (
        <div>
          <h3>Ключевые отрасли в Казахстане:</h3>
          <ul>
            <li><strong>Ритейл</strong> - 25+ проектов по аналитике продаж</li>
            <li><strong>Производство</strong> - 15+ проектов по оптимизации</li>
            <li><strong>Финансы</strong> - 10+ проектов по отчетности</li>
            <li><strong>Услуги</strong> - 8+ проектов по автоматизации</li>
            <li><strong>Логистика</strong> - 5+ проектов по аналитике</li>
          </ul>
        </div>
      )
    },
    {
      title: "Технологии",
      content: (
        <div>
          <h3>Используемые BI-технологии:</h3>
          <ul>
            <li><strong>Power BI</strong> - корпоративная аналитика</li>
            <li><strong>Tableau</strong> - визуализация данных</li>
            <li><strong>QlikView</strong> - интерактивная аналитика</li>
            <li><strong>1C:Предприятие</strong> - интеграция с ERP</li>
            <li><strong>SQL Server</strong> - хранение и обработка данных</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="seo-tabs-section">
      <div className="seo-tabs-header">
        <h3>Дополнительная информация</h3>
        <p>Подробности о наших услугах и проектах</p>
      </div>
      
      <div className="seo-tabs-container">
        <div className="seo-tabs-nav">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`seo-tab-btn ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.title}
            </button>
          ))}
        </div>
        
        <motion.div
          key={activeTab}
          className="seo-tab-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tabs[activeTab].content}
        </motion.div>
      </div>
    </div>
  );
} 