'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, BarChart3, TrendingUp, Zap, Shield } from 'lucide-react'

export function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const stats = [
    { label: 'Активных пользователей', value: '10,000+', icon: BarChart3 },
    { label: 'Увеличение прибыли', value: '45%', icon: TrendingUp },
    { label: 'Автоматизированных операций', value: '1M+', icon: Zap },
    { label: 'Безопасность', value: '99.9%', icon: Shield },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* Анимированные элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-trading-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-trading-accent2/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Главный заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-trading-text">ИИ-автопилот для</span>
            <br />
            <span className="text-gradient">торговли на маркетплейсах</span>
          </h1>
          <p className="text-xl md:text-2xl text-trading-textSecondary max-w-3xl mx-auto leading-relaxed">
            Автоматизируйте прайсинг, находите возможности и увеличивайте прибыль 
            с помощью искусственного интеллекта. Безопасно и эффективно.
          </p>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/register"
            className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
          >
            <span>Начать бесплатно</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <button
            onClick={() => setIsVideoPlaying(true)}
            className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2 group"
          >
            <Play className="w-5 h-5" />
            <span>Смотреть демо</span>
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="text-center p-4 rounded-lg bg-trading-secondary/30 backdrop-blur-sm border border-trading-accent/20"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex justify-center mb-2">
                  <Icon className="w-8 h-8 text-trading-accent" />
                </div>
                <div className="text-2xl font-bold text-trading-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-trading-textSecondary">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-16 text-center">
          <p className="text-trading-textSecondary mb-4">
            Уже используют платформу:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-trading-textSecondary font-semibold">Wildberries</div>
            <div className="text-trading-textSecondary font-semibold">Ozon</div>
            <div className="text-trading-textSecondary font-semibold">Яндекс.Маркет</div>
            <div className="text-trading-textSecondary font-semibold">AliExpress</div>
          </div>
        </div>
      </div>

      {/* Видео модальное окно */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-trading-accent transition-colors"
            >
              ✕
            </button>
            <div className="aspect-video bg-trading-secondary rounded-lg flex items-center justify-center">
              <div className="text-center text-trading-textSecondary">
                <Play className="w-16 h-16 mx-auto mb-4 text-trading-accent" />
                <p>Демо-видео будет доступно после запуска</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
