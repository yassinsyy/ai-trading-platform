export interface CatalogItem {
  externalId: string;
  sku: string;
  title: string;
  brand?: string;
  category?: string;
  url?: string;
}

export interface OfferStock {
  externalId: string;
  onHand: number;
  reserved: number;
  warehouse?: string;
  ts: string;
}

export interface OfferCompetition {
  externalId: string;
  competitors: any[];
  averagePrice: number;
  priceRange: { min: number; max: number };
}

export interface PriceUpdate {
  externalId: string;
  price: number;
  currency?: string;
}

export interface MarketplaceAdapter {
  name(): string;
  getCatalog(opts?: { page?: number; pageSize?: number }): Promise<CatalogItem[]>;
  getStocks(): Promise<OfferStock[]>;
  getOfferCompetition(externalId: string): Promise<OfferCompetition>;
  updatePrices(updates: PriceUpdate[]): Promise<void>;
  refreshPriceFeed(merchantId: string): Promise<{ url: string; rev: string }>;
  publishListing(externalId: string, payload: any): Promise<void>;
  getOrders(filters?: { page?: number; pageSize?: number; orderCode?: string; status?: string }): Promise<any[]>;
  updateOrderStatus(orderCode: string, status: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}
