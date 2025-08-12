export type Mp = 'KASPI' | 'WB' | 'OZON';

export type CompetitionPrice = {
  offerExternalId: string;
  minPrice: number;
  avgPrice?: number;
  maxPrice?: number;
  observedAt: Date;
};

export type StockItem = {
  offerExternalId: string;
  onHand: number;
  city?: string;
  observedAt: Date;
};

export type PriceUpdate = { 
  offerExternalId: string; 
  newPrice: number; 
  reason?: string;
  priority?: number;
};

export type PriceUpdateResult = {
  offerExternalId: string;
  status: 'OK' | 'REJECTED' | 'RETRY';
  code?: string; 
  message?: string;
  timestamp?: Date;
};

export type PriceFeedResult = {
  accepted: boolean;
  ticket?: string;
  url?: string;
  publishedAt?: Date;
};

export interface MarketplaceAdapter {
  // Основные операции
  fetchProducts?(cursor?: string): Promise<{items: any[]; next?: string}>;
  fetchStocks(offerIds: string[]): Promise<StockItem[]>;
  fetchCompetition(offerIds: string[]): Promise<CompetitionPrice[]>;
  updatePrices(batch: PriceUpdate[]): Promise<PriceUpdateResult[]>;
  
  // Альтернативные способы обновления цен
  publishPriceFeed?(feedUrl: string): Promise<PriceFeedResult>;
  
  // Метаданные адаптера
  getRateLimits(): { rpm: number; burst: number; batchSize: number };
  getMode(): 'feed' | 'api' | 'sim';
  getMarketplace(): Mp;
}
