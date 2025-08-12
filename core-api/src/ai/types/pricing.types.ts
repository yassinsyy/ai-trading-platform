// Основные типы для системы ценообразования AI Trading Platform

export type FeeSpec = {
  pct: number; // Процентная комиссия маркетплейса
  perOrderFixed?: number; // Фиксированная комиссия за заказ
  storagePerUnitDay?: number; // Стоимость хранения за единицу в день
};

export type CostSpec = {
  buy: number; // Закупочная цена
  logistics: number; // Логистические расходы
  other?: number; // Прочие расходы
};

export type PricePolicy = {
  mode: 'MANUAL' | 'FOLLOW_MIN_COMPETITOR' | 'MARGIN_TARGET' | 'STOCK_SENSITIVE' | 'CLEARANCE' | 'AI';
  floorPrice?: number; // Минимальная цена
  ceilingPrice?: number; // Максимальная цена
  minMarginPct?: number; // Минимальная маржа в процентах
  maxPriceDeltaPctDay?: number; // Максимальное изменение цены в день (%)
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
};

export type Snapshot = {
  ts: string; // ISO UTC timestamp
  timestamp?: string; // Альтернативное поле для совместимости
  ourPrice: number;
  price?: number; // Альтернативное поле для совместимости
  cost?: number; // Стоимость
  fee?: number; // Комиссия
  id?: string; // Идентификатор
  competitor: {
    min: number;
    avg: number;
    max: number;
  } | null;
  stock: {
    onHand: number;
    reserved: number;
    city?: Record<string, number>;
  } | number; // Объединяем оба типа
  demand?: {
    mu: number; // Прогноз среднего спроса
    sigma: number; // Неопределенность спроса
  } | number; // Объединяем оба типа
  incomplete?: boolean; // Флаг неполных данных
};

export type PricingInputs = {
  offerId: string;
  sku: string;
  cost: CostSpec;
  fee: FeeSpec;
  policy: PricePolicy;
  lastAppliedPrice?: {
    value: number;
    ts: string;
  };
  latest: Snapshot;
  history: Snapshot[];
  market: 'KASPI' | 'WB' | 'OZON';
};

export type PricingDecision = {
  offerId: string;
  recommendedPrice: number;
  newPrice?: number; // Для совместимости
  reasons: string[];
  guardrailsApplied: string[];
  kpis: {
    marginPct: number;
    expectedUnits: number;
    expectedProfit: number;
  };
};

export type DemandModelParams = {
  intercept: number; // a_i в лог-линейной модели
  priceElasticity: number; // b_i в лог-линейной модели
  competitorWeight: number; // η для влияния конкурентов
  seasonalityWeight: number; // γ для сезонности
  positionWeight: number; // γ для позиции в выдаче
};

export type DemandForecast = {
  expected: number;
  confidence: {
    lower: number;
    upper: number;
  };
  scenarios: number[]; // Сгенерированные сценарии для VaR/CVaR
};

export type PortfolioConstraints = {
  maxVaR: number; // Максимальный VaR портфеля
  maxCVaR: number; // Максимальный CVaR портфеля
  minExpectedReturn: number; // Минимальная ожидаемая доходность
  maxDrawdown: number; // Максимальная просадка
};

export type PortfolioOptimizationResult = {
  prices: Record<string, number>; // Цены для каждого SKU
  optimalPrices?: number[]; // Альтернативное поле для совместимости
  expectedReturn: number;
  portfolioVaR: number;
  portfolioCVaR: number;
  sharpeRatio: number;
  constraints: {
    satisfied: boolean;
    violations: string[];
  };
};

export type CompetitorReactionModel = {
  responseProbability: number; // Вероятность ответа конкурента
  priceChangeDelta: number; // Дельта изменения цены конкурента
  responseDelay: number; // Задержка ответа в днях
  aggressiveness: 'low' | 'medium' | 'high';
  // Дополнительные поля для совместимости
  baseReactionProbability?: number;
  priceSensitivity?: number;
  competitiveIntensity?: number;
  baseReactionRatio?: number;
  baseReactionDelay?: number;
  minPrice?: number;
  maxPriceChangePct?: number;
  systemRejectionProbability?: number;
};

export type SimulationState = {
  currentWeek: number;
  skuStates: Record<string, {
    price: number;
    stock: number;
    demand: number;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  competitorStates: Record<string, {
    price: number;
    lastReaction: number;
  }>;
  marketConditions: {
    seasonality: number;
    volatility: number;
    competitiveIntensity: number;
  };
};

export type BacktestResult = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  maxDrawdown: number;
  sharpeRatio: number;
  weeklyMetrics: Array<{
    week: number;
    revenue: number;
    profit: number;
    margin: number;
    stockOutRate: number;
  }>;
  confidenceIntervals: {
    profit: { lower: number; upper: number };
    margin: { lower: number; upper: number };
    drawdown: { lower: number; upper: number };
  };
};

// Дополнительные типы для симуляций
export type SimulationResult = {
  scenarioId: string;
  startTime: string;
  endTime: string;
  steps: any[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
    stockOutRate: number;
    daysOfCover: number;
    turnoverSpeed: number;
  };
  riskMetrics: {
    var95: number;
    cvar95: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  competitorAnalysis: any;
  recommendations: any[];
};

export type ReactionSimulation = {
  competitorId?: string;
  reactionType?: string;
  delay?: number;
  priceChangePct?: number;
  confidence?: number;
};

export type RetrainingTrigger = {
  id: string;
  type: string;
  timestamp: string;
};

// Дополнительные типы для совместимости
export type PricingRecommendation = {
  recommendedPrice: number;
  confidence: number;
  reasons: string[];
};

export type StockLevel = {
  onHand: number;
  reserved: number;
  city?: Record<string, number>;
};

export type DemandLevel = {
  mu: number;
  sigma: number;
};

// Алиасы для совместимости
export type Stock = StockLevel | number;
export type Demand = DemandLevel | number;
