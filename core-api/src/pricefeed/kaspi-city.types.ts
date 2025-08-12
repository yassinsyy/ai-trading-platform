export type KaspiCityPrice = {
  cityId: string;
  cityName: string;
  price: number;
  currency?: string;
};

export type CityPriceMap = Record<string, number>; // cityId -> price

export interface KaspiCity {
  id: string;
  name: string;
  region?: string;
  isActive: boolean;
}

export interface PriceFeedItem {
  sku: string;
  model?: string;
  brand?: string;
  quantity: number;
  price: number;
  cityPrices?: KaspiCityPrice[];
  category?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
}

export interface PriceFeedMetadata {
  merchantId: string;
  generatedAt: Date;
  revision: string;
  itemCount: number;
  totalValue: number;
  cities: string[];
}
