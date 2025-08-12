import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../dashboard-ui/card';
import { Badge } from '../dashboard-ui/badge';
import { TrendingUp, TrendingDown, Users, ShoppingCart, MapPin } from 'lucide-react';

const salesMetrics = [
  {
    title: "Объем продаж",
    value: "₸847.2М",
    change: "+14.8%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "Количество заказов",
    value: "12,847",
    change: "+8.3%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "Средний чек",
    value: "₸65,920",
    change: "+6.1%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "Конверсия",
    value: "3.2%",
    change: "+0.4%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "Повторные покупки",
    value: "67.3%",
    change: "+2.1%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "LTV клиента",
    value: "₸2.4М",
    change: "+12.7%",
    period: "YTD 2024",
    status: "positive"
  }
];

const topProducts = [
  { name: "Продукт A", sales: 245.3, units: 1850, growth: "+18.2%" },
  { name: "Продукт B", sales: 198.7, units: 1420, growth: "+12.4%" },
  { name: "Продукт C", sales: 156.8, units: 980, growth: "+8.7%" },
  { name: "Продукт D", sales: 124.6, units: 720, growth: "+15.3%" },
  { name: "Продукт E", sales: 98.3, units: 580, growth: "+6.9%" }
];

const regionalSales = [
  { region: "Алматы", sales: 285.2, share: 33.7, growth: "+16.2%" },
  { region: "Астана", sales: 198.7, share: 23.4, growth: "+12.8%" },
  { region: "Шымкент", sales: 156.8, share: 18.5, growth: "+9.4%" },
  { region: "Актобе", sales: 124.6, share: 14.7, growth: "+7.8%" },
  { region: "Прочие", sales: 82.9, share: 9.7, growth: "+5.2%" }
];

const customerSegments = [
  { segment: "VIP клиенты", count: 245, revenue: 285.2, share: 33.7 },
  { segment: "Крупные клиенты", count: 1247, revenue: 312.8, share: 36.9 },
  { segment: "Средние клиенты", count: 3456, revenue: 198.7, share: 23.4 },
  { segment: "Мелкие клиенты", count: 7890, revenue: 50.5, share: 6.0 }
];

export function SalesAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesMetrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Badge 
                  variant={metric.status === "positive" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {metric.status === "positive" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {metric.period}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Топ продуктов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {product.growth}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Продажи:</span>
                      <span className="ml-1 font-medium">₸{product.sales}М</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Единиц:</span>
                      <span className="ml-1 font-medium">{product.units}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Продажи по регионам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regionalSales.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{region.region}</h4>
                    <Badge variant="outline" className="text-xs">
                      {region.growth}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-1">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${region.share}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₸{region.sales}М • {region.share}% от общих продаж
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Сегментация клиентов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customerSegments.map((segment, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{segment.segment}</h4>
                  <Badge variant="outline" className="text-xs">
                    {segment.count} клиентов
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-1">
                  <div 
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: `${segment.share}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  ₸{segment.revenue}М • {segment.share}% от выручки
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 