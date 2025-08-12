export const envConfig = {
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_NAME: process.env.DB_NAME || 'consulting_platform',
  DB_SCHEMA: process.env.DB_SCHEMA || 'core',

  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // External APIs
  KASPI_API_KEY: process.env.KASPI_API_KEY || '',
  KASPI_API_SECRET: process.env.KASPI_API_SECRET || '',
  WILDBERRIES_API_KEY: process.env.WILDBERRIES_API_KEY || '',
  OZON_API_KEY: process.env.OZON_API_KEY || '',
  AMAZON_ACCESS_KEY: process.env.AMAZON_ACCESS_KEY || '',
  AMAZON_SECRET_KEY: process.env.AMAZON_SECRET_KEY || '',

  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8001',

  // Content Service
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || 'http://localhost:8002',

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  PROMETHEUS_PORT: parseInt(process.env.PROMETHEUS_PORT || '9090'),
};
