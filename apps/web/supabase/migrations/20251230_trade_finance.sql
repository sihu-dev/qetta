-- Trade Finance Schema Migration
-- Qetta 무역금융 데이터베이스 스키마

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 은행 정보
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  swift_code VARCHAR(11),
  api_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이행보증
CREATE TABLE IF NOT EXISTS guarantees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('performance', 'bid', 'advance_payment', 'defect', 'retention')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'KRW',
  beneficiary VARCHAR(255) NOT NULL,
  bank_id UUID REFERENCES banks(id),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'expired', 'cancelled')),
  contract_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (expiry_date > issue_date)
);

-- 환율 기록
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency VARCHAR(3) NOT NULL,
  quote_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15, 6) NOT NULL CHECK (rate > 0),
  timestamp TIMESTAMPTZ NOT NULL,
  source VARCHAR(50) NOT NULL,
  
  UNIQUE(base_currency, quote_currency, timestamp, source)
);

-- 환헤지 포지션
CREATE TABLE IF NOT EXISTS hedge_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair VARCHAR(7) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  rate DECIMAL(15, 6) NOT NULL CHECK (rate > 0),
  type VARCHAR(20) NOT NULL CHECK (type IN ('forward', 'option', 'swap')),
  maturity_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'expired')),
  premium DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 송장 (팩토링용)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debtor_name VARCHAR(255) NOT NULL,
  debtor_id VARCHAR(50),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'KRW',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'funded', 'paid', 'rejected')),
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_invoice_dates CHECK (due_date >= issue_date)
);

-- 팩터 (금융사)
CREATE TABLE IF NOT EXISTS factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  min_invoice_amount DECIMAL(15, 2),
  max_invoice_amount DECIMAL(15, 2),
  avg_advance_rate DECIMAL(5, 4),
  avg_discount_rate DECIMAL(5, 4),
  api_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 팩토링 제안
CREATE TABLE IF NOT EXISTS factoring_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  factor_id UUID NOT NULL REFERENCES factors(id),
  advance_rate DECIMAL(5, 4) NOT NULL CHECK (advance_rate > 0 AND advance_rate <= 1),
  discount_rate DECIMAL(5, 4) NOT NULL CHECK (discount_rate > 0 AND discount_rate <= 1),
  fee DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL CHECK (total_amount > 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 팩토링 거래
CREATE TABLE IF NOT EXISTS factoring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES factoring_offers(id),
  funded_amount DECIMAL(15, 2) NOT NULL,
  funded_at TIMESTAMPTZ DEFAULT NOW(),
  repaid_amount DECIMAL(15, 2),
  repaid_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'funded' CHECK (status IN ('funded', 'repaid', 'defaulted'))
);

-- Indexes
CREATE INDEX idx_guarantees_user_id ON guarantees(user_id);
CREATE INDEX idx_guarantees_status ON guarantees(status);
CREATE INDEX idx_guarantees_expiry ON guarantees(expiry_date);
CREATE INDEX idx_exchange_rates_pair ON exchange_rates(base_currency, quote_currency);
CREATE INDEX idx_exchange_rates_timestamp ON exchange_rates(timestamp);
CREATE INDEX idx_hedge_positions_user ON hedge_positions(user_id);
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_factoring_offers_invoice ON factoring_offers(invoice_id);

-- RLS Policies
ALTER TABLE guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hedge_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoring_offers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY guarantees_user_policy ON guarantees
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY hedge_positions_user_policy ON hedge_positions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY invoices_user_policy ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY factoring_offers_user_policy ON factoring_offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = factoring_offers.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guarantees_updated_at
  BEFORE UPDATE ON guarantees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial bank data
INSERT INTO banks (name, code, swift_code, api_enabled) VALUES
  ('하나은행', '081', 'HNBNKRSE', true),
  ('신한은행', '088', 'SHBKKRSE', true),
  ('KB국민은행', '004', 'CZNBKRSE', true),
  ('우리은행', '020', 'HVBKKRSE', true),
  ('NH농협은행', '011', 'NACFKRSE', false),
  ('IBK기업은행', '003', 'IBKOKRSE', false),
  ('KDB산업은행', '002', 'KODBKRSE', false)
ON CONFLICT (code) DO NOTHING;
