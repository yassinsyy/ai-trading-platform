import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { BarChart, Zap, TrendingUp, Users, CheckCircle, ArrowRight, DollarSign, Target } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="App">
      <SEOHead 
        title="Автоматизация управленческой отчетности в Казахстане"
        description="Автоматизация управленческой отчетности, как контролировать финансы компании, настройка финансовой отчетности. BI-аналитика для бизнеса и решение для управленческого учета."
        keywords="автоматизация управленческой отчетности, как контролировать финансы компании, настройка финансовой отчетности, как сделать отчет по прибыли и убыткам, автоматизация отчетов из 1С, визуализация финансовых показателей, BI-аналитика для бизнеса, решение для управленческого учета, как контролировать бизнес-показатели, создать KPI-систему для компании, отчеты для собственника бизнеса, консалтинг по управленческой отчетности, как внедрить аналитическую систему в компании, внедрение дашбордов для отдела продаж"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-[#0B0C10] to-[#1F2833]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Автоматизация <span className="text-[#00F5D4]">управленческой отчетности</span>
            </h1>
            <p className="text-xl text-[#C5C6C7] max-w-3xl mx-auto mb-8">
              Как контролировать финансы компании и настроить финансовую отчетность. BI-аналитика для бизнеса и решение для управленческого учета.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#00F5D4] text-[#0B0C10] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#00E5C4] transition-all">
                Получить консультацию
              </button>
              <button className="border border-[#00F5D4] text-[#00F5D4] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#00F5D4]/10 transition-all">
                Посмотреть кейсы
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-16 bg-[#1F2833]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Проблемы, которые мы решаем
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Проблема 1 */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20">
              <h3 className="text-xl font-semibold text-white mb-4">Как контролировать финансы компании?</h3>
              <p className="text-[#C5C6C7] mb-4">
                Создаем систему контроля финансов с автоматическими отчетами и дашбордами для собственника бизнеса
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Автоматические отчеты P&L, ДДС, баланс
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Контроль в реальном времени
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Уведомления об отклонениях
                </li>
              </ul>
            </div>

            {/* Проблема 2 */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20">
              <h3 className="text-xl font-semibold text-white mb-4">Настройка финансовой отчетности</h3>
              <p className="text-[#C5C6C7] mb-4">
                Автоматизируем создание отчетов по прибыли и убыткам, визуализируем финансовые показатели
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Автоматизация отчетов из 1С
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Визуализация финансовых показателей
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Единая система отчетности
                </li>
              </ul>
            </div>

            {/* Проблема 3 */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20">
              <h3 className="text-xl font-semibold text-white mb-4">Создать KPI-систему для компании</h3>
              <p className="text-[#C5C6C7] mb-4">
                Разрабатываем KPI-систему для контроля бизнес-показателей и управления эффективностью
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Определение ключевых метрик
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Автоматический расчет KPI
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Дашборды для руководителей
                </li>
              </ul>
            </div>

            {/* Проблема 4 */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20">
              <h3 className="text-xl font-semibold text-white mb-4">Внедрение дашбордов для отделов</h3>
              <p className="text-[#C5C6C7] mb-4">
                Создаем специализированные дашборды для отдела продаж, маркетинга и финансов
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Дашборды для отдела продаж
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Аналитика маркетинга
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Финансовые дашборды
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 bg-gradient-to-r from-[#0B0C10] to-[#1F2833]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Наши решения
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Решение 1 */}
            <div className="bg-[#1F2833] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">BI-аналитика для бизнеса</h3>
              <p className="text-[#C5C6C7]">
                Комплексное решение для управленческого учета и аналитики данных
              </p>
            </div>

            {/* Решение 2 */}
            <div className="bg-[#1F2833] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Автоматизация отчетности</h3>
              <p className="text-[#C5C6C7]">
                Автоматизация управленческой отчетности и создание системы контроля
              </p>
            </div>

            {/* Решение 3 */}
            <div className="bg-[#1F2833] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Консалтинг по отчетности</h3>
              <p className="text-[#C5C6C7]">
                Консалтинг по управленческой отчетности и внедрение аналитических систем
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0B0C10]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Готовы автоматизировать отчетность?
          </h2>
          <p className="text-xl text-[#C5C6C7] mb-8">
            Получите консультацию по автоматизации управленческой отчетности в вашей компании
          </p>
          <button className="bg-[#00F5D4] text-[#0B0C10] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#00E5C4] transition-all flex items-center gap-2 mx-auto">
            Получить консультацию <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
