"use client";

import React, { useState } from "react";
import { ArrowRight, Download, RefreshCcw, TrendingUp, CheckCircle, Target } from "lucide-react";

// =================== TYPES ===================== //
interface KPIData {
  label: string;
  value: string;
  change: string;
  color?: string;
}

interface BenefitData {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// =================== KPI DATA ===================== //
const KPI_DATA: KPIData[] = [
  { label: "Выручка YTD", value: "₸847.2М", change: "+14.8%", color: "text-primary" },
  { label: "EBITDA", value: "20.0%", change: "Цель: 18%" },
  { label: "Свободный CF", value: "₸126.4М", change: "17.6% маржа" },
  { label: "ROIC", value: "18.5%", change: "Цель: 15%" },
  { label: "Доля рынка", value: "23.4%", change: "+0.8%", color: "text-primary" },
];

// =================== BENEFITS DATA ===================== //
const BENEFITS: BenefitData[] = [
  {
    icon: <TrendingUp size={20} />,
    title: "Рост выручки",
    description: "Видите динамику и ключевые драйверы роста сразу в отчётах"
  },
  {
    icon: <Target size={20} />,
    title: "Полный контроль",
    description: "Управляйте проектами и рисками в реальном времени"
  },
  {
    icon: <CheckCircle size={20} />,
    title: "Всё в одном месте",
    description: "Забудьте про десятки Excel‑файлов, работайте в единой системе"
  }
];

// =================== HEADER COMPONENT ===================== //
function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
      <h2 className="text-2xl font-bold text-foreground font-gilroy">
        Стратегический дашборд
      </h2>
      <div className="flex gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-primary bg-card hover:bg-muted transition-colors text-sm font-medium">
          <RefreshCcw size={16} /> Обновить
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-primary bg-card hover:bg-muted transition-colors text-sm font-medium">
          <Download size={16} /> Экспорт
        </button>
      </div>
    </div>
  );
}

// =================== KPI BAR COMPONENT ===================== //
function KPIBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {KPI_DATA.map((kpi, idx) => (
        <div key={idx} className="bg-card border border-border-secondary rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className={`text-2xl font-bold font-gilroy mb-2 ${kpi.color ?? "text-foreground"}`}>
            {kpi.value}
          </div>
          <div className="text-sm text-muted-foreground font-medium mb-1">
            {kpi.label}
          </div>
          <div className={`text-xs ${kpi.color ?? "text-muted-foreground"}`}>
            {kpi.change}
          </div>
        </div>
      ))}
    </div>
  );
}

// =================== BENEFIT CARDS COMPONENT ===================== //
function BenefitCards() {
  return (
    <div className="space-y-4">
      {BENEFITS.map((b, i) => (
        <div key={i} className="flex items-start gap-4 bg-card border border-border-secondary rounded-xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
            {b.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm font-gilroy mb-1">{b.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{b.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =================== CTA COMPONENT ===================== //
function CTA() {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
      <h3 className="text-lg font-semibold font-gilroy mb-3">Готовы к трансформации?</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Получите доступ к профессиональным инструментам управления
      </p>
      <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-darkBg font-semibold hover:bg-primary/90 transition-colors">
        Увидеть демо‑дашборд <ArrowRight size={16} />
      </button>
    </div>
  );
}

// =================== FOOTER COMPONENT ===================== //
function DashboardFooter() {
  return (
    <div className="flex flex-col md:flex-row justify-between text-xs text-muted-foreground mt-8 pt-6 border-t border-border-secondary">
      <span>DEVELOPMENT GROUP • Конфиденциально</span>
      <span>Автоматическая генерация каждые 24 часа</span>
    </div>
  );
}

// =================== MAIN DASHBOARD COMPONENT ===================== //
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="w-full py-16 bg-gradient-to-b from-darkBg to-deepBg min-h-screen">
      {/* Mobile */}
      <div className="block md:hidden px-6">
        <DashboardHeader />
        <KPIBar />
        <BenefitCards />
        <CTA />
        <DashboardFooter />
      </div>
      
      {/* Desktop */}
      <div className="hidden md:block max-w-7xl mx-auto px-8">
        <DashboardHeader />
        <KPIBar />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Основная часть */}
          <div className="lg:col-span-2 bg-card border border-border-secondary rounded-xl shadow-sm p-8">
            <div className="text-center text-xl text-muted-foreground py-32 font-gilroy">
              [Содержимое дашборда]
            </div>
          </div>
          
          {/* Боковая панель */}
          <div className="space-y-6">
            <BenefitCards />
            <CTA />
          </div>
        </div>
        
        <DashboardFooter />
      </div>
    </section>
  );
} 