import { Target } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';

export function FinanceSection() {
  // Финансовые KPI данные
  const financialKPIs = [
    {
      title: 'Revenue',
      value: '126.4 млрд ₸',
      yoyPercent: 28.1,
      planPercent: 102.3,
      quarterValue: '42.8 млрд ₸',
      quarterYoY: 32.8
    },
    {
      title: 'Gross Profit',
      value: '45.2 млрд ₸',
      margin: '35.8% маржа',
      yoyPercent: 24.5,
      planPercent: 98.7,
      quarterValue: '16.1 млрд ₸',
      quarterMargin: '37.6%'
    },
    {
      title: 'Operating Profit',
      value: '31.2 млрд ₸',
      margin: '24.7% маржа',
      yoyPercent: 31.8,
      planPercent: 104.2,
      quarterValue: '11.4 млрд ₸'
    },
    {
      title: 'Net Profit',
      value: '22.8 млрд ₸',
      margin: '18% маржа',
      yoyPercent: 35.2,
      planPercent: 108.9,
      quarterValue: '8.7 млрд ₸'
    },
    {
      title: 'Free Cash Flow',
      value: '18.4 млрд ₸',
      yoyPercent: 42.3,
      planPercent: 95.8,
      quarterValue: '7.2 млрд ₸'
    }
  ];

  // P&L данные по кварталам
  const plData = [
    { 
      line: 'Выручка',
      q1: 38.2, 
      q2: 45.4, 
      q3: 42.8, 
      ytd: 126.4,
      isHeader: true,
      level: 0
    },
    { 
      line: '  Продажи квартир',
      q1: 34.8, 
      q2: 41.2, 
      q3: 38.9, 
      ytd: 114.9,
      level: 1
    },
    { 
      line: '  Прочие доходы',
      q1: 3.4, 
      q2: 4.2, 
      q3: 3.9, 
      ytd: 11.5,
      level: 1
    },
    { 
      line: 'Себестоимость',
      q1: -24.1, 
      q2: -28.6, 
      q3: -26.7, 
      ytd: -79.4,
      isNegative: true,
      level: 0
    },
    { 
      line: '  СМР (подрядчики)',
      q1: -16.8, 
      q2: -19.4, 
      q3: -18.2, 
      ytd: -54.4,
      isNegative: true,
      level: 1
    },
    { 
      line: '  Материалы',
      q1: -5.2, 
      q2: -6.8, 
      q3: -6.1, 
      ytd: -18.1,
      isNegative: true,
      level: 1
    },
    { 
      line: '  Прямые расходы',
      q1: -2.1, 
      q2: -2.4, 
      q3: -2.4, 
      ytd: -6.9,
      isNegative: true,
      level: 1
    },
    { 
      line: 'Валовая прибыль',
      q1: 14.1, 
      q2: 16.8, 
      q3: 16.1, 
      ytd: 47.0,
      isResult: true,
      level: 0
    },
    { 
      line: 'Операционные расходы',
      q1: -4.8, 
      q2: -5.4, 
      q3: -4.7, 
      ytd: -14.9,
      isNegative: true,
      level: 0
    },
    { 
      line: '  Маркетинг и продажи',
      q1: -2.1, 
      q2: -2.8, 
      q3: -2.3, 
      ytd: -7.2,
      isNegative: true,
      level: 1
    },
    { 
      line: '  Административные',
      q1: -1.9, 
      q2: -1.8, 
      q3: -1.6, 
      ytd: -5.3,
      isNegative: true,
      level: 1
    },
    { 
      line: '  Прочие OPEX',
      q1: -0.8, 
      q2: -0.8, 
      q3: -0.8, 
      ytd: -2.4,
      isNegative: true,
      level: 1
    },
    { 
      line: 'Операционная прибыль',
      q1: 9.3, 
      q2: 11.4, 
      q3: 11.4, 
      ytd: 32.1,
      isResult: true,
      level: 0
    },
    { 
      line: 'Финансовые расходы',
      q1: -1.8, 
      q2: -2.1, 
      q3: -1.9, 
      ytd: -5.8,
      isNegative: true,
      level: 0
    },
    { 
      line: 'Налоги',
      q1: -1.6, 
      q2: -1.9, 
      q3: -1.8, 
      ytd: -5.3,
      isNegative: true,
      level: 0
    },
    { 
      line: 'Чистая прибыль',
      q1: 5.9, 
      q2: 7.4, 
      q3: 7.7, 
      ytd: 21.0,
      isResult: true,
      isFinal: true,
      level: 0
    }
  ];

  // Вертикальный анализ (% от выручки)
  const verticalAnalysis = [
    { category: 'Выручка', percent: 100, value: 126.4, color: '#1e293b' },
    { category: 'Себестоимость', percent: 62.8, value: 79.4, color: '#ef4444' },
    { category: 'Валовая прибыль', percent: 37.2, value: 47.0, color: '#22c55e' },
    { category: 'OPEX', percent: 11.8, value: 14.9, color: '#f59e0b' },
    { category: 'EBIT', percent: 25.4, value: 32.1, color: '#3b82f6' },
    { category: 'Фин. расходы', percent: 4.6, value: 5.8, color: '#8b5cf6' },
    { category: 'Налоги', percent: 4.2, value: 5.3, color: '#6b7280' },
    { category: 'Чистая прибыль', percent: 16.6, value: 21.0, color: '#059669' }
  ];

  // Данные для Waterfall диаграммы
  const waterfallData = [
    { name: 'Выручка', value: 126.4, cumulative: 126.4, type: 'positive' },
    { name: 'Себестоимость', value: -79.4, cumulative: 47.0, type: 'negative' },
    { name: 'Валовая прибыль', value: 0, cumulative: 47.0, type: 'total' },
    { name: 'OPEX', value: -14.9, cumulative: 32.1, type: 'negative' },
    { name: 'EBIT', value: 0, cumulative: 32.1, type: 'total' },
    { name: 'Фин. расходы', value: -5.8, cumulative: 26.3, type: 'negative' },
    { name: 'Налоги', value: -5.3, cumulative: 21.0, type: 'negative' },
    { name: 'Чистая прибыль', value: 0, cumulative: 21.0, type: 'final' }
  ];

  // Тренд прибыли по кварталам (последние 8 кварталов)
  const profitTrend = [
    { period: '2022 Q3', netProfit: 3.2, grossMargin: 32.1 },
    { period: '2022 Q4', netProfit: 4.1, grossMargin: 33.8 },
    { period: '2023 Q1', netProfit: 4.4, grossMargin: 31.2 },
    { period: '2023 Q2', netProfit: 5.7, grossMargin: 34.6 },
    { period: '2023 Q3', netProfit: 5.8, grossMargin: 35.1 },
    { period: '2023 Q4', netProfit: 6.9, grossMargin: 36.2 },
    { period: '2024 Q1', netProfit: 5.9, grossMargin: 36.9 },
    { period: '2024 Q2', netProfit: 7.4, grossMargin: 37.0 },
    { period: '2024 Q3', netProfit: 7.7, grossMargin: 37.6 }
  ];

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-semibold mb-1 text-white">
              Financial Performance
            </h1>
            <p className="text-light-gray">
              Финансовые результаты • Q3 2024 YTD
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-small text-light-gray">Период отчёта</div>
            <div className="font-semibold text-white">Q1-Q3 2024</div>
          </div>
        </div>
      </div>

      {/* Упрощенные финансовые KPI карточки */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {financialKPIs.map((kpi, index) => (
          <div key={index} className="card p-4">
            {/* Заголовок KPI серым мелким */}
            <div className="text-small text-light-gray font-medium mb-3">{kpi.title}</div>
            
            {/* Основное число уменьшенное */}
            <div className="text-xl font-bold text-white mb-2">{kpi.value}</div>
            
            {/* Маржа отдельной строкой */}
            {kpi.margin && (
              <div className="text-body text-light-gray mb-3">{kpi.margin}</div>
            )}
            
            {/* Динамика YoY и план цветными бейджами */}
            <div className="flex items-center space-x-2 mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded text-small font-medium ${
                kpi.yoyPercent > 0 
                  ? 'bg-cyan bg-opacity-20 text-cyan' 
                  : 'bg-red-500 bg-opacity-20 text-red-400'
              }`}>
                {kpi.yoyPercent > 0 ? '+' : ''}{kpi.yoyPercent}% YoY
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-small font-medium ${
                kpi.planPercent >= 100 
                  ? 'bg-cyan bg-opacity-20 text-cyan' 
                  : 'bg-amber-500 bg-opacity-20 text-amber-400'
              }`}>
                {kpi.planPercent}% план
              </span>
            </div>
            
            {/* Квартальные данные внизу серым */}
            <div className="text-small text-light-gray border-t border-light-gray border-opacity-20 pt-2">
              Q3 2024: {kpi.quarterValue}
              {kpi.quarterMargin && ` | ${kpi.quarterMargin}`}
              {kpi.quarterYoY && (
                <span className={`ml-1 ${kpi.quarterYoY > 0 ? 'text-cyan' : 'text-red-400'}`}>
                  ({kpi.quarterYoY > 0 ? '+' : ''}{kpi.quarterYoY}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Визуализации и таблицы */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Квартальный P&L */}
        <div className="card p-4">
          <h3 className="text-body font-medium text-white mb-4">Квартальный P&L (млрд ₸)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-light-gray border-opacity-20">
                  <th className="text-left text-light-gray font-medium py-2">Статья</th>
                  <th className="text-right text-light-gray font-medium py-2">Q1</th>
                  <th className="text-right text-light-gray font-medium py-2">Q2</th>
                  <th className="text-right text-light-gray font-medium py-2">Q3</th>
                  <th className="text-right text-light-gray font-medium py-2 border-l border-light-gray border-opacity-20">YTD</th>
                </tr>
              </thead>
              <tbody>
                {plData.map((item, index) => (
                  <tr key={index} className={`
                    ${item.isResult ? 'border-t border-light-gray border-opacity-20' : ''}
                    ${item.isFinal ? 'border-t-2 border-light-gray bg-light-gray bg-opacity-10' : ''}
                  `}>
                    <td className={`py-1 ${
                      item.level === 1 ? 'text-light-gray' : 
                      item.isResult ? 'font-medium text-white' :
                      item.isFinal ? 'font-bold text-white' : 'text-white'
                    }`}>
                      {item.line}
                    </td>
                    <td className={`text-right py-1 ${
                      item.isNegative ? 'text-red-400' : 
                      item.isResult || item.isFinal ? 'font-medium text-white' : 'text-white'
                    }`}>
                      {item.q1 > 0 || item.isNegative ? item.q1.toFixed(1) : ''}
                    </td>
                    <td className={`text-right py-1 ${
                      item.isNegative ? 'text-red-400' : 
                      item.isResult || item.isFinal ? 'font-medium text-white' : 'text-white'
                    }`}>
                      {item.q2 > 0 || item.isNegative ? item.q2.toFixed(1) : ''}
                    </td>
                    <td className={`text-right py-1 ${
                      item.isNegative ? 'text-red-400' : 
                      item.isResult || item.isFinal ? 'font-medium text-white' : 'text-white'
                    }`}>
                      {item.q3 > 0 || item.isNegative ? item.q3.toFixed(1) : ''}
                    </td>
                    <td className={`text-right py-1 border-l border-light-gray border-opacity-20 ${
                      item.isNegative ? 'text-red-400 font-medium' : 
                      item.isResult || item.isFinal ? 'font-bold text-white' : 'font-medium text-white'
                    }`}>
                      {item.ytd.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Вертикальный анализ */}
        <div className="card p-4">
          <h3 className="text-body font-medium text-white mb-4">Структура затрат (% от выручки)</h3>
          
          {/* 100% Stacked Bar */}
          <div className="h-16 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="horizontal" data={[{ name: 'YTD 2024' }]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" hide />
                <Bar dataKey="dummy" stackId="a">
                  {verticalAnalysis.map((item, index) => (
                    <Cell key={index} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Таблица процентов */}
          <div className="space-y-2">
            {verticalAnalysis.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-small">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-white">{item.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-light-gray">{item.value} млрд ₸</span>
                  <span className="font-medium text-white w-12 text-right">{item.percent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Дополнительные визуализации */}
      <div className="grid grid-cols-2 gap-6">
        {/* Waterfall P&L */}
        <div className="card p-4">
          <h3 className="text-body font-medium text-white mb-4">Waterfall P&L YTD (млрд ₸)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis hide />
                <Bar dataKey="cumulative" fill="#475569" radius={[2, 2, 0, 0]} />
                {waterfallData.map((item, index) => (
                  <ReferenceLine 
                    key={index}
                    y={item.cumulative} 
                    stroke={item.type === 'final' ? '#059669' : '#94a3b8'} 
                    strokeDasharray={item.type === 'total' ? "3 3" : "0"}
                    strokeWidth={item.type === 'final' ? 2 : 1}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-small text-light-gray mt-2">
            Показывает путь от выручки до чистой прибыли через основные статьи затрат
          </div>
        </div>

        {/* Тренд прибыли */}
        <div className="card p-4">
          <h3 className="text-body font-medium text-white mb-4">Тренд прибыли и маржинальности</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitTrend} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis hide />
                <Bar dataKey="netProfit" fill="#475569" radius={[2, 2, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="grossMargin" 
                  stroke="#1e293b"
                  strokeWidth={2}
                  dot={{ fill: '#1e293b', strokeWidth: 0, r: 3 }}
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-small text-light-gray mt-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
                <span>Чистая прибыль</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-0.5 bg-light-gray"></div>
                <span>GP Margin %</span>
              </div>
            </div>
            <span>9 кварталов</span>
          </div>
        </div>
      </div>

      {/* Финансовые инсайты */}
      <div className="mt-8 card p-4">
        <div className="flex items-start space-x-3">
          <Target className="w-4 h-4 text-light-gray mt-0.5 flex-shrink-0" />
          <div className="text-body text-white">
            <span className="font-medium">Финансовые результаты Q3 2024:</span> Выручка выросла на 32.8% YoY до 42.8 млрд ₸. 
            Валовая маржа улучшилась до 37.6% (+2.5 п.п. YoY). Чистая прибыль показала рост 39.5% до 7.7 млрд ₸. 
            <span className="font-medium text-cyan"> Свободный денежный поток превысил план на 1.2%, составив 7.2 млрд ₸.</span>
          </div>
        </div>
      </div>
    </div>
  );
}