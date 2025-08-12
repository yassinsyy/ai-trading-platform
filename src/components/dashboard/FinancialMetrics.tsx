import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../dashboard-ui/card';
import { Badge } from '../dashboard-ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

const financialMetrics = [
  {
    title: "Выручка",
    value: "₸847.2М",
    change: "+14.8%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "EBITDA",
    value: "₸169.4М",
    change: "+18.7%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "Чистая прибыль",
    value: "₸127.1М",
    change: "+21.3%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "Операционные расходы",
    value: "₸677.8М",
    change: "+12.1%",
    period: "YTD 2024",
    status: "neutral"
  },
  {
    title: "Денежный поток",
    value: "₸126.4М",
    change: "+15.2%",
    period: "YTD 2024",
    status: "positive"
  },
  {
    title: "ROE",
    value: "18.5%",
    change: "+2.3%",
    period: "YTD 2024",
    status: "positive"
  }
];

const revenueBreakdown = [
  { segment: "Продукт A", revenue: 320.5, share: 37.8 },
  { segment: "Продукт B", revenue: 245.3, share: 28.9 },
  { segment: "Продукт C", revenue: 156.8, share: 18.5 },
  { segment: "Услуги", revenue: 124.6, share: 14.8 }
];

const costStructure = [
  { category: "Сырье и материалы", amount: 285.2, share: 42.1 },
  { category: "Персонал", amount: 198.7, share: 29.3 },
  { category: "Накладные расходы", amount: 95.4, share: 14.1 },
  { category: "Маркетинг", amount: 67.3, share: 9.9 },
  { category: "Прочие", amount: 31.2, share: 4.6 }
];

export function FinancialMetrics() {
  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financialMetrics.map((metric, index) => (
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

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Структура выручки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{item.segment}</h4>
                    <span className="text-sm font-medium">₸{item.revenue}М</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.share}% от общей выручки
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Структура затрат
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costStructure.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{item.category}</h4>
                    <span className="text-sm font-medium">₸{item.amount}М</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.share}% от общих затрат
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 