# 🚀 ИИ-Автопилот Торговли на Маркетплейсах

Полноценная платформа для автоматизации торговли на Kaspi, Wildberries, Ozon и Amazon с использованием ИИ для прогнозирования спроса, автопрайсинга и оптимизации закупок.

## 🎯 Цель MVP (8-12 недель)

Доказать прирост **валовой прибыли** магазина за счёт:
- 🔒 Безопасного автопрайсинга (с "полом" маржи и ограничениями)
- 🧠 "Умного" подбора товаров к закупке (SKU × объём)
- ✍️ Генерации/улучшения карточек (LLM)
- 📊 Простого планирования пополнений

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Core API      │    │   ML Service    │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  Content       │◄─────────────┘
                        │  Service       │
                        │  (Node.js)     │
                        └─────────────────┘
```

## 🛠️ Технологический стек

### Backend
- **Core API**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **ML Service**: Python + FastAPI + LightGBM/XGBoost + Prophet
- **Content Service**: Node.js + TypeScript + OpenAI/Anthropic
- **Cache/Queues**: Redis + BullMQ
- **Auth**: JWT + RBAC

### Frontend
- **Framework**: Next.js 14 + React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Charts**: Recharts

### Infrastructure
- **Dev**: Docker Compose
- **Prod**: Kubernetes + Helm
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Sentry

## 📁 Структура проекта

```
ai-trading-platform/
├── core-api/          # Основной API (NestJS)
├── ml-service/        # ML сервис (Python/FastAPI)
├── content-service/   # Сервис контента (Node.js)
├── web-app/           # Frontend (Next.js)
├── infra/             # Docker, K8s, конфиги
└── shared/            # Общие типы и утилиты
```

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Развертывание dev-стенда
```bash
# Клонировать репозиторий
git clone <repo-url>
cd ai-trading-platform

# Поднять инфраструктуру
cd infra
docker-compose up -d

# Запустить Core API
cd ../core-api
npm install
npm run start:dev

# Запустить ML Service
cd ../ml-service
pip install -r requirements.txt
uvicorn main:app --reload

# Запустить Web App
cd ../web-app
npm install
npm run dev
```

## 📊 Основные возможности

### 1. Поиск выгодных товаров (Sourcing)
- Анализ конкурентов и спроса
- ML-прогнозирование продаж
- Скоринг SKU с учетом рисков
- Рекомендации по закупкам

### 2. Автопрайсинг с Guardrails
- Защита минимальной маржи
- Ограничения на изменение цен
- Аудит всех изменений
- Интеграция с маркетплейсами

### 3. Умные карточки товаров
- LLM-генерация описаний
- Валидация по правилам MP
- A/B тестирование
- Автоматическая публикация

### 4. Управление закупками
- Планирование PO на основе ML
- Автоматические заказы поставщикам
- Трекинг статусов и ETA
- Управление рисками

## 🔐 Безопасность

- JWT токены (access/refresh)
- RBAC с ролями: Owner, Manager, Operator, Read-only
- Шифрование API ключей маркетплейсов
- Аудит всех действий
- Rate limiting и защита от атак

## 📈 Мониторинг

- Метрики производительности
- Алерты по критическим событиям
- Логирование всех операций
- Дашборды Grafana
- Интеграция с Sentry

## 🧪 Тестирование

- Unit тесты для бизнес-логики
- Интеграционные тесты с мок-адаптерами
- E2E тесты основных сценариев
- Нагрузочное тестирование

## 📅 План разработки (12 недель)

- **Недели 1-2**: Каркас BE/FE, БД, Auth, интеграция с 1 MP
- **Недели 3-4**: Расчет прибыли, простой прогноз, Opportunities v1
- **Недели 5-6**: Pricing engine + guardrails + Audit
- **Недели 7-8**: Content LLM + Validator + Publish, A/B v1
- **Недели 9-10**: PO Orchestration (черновики, approve, PDF/email)
- **Недели 11**: Inventory, Daily report, Alerts
- **Неделя 12**: Обкатка, фичфлаги, CI/CD, документация

## 🤝 Участие в разработке

1. Выберите сервис для работы
2. Изучите архитектуру и API контракты
3. Следуйте стандартам кодирования
4. Пишите тесты для новой функциональности
5. Обновляйте документацию

## 📞 Контакты

- **Product Owner**: [Имя]
- **Tech Lead**: [Имя]
- **Architect**: [Имя]

## 📄 Лицензия

MIT License 