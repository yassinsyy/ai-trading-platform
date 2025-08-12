import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { BarChart, Zap, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function PowerBIPage() {
  return (
    <div className="App">
      <SEOHead 
        title="Внедрение Power BI под ключ в Казахстане"
        description="Внедрение Power BI под ключ в Казахстане. Автоматизация управленческой отчетности, настройка финансовой отчетности, построение дашбордов Power BI. Консалтинг по Power BI и создание KPI-систем."
        keywords="внедрение Power BI под ключ, настройка Power BI для компании, автоматизация отчетности в Power BI, подрядчик по Power BI, консалтинг Power BI, BI-аналитика на базе Power BI, построение дашбордов в Power BI, разработка управленческой отчетности Power BI, Power BI + 1C интеграция, визуализация данных Power BI, KPI в Power BI, облачная аналитика Power BI, разработка P&L ДДС баланс в Power BI"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-[#0B0C10] to-[#1F2833]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Внедрение <span className="text-[#00F5D4]">Power BI</span> под ключ
            </h1>
            <p className="text-xl text-[#C5C6C7] max-w-3xl mx-auto mb-8">
              Автоматизация управленческой отчетности, настройка финансовой отчетности и создание KPI-систем для вашего бизнеса
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

      {/* Services Grid */}
      <section className="py-16 bg-[#1F2833]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Услуги по Power BI
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Внедрение под ключ */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Внедрение Power BI под ключ</h3>
              <p className="text-[#C5C6C7] mb-4">
                Полный цикл внедрения: от анализа требований до запуска системы в продакшн
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Анализ бизнес-процессов
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Настройка источников данных
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Создание дашбордов
                </li>
              </ul>
            </div>

            {/* Автоматизация отчетности */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Автоматизация отчетности</h3>
              <p className="text-[#C5C6C7] mb-4">
                Автоматизация управленческой отчетности и создание системы KPI
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  P&L, ДДС, баланс
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  KPI-система
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Автообновление данных
                </li>
              </ul>
            </div>

            {/* Интеграция с 1С */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Power BI + 1C интеграция</h3>
              <p className="text-[#C5C6C7] mb-4">
                Автоматизация отчетов из 1С и визуализация финансовых показателей
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Подключение к 1С
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Автоматизация отчетов
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Визуализация данных
                </li>
              </ul>
            </div>

            {/* Облачная аналитика */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Облачная аналитика</h3>
              <p className="text-[#C5C6C7] mb-4">
                Облачная аналитика Power BI для доступа к данным из любой точки мира
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Облачное развертывание
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Мобильный доступ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Безопасность данных
                </li>
              </ul>
            </div>

            {/* Консалтинг */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Консалтинг Power BI</h3>
              <p className="text-[#C5C6C7] mb-4">
                Консалтинг по управленческой отчетности и решение для управленческого учета
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Аудит существующих систем
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Стратегия внедрения
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Обучение команды
                </li>
              </ul>
            </div>

            {/* Дашборды */}
            <div className="bg-[#0B0C10] rounded-xl p-6 border border-[#00F5D4]/20 hover:border-[#00F5D4] transition-all">
              <div className="w-12 h-12 bg-[#00F5D4]/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Построение дашбордов</h3>
              <p className="text-[#C5C6C7] mb-4">
                Визуализация данных Power BI и создание интерактивных дашбордов
              </p>
              <ul className="text-sm text-[#8A8D91] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Интерактивные графики
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Drill-down аналитика
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
                  Персонализация
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0B0C10] to-[#1F2833]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Готовы к внедрению Power BI?
          </h2>
          <p className="text-xl text-[#C5C6C7] mb-8">
            Получите консультацию по внедрению Power BI под ключ в вашей компании
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
