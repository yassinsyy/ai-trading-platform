'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Target,
  BarChart3,
  Zap,
  Globe,
  Lock
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'ИИ-аналитика',
    description: 'Машинное обучение анализирует историю продаж, прогнозирует спрос и рекомендует оптимальные решения',
    benefits: ['Прогноз спроса на 30-60 дней', 'Анализ сезонности', 'Выявление трендов'],
    color: 'blue'
  },
  {
    icon: TrendingUp,
    title: 'Автопрайсинг',
    description: 'Умное ценообразование с защитой от убытков. Система учитывает конкурентов и вашу минимальную маржу',
    benefits: ['Защита минимальной маржи', 'Анализ конкурентов', 'Автоматические корректировки'],
    color: 'green'
  },
  {
    icon: Target,
    title: 'Поиск возможностей',
    description: 'Находим выгодные товары для закупки, анализируем риски и рассчитываем ожидаемую прибыль',
    benefits: ['Скоринг SKU', 'Оценка рисков', 'Расчет ROI'],
    color: 'purple'
  },
  {
    icon: BarChart3,
    title: 'Управление запасами',
    description: 'Оптимизируем остатки, предотвращаем дефицит и избыток товаров',
    benefits: ['Прогноз пополнений', 'Анализ оборачиваемости', 'Автоматические заказы'],
    color: 'amber'
  },
  {
    icon: Globe,
    title: 'Мультимаркетплейс',
    description: 'Поддержка Kaspi, Wildberries, Ozon, Amazon. Единая панель для всех площадок',
    benefits: ['Централизованное управление', 'Синхронизация данных', 'Единая аналитика'],
    color: 'indigo'
  },
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Защита данных, аудит изменений и соблюдение требований маркетплейсов',
    benefits: ['Шифрование данных', 'Журнал изменений', 'RBAC-авторизация'],
    color: 'red'
  }
]

const getColorClasses = (color: string) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Возможности системы
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            ИИ-автопилот для торговли на маркетплейсах. Автоматизируем рутинные задачи, 
            увеличиваем прибыль и снижаем риски.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${getColorClasses(feature.color)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-slate-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Дополнительные возможности */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Дополнительные инструменты
            </h3>
            <p className="text-lg text-slate-600">
              Все необходимое для эффективной работы с маркетплейсами
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Быстрая интеграция</h4>
              <p className="text-sm text-slate-600">Подключение к маркетплейсам за 15 минут</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Детальная аналитика</h4>
              <p className="text-sm text-slate-600">Отчеты по прибыли, спросу и конкурентам</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Безопасность данных</h4>
              <p className="text-sm text-slate-600">Шифрование и защита конфиденциальности</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-semibold mb-2">Мультиязычность</h4>
              <p className="text-sm text-slate-600">Поддержка русского, казахского и английского</p>
            </Card>
          </div>
        </div>

        {/* CTA секция */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Готовы увеличить прибыль?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к 500+ компаниям, которые уже используют ИИ-автопилот 
              для автоматизации торговли на маркетплейсах
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Заказать демо
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Связаться с нами
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
