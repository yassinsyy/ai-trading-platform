-- Инициализация базы данных для платформы ИИ-автопилота торговли
-- Создаем схему core
CREATE SCHEMA IF NOT EXISTS "core";

-- Устанавливаем схему по умолчанию
SET search_path TO "core", public;

-- Создаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Создаем пользователя для приложения (опционально)
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON SCHEMA "core" TO app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "core" TO app_user;

-- Комментарий к схеме
COMMENT ON SCHEMA "core" IS 'Основная схема для платформы ИИ-автопилота торговли на маркетплейсах';
