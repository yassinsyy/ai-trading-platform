'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  ShoppingCart, 
  Target, 
  AlertTriangle,
  DollarSign,
  Package,
  BarChart3,
  Filter,
  Search,
  Eye,
  Plus
} from 'lucide-react'

interface Opportunity {
  id: string
  productId: string
  title: string
  brand: string
  category: string
  recommendedQty: number
  expectedProfit: number
  risk: 'low' | 'medium' | 'high'
  rationale: string
  competitorCount: number
  minCompetitorPrice: number
  ourCost: number
  forecastDemand30: number
  forecastDemand60: number
  stockCoverDays: number
  supplier: {
    name: string
    rating: number
    leadDays: number
    moq: number
  }
}

export function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: '1',
      productId: 'SKU001',
      title: 'Смартфон Samsung Galaxy A54',
      brand: 'Samsung',
      category: 'Электроника',
      recommendedQty: 100,
      expectedProfit: 45000,
      risk: 'low',
      rationale: 'Высокий спрос, стабильная цена, низкая конкуренция',
      competitorCount: 3,
      minCompetitorPrice: 185000,
      ourCost: 140000,
      forecastDemand30: 45,
      forecastDemand60: 120,
      stockCoverDays: 8,
      supplier: {
        name: 'TechSupply Co.',
        rating: 4.8,
        leadDays: 14,
        moq: 50
      }
    },
    {
      id: '2',
      productId: 'SKU002',
      title: 'Наушники Apple AirPods Pro',
      brand: 'Apple',
      category: 'Аудио',
      recommendedQty: 200,
      expectedProfit: 68000,
      risk: 'medium',
      rationale: 'Премиум сегмент, сезонный спрос, средняя конкуренция',
      competitorCount: 7,
      minCompetitorPrice: 89000,
      ourCost: 65000,
      forecastDemand30: 35,
      forecastDemand60: 95,
      stockCoverDays: 12,
      supplier: {
        name: 'AudioTech Ltd.',
        rating: 4.6,
        leadDays: 21,
        moq: 100
      }
    },
    {
      id: '3',
      productId: 'SKU003',
      title: 'Умные часы Xiaomi Mi Band 8',
      brand: 'Xiaomi',
      category: 'Носимые устройства',
      recommendedQty: 150,
      expectedProfit: 22500,
      risk: 'low',
      rationale: 'Популярный бренд, низкая цена, высокий спрос',
      competitorCount: 5,
      minCompetitorPrice: 45000,
      ourCost: 32000,
      forecastDemand30: 60,
      forecastDemand60: 140,
      stockCoverDays: 6,
      supplier: {
        name: 'SmartWear Solutions',
        rating: 4.9,
        leadDays: 10,
        moq: 75
      }
    }
  ])

  const [filters, setFilters] = useState({
    category: 'all',
    risk: 'all',
    minProfit: '',
    maxCompetitors: ''
  })

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.category !== 'all' && opp.category !== filters.category) return false
    if (filters.risk !== 'all' && opp.risk !== filters.risk) return false
    if (filters.minProfit && opp.expectedProfit < parseInt(filters.minProfit)) return false
    if (filters.maxCompetitors && opp.competitorCount > parseInt(filters.maxCompetitors)) return false
    return true
  })

  const handleCreatePO = (opportunity: Opportunity) => {
    // Здесь будет создание черновика PO
    console.log('Создание PO для:', opportunity.productId)
    setSelectedOpportunity(opportunity)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return '🟢'
      case 'medium': return '🟡'
      case 'high': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <section id="opportunities" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Возможности для закупок
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            ИИ анализирует рынок и рекомендует товары для закупки. 
            Каждая рекомендация включает прогноз спроса, анализ рисков и расчет прибыльности.
          </p>
        </div>

        {/* Фильтры */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Фильтры и поиск</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Поиск товара</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="SKU или название..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Категория</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="Электроника">Электроника</SelectItem>
                    <SelectItem value="Аудио">Аудио</SelectItem>
                    <SelectItem value="Носимые устройства">Носимые устройства</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="risk">Уровень риска</Label>
                <Select value={filters.risk} onValueChange={(value) => setFilters(prev => ({ ...prev, risk: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все риски</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="minProfit">Мин. прибыль (₸)</Label>
                <Input
                  id="minProfit"
                  type="number"
                  placeholder="0"
                  value={filters.minProfit}
                  onChange={(e) => setFilters(prev => ({ ...prev, minProfit: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxCompetitors">Макс. конкурентов</Label>
                <Input
                  id="maxCompetitors"
                  type="number"
                  placeholder="∞"
                  value={filters.maxCompetitors}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxCompetitors: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Всего возможностей</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredOpportunities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Общая прибыль</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(filteredOpportunities.reduce((sum, opp) => sum + opp.expectedProfit, 0) / 1000).toFixed(1)}K ₸
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Рекомендуемый объем</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredOpportunities.reduce((sum, opp) => sum + opp.recommendedQty, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Средний риск</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredOpportunities.filter(opp => opp.risk === 'low').length > filteredOpportunities.length / 2 ? 'Низкий' : 'Средний'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Список возможностей */}
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <Badge variant="outline">{opportunity.brand}</Badge>
                      <Badge variant="secondary">{opportunity.category}</Badge>
                    </div>
                    <CardDescription>
                      SKU: {opportunity.productId} • {opportunity.rationale}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRiskIcon(opportunity.risk)}</span>
                    <Badge className={getRiskColor(opportunity.risk)}>
                      Риск: {opportunity.risk === 'low' ? 'Низкий' : opportunity.risk === 'medium' ? 'Средний' : 'Высокий'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  {/* Основные метрики */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-slate-600">Рекомендуемый объем</Label>
                      <p className="text-2xl font-bold text-blue-600">{opportunity.recommendedQty}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Ожидаемая прибыль</Label>
                      <p className="text-xl font-semibold text-green-600">{opportunity.expectedProfit.toLocaleString()} ₸</p>
                    </div>
                  </div>
                  
                  {/* Прогноз спроса */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-slate-600">Спрос (30 дней)</Label>
                      <p className="text-lg font-semibold">{opportunity.forecastDemand30}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Спрос (60 дней)</Label>
                      <p className="text-lg font-semibold">{opportunity.forecastDemand60}</p>
                    </div>
                  </div>
                  
                  {/* Конкуренция */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-slate-600">Конкуренты</Label>
                      <p className="text-lg font-semibold">{opportunity.competitorCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Мин. цена конкурента</Label>
                      <p className="text-lg font-semibold">{opportunity.minCompetitorPrice.toLocaleString()} ₸</p>
                    </div>
                  </div>
                  
                  {/* Поставщик */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-slate-600">Поставщик</Label>
                      <p className="text-lg font-semibold">{opportunity.supplier.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Рейтинг:</span>
                        <span className="text-sm font-medium">{opportunity.supplier.rating}⭐</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Срок поставки</Label>
                      <p className="text-sm">{opportunity.supplier.leadDays} дней</p>
                    </div>
                  </div>
                </div>
                
                {/* Дополнительная информация */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label className="text-sm text-slate-600">Наша себестоимость</Label>
                    <p className="font-semibold">{opportunity.ourCost.toLocaleString()} ₸</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Покрытие запасами</Label>
                    <p className="font-semibold">{opportunity.stockCoverDays} дней</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Минимальный заказ</Label>
                    <p className="font-semibold">{opportunity.supplier.moq}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Маржинальность</Label>
                    <p className="font-semibold text-green-600">
                      {(((opportunity.minCompetitorPrice - opportunity.ourCost) / opportunity.ourCost) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                {/* Действия */}
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => handleCreatePO(opportunity)}
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Создать заказ на закупку
                  </Button>
                  
                  <Button variant="outline" size="lg">
                    <Eye className="w-4 h-4 mr-2" />
                    Детальный анализ
                  </Button>
                  
                  <Button variant="outline" size="lg">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    История цен
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Пустое состояние */}
        {filteredOpportunities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Возможности не найдены
              </h3>
              <p className="text-slate-500 mb-4">
                Попробуйте изменить фильтры или дождитесь обновления данных
              </p>
              <Button 
                variant="outline"
                onClick={() => setFilters({ category: 'all', risk: 'all', minProfit: '', maxCompetitors: '' })}
              >
                Сбросить фильтры
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Информация о системе */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Target className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">
                Как работает система рекомендаций
              </h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Анализируем историю продаж и прогнозируем спрос на 30-60 дней</li>
                <li>• Учитываем цены конкурентов и вашу минимальную маржу</li>
                <li>• Оцениваем риски: волатильность спроса, конкуренция, качество поставщика</li>
                <li>• Рекомендуем оптимальный объем закупки для максимизации прибыли</li>
                <li>• Обновляем рекомендации каждые 24 часа</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
