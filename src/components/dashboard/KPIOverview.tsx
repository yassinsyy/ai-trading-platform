import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../dashboard-ui/card';
import { Badge } from '../dashboard-ui/badge';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const executiveKPIs = [
  {
    title: "Выручка YTD",
    value: "₸847.2М",
    change: "+14.8%",
    target: "₸800М",
    status: "positive",
    detail: "117.8% от плана"
  },
  {
    title: "EBITDA",
    value: "₸169.4М", 
    change: "+18.7%",
    target: "₸144М",
    status: "positive",
    detail: "Маржа: 20.0%"
  },
  {
    title: "Чистая прибыль",
    value: "₸127.1М",
    change: "+21.3%",
    target: "₸105М",
    status: "positive",
    detail: "Маржа: 15.0%"
  },
  {
    title: "ROI",
    value: "24.7%",
    change: "+2.1%",
    target: "22%",
    status: "positive",
    detail: "Превышение цели"
  },
  {
    title: "Операционная эффективность",
    value: "94.2%",
    change: "+2.1%",
    target: "92%",
    status: "positive",
    detail: "OEE показатель"
  },
  {
    title: "Доля рынка",
    value: "23.4%",
    change: "+0.8%",
    target: "22%",
    status: "positive",
    detail: "№2 позиция"
  }
];

const strategicInitiatives = [
  {
    name: "Цифровая трансформация",
    progress: 78,
    status: "positive",
    deadline: "Декабрь 2024",
    investment: "₸12.5М"
  },
  {
    name: "Международная экспансия", 
    progress: 92,
    status: "positive",
    deadline: "Октябрь 2024",
    investment: "₸15.7М"
  },
  {
    name: "Расширение продуктовой линейки",
    progress: 45,
    status: "attention",
    deadline: "Март 2025",
    investment: "₸8.3М"
  }
];

const riskIndicators = [
  {
    area: "Финансовые риски",
    level: "Низкий",
    status: "positive",
    details: "Кредитный рейтинг AAA"
  },
  {
    area: "Операционные риски",
    level: "Средний",
    status: "attention",
    details: "Требуется мониторинг"
  },
  {
    area: "Рыночные риски",
    level: "Низкий",
    status: "positive",
    details: "Стабильный спрос"
  }
];

export function KPIOverview() {
  return (
    <div className="space-y-8">
      {/* Executive KPIs - Четкая сетка 6 колонок */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {executiveKPIs.map((kpi, index) => (
          <Card key={index} className="p-6 border border-border-secondary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 px-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground font-gilroy">
                  {kpi.title}
                </CardTitle>
                <Badge 
                  variant={kpi.status === "positive" ? "default" : "secondary"}
                  className="text-xs font-medium"
                >
                  {kpi.status === "positive" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {kpi.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="text-2xl font-bold text-foreground font-gilroy mb-2">
                {kpi.value}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Цель: {kpi.target} • {kpi.detail}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Initiatives */}
      <Card className="border border-border-secondary shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-lg font-gilroy">
            <Target className="w-5 h-5 text-primary" />
            Стратегические инициативы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {strategicInitiatives.map((initiative, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-muted/30 rounded-xl border border-border-secondary">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-semibold text-sm font-gilroy">{initiative.name}</h4>
                    <Badge 
                      variant={initiative.status === "positive" ? "default" : "secondary"}
                      className="text-xs font-medium"
                    >
                      {initiative.status === "positive" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {initiative.progress}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Срок: {initiative.deadline} • Инвестиции: {initiative.investment}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-6">
                  <div className="w-20 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        initiative.status === "positive" 
                          ? "bg-primary" 
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${initiative.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      <Card className="border border-border-secondary shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-lg font-gilroy">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Индикаторы рисков
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {riskIndicators.map((risk, index) => (
              <div key={index} className="p-6 border border-border-secondary rounded-xl bg-muted/20">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-semibold text-sm font-gilroy">{risk.area}</h4>
                  <Badge 
                    variant={risk.status === "positive" ? "default" : "secondary"}
                    className="text-xs font-medium"
                  >
                    {risk.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{risk.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 