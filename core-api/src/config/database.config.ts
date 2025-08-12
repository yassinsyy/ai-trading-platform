import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const password = configService.get('DB_PASSWORD', '');
  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USER', 'postgres'),
    database: configService.get('DB_NAME', 'ai_trading_db'),
             entities: [
               __dirname + '/../entities/merchant.entity{.ts,.js}',
               __dirname + '/../entities/marketplace-account.entity{.ts,.js}',
               __dirname + '/../entities/product.entity{.ts,.js}',
               __dirname + '/../entities/offer.entity{.ts,.js}',
               __dirname + '/../entities/costs.entity{.ts,.js}',
               __dirname + '/../entities/fees.entity{.ts,.js}',
               __dirname + '/../entities/competitor-snapshot.entity{.ts,.js}',
               __dirname + '/../entities/stock-snapshot.entity{.ts,.js}',
               __dirname + '/../entities/price-history.entity{.ts,.js}',
               __dirname + '/../entities/price-policy.entity{.ts,.js}',
               __dirname + '/../entities/sales-daily.entity{.ts,.js}',
               __dirname + '/../entities/listing-draft.entity{.ts,.js}',
               __dirname + '/../entities/ab-test.entity{.ts,.js}',
               __dirname + '/../entities/user.entity{.ts,.js}',
             ],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    ...(password && password.trim() !== '' ? { password } : {}),
  };
  
  console.log('🔍 Database config:', {
    host: config.host,
    port: config.port,
    username: config.username,
    database: config.database,
    password: config.password ? '***' : 'undefined'
  });
  
  return config;
};
