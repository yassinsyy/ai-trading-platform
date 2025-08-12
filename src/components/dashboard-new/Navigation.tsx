
import { 
  BarChart3, 
  DollarSign, 
  Building2, 
  ShoppingCart, 
  Package, 
  Users, 
  Shield, 
  Leaf
} from "lucide-react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      subtitle: 'Сводка',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Общие KPI, тренды, инсайты'
    },
    {
      id: 'finance',
      title: 'Finance',
      subtitle: 'Финансы',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'P&L, Cash Flow, Balance Sheet'
    },
    {
      id: 'projects',
      title: 'Projects',
      subtitle: 'Проекты',
      icon: <Building2 className="w-4 h-4" />,
      description: 'Готовность, статусы, бюджеты'
    },
    {
      id: 'sales',
      title: 'Sales & Clients',
      subtitle: 'Продажи',
      icon: <ShoppingCart className="w-4 h-4" />,
      description: 'Выручка, клиенты, воронка'
    },
    {
      id: 'procurement',
      title: 'Procurement',
      subtitle: 'Закупки',
      icon: <Package className="w-4 h-4" />,
      description: 'Поставщики, контракты'
    },
    {
      id: 'hr',
      title: 'HR & Workforce',
      subtitle: 'Персонал',
      icon: <Users className="w-4 h-4" />,
      description: 'Численность, ФОТ, KPI'
    },
    {
      id: 'risks',
      title: 'Risks & Compliance',
      subtitle: 'Риски',
      icon: <Shield className="w-4 h-4" />,
      description: 'Финансовые, проектные риски'
    },
    {
      id: 'esg',
      title: 'ESG',
      subtitle: 'Устойчивость',
      icon: <Leaf className="w-4 h-4" />,
      description: 'Экология, социальные KPI'
    }
  ];

  return (
    <nav className="w-48 bg-dark-gray border-r border-light-gray border-opacity-20 h-full flex flex-col">
      {/* Логотип компании */}
      <div className="p-4 border-b border-light-gray border-opacity-20">
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="h-6 w-auto"
          />
        </div>
      </div>

      {/* Навигационные разделы */}
      <div className="flex-1 py-2">
        <div className="px-3 mb-3">
          <div className="text-xs font-medium text-light-gray uppercase tracking-wide">
            Управленческая отчётность
          </div>
        </div>

        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full px-3 py-2 text-left transition-colors duration-200 ${
                activeSection === section.id
                  ? 'bg-cyan bg-opacity-10 text-cyan border-r-2 border-cyan'
                  : 'text-light-gray hover:bg-white hover:bg-opacity-5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${
                  activeSection === section.id 
                    ? 'bg-cyan text-dark' 
                    : 'text-light-gray'
                }`}>
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {section.title}
                  </div>
                  <div className="text-xs text-light-gray truncate">
                    {section.subtitle}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Информация о пользователе */}
      <div className="p-4 border-t border-light-gray border-opacity-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan rounded-full flex items-center justify-center">
            <span className="text-dark text-sm font-medium">DG</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              Development Group
            </div>
            <div className="text-xs text-light-gray truncate">
              Администратор
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}