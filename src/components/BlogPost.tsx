"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, BookOpen } from "lucide-react";

const articles = {
  "zachem-biznesu-bi": {
    title: "Зачем бизнесу BI-система?",
    excerpt: "BI-системы позволяют собственникам видеть финансовые и операционные данные в реальном времени.",
    image: "/blog/bi-system.jpg",
    date: "20 января 2025",
    readTime: "5 мин",
    author: "Команда DIM PARTNERS",
    content: `
      <p>BI-системы позволяют собственникам видеть финансовые и операционные данные в реальном времени. В Казахстане бизнесы теряют до 30% прибыли из-за отсутствия прозрачной аналитики.</p>
      
      <h2>Что такое BI-система?</h2>
      <p>Business Intelligence (BI) — это совокупность технологий, процессов и инструментов для сбора, анализа и представления данных в удобном для принятия решений виде.</p>
      
      <h2>Проблемы без BI-системы</h2>
      <ul>
        <li>Отсутствие единой картины бизнеса</li>
        <li>Задержки в получении отчетов</li>
        <li>Человеческие ошибки в расчетах</li>
        <li>Сложность прогнозирования</li>
      </ul>
      
      <h2>Преимущества внедрения BI</h2>
      <ul>
        <li>Прозрачность всех процессов</li>
        <li>Быстрое принятие решений</li>
        <li>Автоматизация отчетности</li>
        <li>Повышение эффективности</li>
      </ul>
      
      <p>Внедрение BI решает эти проблемы, повышая эффективность и прозрачность управления. Наша команда в DIM PARTNERS специализируется на внедрении BI-систем для компаний любого размера.</p>
    `
  },
  "cfo-outsourcing-benefits": {
    title: "CFO-аутсорсинг: выгода для малого и среднего бизнеса",
    excerpt: "CFO-аутсорсинг — это доступ к экспертизе уровня «больших компаний» без затрат на штат.",
    image: "/blog/cfo-outsourcing.jpg",
    date: "18 января 2025",
    readTime: "7 мин",
    author: "Команда DIM PARTNERS",
    content: `
      <p>CFO-аутсорсинг — это доступ к экспертизе уровня «больших компаний» без затрат на штат. Мы в DIM PARTNERS внедряем финансовый контроль и управленческую отчетность с помощью BI.</p>
      
      <h2>Что включает CFO-аутсорсинг?</h2>
      <ul>
        <li>Финансовое планирование и бюджетирование</li>
        <li>Управленческая отчетность</li>
        <li>Анализ финансовых показателей</li>
        <li>Оптимизация налогового планирования</li>
      </ul>
      
      <h2>Экономия для бизнеса</h2>
      <p>Стоимость штатного CFO в Казахстане составляет от 500,000 до 1,500,000 тенге в месяц. Аутсорсинг позволяет получить аналогичный уровень экспертизы за 200,000-400,000 тенге.</p>
      
      <h2>Преимущества аутсорсинга</h2>
      <ul>
        <li>Экономия до 70% на зарплатах</li>
        <li>Доступ к лучшим практикам</li>
        <li>Гибкость в масштабировании</li>
        <li>Фокус на развитии бизнеса</li>
      </ul>
      
      <p>Это помогает бизнесу расти без хаоса и с полным контролем над финансами.</p>
    `
  },
  "bi-implementation-30-days": {
    title: "Как внедрить BI-систему за 30 дней",
    excerpt: "Пошаговое руководство по быстрому внедрению BI-системы в вашей компании с минимальными затратами.",
    image: "/blog/bi-implementation.jpg",
    date: "15 января 2025",
    readTime: "10 мин",
    author: "Команда DIM PARTNERS",
    content: `
      <p>Внедрение BI-системы не должно занимать месяцы. Мы разработали методику быстрого внедрения за 30 дней.</p>
      
      <h2>Неделя 1: Анализ и планирование</h2>
      <ul>
        <li>Аудит текущих процессов</li>
        <li>Определение ключевых KPI</li>
        <li>Выбор BI-платформы</li>
        <li>Планирование архитектуры</li>
      </ul>
      
      <h2>Неделя 2-3: Разработка</h2>
      <ul>
        <li>Настройка источников данных</li>
        <li>Создание дашбордов</li>
        <li>Настройка автоматизации</li>
        <li>Тестирование системы</li>
      </ul>
      
      <h2>Неделя 4: Внедрение</h2>
      <ul>
        <li>Обучение пользователей</li>
        <li>Запуск в продакшн</li>
        <li>Мониторинг работы</li>
        <li>Поддержка и доработки</li>
      </ul>
      
      <p>Такой подход позволяет быстро получить результат и начать использовать аналитику для принятия решений.</p>
    `
  },
  "sales-analytics-chaos-order": {
    title: "Аналитика продаж: от хаоса к порядку",
    excerpt: "Как превратить разрозненные данные о продажах в мощный инструмент для роста бизнеса.",
    image: "/blog/sales-analytics.jpg",
    date: "12 января 2025",
    readTime: "8 мин",
    author: "Команда DIM PARTNERS",
    content: `
      <p>Большинство компаний имеют разрозненные данные о продажах в разных системах. Аналитика продаж помогает объединить их в единую картину.</p>
      
      <h2>Что анализировать в продажах?</h2>
      <ul>
        <li>Воронка продаж и конверсии</li>
        <li>Эффективность менеджеров</li>
        <li>Сегментация клиентов</li>
        <li>Прогнозирование продаж</li>
      </ul>
      
      <h2>Инструменты аналитики</h2>
      <p>Мы используем Power BI, Tableau и другие платформы для создания интерактивных дашбордов продаж.</p>
      
      <h2>Результаты внедрения</h2>
      <ul>
        <li>Рост продаж на 25-40%</li>
        <li>Сокращение времени на отчеты</li>
        <li>Улучшение качества прогнозов</li>
        <li>Повышение мотивации команды</li>
      </ul>
      
      <p>Правильная аналитика продаж превращает хаос данных в мощный инструмент для роста бизнеса.</p>
    `
  },
  "kpi-owner-top-10": {
    title: "KPI для собственника: что измерять в первую очередь",
    excerpt: "Топ-10 ключевых показателей, которые должен отслеживать каждый собственник бизнеса.",
    image: "/blog/kpi-owner.jpg",
    date: "10 января 2025",
    readTime: "6 мин",
    author: "Команда DIM PARTNERS",
    content: `
      <p>Собственнику бизнеса важно отслеживать правильные KPI. Мы составили топ-10 самых важных показателей.</p>
      
      <h2>Финансовые KPI</h2>
      <ul>
        <li>Выручка и рост выручки</li>
        <li>Валовая и чистая прибыль</li>
        <li>Рентабельность продаж</li>
        <li>Денежный поток</li>
      </ul>
      
      <h2>Операционные KPI</h2>
      <ul>
        <li>Конверсия воронки продаж</li>
        <li>Средний чек</li>
        <li>LTV клиента</li>
        <li>Скорость оборачиваемости</li>
      </ul>
      
      <h2>Стратегические KPI</h2>
      <ul>
        <li>Доля рынка</li>
        <li>Удовлетворенность клиентов</li>
        <li>Эффективность команды</li>
        <li>Инновационность продуктов</li>
      </ul>
      
      <p>Отслеживание этих KPI поможет принимать обоснованные решения и развивать бизнес в правильном направлении.</p>
    `
  },
  "reporting-automation-20-hours": {
    title: "Автоматизация отчетности: экономия 20 часов в неделю",
    excerpt: "Как автоматизировать рутинные отчеты и освободить время для стратегических задач.",
    image: "/blog/reporting-automation.jpg",
    date: "8 января 2025",
    readTime: "9 мин",
    author: "Команда DIM PARTNERS",
    content: `
      <p>Ручная подготовка отчетов отнимает до 20 часов в неделю у финансовых специалистов. Автоматизация освобождает это время для стратегических задач.</p>
      
      <h2>Что можно автоматизировать?</h2>
      <ul>
        <li>Ежедневные отчеты о продажах</li>
        <li>Еженедельные финансовые отчеты</li>
        <li>Месячные управленческие отчеты</li>
        <li>KPI дашборды</li>
      </ul>
      
      <h2>Технологии автоматизации</h2>
      <p>Мы используем Power BI, SQL Server Integration Services и другие инструменты для создания автоматизированных отчетов.</p>
      
      <h2>Экономия времени</h2>
      <ul>
        <li>Подготовка отчетов: с 4 часов до 10 минут</li>
        <li>Проверка данных: с 2 часов до автоматической валидации</li>
        <li>Распространение: с 1 часа до автоматической рассылки</li>
        <li>Анализ: с 3 часов до интерактивных дашбордов</li>
      </ul>
      
      <p>Автоматизация отчетности позволяет сосредоточиться на анализе данных и принятии стратегических решений.</p>
    `
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = articles[slug as keyof typeof articles];

  if (!article) {
    return (
      <section className="blog-post-section">
        <div className="container">
          <div className="blog-post-not-found">
            <h1>Статья не найдена</h1>
            <p>Запрашиваемая статья не существует или была удалена.</p>
            <motion.a
              href="/blog"
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Вернуться к статьям
            </motion.a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-post-section">
      <div className="container">
        <motion.div
          className="blog-post-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="blog-post-meta">
            <span className="blog-post-date">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="blog-post-read-time">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
            <span className="blog-post-author">
              <BookOpen className="w-4 h-4" />
              {article.author}
            </span>
          </div>
          
          <h1 className="blog-post-title">{article.title}</h1>
          <p className="blog-post-excerpt">{article.excerpt}</p>
          
          <div className="blog-post-actions">
            <motion.button
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
              Поделиться
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="blog-post-image"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <img src={article.image} alt={article.title} />
        </motion.div>

        <motion.div
          className="blog-post-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <motion.div
          className="blog-post-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <motion.button
            onClick={() => navigate('/blog')}
            className="btn btn-tertiary"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-4 h-4" />
            ← Назад к статьям
          </motion.button>
          
          <motion.a
            href="#contact"
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Обсудить проект
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}


 