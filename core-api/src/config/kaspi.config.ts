export const kaspiConfig = {
  // Kaspi Shop API (orders/status REST)
  shopApi: {
    baseUrl: process.env.KASPI_SHOP_API_BASE || 'https://kaspi.kz/shop/api/v2',
    token: process.env.KASPI_API_TOKEN || '',
    timeout: 30000,
    rateLimit: {
      requestsPerMinute: 100,
      maxConcurrent: 5
    }
  },

  // Price Feed (XML generation and publishing)
  priceFeed: {
    publicBaseUrl: process.env.PRICEFEED_PUBLIC_BASE_URL || 'https://cdn.example.com/feeds',
    bucket: process.env.PRICEFEED_BUCKET || 'pricefeeds',
    prefix: process.env.PRICEFEED_PREFIX || 'kaspi/',
    publishIntervalCron: process.env.PRICEFEED_PUBLISH_INTERVAL_CRON || '*/15 * * * *',
    xmlFormat: {
      rootElement: 'pricefeed',
      itemElement: 'item',
      attributes: {
        generatedAt: '@_generatedAt',
        merchantId: '@_id',
        cityId: '@_cityId'
      }
    }
  },

  // S3/MinIO storage
  storage: {
    endpoint: process.env.S3_ENDPOINT || 'https://s3.example.com',
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    bucket: process.env.PRICEFEED_BUCKET || 'pricefeeds'
  }
};
