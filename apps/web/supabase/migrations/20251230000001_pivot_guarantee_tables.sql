-- =========================================
-- Qetta 2026 Pivot: 보증 연계 플랫폼
-- 신규 테이블: awards, guarantee_providers, guarantee_applications, stofo_predictions
-- =========================================

-- 1. AWARDS (낙찰 정보)
CREATE TABLE IF NOT EXISTS awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),

  -- 계약 정보
  contract_number TEXT,
  contract_amount BIGINT NOT NULL,
  contract_start DATE,
  contract_end DATE,

  -- 보증 요구사항
  requires_performance_bond BOOLEAN DEFAULT false,
  requires_advance_payment_bond BOOLEAN DEFAULT false,
  requires_defect_bond BOOLEAN DEFAULT false,

  -- 보증 비율 (%)
  performance_bond_rate DECIMAL(5,2) DEFAULT 10.00,
  advance_payment_rate DECIMAL(5,2) DEFAULT 100.00,
  defect_bond_rate DECIMAL(5,2) DEFAULT 5.00,

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 등록됨
    'in_progress',  -- 보증 진행 중
    'guaranteed',   -- 보증 완료
    'completed',    -- 계약 완료
    'cancelled'     -- 취소
  )),

  -- 메타
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, bid_id)
);

-- 2. GUARANTEE_PROVIDERS (보증기관)
CREATE TABLE IF NOT EXISTS guarantee_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'insurance',    -- 보증보험 (SGI서울보증)
    'credit',       -- 신용보증 (신보, 기보)
    'mutual_aid',   -- 공제조합 (건설공제, 전문건설공제)
    'bank'          -- 은행 (지급보증)
  )),

  -- 연락처
  website_url TEXT,
  apply_url TEXT,
  phone TEXT,

  -- 보증료율 범위 (%)
  min_fee_rate DECIMAL(5,3),
  max_fee_rate DECIMAL(5,3),

  -- 지원 보증 유형
  supports_performance BOOLEAN DEFAULT true,
  supports_advance_payment BOOLEAN DEFAULT true,
  supports_defect BOOLEAN DEFAULT true,
  supports_bid BOOLEAN DEFAULT false,

  -- 지원 업종 (NULL = 전체)
  supported_industries TEXT[],

  -- API 연동 상태
  api_status TEXT DEFAULT 'manual' CHECK (api_status IN ('manual', 'planned', 'connected')),
  api_config JSONB DEFAULT '{}',

  -- 메타
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 보증기관 초기 데이터
INSERT INTO guarantee_providers (id, name, short_name, type, website_url, apply_url, min_fee_rate, max_fee_rate, supports_bid, display_order) VALUES
  ('sgi', 'SGI서울보증', 'SGI', 'insurance', 'https://www.sgic.co.kr', 'https://direct.sgic.co.kr', 0.5, 2.0, true, 10),
  ('kodit', '신용보증기금', '신보', 'credit', 'https://www.kodit.co.kr', 'https://www.kodit.co.kr/kodit/apply', 0.5, 2.5, false, 20),
  ('kibo', '기술보증기금', '기보', 'credit', 'https://www.kibo.or.kr', 'https://www.kibo.or.kr', 0.5, 2.0, false, 30),
  ('construction', '건설공제조합', '건설공제', 'mutual_aid', 'https://www.cgc.or.kr', 'https://www.cgc.or.kr', 0.3, 1.5, true, 40),
  ('specialty', '전문건설공제조합', '전문건설', 'mutual_aid', 'https://www.kscfc.or.kr', 'https://www.kscfc.or.kr', 0.3, 1.5, true, 50),
  ('electric', '전기공사공제조합', '전기공제', 'mutual_aid', 'https://www.ecmag.or.kr', 'https://www.ecmag.or.kr', 0.3, 1.2, true, 60)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website_url = EXCLUDED.website_url,
  apply_url = EXCLUDED.apply_url;

