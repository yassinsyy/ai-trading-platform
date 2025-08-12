import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceAdapter, Mp } from './adapter.types';
import { KaspiFeedAdapter } from './adapters/kaspi-feed.adapter';
import { KaspiSimAdapter } from './adapters/kaspi-sim.adapter';
import { KaspiHttpAdapter } from './adapters/kaspi-http.adapter';
import { PriceFeedPublisher } from '../pricefeed/pricefeed.publisher';

@Injectable()
export class AdapterService {
  private readonly logger = new Logger(AdapterService.name);

  constructor(private readonly priceFeedPublisher: PriceFeedPublisher) {}

  resolveAdapter(mp: Mp): MarketplaceAdapter {
    const mode = process.env[`MP_${mp}_MODE`] || 'feed'; // 'feed' | 'api' | 'sim'
    
    this.logger.debug(`Resolving adapter for ${mp} in mode ${mode}`);
    
    switch (mp) {
      case 'KASPI':
        switch (mode) {
          case 'feed':
            return new KaspiFeedAdapter(this.priceFeedPublisher);
          case 'sim':
            return new KaspiSimAdapter();
          case 'api':
            return new KaspiHttpAdapter({
              baseUrl: process.env.KASPI_API_BASE_URL,
              token: process.env.KASPI_API_TOKEN,
              batchSize: parseInt(process.env.KASPI_BATCH_SIZE || '100'),
            });
          default:
            throw new Error(`Unknown mode ${mode} for KASPI`);
        }
      
      case 'WB':
        // TODO: Implement Wildberries adapters
        throw new Error(`No adapter implemented for ${mp} in mode ${mode}`);
      
      case 'OZON':
        // TODO: Implement Ozon adapters
        throw new Error(`No adapter implemented for ${mp} in mode ${mode}`);
      
      default:
        throw new Error(`Unknown marketplace: ${mp}`);
    }
  }

  getAvailableAdapters(): Array<{mp: Mp; mode: string; available: boolean}> {
    const marketplaces: Mp[] = ['KASPI', 'WB', 'OZON'];
    const modes = ['feed', 'api', 'sim'];
    
    return marketplaces.flatMap(mp => 
      modes.map(mode => ({
        mp,
        mode,
        available: this.isAdapterAvailable(mp, mode)
      }))
    );
  }

  private isAdapterAvailable(mp: Mp, mode: string): boolean {
    try {
      if (mp === 'KASPI') {
        return ['feed', 'sim', 'api'].includes(mode);
      }
      return false; // WB and OZON not implemented yet
    } catch {
      return false;
    }
  }
}
