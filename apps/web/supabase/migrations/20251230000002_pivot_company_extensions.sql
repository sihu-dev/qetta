-- =========================================
-- BIDFLOW 2026 Pivot: 기업 정보 확장 및 MCP 로그
-- =========================================

-- 1. TENANTS 테이블 확장 (기업 상세 정보)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_number TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS representative_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS annual_revenue BIGINT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS credit_rating TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS website TEXT;

-- 기업 규모 (SME 분류용)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS company_size TEXT
  DEFAULT 'small' CHECK (company_size IN ('micro', 'small', 'medium', 'large'));

-- 주요 발주기관 (관심 기관)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS target_organizations TEXT[];

-- 보증 관련 정보
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS kodit_member BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS sgi_member BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS construction_license BOOLEAN DEFAULT false;

-- 2. PRODUCTS 테이블 확장 (파이프 규격)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pipe_size_min INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pipe_size_max INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. MCP_CALL_LOGS (MCP 호출 로그)
CREATE TABLE IF NOT EXISTS mcp_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),

  -- MCP 정보
  server_name TEXT NOT NULL,  -- 'bidflow-core', 'stofo-engine', 'guarantee-api'
  tool_name TEXT NOT NULL,    -- 'search_bids', 'predict_win_rate', etc.

  -- 요청/응답
  request_params JSONB,
  response_data JSONB,

  -- 성능
  duration_ms INTEGER,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,

  -- 소스
  source TEXT DEFAULT 'api' CHECK (source IN ('api', 'sheets', 'chrome_ext', 'webhook')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATION_SETTINGS (알림 설정)
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),

  -- 채널별 활성화
  email_enabled BOOLEAN DEFAULT true,
  slack_enabled BOOLEAN DEFAULT false,
  kakao_enabled BOOLEAN DEFAULT false,

  -- 채널 설정
  email_address TEXT,
  slack_webhook_url TEXT,
  kakao_user_id TEXT,

  -- 알림 유형별 설정
  notify_high_match BOOLEAN DEFAULT true,     -- 고신뢰도 매칭
  notify_deadline_3d BOOLEAN DEFAULT true,    -- 마감 3일 전
  notify_deadline_1d BOOLEAN DEFAULT true,    -- 마감 1일 전
  notify_guarantee_status BOOLEAN DEFAULT true, -- 보증 상태 변경

  -- 최소 점수 (이상만 알림)
  min_score_threshold INTEGER DEFAULT 80,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, profile_id)
);

-- 5. SHEETS_SYNC_LOG (Google Sheets 동기화 로그)
CREATE TABLE IF NOT EXISTS sheets_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  spreadsheet_id TEXT NOT NULL,
  sheet_name TEXT,

  -- 동기화 정보
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'push', 'pull')),
  records_synced INTEGER DEFAULT 0,

  -- 상태
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'error')),
  error_message TEXT,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. API_KEYS (외부 API 키 관리)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,  -- SHA256 해시
  key_prefix TEXT NOT NULL, -- 처음 8자 (표시용)

  -- 권한
  scopes TEXT[] DEFAULT ARRAY['read'],

  -- 제한
  rate_limit_per_minute INTEGER DEFAULT 60,

  -- 상태
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스

CREATE INDEX IF NOT EXISTS idx_mcp_logs_tenant ON mcp_call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_server ON mcp_call_logs(server_name);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_created ON mcp_call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_status ON mcp_call_logs(status);

CREATE INDEX IF NOT EXISTS idx_notif_settings_tenant ON notification_settings(tenant_id);

CREATE INDEX IF NOT EXISTS idx_sheets_sync_tenant ON sheets_sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sheets_sync_spreadsheet ON sheets_sync_logs(spreadsheet_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- RLS

ALTER TABLE mcp_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own mcp logs"
  ON mcp_call_logs FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can manage own notification settings"
  ON notification_settings FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can view own sheets sync logs"
  ON sheets_sync_logs FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can manage own api keys"
  ON api_keys FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- 트리거

DROP TRIGGER IF EXISTS update_notif_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notif_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE mcp_call_logs IS 'MCP 서버 호출 로그 - 디버깅 및 사용량 추적';
COMMENT ON TABLE notification_settings IS '사용자별 알림 설정';
COMMENT ON TABLE sheets_sync_logs IS 'Google Sheets 동기화 이력';
COMMENT ON TABLE api_keys IS '외부 API 키 관리';
