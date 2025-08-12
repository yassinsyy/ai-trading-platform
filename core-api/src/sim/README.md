# Simulation Module

Модуль симуляции для AI Trading Platform, реализующий Rolling Horizon Control (RHC) и анализ конкурентных реакций.

## Компоненты

### RollingSimService
Основной сервис для выполнения симуляций с использованием алгоритма Rolling Horizon Control.

**Основные возможности:**
- Прогнозирование спроса с использованием ML моделей
- Генерация сценариев развития рынка
- Оптимизация портфеля продуктов
- Симуляция реакций конкурентов
- Расчет метрик риска и производительности
- Автоматическое переобучение моделей

**Ключевые методы:**
- `runRollingSimulation()` - запуск основной симуляции
- `checkRetrainingTriggers()` - проверка необходимости переобучения
- `forecastDemand()` - прогнозирование спроса
- `optimizePortfolio()` - оптимизация портфеля

### CompetitorReactionService
Сервис для анализа и симуляции реакций конкурентов на изменения цен.

**Основные возможности:**
- Анализ паттернов реакций конкурентов
- Симуляция возможных реакций на изменения цен
- Расчет времени реакции и давления на цены
- Генерация истории реакций для обучения

### SimController
REST API контроллер для управления симуляциями.

**Эндпоинты:**
- `POST /simulation/scenario` - создание и запуск сценария
- `GET /simulation/scenarios` - получение списка сценариев
- `GET /simulation/scenario/:id` - получение результатов сценария
- `GET /simulation/state` - получение текущего состояния
- `POST /simulation/competitor-analysis` - анализ конкурентов
- `POST /simulation/competitor-simulation` - симуляция реакций
- `DELETE /simulation/scenario/:id` - удаление сценария
- `POST /simulation/cleanup` - очистка завершенных симуляций

## Использование

### Создание сценария симуляции

```typescript
const scenario = {
  name: "Market Expansion Test",
  description: "Testing pricing strategy for new market entry",
  parameters: {
    portfolioOptimization: true,
    riskTolerance: "MEDIUM",
    targetMargin: 0.25
  },
  priority: "HIGH",
  horizon: 48, // 48 часов
  stepSize: 2  // 2 часа на шаг
};

const result = await simService.createAndRunScenario(scenario);
```

### Анализ конкурентов

```typescript
const analysis = await simService.analyzeCompetitorReactions({
  skuIds: ["SKU001", "SKU002"],
  timeRange: {
    start: "2024-01-01T00:00:00Z",
    end: "2024-01-31T23:59:59Z"
  }
});
```

## Архитектура

Модуль использует следующие зависимости:
- **LogLinearDemandModel** - логарифмическая модель спроса
- **PiecewiseDemandModel** - кусочная модель спроса
- **TimeSyncUtils** - утилиты синхронизации времени
- **PortfolioOptimizerService** - оптимизация портфеля
- **AugmentedBacktestService** - расширенное бэктестирование

## Конфигурация

Модуль поддерживает настройку через параметры сценария:
- Горизонт планирования (1-168 часов)
- Размер временного шага (0.25-24 часа)
- Приоритет выполнения
- Параметры оптимизации и управления рисками

## Мониторинг

Сервис предоставляет детальную информацию о состоянии симуляции:
- Прогресс выполнения (0-100%)
- Текущий шаг и общее количество шагов
- Время начала и последнего обновления
- Статус выполнения (IDLE, RUNNING, PAUSED, COMPLETED)
- Ошибки и предупреждения

## Безопасность

Все эндпоинты защищены JWT аутентификацией и требуют валидный токен доступа.
