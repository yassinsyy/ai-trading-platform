'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Metric {
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  icon: any
  color: string
}

const metrics: Metric[] = [
  {
    title: 'Общая выручка',
    value: '₸ 2,847,500',
    change: 12.5,
    changeType: 'increase',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Прибыль',
    value: '₸ 712,000',
    change: 8.3,
    changeType: 'increase',
    icon: TrendingUp,
    color: 'text-blue-600'
  },
  {
    title: 'Заказы',
    value: '1,247',
    change: -2.1,
    changeType: 'decrease',
    icon: ShoppingCart,
    color: 'text-purple-600'
  },
  {
    title: 'Товары',
    value: '89',
    change: 5.7,
    changeType: 'increase',
    icon: Package,
    color: 'text-amber-600'
  }
]

const recentActivities = [
  {
    id: '1',
    type: 'price_update',
    product: 'Samsung Galaxy A54',
    description: 'Цена обновлена с ₸185,000 до ₸182,500',
    time: '2 минуты назад',
    status: 'completed'
  },
  {
    id: '2',
    type: 'stock_alert',
    product: 'Apple AirPods Pro',
    description: 'Низкий остаток: 15 шт. (покрытие 3 дня)',
    time: '15 минут назад',
    status: 'warning'
  },
  {
    id: '3',
    type: 'competitor_analysis',
    product: 'Xiaomi Mi Band 8',
    description: 'Обнаружена новая цена конкурента: ₸42,000',
    time: '1 час назад',
    status: 'info'
  },
  {
    id: '4',
    type: 'purchase_order',
    product: 'Наушники Sony WH-1000XM5',
    description: 'Создан заказ на закупку: 50 шт.',
    time: '2 часа назад',
    status: 'completed'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'warning': return 'bg-yellow-100 text-yellow-800'
    case 'info': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (type: string) => {
  switch (type) {
    case 'price_update': return '💱'
    case 'stock_alert': return '⚠️'
    case 'competitor_analysis': return '🔍'
    case 'purchase_order': return '📋'
    default: return 'ℹ️'
  }
}

export function Dashboard() {
  return (
    <section id="dashboard" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Панель управления
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Мониторинг ключевых показателей, автоматические уведомления 
            и быстрый доступ к важной информации
          </p>
        </div>

        {/* Ключевые метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  <Badge 
                    variant={metric.changeType === 'increase' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {metric.changeType === 'increase' ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm text-slate-600">
                  {metric.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* График продаж */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Динамика продаж (7 дней)</span>
                </CardTitle>
                <CardDescription>
                  Объем продаж и выручка по дням недели
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>График продаж</p>
                    <p className="text-sm">Интеграция с Chart.js или Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Последние действия */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Последние действия</span>
                </CardTitle>
                <CardDescription>
                  Системные уведомления и обновления
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="text-2xl">{getStatusIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.product}
                          </p>
                          <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status === 'completed' ? 'Завершено' : 
                             activity.status === 'warning' ? 'Внимание' : 'Информация'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button variant="outline" className="w-full">
                    Просмотреть все
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>
                Часто используемые функции и настройки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Автопрайсинг</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Package className="w-6 h-6" />
                  <span className="text-sm">Управление запасами</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-sm">Заказы на закупку</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Команда</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Информация о системе */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">
                Статус системы
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-blue-700">Автопрайсинг: Активен</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-blue-700">Интеграции: Работают</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-blue-700">ML-модели: Обновлены</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
