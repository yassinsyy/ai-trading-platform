"use client";

import { motion } from "framer-motion";
import { BarChart3, Search, TrendingUp, Lightbulb, ArrowRight } from "lucide-react";

const levels = [
  {
    number: 1,
    title: "Descriptive",
    description: "Что произошло? — P&L, Cash Flow, управленческие отчёты и BI‑дашборды.",
    keyPhrase: "P&L, Cash Flow",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "#00F5D4",
    intensity: 0.3
  },
  {
    number: 2,
    title: "Diagnostic", 
    description: "Почему это произошло? — факторный анализ, сравнение сегментов, выявление узких мест.",
    keyPhrase: "факторный анализ",
    icon: <Search className="w-8 h-8" />,
    color: "#33E1FF",
    intensity: 0.5
  },
  {
    number: 3,
    title: "Predictive",
    description: "Что произойдет? — прогнозирование продаж, сценарное моделирование и тренды.",
    keyPhrase: "прогнозирование",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "#66FF99",
    intensity: 0.7
  },
  {
    number: 4,
    title: "Prescriptive",
    description: "Что делать? — управленческие решения, оптимизация и стратегия роста бизнеса.",
    keyPhrase: "управленческие решения",
    icon: <Lightbulb className="w-8 h-8" />,
    color: "#FFFFFF",
    intensity: 1.0
  }
];

export default function AnalyticsLevels() {
  return (
    <section className="analytics-levels" id="team">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">От данных к стратегии</h2>
          <p className="section-subtitle">
            Закрываем все уровни аналитики — от описания фактов до управленческих решений
          </p>
        </motion.div>

        <div className="levels-grid">
          {levels.map((level, index) => (
            <motion.div
              key={index}
              className="level-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ 
                y: -8,
                boxShadow: `0 0 30px ${level.color}${Math.floor(level.intensity * 255).toString(16).padStart(2, '0')}`
              }}
            >
              <div 
                className="level-number"
                                 style={{ 
                   color: level.color,
                   opacity: level.intensity
                 }}
              >
                {level.number}
              </div>
              <div 
                className="level-icon"
                style={{ 
                  '--level-color': level.color,
                  '--level-intensity': level.intensity
                } as React.CSSProperties}
              >
                {level.icon}
              </div>
              <h3 className="level-title">{level.title}</h3>
              <p className="level-description">
                {level.description.split('—').map((part, i) => (
                  <span key={i}>
                    {i === 0 ? part : (
                      <>
                        — <span className="level-keyphrase">{level.keyPhrase}</span>
                        {part.replace(level.keyPhrase, '')}
                      </>
                    )}
                  </span>
                ))}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Progress line */}
        <motion.div
          className="progress-line"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1.2 }}
        >
          <div className="progress-arrow">
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.div>
      </div>
    </section>
  );
} 