# Backend API для ИИ-автопилота торговли

## Описание
Backend API для платформы ИИ-автопилота торговли на маркетплейсах (Kaspi, Wildberries, Ozon, Amazon).

## Технологии
- **NestJS** - фреймворк для Node.js
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кэш и очереди
- **BullMQ** - система очередей задач

## Структура проекта
```
src/
├── config/          # Конфигурация (БД, переменные окружения)
├── entities/        # Сущности базы данных
├── migrations/      # Миграции БД
├── modules/         # Модули приложения
├── services/        # Бизнес-логика
├── controllers/     # API контроллеры
└── main.ts         # Точка входа
```

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск инфраструктуры (Docker)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Настройка переменных окружения
Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

### 4. Запуск в режиме разработки
```bash
npm run start:dev
```

## API Endpoints

### Аутентификация
- `POST /auth/login` - вход в систему
- `GET /me` - информация о текущем пользователе

### Маркетплейсы
- `GET /marketplaces` - список маркетплейсов
- `POST /marketplaces/:id/connect` - подключение к маркетплейсу
- `GET /marketplaces/:id/health` - проверка состояния подключения

### Товары и предложения
- `GET /products` - список товаров
- `GET /offers` - список предложений
- `POST /offers/:id/price/apply` - применение новой цены

### Закупки
- `GET /suppliers` - список поставщиков
- `POST /po/draft` - создание черновика заказа
- `POST /po/:id/approve` - одобрение заказа

## База данных

### Схема
Основная схема: `core`

### Основные таблицы
- `merchants` - магазины/мерчанты
- `marketplace_accounts` - аккаунты маркетплейсов
- `products` - товары
- `offers` - предложения на маркетплейсах
- `price_policies` - политики ценообразования
- `stock_snapshots` - снапшоты остатков
- `sales_daily` - ежедневные продажи
- `suppliers` - поставщики
- `purchase_orders` - заказы на закупку

### Миграции
```bash
# Создание миграции
npm run migration:generate -- -n MigrationName

# Запуск миграций
npm run migration:run

# Откат миграции
npm run migration:revert
```

## Разработка

### Команды
```bash
# Сборка
npm run build

# Линтинг
npm run lint

# Тесты
npm run test
npm run test:e2e

# Форматирование кода
npm run format
```

### Структура модулей
Каждый модуль должен содержать:
- `*.module.ts` - конфигурация модуля
- `*.service.ts` - бизнес-логика
- `*.controller.ts` - API контроллеры
- `*.dto.ts` - Data Transfer Objects
- `*.entity.ts` - сущности (если есть)

## Мониторинг и логирование

### Метрики
- Prometheus метрики на порту 9090
- Health checks для всех сервисов

### Логирование
- Structured logging в JSON формате
- Уровни: error, warn, info, debug

## Безопасность

### Аутентификация
- JWT токены (access + refresh)
- bcrypt для хеширования паролей

### Авторизация
- RBAC (Role-Based Access Control)
- Роли: Owner, Manager, Operator, Read-only

### Защита
- Rate limiting
- Helmet для HTTP заголовков
- Валидация всех входных данных

## Интеграции

### Маркетплейсы
- **Kaspi** - официальный API
- **Wildberries** - официальный API
- **Ozon** - официальный API
- **Amazon** - официальный API

### ML Service
- Python FastAPI на порту 8001
- Прогнозирование спроса
- Скоринг SKU
- Прайсинг-политики

### Content Service
- Node.js/TypeScript на порту 8002
- LLM-генерация карточек
- Валидация контента
- A/B тестирование

## Развертывание

### Production
```bash
# Сборка
npm run build

# Запуск
npm run start:prod
```

### Docker
```bash
# Сборка образа
docker build -t consulting-backend .

# Запуск контейнера
docker run -p 3000:3000 consulting-backend
```

## Поддержка

### Логи
- Логи приложения: `logs/app.log`
- Логи ошибок: `logs/error.log`

### Мониторинг
- Grafana dashboard для метрик
- Sentry для отслеживания ошибок

## Лицензия
MIT
