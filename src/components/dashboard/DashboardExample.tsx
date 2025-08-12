import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from 'lucide-react';
import { KPICard } from './KPICard';
import { KPIOverview } from './KPIOverview';

// Данные для демонстрации
const demoKPIs = [
  {
    title: "Выручка YTD",
    value: "₸847.2М",
    subtitle: "Цель: ₸800М",
    trend: { value: 14.8, isPositive: true },
    icon: <DollarSign size={20} />
  },
  {
    title: "EBITDA",
    value: "20.0%",
    subtitle: "Цель: 18%",
    trend: { value: 2.0, isPositive: true },
    icon: <BarChart3 size={20} />
  },
  {
    title: "Свободный CF",
    value: "₸126.4М",
    subtitle: "17.6% маржа",
    trend: { value: 17.6, isPositive: true },
    icon: <TrendingUp size={20} />
  },
  {
    title: "ROIC",
    value: "18.5%",
    subtitle: "Цель: 15%",
    trend: { value: 3.5, isPositive: true },
    icon: <Target size={20} />
  },
  {
    title: "Доля рынка",
    value: "23.4%",
    subtitle: "№2 позиция",
    trend: { value: 0.8, isPositive: true },
    icon: <Users size={20} />
  },
  {
    title: "Операционная эффективность",
    value: "94.2%",
    subtitle: "OEE показатель",
    trend: { value: 2.1, isPositive: true },
    icon: <TrendingUp size={20} />
  }
];

export function DashboardExample() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-darkBg to-deepBg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-gilroy mb-2">
            Стратегический дашборд
          </h1>
          <p className="text-muted-foreground font-gilroy">
            Профессиональная аналитика в реальном времени
          </p>
        </div>

        {/* Основные KPI - Четкая сетка 6 колонок */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {demoKPIs.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              trend={kpi.trend}
            />
          ))}
        </div>

        {/* Детальная аналитика */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Графики */}
          <div className="lg:col-span-2 space-y-8">
            {/* График выручки */}
            <div className="bg-card border border-border-secondary rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold font-gilroy">Динамика выручки</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  YTD 2024
                </div>
              </div>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">График выручки</p>
                </div>
              </div>
            </div>

            {/* Метрики эффективности */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border-secondary rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground font-gilroy mb-4">
                  Операционные расходы
                </h4>
                <div className="text-2xl font-bold text-foreground font-gilroy mb-2">
                  ₸678.6М
                </div>
                <div className="text-xs text-muted-foreground">
                  -2.3% vs прошлый год
                </div>
              </div>
              
              <div className="bg-card border border-border-secondary rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground font-gilroy mb-4">
                  Чистая прибыль
                </h4>
                <div className="text-2xl font-bold text-foreground font-gilroy mb-2">
                  ₸127.1М
                </div>
                <div className="text-xs text-muted-foreground">
                  +21.3% vs прошлый год
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - Дополнительная информация */}
          <div className="space-y-6">
            {/* Быстрые действия */}
            <div className="bg-card border border-border-secondary rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold font-gilroy mb-4">Быстрые действия</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                  <div className="font-medium text-sm font-gilroy">Обновить данные</div>
                  <div className="text-xs text-muted-foreground">Последнее обновление: 2 мин назад</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-muted/20 border border-border-secondary hover:bg-muted/30 transition-colors">
                  <div className="font-medium text-sm font-gilroy">Экспорт отчета</div>
                  <div className="text-xs text-muted-foreground">PDF, Excel, CSV</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-muted/20 border border-border-secondary hover:bg-muted/30 transition-colors">
                  <div className="font-medium text-sm font-gilroy">Настройки</div>
                  <div className="text-xs text-muted-foreground">Персонализация дашборда</div>
                </button>
              </div>
            </div>

            {/* Уведомления */}
            <div className="bg-card border border-border-secondary rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold font-gilroy mb-4">Уведомления</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="font-medium text-sm font-gilroy text-green-400">Цель достигнута</div>
                  <div className="text-xs text-muted-foreground">Выручка превысила план на 5.9%</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="font-medium text-sm font-gilroy text-yellow-400">Требует внимания</div>
                  <div className="text-xs text-muted-foreground">Операционные расходы растут</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Детальная аналитика */}
        <div className="mt-8">
          <KPIOverview />
        </div>
      </div>
    </div>
  );
} 