-- 3. GUARANTEE_APPLICATIONS (보증 신청)
CREATE TABLE IF NOT EXISTS guarantee_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  award_id UUID NOT NULL REFERENCES awards(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES guarantee_providers(id),

  -- 보증 유형
  guarantee_type TEXT NOT NULL CHECK (guarantee_type IN (
    'performance',      -- 계약이행보증
    'advance_payment',  -- 선금이행보증
    'defect',           -- 하자이행보증
    'bid'               -- 입찰보증
  )),

  -- 금액
  guarantee_amount BIGINT NOT NULL,
  guarantee_period_start DATE,
  guarantee_period_end DATE,

  -- 보증료
  estimated_fee BIGINT,
  actual_fee BIGINT,
  fee_rate DECIMAL(5,3),

  -- 상태
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',        -- 작성 중
    'submitted',    -- 제출됨
    'reviewing',    -- 심사 중
    'approved',     -- 승인
    'rejected',     -- 거절
    'issued',       -- 보증서 발급
    'cancelled'     -- 취소
  )),

  -- 신청 정보
  application_number TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,

  -- 첨부 서류
  documents JSONB DEFAULT '[]',

  -- 메모
  notes TEXT,
  rejection_reason TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STOFO_PREDICTIONS (StoFo 예측 결과)
CREATE TABLE IF NOT EXISTS stofo_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),

  -- 예측 결과
  win_probability DECIMAL(5,4) NOT NULL,  -- 0.0000 ~ 1.0000
  optimal_price BIGINT,
  price_range_low BIGINT,
  price_range_high BIGINT,

  -- 경쟁 분석
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high', 'extreme')),
  expected_competitors INTEGER,

  -- 모델 정보
  model_version TEXT DEFAULT 'stofo-v1',
  confidence_score DECIMAL(5,4),

  -- 입력 파라미터
  input_params JSONB DEFAULT '{}',

  -- 캐싱
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일 입찰-제품에 중복 방지 (24시간 캐싱)
  UNIQUE(tenant_id, bid_id, product_id)
);

-- 인덱스

-- awards
CREATE INDEX IF NOT EXISTS idx_awards_tenant ON awards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_awards_bid ON awards(bid_id);
CREATE INDEX IF NOT EXISTS idx_awards_status ON awards(status);
CREATE INDEX IF NOT EXISTS idx_awards_contract_end ON awards(contract_end);

-- guarantee_applications
CREATE INDEX IF NOT EXISTS idx_guar_app_tenant ON guarantee_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guar_app_award ON guarantee_applications(award_id);
CREATE INDEX IF NOT EXISTS idx_guar_app_provider ON guarantee_applications(provider_id);
CREATE INDEX IF NOT EXISTS idx_guar_app_status ON guarantee_applications(status);
CREATE INDEX IF NOT EXISTS idx_guar_app_type ON guarantee_applications(guarantee_type);

-- stofo_predictions
CREATE INDEX IF NOT EXISTS idx_stofo_tenant ON stofo_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stofo_bid ON stofo_predictions(bid_id);
CREATE INDEX IF NOT EXISTS idx_stofo_expires ON stofo_predictions(expires_at);
CREATE INDEX IF NOT EXISTS idx_stofo_win_prob ON stofo_predictions(win_probability DESC);

-- 트리거

DROP TRIGGER IF EXISTS update_awards_updated_at ON awards;
CREATE TRIGGER update_awards_updated_at
  BEFORE UPDATE ON awards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guar_app_updated_at ON guarantee_applications;
CREATE TRIGGER update_guar_app_updated_at
  BEFORE UPDATE ON guarantee_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantee_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stofo_predictions ENABLE ROW LEVEL SECURITY;

-- awards RLS
CREATE POLICY "Tenants can view own awards"
  ON awards FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can insert own awards"
  ON awards FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can update own awards"
  ON awards FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- guarantee_applications RLS
CREATE POLICY "Tenants can view own guarantee applications"
  ON guarantee_applications FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can manage own guarantee applications"
  ON guarantee_applications FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- stofo_predictions RLS
CREATE POLICY "Tenants can view own predictions"
  ON stofo_predictions FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can insert own predictions"
  ON stofo_predictions FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- guarantee_providers는 공개 읽기
ALTER TABLE guarantee_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guarantee providers"
  ON guarantee_providers FOR SELECT
  USING (true);

COMMENT ON TABLE awards IS '낙찰 정보 - 입찰 성공 후 계약/보증 관리';
COMMENT ON TABLE guarantee_providers IS '보증기관 정보 - SGI, 신보, 기보, 공제조합 등';
COMMENT ON TABLE guarantee_applications IS '보증 신청 - 이행보증, 선금보증, 하자보증 신청 관리';
COMMENT ON TABLE stofo_predictions IS 'StoFo Engine 예측 결과 캐싱';
