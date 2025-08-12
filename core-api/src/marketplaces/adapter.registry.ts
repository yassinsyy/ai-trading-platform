// This file is deprecated. Use AdapterService instead.
// Keeping for backward compatibility but marking as deprecated.

import { MarketplaceAdapter, Mp } from './adapter.types';

/**
 * @deprecated Use AdapterService.resolveAdapter() instead
 */
export function resolveAdapter(mp: Mp): MarketplaceAdapter {
  throw new Error('resolveAdapter is deprecated. Use AdapterService.resolveAdapter() instead');
}

/**
 * @deprecated Use AdapterService.getAvailableAdapters() instead
 */
export function getAvailableAdapters(): Array<{mp: Mp; mode: string; available: boolean}> {
  throw new Error('getAvailableAdapters is deprecated. Use AdapterService.getAvailableAdapters() instead');
}
