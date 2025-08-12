import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Безопасность
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('AI Trading Platform API')
    .setDescription('API для ИИ-автопилота торговли на маркетплейсах')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Аутентификация')
    .addTag('marketplaces', 'Маркетплейсы')
    .addTag('products', 'Товары')
    .addTag('opportunities', 'Возможности')
    .addTag('pricing', 'Ценообразование')
    .addTag('purchase-orders', 'Закупки')
    .addTag('content', 'Контент')
    .addTag('reports', 'Отчёты')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Глобальный префикс
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 AI Trading Platform API запущен на порту ${port}`);
  console.log(`📚 Swagger документация: http://localhost:${port}/api`);
}

bootstrap();
