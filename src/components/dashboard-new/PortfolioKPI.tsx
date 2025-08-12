import { DollarSign, Building2, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function PortfolioKPI() {
  // Мок данные для графиков
  const profitData = [
    { month: 'Янв', value: 8.2 },
    { month: 'Фев', value: 9.1 },
    { month: 'Мар', value: 10.5 },
    { month: 'Апр', value: 11.2 },
    { month: 'Май', value: 12.8 },
    { month: 'Июн', value: 14.3 },
    { month: 'Июл', value: 15.7 },
    { month: 'Авг', value: 17.4 }
  ];

  const readinessData = [
    { month: 'Янв', value: 65 },
    { month: 'Фев', value: 68 },
    { month: 'Мар', value: 72 },
    { month: 'Апр', value: 75 },
    { month: 'Май', value: 78 },
    { month: 'Июн', value: 80 },
    { month: 'Июл', value: 82 },
    { month: 'Авг', value: 85 }
  ];

  const riskData = [
    { month: 'Янв', value: 15 },
    { month: 'Фев', value: 12 },
    { month: 'Мар', value: 10 },
    { month: 'Апр', value: 8 },
    { month: 'Май', value: 6 },
    { month: 'Июн', value: 5 },
    { month: 'Июл', value: 4 },
    { month: 'Авг', value: 3 }
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Финансы */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-light-gray bg-opacity-20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-light-gray" />
            </div>
            <div>
              <h3 className="font-medium text-white">Финансы</h3>
              <p className="text-small text-light-gray">YTD результат</p>
            </div>
          </div>
          <div className="text-small text-light-gray bg-light-gray bg-opacity-20 px-2 py-1 rounded">
            +28.1%
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold text-white mb-1">63.2 млрд ₸</div>
            <div className="text-small text-light-gray">Общая прибыль (108.2% от плана)</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-white">28.7%</div>
              <div className="text-small text-light-gray">Рентабельность</div>
            </div>
            <div>
              <div className="font-semibold text-white">58.4</div>
              <div className="text-small text-light-gray">План млрд ₸</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-small text-light-gray mb-2">Динамика прибыли</div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#66FCF1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Готовность проектов */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-light-gray bg-opacity-20 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-light-gray" />
            </div>
            <div>
              <h3 className="font-medium text-white">Готовность</h3>
              <p className="text-small text-light-gray">Портфель проектов</p>
            </div>
          </div>
          <div className="text-small text-light-gray bg-light-gray bg-opacity-20 px-2 py-1 rounded">
            +12.3%
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold text-white mb-1">81%</div>
            <div className="text-small text-light-gray">Средняя готовность</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-white">3</div>
              <div className="text-small text-light-gray">В срок</div>
            </div>
            <div>
              <div className="font-semibold text-white">1</div>
              <div className="text-small text-light-gray">Под риском</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-small text-light-gray mb-2">Динамика готовности</div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessData}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#45A29E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Риски */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-light-gray bg-opacity-20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-light-gray" />
            </div>
            <div>
              <h3 className="font-medium text-white">Риски</h3>
              <p className="text-small text-light-gray">Критические зоны</p>
            </div>
          </div>
          <div className="text-small text-amber-400 bg-amber-500 bg-opacity-20 px-2 py-1 rounded">
            -15.2%
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-small text-light-gray">Проект с отставанием</div>
              <div className="text-small text-amber-400">URBAN PARK</div>
            </div>
            <div className="w-full bg-light-gray bg-opacity-20 rounded-full h-1">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: '35%' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-white">5.2</div>
              <div className="text-small text-light-gray">Млрд ₸ разрыв</div>
            </div>
            <div>
              <div className="font-semibold text-white">-12.8%</div>
              <div className="text-small text-light-gray">Недобор продаж</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-small text-light-gray mb-2">Уровень рисков</div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}