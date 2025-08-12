import { ReactNode } from "react";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Shield, 
  Leaf,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

interface SectionConfig {
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  features: string[];
  color: string;
  gradient: string;
}

const sectionConfigs: Record<string, SectionConfig> = {
  sales: {
    title: "Sales & Clients",
    subtitle: "Продажи и клиентская база",
    description: "Аналитика продаж, воронка клиентов, конверсии и выручка по каналам",
    icon: <ShoppingCart className="w-6 h-6" />,
    features: [
      "Воронка продаж по этапам",
      "Конверсии по каналам",
      "LTV и CAC метрики",
      "Клиентская сегментация",
      "Прогнозы продаж"
    ],
    color: "text-cyan",
    gradient: "from-cyan-500 to-teal-500"
  },
  procurement: {
    title: "Procurement",
    subtitle: "Закупки и поставщики",
    description: "Управление поставщиками, контрактами, закупочными процессами и затратами",
    icon: <Package className="w-6 h-6" />,
    features: [
      "База поставщиков",
      "Контрактная аналитика",
      "Закупочные процессы",
      "Контроль затрат",
      "Оптимизация закупок"
    ],
    color: "text-teal",
    gradient: "from-teal-500 to-cyan-500"
  },
  hr: {
    title: "HR & Workforce",
    subtitle: "Персонал и кадры",
    description: "Управление персоналом, производительность, ФОТ и HR метрики",
    icon: <Users className="w-6 h-6" />,
    features: [
      "Численность персонала",
      "Производительность труда",
      "ФОТ и компенсации",
      "Текучесть кадров",
      "HR KPI и метрики"
    ],
    color: "text-purple-500",
    gradient: "from-purple-500 to-pink-500"
  },
  risks: {
    title: "Risks & Compliance",
    subtitle: "Риски и соответствие",
    description: "Мониторинг рисков, соответствие требованиям, аудит и контроль",
    icon: <Shield className="w-6 h-6" />,
    features: [
      "Финансовые риски",
      "Операционные риски",
      "Соответствие требованиям",
      "Аудит и контроль",
      "Планы реагирования"
    ],
    color: "text-amber-500",
    gradient: "from-amber-500 to-orange-500"
  },
  esg: {
    title: "ESG",
    subtitle: "Устойчивое развитие",
    description: "Экологические, социальные и управленческие показатели устойчивого развития",
    icon: <Leaf className="w-6 h-6" />,
    features: [
      "Экологические показатели",
      "Социальная ответственность",
      "Корпоративное управление",
      "Устойчивое развитие",
      "ESG рейтинги"
    ],
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-500"
  }
};

interface SectionPlaceholderProps {
  section: string;
}

export function SectionPlaceholder({ section }: SectionPlaceholderProps) {
  const config = sectionConfigs[section] || {
    title: "Раздел в разработке",
    subtitle: "Функциональность готовится",
    description: "Данный раздел находится в стадии разработки и будет доступен в ближайшее время",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Аналитика данных",
      "Интерактивные графики",
      "Детальная отчетность",
      "Экспорт данных",
      "Настройка дашбордов"
    ],
    color: "text-light-gray",
    gradient: "from-light-gray to-light-gray"
  };

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-semibold mb-1 text-white">
              {config.title}
            </h1>
            <p className="text-light-gray">
              {config.subtitle} • Август 2024
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-small text-light-gray">Статус</div>
            <div className="font-medium text-amber-400">В разработке</div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - Описание */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-lg flex items-center justify-center text-white`}>
                {config.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {config.title}
                </h2>
                <p className="text-light-gray">
                  {config.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-light-gray mb-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  Планируемая функциональность
                </h3>
                <p className="text-light-gray">
                  {config.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-light-gray rounded-full"></div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка - Статус */}
        <div className="space-y-6">
          {/* Статус разработки */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">
              Статус разработки
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-light-gray">Планирование</span>
                <CheckCircle className="w-4 h-4 text-cyan" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-light-gray">Дизайн</span>
                <CheckCircle className="w-4 h-4 text-cyan" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-light-gray">Разработка</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-light-gray">Тестирование</span>
                <div className="w-4 h-4 bg-light-gray bg-opacity-30 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-light-gray">Запуск</span>
                <div className="w-4 h-4 bg-light-gray bg-opacity-30 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Прогресс */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">
              Прогресс
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-light-gray text-small">Общий прогресс</span>
                  <span className="text-white font-medium">45%</span>
                </div>
                <div className="w-full bg-light-gray bg-opacity-20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan to-teal h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">2-3 недели</div>
                <div className="text-small text-light-gray">до завершения</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}