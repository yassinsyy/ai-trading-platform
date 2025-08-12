# Техническое задание (ТЗ) — «Келісім AI»

Версия: 1.0 (M0–M2)
Ответственный: CTO
Дата: {{сегодня}}

## 1. Цели и границы релиза
- Цель M0 (72 часа):
  - Telegram WebApp (TWA) фронт с мастером договора (RU/KZ)
  - Шаблоны: Аренда жилья, Расписка (займ)
  - Подпись ПЭП: рукописная подпись + SMS‑OTP, журнал подписи
  - Генерация PDF + «Сертификат подписи» + QR‑верификация (публичная страница)
  - Платежи: Telegram Payments (или внешняя ссылка PayBox/HalykPay)
  - AI: парсинг ответов → JSON, RU/KZ резюме договора
- Цель M1 (неделя 2):
  - Шаблон «Авто (предварительный) + акт»
  - Модуль «Опись имущества» (фото + OCR счетчиков)
  - E‑mail отправка PDF, пакеты/купоны, лог аудита
- Цель M2 (нед. 3–4):
  - Заявка/пилот eGov Mobile (усиленная подпись)
  - Селфи+OCR (опционально), WhatsApp Cloud API
  - PRO‑аккаунт: история, многократные подписи

## 2. Пользовательские сценарии (USM)
- Backbone: Выбор шаблона → Сбор данных → Превью+резюме → Оплата → Подпись A → Приглашение B → Подпись B → Выпуск PDF → Верификация QR → Пост‑процессы (напоминания)
- Non‑happy paths: сбой оплаты, истекший OTP, отказ B, редактирование разделов.

## 3. Acceptance criteria (M0)
- A1. Пользователь может сформировать и получить подписанный обеими сторонами PDF для «Аренда» и «Расписка» за ≤ 5 минут.
- A2. PDF содержит QR, по которому открывается публичная страница верификации (без ПДн), статус «подписан обеими» и контрольную сумму.
- A3. Подпись фиксируется журналом: метод (ПЭП), номер телефона (если предоставлен), chat_id, IP/UA, timestamp, hash документа, версия шаблона.
- A4. Оплата обязательна для снятия водяного знака; webhook меняет статус на paid.
- A5. AI‑резюме RU/KZ отображает 5–8 пунктов без искажений; temperature=0, без адвокатских советов.
- A6. ИИН валидируется (чексумма/дата рождения); маскирование в превью.
- A7. Все персональные поля шифруются при хранении.
- A8. Логи ошибок, метрики времени генерации PDF (< 2 c), доставка PDF через бота.

## 4. Архитектура
```
Telegram (Bot + WebApp)
        │ initData (HMAC)
        ▼
   WebApp (React/Vite)  ────────────────►  Backend API (Express)
        │  Canvas/OTP, openInvoice                      │
        ▼                                              ▼
   Telegram Bot (grammY) ◄────────── webhooks ◄──── Payments/SMS Provider
        │                                              │
        ▼                                              ▼
   S3 (MinIO) — файлы (PDF/подписи)          PostgreSQL — data + pgcrypto
        │                                              │
        └──────► Verify Page (/verify/:id) ◄───────────┘
```

Компоненты:
- WebApp: мастер ввода, Canvas подпись, интеграция Payments, локализация RU/KZ
- Bot: старт/кнопки, выдача PDF, OTP в чат (если не SMS)
- API: сбор/валидация, AI, генерация HTML→PDF, QR, публичная верификация
- DB: users, contracts, parties, signatures, payments, audit_logs, files
- Files: S3/MinIO для подписи изображений и PDF

## 5. Схема данных (M0)
Таблицы (SQL в `sql/001_schema.sql`):
- `users(id, tg_id, phone_e164, locale, created_at)`
- `contracts(id, public_id, type, status, template_version, fields_json, summary_ru, summary_kz, owner_user_id, created_at, updated_at)`
- `parties(id, contract_id, role, full_name_enc, iin_enc, phone_e164, tg_id, created_at)`
- `signatures(id, contract_id, party_id, method, signature_image_url, otp_hash, ip, user_agent, signed_at)`
- `payments(id, contract_id, provider, status, amount_kzt, invoice_id, created_at, updated_at)`
- `files(id, contract_id, kind, s3_key, sha256, created_at)`
- `audit_logs(id, contract_id, event, meta, created_at)`

Шифрование: поля с `_enc` через pgcrypto (PGEK в `.env`).

