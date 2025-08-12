import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('AI Trading Platform API')
    .setDescription('API для ИИ-автопилота торговли на маркетплейсах')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('marketplaces', 'Интеграция с маркетплейсами')
    .addTag('products', 'Управление товарами')
    .addTag('offers', 'Управление офферами')
    .addTag('pricing', 'Автопрайсинг')
    .addTag('opportunities', 'Поиск возможностей')
    .addTag('content', 'Генерация контента')
    .addTag('purchase-orders', 'Управление закупками')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 AI Trading Platform API запущен на порту ${port}`);
  console.log(`📚 Swagger документация: http://localhost:${port}/api`);
}

bootstrap();
