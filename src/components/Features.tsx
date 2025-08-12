import React from 'react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const features = [
    {
      icon: "⚛️",
      title: "React 18",
      description: "Современная библиотека для создания пользовательских интерфейсов с новейшими возможностями."
    },
    {
      icon: "🔷",
      title: "TypeScript",
      description: "Типизированный JavaScript для надежной разработки и лучшего опыта разработчика."
    },
    {
      icon: "🎨",
      title: "Профессиональный дизайн",
      description: "Минималистичный корпоративный стиль с использованием Gilroy шрифтов и продуманной цветовой палитры."
    },
    {
      icon: "📱",
      title: "Адаптивность",
      description: "Полностью адаптивный дизайн, который отлично выглядит на всех устройствах и разрешениях."
    },
    {
      icon: "⚡",
      title: "Высокая производительность",
      description: "Оптимизированный код и современные практики для быстрой загрузки и плавной работы."
    },
    {
      icon: "🌟",
      title: "3D графика",
      description: "Интеграция Three.js для создания интерактивных 3D-элементов и визуальных эффектов."
    }
  ];

  return (
    <section id="features" className="py-20 bg-primary-medium/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-gilroy-bold mb-6">
            <span className="gradient-text">Возможности</span> проекта
          </h2>
          <p className="text-xl text-primary-gray max-w-3xl mx-auto">
            Наш проект сочетает в себе современные технологии и профессиональный дизайн для создания 
            уникального пользовательского опыта.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card group hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-gilroy-bold mb-3 text-primary-light">
                {feature.title}
              </h3>
              <p className="text-primary-gray leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="card bg-primary-dark/50 border-primary-accent/20">
            <h3 className="text-2xl font-gilroy-bold mb-4 text-primary-light">
              Технический стек
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-primary-gray">
              <span className="px-3 py-1 bg-primary-medium rounded-full border border-primary-accent/30">React 18</span>
              <span className="px-3 py-1 bg-primary-medium rounded-full border border-primary-accent/30">TypeScript</span>
              <span className="px-3 py-1 bg-primary-medium rounded-full border border-primary-accent/30">Three.js</span>
              <span className="px-3 py-1 bg-primary-medium rounded-full border border-primary-accent/30">Webpack</span>
              <span className="px-3 py-1 bg-primary-medium rounded-full border border-primary-accent/30">Framer Motion</span>
              <span className="px-3 py-1 bg-primary-medium rounded-full border border-primary-accent/30">Gilroy Fonts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
