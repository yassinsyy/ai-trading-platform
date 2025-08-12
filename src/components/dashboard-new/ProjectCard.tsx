import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Car,
  Home,
  Store,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProjectData {
  id: string;
  name: string;
  address: string;
  image: string;
  progress: number;
  status: 'ontrack' | 'risk' | 'delay';
  statusText: string;
  class: string;
  completion_date?: string;
  price_from?: string;
  profit: {
    value: string;
    plan: string;
    percentage: string;
    change: string;
  };
  profitability: string;
  budget: {
    plan: string;
    fact: string;
    deviation: string;
  };
  financing: {
    remaining: string;
    percentage: number;
  };
  sales: {
    apartments: { sold: number; total: number };
    commercial: { sold: number; total: number };
    parking: { sold: number; total: number };
    revenue: string;
  };
  completion: {
    planned: string;
    forecast: string;
    deviation: string;
  };
  salesTrend: Array<{ value: number; month: string }>;
  progressTrend: Array<{ value: number; month: string }>;
}

interface ProjectCardProps {
  project: ProjectData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = {
    ontrack: {
      color: 'bg-cyan bg-opacity-20 text-cyan border-cyan border-opacity-30',
      progressColor: '#66FCF1',
      icon: <CheckCircle className="w-3 h-3" />,
      text: 'В срок'
    },
    risk: {
      color: 'bg-amber-500 bg-opacity-20 text-amber-400 border-amber-500 border-opacity-30',
      progressColor: '#f59e0b',
      icon: <AlertTriangle className="w-3 h-3" />,
      text: 'Риск'
    },
    delay: {
      color: 'bg-red-500 bg-opacity-20 text-red-400 border-red-500 border-opacity-30',
      progressColor: '#dc2626',
      icon: <Clock className="w-3 h-3" />,
      text: 'Отставание'
    }
  };

  const status = statusConfig[project.status];

  // Расчёт общих продаж
  const totalSold = project.sales.apartments.sold + project.sales.commercial.sold + project.sales.parking.sold;
  const totalUnits = project.sales.apartments.total + project.sales.commercial.total + project.sales.parking.total;
  const salesPercentage = Math.round((totalSold / totalUnits) * 100);

