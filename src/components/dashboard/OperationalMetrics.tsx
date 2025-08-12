import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../dashboard-ui/card';
import { Badge } from '../dashboard-ui/badge';
import { Settings, TrendingUp, TrendingDown, Factory, CheckCircle, AlertTriangle } from 'lucide-react';

const operationalMetrics = [
  {
    title: "Производительность",
    value: "94.2%",
    change: "+2.1%",
    target: "92%",
    status: "positive"
  },
  {
    title: "Время простоя",
    value: "2.8%",
    change: "-0.5%",
    target: "3%",
    status: "positive"
  },
  {
    title: "Качество продукции",
    value: "98.7%",
    change: "+0.3%",
    target: "98%",
    status: "positive"
  },
  {
    title: "Эффективность персонала",
    value: "87.3%",
    change: "+1.2%",
    target: "85%",
    status: "positive"
  },
  {
    title: "Загрузка мощностей",
    value: "76.5%",
    change: "+3.1%",
    target: "75%",
    status: "positive"
  },
  {
    title: "Скорость доставки",
    value: "2.3 дня",
    change: "-0.2 дня",
    target: "2.5 дня",
    status: "positive"
  }
];

const productionData = [
  { line: "Линия A", efficiency: 96.2, output: 1250, quality: 99.1 },
  { line: "Линия B", efficiency: 92.8, output: 1180, quality: 98.5 },
  { line: "Линия C", efficiency: 89.4, output: 1050, quality: 97.8 },
  { line: "Линия D", efficiency: 94.7, output: 1320, quality: 99.3 }
];

const maintenanceSchedule = [
  {
    equipment: "Пресс-форма #1",
    lastMaintenance: "15.07.2024",
    nextMaintenance: "15.10.2024",
    status: "scheduled"
  },
  {
    equipment: "Конвейер A",
    lastMaintenance: "22.07.2024",
    nextMaintenance: "22.09.2024",
    status: "urgent"
  },
  {
    equipment: "Печь #3",
    lastMaintenance: "08.07.2024",
    nextMaintenance: "08.11.2024",
    status: "scheduled"
  }
];

export function OperationalMetrics() {
  return (
    <div className="space-y-6">
      {/* Key Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operationalMetrics.map((metric, index) => (
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
                Цель: {metric.target}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Production Lines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Производственные линии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productionData.map((line, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{line.line}</h4>
                  <Badge variant="outline" className="text-xs">
                    {line.efficiency}% эффективность
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Выпуск:</span>
                    <span className="ml-1 font-medium">{line.output} ед/день</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Качество:</span>
                    <span className="ml-1 font-medium">{line.quality}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            График технического обслуживания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenanceSchedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{item.equipment}</h4>
                    <Badge 
                      variant={item.status === "urgent" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {item.status === "urgent" ? (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {item.status === "urgent" ? "Срочно" : "По графику"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Последнее: {item.lastMaintenance} • Следующее: {item.nextMaintenance}
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