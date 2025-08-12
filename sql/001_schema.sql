-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tg_id BIGINT UNIQUE,
  phone_e164 TEXT,
  locale TEXT DEFAULT 'ru',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id UUID UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rent','loan')),
  status TEXT NOT NULL DEFAULT 'draft',
  template_version TEXT NOT NULL,
  fields_json JSONB NOT NULL DEFAULT '{}',
  summary_ru TEXT,
  summary_kz TEXT,
  owner_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Parties
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  full_name_enc BYTEA,
  iin_enc BYTEA,
  phone_e164 TEXT,
  tg_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Signatures
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  signature_image_url TEXT,
  otp_hash TEXT,
  ip TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_kzt INTEGER,
  invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);