import { Injectable, Logger } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import { PriceFeedItem, PriceFeedMetadata } from './kaspi-city.types';
import { kaspiConfig } from '../config/kaspi.config';

@Injectable()
export class PriceFeedService {
  private readonly logger = new Logger(PriceFeedService.name);

  /**
   * Собираем XML фид по данным из БД: SKU, базовая цена, остаток.
   * Опционально — цены по городам (cityPrices).
   */
  async buildXml(merchantId: string, items: PriceFeedItem[]): Promise<string> {
    this.logger.debug(`Building XML feed for merchant ${merchantId} with ${items.length} items`);

    try {
      const doc = create({
        version: '1.0',
        encoding: 'UTF-8'
      });

      const root = doc.ele(kaspiConfig.priceFeed.xmlFormat.rootElement);
      root.att(kaspiConfig.priceFeed.xmlFormat.attributes.generatedAt.replace('@_', ''), new Date().toISOString());
      
      const merchant = root.ele('merchant');
      merchant.att(kaspiConfig.priceFeed.xmlFormat.attributes.merchantId.replace('@_', ''), merchantId);
      
      const itemsElement = root.ele('items');
      
      items.forEach((item) => {
        const itemElement = itemsElement.ele(kaspiConfig.priceFeed.xmlFormat.itemElement);
        
        itemElement.ele('sku').txt(item.sku);
        if (item.model) itemElement.ele('model').txt(item.model);
        if (item.brand) itemElement.ele('brand').txt(item.brand);
        itemElement.ele('quantity').txt(item.quantity.toString());
        itemElement.ele('price').txt(item.price.toString());
        if (item.category) itemElement.ele('category').txt(item.category);

        // Добавляем размеры если есть
        if (item.dimensions) {
          if (item.weight) itemElement.ele('weight').txt(item.weight.toString());
          if (item.dimensions.length) itemElement.ele('length').txt(item.dimensions.length.toString());
          if (item.dimensions.width) itemElement.ele('width').txt(item.dimensions.width.toString());
          if (item.dimensions.height) itemElement.ele('height').txt(item.dimensions.height.toString());
        }

        // Добавляем цены по городам если есть
        if (item.cityPrices && item.cityPrices.length > 0) {
          const pricesElement = itemElement.ele('prices');
          item.cityPrices.forEach(cp => {
            const priceElement = pricesElement.ele('price');
            priceElement.att(kaspiConfig.priceFeed.xmlFormat.attributes.cityId.replace('@_', ''), cp.cityId);
            priceElement.txt(cp.price.toString());
          });
        }
      });

      const xml = doc.end({ prettyPrint: true });
      this.logger.debug(`XML feed generated successfully for merchant ${merchantId}`);
      return xml;
    } catch (error) {
      this.logger.error(`Failed to generate XML feed for merchant ${merchantId}:`, error);
      throw new Error(`XML generation failed: ${error.message}`);
    }
  }

  /**
   * Создает метаданные фида для аудита
   */
  createMetadata(merchantId: string, items: PriceFeedItem[], revision: string): PriceFeedMetadata {
    const cities = new Set<string>();
    let totalValue = 0;

    items.forEach(item => {
      totalValue += item.price * item.quantity;
      if (item.cityPrices) {
        item.cityPrices.forEach(cp => cities.add(cp.cityId));
      }
    });

    return {
      merchantId,
      generatedAt: new Date(),
      revision,
      itemCount: items.length,
      totalValue,
      cities: Array.from(cities)
    };
  }

  /**
   * Валидирует данные фида перед генерацией XML
   */
  validateItems(items: PriceFeedItem[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!items || items.length === 0) {
      errors.push('Items array is empty');
      return { isValid: false, errors };
    }

    items.forEach((item, index) => {
      if (!item.sku || item.sku.trim() === '') {
        errors.push(`Item ${index}: SKU is required`);
      }
      if (typeof item.quantity !== 'number' || item.quantity < 0) {
        errors.push(`Item ${index}: Quantity must be a non-negative number`);
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item ${index}: Price must be a non-negative number`);
      }
      if (item.cityPrices) {
        item.cityPrices.forEach((cp, cpIndex) => {
          if (!cp.cityId || cp.cityId.trim() === '') {
            errors.push(`Item ${index}, city price ${cpIndex}: City ID is required`);
          }
          if (typeof cp.price !== 'number' || cp.price < 0) {
            errors.push(`Item ${index}, city price ${cpIndex}: City price must be a non-negative number`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