  return (
    <div className="card overflow-hidden">
      {/* Заголовок проекта */}
      <div className="border-b border-light-gray border-opacity-20 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-white">{project.name}</h3>
              <Badge className={`${status.color} px-2 py-1 text-small`}>
                {status.icon}
                <span className="ml-1">{status.text}</span>
              </Badge>
            </div>
            <div className="flex items-center text-light-gray space-x-3">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="text-small">{project.address}</span>
              </div>
              <span className="text-light-gray">•</span>
              <span className="bg-light-gray bg-opacity-20 text-white px-2 py-1 rounded text-small">
                {project.class}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-6 gap-6">
          {/* Левая часть: Фото + Прогресс */}
          <div className="col-span-1">
            {/* Фото объекта */}
            <div className="mb-6">
              <ImageWithFallback
                src={project.image}
                alt={project.name}
                className="w-full h-24 object-cover rounded border border-light-gray border-opacity-20"
              />
            </div>

            {/* Главный акцент - Готовность */}
            <div className="text-center mb-6">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(197, 198, 199, 0.3)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke={status.progressColor}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${project.progress * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-white">{project.progress}%</span>
                </div>
              </div>
              <div className="text-small text-light-gray">Готовность</div>
            </div>

            {/* Продажи компактно */}
            <div className="space-y-2">
              <div className="text-small font-medium text-light-gray mb-3">Продажи</div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Home className="w-3 h-3 text-light-gray" />
                  <span className="text-small">Кв.</span>
                </div>
                <span className="text-small font-medium text-white">{project.sales.apartments.sold}/{project.sales.apartments.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Store className="w-3 h-3 text-light-gray" />
                  <span className="text-small">Ком.</span>
                </div>
                <span className="text-small font-medium text-white">{project.sales.commercial.sold}/{project.sales.commercial.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Car className="w-3 h-3 text-light-gray" />
                  <span className="text-small">Парк.</span>
                </div>
                <span className="text-small font-medium text-white">{project.sales.parking.sold}/{project.sales.parking.total}</span>
              </div>
              
              <div className="pt-2 border-t border-light-gray border-opacity-20">
                <div className="font-bold text-white">{project.sales.revenue}</div>
                <div className="text-small text-light-gray">выручка</div>
              </div>
            </div>
          </div>

          {/* Правая часть: KPI */}
          <div className="col-span-5">
            {/* Топ ряд - Главные показатели */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              
              {/* Прибыль */}
              <div className="bg-light-gray bg-opacity-10 border border-light-gray border-opacity-20 rounded p-4">
                <div className="text-small text-light-gray mb-1">Прибыль</div>
                <div className="font-bold text-white mb-1">{project.profit.value}</div>
                <div className="text-small text-light-gray">{project.profit.percentage}</div>
                <div className="text-small text-light-gray mt-1">{project.profit.change}</div>
              </div>

              {/* Бюджет */}
              <div className="bg-light-gray bg-opacity-10 border border-light-gray border-opacity-20 rounded p-4">
                <div className="text-small text-light-gray mb-1">Бюджет</div>
                <div className="font-bold text-white mb-1">{project.budget.fact}</div>
                <div className="text-small text-light-gray">факт</div>
                <div className="text-small text-light-gray mt-1">{project.budget.deviation}</div>
              </div>

              {/* Рентабельность */}
              <div className="bg-light-gray bg-opacity-10 border border-light-gray border-opacity-20 rounded p-4">
                <div className="text-small text-light-gray mb-1">Рентабельность</div>
                <div className="font-bold text-white mb-1">{project.profitability}</div>
                <div className="text-small text-light-gray">маржа</div>
              </div>

              {/* Завершение */}
              <div className="bg-light-gray bg-opacity-10 border border-light-gray border-opacity-20 rounded p-4">
                <div className="text-small text-light-gray mb-1">Завершение</div>
                <div className="font-bold text-white mb-1">{project.completion.forecast}</div>
                <div className="text-small text-light-gray">прогноз</div>
                {project.completion.deviation !== 'В срок' && (
                  <div className="text-small text-red-400 mt-1">{project.completion.deviation}</div>
                )}
              </div>
            </div>

            {/* Нижний ряд - Операционные показатели */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Финансирование */}
              <div className="bg-light-gray bg-opacity-10 border border-light-gray border-opacity-20 rounded p-4">
                <div className="text-small font-medium text-light-gray mb-3">Финансирование</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-semibold text-white mb-1">{project.financing.remaining}</div>
                    <div className="text-small text-light-gray">остаток кредита</div>
                    <div className="w-full bg-light-gray bg-opacity-20 rounded-full h-1 mt-2">
                      <div 
                        className="bg-light-gray h-1 rounded-full" 
                        style={{ width: `${project.financing.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white mb-1">{salesPercentage}%</div>
                    <div className="text-small text-light-gray">продано</div>
                    <div className="text-small text-light-gray mt-1">
                      {totalSold}/{totalUnits}
                    </div>
                  </div>
                </div>
              </div>

              {/* Строительство */}
              <div className="bg-light-gray bg-opacity-10 border border-light-gray border-opacity-20 rounded p-4">
                <div className="text-small font-medium text-light-gray mb-3">Строительство</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-semibold text-white mb-1">{project.progress}%</div>
                    <div className="text-small text-light-gray">готовности</div>
                    <div className="w-full bg-light-gray bg-opacity-20 rounded-full h-1 mt-2">
                      <div 
                        className="h-1 rounded-full"
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: status.progressColor 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white mb-1">КС-{Math.floor(project.progress / 6)}</div>
                    <div className="text-small text-light-gray">этап</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка детализации */}
            <div className="flex justify-end mt-4">
              <Button variant="ghost" size="sm" className="text-xs px-4 py-2">
                <ExternalLink className="w-3 h-3 mr-2" />
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}