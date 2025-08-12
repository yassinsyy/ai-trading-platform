# Келісім AI — договор за 3 минуты в Telegram

Готовим договоры для частных сделок за 3–5 минут в Telegram WebApp, с подписями (SMS/eGov), QR‑проверкой и AI‑помощником (RU/KZ).

## Структура репозитория
- `docs/` — ТЗ, схемы, процессы, чек‑листы
- `openapi.yaml` — спецификация REST API
- `backend/` — Node.js (Express) API, Telegram‑бот, генерация PDF
- `webapp/` — Telegram WebApp (React + Vite)
- `sql/` — SQL‑схема БД и миграции (M0)
- `docker-compose.yml` — локальная разработка (API + Postgres + MinIO + Caddy)

## Быстрый старт (Dev, Docker)
1. Скопируйте переменные окружения:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp webapp/.env.example webapp/.env
   ```
2. Запустите инфраструктуру и сервисы:
   ```bash
   docker compose up -d --build
   ```
3. Откройте WebApp локально: `https://localhost:5173` (стаб) или через Telegram‑бота (после настройки `TELEGRAM_BOT_TOKEN`).
4. OpenAPI (Swagger UI): `https://localhost:8080/api/docs`
5. Верификация по QR (публичная страница): `https://localhost:8080/verify/:publicId`

## Мини‑настройка Telegram
- Создайте бота через @BotFather, получите `TELEGRAM_BOT_TOKEN`
- Установите `TELEGRAM_WEBAPP_URL` (пример: `https://<ваш-домен>/`)
- Включите платежного провайдера Telegram (или используйте PayBox/HalykPay как внешний линк)

## Важные переменные окружения
См. `.env.example` и `backend/.env.example`.

Критичные:
- `DATABASE_URL` — строка подключения Postgres
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` — для хранения файлов (MinIO/S3)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBAPP_URL` — бот и WebApp
- `OPENAI_API_KEY` — AI парсинг/резюме (можно отключить флагом)
- `PAYMENT_*` — настройки платежей
- `SMS_*` — настройки SMS‑провайдера

## Сборка без Docker
Backend:
```bash
cd backend
pnpm i
pnpm dev
```
WebApp:
```bash
cd webapp
pnpm i
pnpm dev
```

## Документы
- Полное ТЗ: `docs/TZ.md`
- Диаграммы процессов и архитектуры: внутри `docs/TZ.md`

## Лицензия
Proprietary — все права защищены. Использование по согласованию. 