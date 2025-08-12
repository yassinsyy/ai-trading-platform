import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { envConfig } from './env.config';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  username: envConfig.DB_USERNAME,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_NAME,
  schema: envConfig.DB_SCHEMA,
  
  // Entities
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  
  // Migrations
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  migrationsTableName: 'migrations',
  
  // Synchronization (только для разработки!)
  synchronize: envConfig.NODE_ENV === 'development',
  
  // Logging
  logging: envConfig.NODE_ENV === 'development',
  logger: 'advanced-console',
  
  // Connection options
  extra: {
    max: 20, // максимальное количество соединений
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  },
  
  // SSL (для продакшена)
  ssl: envConfig.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
