import React, { useState, useCallback, useMemo } from 'react';
import { TrendingUp, CheckCircle, Target, ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { Header } from './dashboard/Header';
import { Navigation } from './dashboard/Navigation';
import { OverviewSection } from './dashboard/OverviewSection';
import { ProjectsSection } from './dashboard/ProjectsSection';
import { FinanceSection } from './dashboard/FinanceSection';
import { SectionPlaceholder } from './dashboard/SectionPlaceholder';

// Структура карточки преимущества
interface BenefitCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BENEFIT_CARDS: BenefitCard[] = [
  {
    icon: <TrendingUp size={24} />,
    title: 'Рост выручки',
    description: 'Видите динамику и ключевые драйверы роста сразу в отчётах',
  },
  {
    icon: <Target size={24} />,
    title: 'Полный контроль',
    description: 'Управляйте проектами и рисками в реальном времени',
  },
  {
    icon: <CheckCircle size={24} />,
    title: 'Всё в одном месте',
    description: 'Забудьте про десятки Excel‑файлов, работайте в единой системе',
  },
];

export default function DashboardSection() {
  const [activeSection, setActiveSection] = useState('overview');
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
  }, []);
  const renderSection = useMemo(() => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'finance':
        return <FinanceSection />;
      default:
        return <SectionPlaceholder section={activeSection} />;
    }
  }, [activeSection]);

  return (
    <section className="dashboard-section-premium w-full py-20 bg-gradient-to-b from-[#141b21] to-[#191d20]">
      {/* ====== Заголовок блока ====== */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Стратегический дашборд</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Управляйте бизнесом через цифры и прозрачные метрики
        </p>
      </div>

      {/* ====== Dashboard (динамическая высота + внутренний скролл) ====== */}
      <div className="flex justify-center w-full mb-12">
        {/* Мобильное уведомление */}
        <div className="lg:hidden w-full max-w-md mx-auto mb-6 p-4 bg-[#1F2833]/80 rounded-xl border border-[#00F5D4]/20">
          <div className="flex items-center gap-3 text-center">
            <Monitor className="w-5 h-5 text-[#00F5D4]" />
            <p className="text-sm text-[#C5C6C7]">
              Дашборд отображается на компьютере для лучшего просмотра
            </p>
          </div>
        </div>
        
        <div
          className="
            dashboard-embed-frame
            mx-auto
            max-w-[1100px] w-full
            h-[80vh] min-h-[420px]
            bg-[#191d20] rounded-2xl border border-[#00F5D4]
            shadow-[0_4px_48px_0_rgba(0,245,212,0.18)]
            flex items-center justify-center
            overflow-hidden
            hidden lg:flex
          "
        >
          <div
            className="dashboard-app-compact"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden', // Скрываем лишнее
            }}
          >
            <div className="dashboard-content-compact flex w-full h-full">
              <Navigation activeSection={activeSection} onSectionChange={handleSectionChange} />
              <div className="dashboard-main-compact flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                <Header />
                {/* Весь скроллируемый контент — только внутри этого блока! */}
                <main className="dashboard-sections-compact flex-1 overflow-y-auto p-8" style={{maxHeight: '65vh'}}>
                  {renderSection}
                  <div className="dashboard-footer-compact pt-6">
                    <div className="footer-content flex justify-between text-xs text-gray-400">
                      <span>DEVELOPMENT GROUP • Конфиденциально</span>
                      <span>Автоматическая генерация каждые 24 часа</span>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
        
        {/* Мобильная версия - показываем заглушку */}
        <div className="lg:hidden w-full max-w-md mx-auto">
          <div className="bg-[#191d20] rounded-2xl border border-[#00F5D4]/20 p-8 text-center">
            <div className="w-16 h-16 bg-[#00F5D4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-[#00F5D4]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Стратегический дашборд</h3>
            <p className="text-sm text-[#C5C6C7] mb-4">
              Интерактивная панель управления с ключевыми метриками бизнеса
            </p>
            <div className="flex flex-col gap-2 text-xs text-[#8A8D91]">
              <div className="flex items-center justify-between">
                <span>📊 KPI метрики</span>
                <span className="text-[#00F5D4]">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>📈 Аналитика продаж</span>
                <span className="text-[#00F5D4]">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>💰 Финансовые отчёты</span>
                <span className="text-[#00F5D4]">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== Карточки преимуществ и CTA (профессиональный дизайн) ====== */}
      <section className="w-full py-16 bg-transparent px-8 md:px-0">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
          {/* Карточки преимуществ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {BENEFIT_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="
                  bg-[#15191e]/90 rounded-xl 
                  shadow-[0_6px_36px_0_rgba(0,245,212,0.10)] 
                  border border-[#2c2c2c] 
                  px-6 py-8 
                  flex flex-col items-start
                  hover:shadow-[0_8px_48px_0_rgba(0,245,212,0.20)] 
                  hover:border-[#66FCF1] 
                  hover:-translate-y-1 
                  transition-all duration-300
                "
              >
                <div className="mb-3 p-3 bg-[#00F5D4]/10 rounded-lg text-[#00F5D4]">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{card.title}</h3>
                <p className="text-sm text-[#b1b6be] leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="
            w-full flex flex-col items-center 
            bg-[#14212b]/70 rounded-2xl 
            border border-[#1f2833] shadow-xl 
            px-8 py-10 mt-6
          ">
            <h2 className="text-2xl font-bold text-white mb-3">Готовы к трансформации?</h2>
            <p className="text-base text-[#b1b6be] mb-6 text-center">
              Получите доступ к профессиональным инструментам управления
            </p>
            <button
              className="
                bg-[#00F5D4] text-[#14212b] 
                px-8 py-4 rounded-xl 
                font-bold text-lg 
                flex items-center gap-2
                hover:bg-[#00E5C4] 
                hover:shadow-[0_0_40px_0_rgba(0,245,212,0.30)] 
                transition-all duration-300
                w-full md:w-auto
              "
            >
              Увидеть демо-дашборд <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

/*
---- КРАТКОЕ ТЗ ДЛЯ КУРСОРА ----

1. Фрейм использует динамическую высоту (80vh) вместо фиксированной.
2. Скролл только у внутреннего контента (.dashboard-sections-compact), НЕ у внешнего контейнера.
3. Убрано масштабирование scale() — используется адаптивная высота.
4. Dashboard занимает всю доступную ширину без пустых областей.
5. Карточки преимуществ в едином контейнере с профессиональным дизайном.
6. На десктопе карточки в 3 колонки, на мобиле — в столбик.
7. CTA-блок с яркой кнопкой и glow-эффектом.
8. Анимации hover для карточек и кнопки.
9. Адаптивность на всех экранах с правильными отступами.
10. Для CSS-классов используешь Tailwind, кастомные классы вынеси в отдельный css при необходимости.
*/
