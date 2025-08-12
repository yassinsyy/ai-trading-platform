import { TrendingUp, Target } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';

export function ExecutiveSummary() {
  // Мок данные для Executive Summary
  const revenueYoYData = [
    { 
      month: 'Янв', 
      revenue2024: 8.2, 
      revenue2023: 7.1, 
      profit2024: 2.1, 
      profit2023: 1.8,
      revenueYoY: 15.5,
      profitYoY: 16.7,
      isRecent: false
    },
    { 
      month: 'Фев', 
      revenue2024: 9.1, 
      revenue2023: 7.8, 
      profit2024: 2.4, 
      profit2023: 2.0,
      revenueYoY: 16.7,
      profitYoY: 20.0,
      isRecent: false
    },
    { 
      month: 'Мар', 
      revenue2024: 10.5, 
      revenue2023: 8.9, 
      profit2024: 2.8, 
      profit2023: 2.3,
      revenueYoY: 18.0,
      profitYoY: 21.7,
      isRecent: false
    },
    { 
      month: 'Апр', 
      revenue2024: 11.2, 
      revenue2023: 9.4, 
      profit2024: 3.1, 
      profit2023: 2.5,
      revenueYoY: 19.1,
      profitYoY: 24.0,
      isRecent: false
    },
    { 
      month: 'Май', 
      revenue2024: 12.8, 
      revenue2023: 10.1, 
      profit2024: 3.6, 
      profit2023: 2.8,
      revenueYoY: 26.7,
      profitYoY: 28.6,
      isRecent: false
    },
    { 
      month: 'Июн', 
      revenue2024: 14.3, 
      revenue2023: 11.5, 
      profit2024: 4.2, 
      profit2023: 3.2,
      revenueYoY: 24.3,
      profitYoY: 31.3,
      isRecent: true
    },
    { 
      month: 'Июл', 
      revenue2024: 15.7, 
      revenue2023: 12.2, 
      profit2024: 4.7, 
      profit2023: 3.5,
      revenueYoY: 28.7,
      profitYoY: 34.3,
      isRecent: true
    },
    { 
      month: 'Авг', 
      revenue2024: 17.4, 
      revenue2023: 13.1, 
      profit2024: 5.3, 
      profit2023: 3.8,
      revenueYoY: 32.8,
      profitYoY: 39.5,
      isRecent: true
    }
  ];

  const projectsStatusData = [
    { name: 'В срок', value: 65, color: '#475569', count: 3 },
    { name: 'Риск', value: 25, color: '#f59e0b', count: 1 },
    { name: 'Отставание', value: 10, color: '#dc2626', count: 0 }
  ];

  // Вычисления
  const currentRevenue = 126.4; // млрд ₸ YTD
  const lastYearRevenue = 98.7;
  const revenueGrowth = ((currentRevenue - lastYearRevenue) / lastYearRevenue * 100).toFixed(1);

  const currentProfit = 31.2; // млрд ₸ YTD  
  const profitMargin = (currentProfit / currentRevenue * 100).toFixed(1);

  const apartmentsSold = 487;
  const apartmentsPlan = 620;
  const apartmentsPlanPercent = (apartmentsSold / apartmentsPlan * 100).toFixed(1);
  const apartmentsLastYear = 441;
  const apartmentsYoYGrowth = ((apartmentsSold - apartmentsLastYear) / apartmentsLastYear * 100).toFixed(1);

  const avgCompletion = 78.5; // средневзвешенный % завершения
  const salesPlanProgress = 74; // % выполнения годового плана продаж
  const customerSatisfaction = 4.7; // из 5

  return (
    <div className="space-y-6 mb-8">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {/* Выручка YTD */}
        <div className="card p-4">
          <div className="text-small text-light-gray mb-2">Выручка YTD</div>
          <div className="text-xl font-bold text-white mb-1">{currentRevenue} млрд ₸</div>
          <div className="flex items-center text-small">
            <TrendingUp className="w-3 h-3 text-cyan mr-1" />
            <span className="text-cyan font-medium">+{revenueGrowth}% vs LY</span>
          </div>
        </div>

        {/* Продажи квартир */}
        <div className="card p-4">
          <div className="text-small text-light-gray mb-2">Продажи квартир</div>
          <div className="text-xl font-bold text-white mb-1">{apartmentsSold} шт</div>
          <div className="flex items-center justify-between text-small">
            <span className="text-light-gray">{apartmentsPlanPercent}% к плану</span>
            <span className="text-cyan font-medium">+{apartmentsYoYGrowth}% YoY</span>
          </div>
        </div>

        {/* Прибыль YTD */}
        <div className="card p-4">
          <div className="text-small text-light-gray mb-2">Прибыль YTD</div>
          <div className="text-xl font-bold text-white mb-1">{currentProfit} млрд ₸</div>
          <div className="text-small text-light-gray">
            {profitMargin}% маржа
          </div>
        </div>

        {/* Завершение проектов */}
        <div className="card p-4">
          <div className="text-small text-light-gray mb-2">Завершение проектов</div>
          <div className="text-xl font-bold text-white mb-1">{avgCompletion}%</div>
          <div className="text-small text-light-gray">
            средневзвешенный
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="card p-4">
          <div className="text-small text-light-gray mb-2">Customer Satisfaction</div>
          <div className="text-xl font-bold text-white mb-1">{customerSatisfaction}/5.0</div>
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <div key={star} className={`w-3 h-3 rounded-full mr-1 ${star <= Math.floor(customerSatisfaction) ? 'bg-cyan' : 'bg-light-gray bg-opacity-30'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Визуализации */}
      <div className="grid grid-cols-3 gap-6">
        {/* Улучшенный комбо график: Столбцы + Линия */}
        <div className="card p-4">
          <div className="text-body font-medium text-white mb-3">
            Месячная динамика выручки и прибыли
          </div>
          <div className="h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueYoYData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#C5C6C7' }}
                />
                <YAxis hide />
                
                {/* Подсветка последних месяцев серым фоном */}
                <ReferenceLine 
                  x="Июн" 
                  stroke="none" 
                  fill="rgba(197, 198, 199, 0.1)"
                />
                
                {/* Столбцы выручки 2024 */}
                <Bar 
                  dataKey="revenue2024" 
                  fill="#66FCF1" 
                  radius={[2, 2, 0, 0]}
                  maxBarSize={20}
                />
                
                {/* Столбцы выручки 2023 (фоновые, светлее) */}
                <Bar 
                  dataKey="revenue2023" 
                  fill="#45A29E" 
                  radius={[2, 2, 0, 0]}
                  maxBarSize={12}
                />
                
                {/* Линия прибыли 2024 */}
                <Line 
                  type="monotone" 
                  dataKey="profit2024" 
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  dot={{ fill: '#FFFFFF', strokeWidth: 0, r: 2 }}
                  yAxisId="right"
                />
                
                {/* Линия прибыли 2023 */}
                <Line 
                  type="monotone" 
                  dataKey="profit2023" 
                  stroke="#C5C6C7"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Детализация с YoY процентами */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-small">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <span className="text-light-gray">Выручка 2024</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-0.5 bg-light-gray"></div>
                  <span className="text-light-gray">Прибыль 2024</span>
                </div>
              </div>
              <span className="text-light-gray">vs 2023</span>
            </div>
            
            {/* YoY проценты для последних месяцев */}
            <div className="flex items-center justify-between text-small bg-light-gray bg-opacity-10 rounded px-2 py-1">
              <span className="text-light-gray">YoY рост (Авг):</span>
              <div className="flex items-center space-x-3">
                <span className="text-cyan font-medium">Выручка +32.8%</span>
                <span className="text-cyan font-medium">Прибыль +39.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Гейдж: % выполнения плана продаж */}
        <div className="card p-4">
          <div className="text-body font-medium text-white mb-3">
            План продаж 2024
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(197, 198, 199, 0.3)" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="#66FCF1"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${salesPlanProgress * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{salesPlanProgress}%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            <div className="text-small text-light-gray">487 из 620 квартир</div>
            <div className="text-small text-light-gray">осталось 133 шт</div>
            <div className="text-small text-cyan font-medium mt-1">
              На 4 мес. опережаем план
            </div>
          </div>
        </div>

        {/* Карта статусов проектов */}
        <div className="card p-4">
          <div className="text-body font-medium text-white mb-3">
            Статусы проектов
          </div>
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsStatusData}
                    cx="50%" 
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {projectsStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1">
            {projectsStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-small">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-light-gray">{item.name}</span>
                </div>
                <span className="font-medium text-white">{item.count}</span>
              </div>
            ))}
          </div>
          
          {/* Добавим краткий инсайт */}
          <div className="mt-3 pt-2 border-t border-light-gray border-opacity-20">
            <div className="text-small text-light-gray">
              <span className="font-medium text-white">4 из 4</span> проектов без критических задержек
            </div>
          </div>
        </div>
      </div>

      {/* Ключевой инсайт для CEO */}
      <div className="card p-4">
        <div className="flex items-start space-x-3">
          <Target className="w-4 h-4 text-light-gray mt-0.5 flex-shrink-0" />
          <div className="text-body text-white">
            <span className="font-medium">Здоровье бизнеса:</span> Выручка опережает прошлый год на {revenueGrowth}%, 
            план продаж выполнен на {salesPlanProgress}%. Все проекты в штатном режиме, 
            клиентская удовлетворённость {customerSatisfaction}/5.0. 
            <span className="font-medium text-cyan"> Прогноз выполнения годового плана: 96-98%.</span>
          </div>
        </div>
      </div>
    </div>
  );
}