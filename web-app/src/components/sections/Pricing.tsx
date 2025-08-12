'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle,
  DollarSign,
  Target,
  BarChart3,
  Plus
} from 'lucide-react'

interface PricePolicy {
  id: string
  productId: string
  minMarginPct: number
  maxPriceDeltaPctDay: number
  mode: 'auto' | 'manual'
  floorPrice: number
  currentPrice: number
  competitorMinPrice?: number
  stockCoverDays: number
}

export function Pricing() {
  const [policies, setPolicies] = useState<PricePolicy[]>([
    {
      id: '1',
      productId: 'SKU001',
      minMarginPct: 25,
      maxPriceDeltaPctDay: 5,
      mode: 'auto',
      floorPrice: 1500,
      currentPrice: 2000,
      competitorMinPrice: 1900,
      stockCoverDays: 12
    },
    {
      id: '2',
      productId: 'SKU002',
      minMarginPct: 30,
      maxPriceDeltaPctDay: 3,
      mode: 'manual',
      floorPrice: 800,
      currentPrice: 1200,
      competitorMinPrice: 1150,
      stockCoverDays: 8
    }
  ])

  const [selectedPolicy, setSelectedPolicy] = useState<PricePolicy | null>(null)

  const calculateNewPrice = (policy: PricePolicy): { newPrice: number; reason: string } => {
    const { currentPrice, floorPrice, maxPriceDeltaPctDay, competitorMinPrice, stockCoverDays } = policy
    
    let target = currentPrice
    
    if (competitorMinPrice) {
      const desired = competitorMinPrice * 0.99 // быть на 1% дешевле
      target = Math.max(desired, floorPrice)
    }
    
    // если мало запаса — поднимем чуть цену, если избыток — опустим к безопасному
    if (stockCoverDays < 7) target *= 1.02
    if (stockCoverDays > 45) target *= 0.98
    
    const clampLow = currentPrice * (1 - maxPriceDeltaPctDay / 100)
    const clampHigh = currentPrice * (1 + maxPriceDeltaPctDay / 100)
    
    const newPrice = Math.min(Math.max(target, Math.max(floorPrice, clampLow)), clampHigh)
    const reason = `floor=${floorPrice.toFixed(2)}, comp=${competitorMinPrice}, stockDays=${stockCoverDays}`
    
    return { newPrice, reason }
  }

  const handleAutoPricing = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId)
    if (!policy) return
    
    const { newPrice, reason } = calculateNewPrice(policy)
    
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, currentPrice: newPrice } : p
    ))
    
    // Здесь будет API вызов для обновления цены
    console.log(`Обновлена цена для ${policy.productId}: ${newPrice} (${reason})`)
  }

  const handleModeToggle = (policyId: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, mode: p.mode === 'auto' ? 'manual' : 'auto' } : p
    ))
  }

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Умное управление ценами
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Автоматическое ценообразование с защитой от убытков. 
            Система учитывает конкурентов, остатки и вашу минимальную маржу.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Защита маржи</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Никогда не продаем ниже минимальной прибыли. 
                Система автоматически блокирует убыточные цены.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Конкурентный анализ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Отслеживаем цены конкурентов в реальном времени. 
                Автоматически корректируем для сохранения конкурентоспособности.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Управление остатками</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Адаптируем цены под уровень запасов. 
                Повышаем при дефиците, снижаем при избытке.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-slate-900">
              Политики ценообразования
            </h3>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Добавить политику
            </Button>
          </div>

          {policies.map((policy) => {
            const { newPrice, reason } = calculateNewPrice(policy)
            const priceChange = ((newPrice - policy.currentPrice) / policy.currentPrice) * 100
            const isPriceChange = Math.abs(priceChange) > 0.1

            return (
              <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.productId}</CardTitle>
                      <CardDescription>
                        Текущая цена: <span className="font-semibold">{policy.currentPrice} ₸</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={policy.mode === 'auto'}
                            onCheckedChange={() => handleModeToggle(policy.id)}
                          />
                          <Label className="text-sm">
                            {policy.mode === 'auto' ? 'Авто' : 'Ручное'}
                          </Label>
                        </div>
                        <Badge variant={policy.mode === 'auto' ? 'default' : 'secondary'}>
                          {policy.mode === 'auto' ? 'Активно' : 'Отключено'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label className="text-sm text-slate-600">Мин. маржа</Label>
                      <p className="font-semibold">{policy.minMarginPct}%</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Макс. изменение</Label>
                      <p className="font-semibold">{policy.maxPriceDeltaPctDay}%/день</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Пол цены</Label>
                      <p className="font-semibold">{policy.floorPrice} ₸</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Остаток (дни)</Label>
                      <p className="font-semibold">{policy.stockCoverDays}</p>
                    </div>
                  </div>

                  {policy.competitorMinPrice && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Минимальная цена конкурента: {policy.competitorMinPrice} ₸
                        </span>
                      </div>
                    </div>
                  )}

                  {isPriceChange && (
                    <Alert className="mb-4">
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Рекомендуемая цена:</strong> {newPrice.toFixed(2)} ₸ 
                        ({priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%)
                        <br />
                        <span className="text-sm text-slate-600">Причина: {reason}</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => handleAutoPricing(policy.id)}
                      disabled={policy.mode === 'manual'}
                      className="flex-1"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Применить автоцену
                    </Button>
                    
                    <Button variant="outline" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      История изменений
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">
                Важные ограничения системы
              </h4>
              <ul className="text-amber-700 space-y-1 text-sm">
                <li>• Цена никогда не опускается ниже минимальной маржи</li>
                <li>• Максимальное изменение цены ограничено настройками</li>
                <li>• Ночные изменения заблокированы (quiet-hours)</li>
                <li>• Все изменения логируются в аудите</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