## 6. Контракты API (OpenAPI)
Файл: `openapi.yaml`
- POST `/api/contracts` — создать черновик
- POST `/api/contracts/{id}/fields` — сохранить/нормализовать поля (AI)
- GET `/api/contracts/{id}/preview` — превью (HTML/PDF с водяным знаком)
- POST `/api/contracts/{id}/pay` — создать инвойс
- POST `/webhooks/payments/{provider}` — вебхук платежей
- POST `/api/contracts/{id}/sign/a` — зафиксировать подпись стороны A (Canvas + OTP)
- POST `/api/contracts/{id}/invite` — создать токен приглашения стороны B
- POST `/api/contracts/{id}/sign/b` — подпись B (по токену)
- GET `/verify/{publicId}` — публичная верификация

## 7. Бизнес‑правила
- До оплаты: выдавать только превью с водяным знаком и маркировкой «не подписан».
- Подписанным считается после двух валидных записей в `signatures` с уникальными `party_id`.
- `public_id` неизменен, QR всегда валиден, но скрывает ПДн.
- OTP: 6 цифр, TTL 10 минут, не более 5 попыток.

## 8. Локализация (RU/KZ)
- Веб‑копии и шаблоны через i18n json (`webapp/src/i18n/*`, `backend/i18n/*`).
- AI резюме генерируется на обоих языках; критичный текст шаблонов — из кода/файлов.

## 9. AI‑интеграция
- Модели: `gpt-4o-mini` (или совместимая) через `OPENAI_API_KEY`.
- Функции:
  - `POST /contracts/{id}/fields`: извлечение полей по JSON‑схеме
  - `GET /contracts/{id}/summary`: краткое резюме RU/KZ (кешируем)
- Guardrails: temperature=0, размер контекста ограничен, маскируем ИИН/адрес.

## 10. Генерация PDF
- HTML шаблоны (`backend/templates/*.html`) + Puppeteer; шрифты кириллицы/KZ.
- Последняя страница — «Сертификат подписи»: метод(ы), timestamps, контрольная сумма, ссылка на QR.

## 11. Платежи
- Telegram Payments (рекомендовано) или PayBox/HalykPay (через `openLink`).
- Вебхук меняет `payments.status` → `paid`, открывает подпись.

## 12. Безопасность
- Проверка `initData` TWA (HMAC, timing‑safe compare).
- Шифрование PII (pgcrypto), S3 приватный, presigned URLs ограниченной жизни.
- HMAC вебхуков, rate‑limit, audit событий.

## 13. Логи и метрики
- Request‑id, структурные логи, тайминги PDF/AI.
- Бизнес‑метрики: Start, Preview, Pay, Paid, SignA, InviteB, SignB, PDFIssued, VerifyViewed.

## 14. Тестирование
- Unit: валидация ИИН, OTP, расчёт сроков, рендер HTML.
- Integration: платежный вебхук, SMS‑мок, генерация PDF, верификация QR.
- E2E (Playwright): сценарии аренды и расписки до выдачи PDF (стаб платежа).
- Нагрузка: 10 PDF/мин устойчиво; цель — p95 генерации < 2.5 c.

## 15. Деплой/DevOps
- Docker Compose для dev.
- Prod: Docker образы, reverse proxy (Caddy/Nginx), HTTPS, Postgres 15+, S3 (Wasabi/CF R2), бэкапы.
- Миграции: SQL файлы под контролем версий.
- Secrets: `.env` через Vault/Secrets manager (в dev — файлы).

## 16. План работ (спринты)
- Спринт 0 (3 дня): каркас, БД, API ядро, TWA, PDF, платежи (sandbox), AI‑резюме, верификация.
- Спринт 1 (7 дней): Авто+Акт, опись/OCR, e‑mail, пакеты/купоны, аналитика.
- Спринт 2 (14 дней): eGov заявка, risk‑модуль, селфи+OCR, партнёрские SDK.

## 17. ISSUE трекер (нужны уточнения)
1. [LEGAL] Подтвердить юридический текст дисклеймеров RU/KZ и условия оферты.
2. [PAY] Выбор платежного провайдера KZT для Telegram Payments или внешнего.
3. [SMS] Выбор SMS провайдера (цены/антиспам/DLR).
4. [EGOV] Контакты для eGov Mobile интеграции (тестовый контур).
5. [BRAND] Логотип/цвета/шрифты для PDF.
6. [AI] Отдельный ключ и квоты; список полей для JSON‑схем.

## 18. Приложения
- Примеры JSON‑схем (см. `backend/schemas/*.json`)
- Тексты шаблонов RU/KZ (см. `backend/templates/*`)
- Примеры ответов AI