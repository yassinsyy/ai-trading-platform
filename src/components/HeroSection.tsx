// src/components/HeroSection.tsx
import React, { useState, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Sphere3D } from "./Sphere3D";
import { HeroStatsCard } from "./HeroStatsCard";
import { PrimaryButton, SecondaryButton } from "./HeroButtons";
import B2BContactModal from "./B2BContactModal";
import QuickContactModal from "./QuickContactModal";
import { LazySphere } from "./LazySphere";

/**
 * HeroSection — Премиальный главный блок с адаптивным дизайном.
 * Desktop: горизонтальная сетка с текстом слева и сферой справа
 * Mobile: mobile-first структура с правильными размерами и отступами
 */
export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

  return (
    <section
      className="relative w-full min-h-screen bg-gradient-to-b from-[#050607] via-[#0A0B0C] to-[#050607] overflow-hidden"
      aria-label="Премиальный блок управления бизнесом"
    >
      {/* Desktop Layout */}
      <div className="hidden lg:block relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Левая часть — текст и кнопки */}
          <div className="flex flex-col flex-1 min-w-[270px] max-w-xl items-start justify-center">
            <h1 className="font-extrabold text-white text-4xl md:text-5xl xl:text-6xl leading-tight tracking-tight mb-7">
              Помогаем{" "}
              <span className="text-[#00F5D4]">управлять бизнесом</span>
              <br className="hidden md:block" />
              через цифры и{" "}
              <span className="text-[#00F5D4]">BI-аналитику</span>
            </h1>
            <p className="text-[#d7dadf] text-lg md:text-xl mb-9 max-w-lg">
              Внедряем BI-системы и строим управленческую аналитику, чтобы вы принимали решения на основе данных, а не хаоса.
            </p>
            <div className="flex flex-col xs:flex-row gap-4 w-full max-w-sm mb-8">
              <PrimaryButton onClick={() => setIsModalOpen(true)}>
                Получить консультацию
              </PrimaryButton>
              <SecondaryButton>
                Посмотреть кейсы
              </SecondaryButton>
            </div>
            <HeroStatsCard />
          </div>
          {/* Правая часть — 3D сфера */}
          <div className="flex-1 flex items-center justify-center w-full md:w-auto">
            <Sphere3D />
          </div>
        </div>
      </div>

      {/* Mobile Layout - Mobile-First */}
      <div className="lg:hidden relative min-h-screen w-full flex flex-col items-center mobile-container pt-24 pb-8 padding-safe">
        {/* Main Container */}
        <main className="flex flex-col items-center w-full max-w-sm mx-auto space-y-6 mobile-fade-in-up">
          
          {/* Main Heading - крупный и читаемый */}
          <h1 className="text-[clamp(35px,8.9vw,50px)] font-bold text-center leading-tight text-white mb-4 ultra-mobile-text">
            Помогаем управлять бизнесом через цифры и <span className="text-[#00F5D4]">BI‑аналитику</span>
          </h1>

          {/* Subtitle - компактный и читаемый */}
          <p className="text-base text-[#d7dadf] text-center mb-6 max-w-xs leading-relaxed ultra-mobile-text">
            BI-системы и управленческая аналитика для решений без хаоса
          </p>

          {/* Action Buttons - крупные touch-зоны */}
          <div className="flex flex-col w-full space-y-4 mb-6">
            <button 
              className="w-full py-4 text-base font-semibold bg-[#00F5D4] text-black rounded-xl shadow-lg transition-all duration-300 mobile-touch-target"
              onClick={() => setIsModalOpen(true)}
              aria-label="Получить консультацию по BI-системам"
            >
              Получить консультацию
            </button>
            <a 
              href="#cases" 
              className="w-full py-4 text-base font-semibold border-2 border-[#00F5D4] text-[#00F5D4] bg-transparent rounded-xl text-center flex items-center justify-center transition-all duration-300 mobile-touch-target"
              role="button"
              tabIndex={0}
              aria-label="Посмотреть кейсы внедрения BI-систем"
            >
              Посмотреть кейсы
            </a>
          </div>

          {/* Statistics Cards - одна колонка */}
          <div className="w-full flex flex-col space-y-4 mb-6">
            <div className="flex items-center gap-4 bg-[#182426cc] border border-[#00F5D4]/20 rounded-xl px-4 py-4 mobile-fade-in">
              <div className="w-10 h-10 bg-[#00F5D4] rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-[#00F5D4] rounded-full opacity-80"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#00F5D4] text-base">50+ проектов</span>
                <span className="text-[#c6faf0] text-sm">в ритейле, производстве и услугах</span>
              </div>
            </div>
          </div>
        </main>

        {/* 3D Sphere - внизу как декоративный элемент с ленивой загрузкой */}
        <div className="mt-6 mb-8 flex justify-center items-center w-full relative z-10">
          <LazySphere />
        </div>
      </div>

      {/* Fixed Quick Contact Button */}
      <div className="fixed left-0 right-0 mobile-fixed-bottom z-20 flex justify-center px-4 padding-safe">
        <button 
          className="bg-gradient-to-r from-[#00F5D4] to-[#09C1A3] rounded-2xl h-12 w-full max-w-xs text-base font-bold shadow-lg transition-all duration-300 text-black mobile-touch-target"
          onClick={() => setIsQuickModalOpen(true)}
          aria-label="Заказать звонок для консультации"
        >
          Позвоните мне
        </button>
      </div>

      {/* Лёгкое бирюзовое свечение в фоне */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 z-0 w-[650px] h-[480px] rounded-full blur-3xl bg-[#00F5D480] opacity-15"
        aria-hidden="true"
      />

      {/* B2B Модальное окно */}
      <B2BContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Quick Contact Modal */}
      <QuickContactModal 
        isOpen={isQuickModalOpen} 
        onClose={() => setIsQuickModalOpen(false)} 
      />
    </section>
  );
} 