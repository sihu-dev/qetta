-- =========================================
-- BIDFLOW 2026 Pivot: 씨엠엔텍 기업 정보 업데이트
-- =========================================

-- 씨엠엔텍 기업 상세 정보 추가
UPDATE tenants SET
  business_number = '123-45-67890',
  representative_name = '홍길동',
  industry = '유량계/계측기 제조',
  employee_count = 50,
  annual_revenue = 5000000000,  -- 50억
  credit_rating = 'A',
  address = '경기도 용인시 처인구 모현면',
  phone = '031-702-4910',
  email = 'info@cmntech.co.kr',
  website = 'https://www.cmntech.co.kr',
  company_size = 'small',
  target_organizations = ARRAY[
    'K-water (한국수자원공사)',
    '한국환경공단',
    '서울특별시 상수도사업본부',
    '한국전력공사',
    '한국지역난방공사'
  ],
  kodit_member = true,
  sgi_member = true,
  construction_license = false
WHERE slug = 'cmntech';

-- products 테이블에 파이프 규격 추가
UPDATE products SET
  category = '초음파 유량계',
  pipe_size_min = 100,
  pipe_size_max = 4000,
  description = '다회선 초음파 유량계, 상수도/취수장/정수장용'
WHERE model_number = 'UR-1000PLUS';

UPDATE products SET
  category = '전자식 유량계',
  pipe_size_min = 15,
  pipe_size_max = 2000,
  description = '일체형 전자유량계, 공업용수/상거래용'
WHERE model_number = 'MF-1000C';

UPDATE products SET
  category = '비만관 유량계',
  pipe_size_min = 100,
  pipe_size_max = 3000,
  description = '비만관형 초음파 유량계, 하수/우수/슬러지용'
WHERE model_number = 'UR-1010PLUS';

UPDATE products SET
  category = '개수로 유량계',
  pipe_size_min = 0,
  pipe_size_max = 0,  -- 개수로는 파이프 규격 없음
  description = '개수로 유량계, 하천/수로/농업용수용'
WHERE model_number = 'SL-3000PLUS';

UPDATE products SET
  category = '열량계',
  pipe_size_min = 15,
  pipe_size_max = 300,
  description = '초음파 열량계, 지역난방/빌딩 에너지용'
WHERE model_number = 'EnerRay';

-- 부경에너지 파일럿 고객 추가
INSERT INTO tenants (id, name, slug, settings, plan, business_number, industry, company_size, target_organizations)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '부경에너지',
  'bukyung-energy',
  '{
    "notification": {
      "email": true,
      "slack": false,
      "webhook": false
    },
    "matching": {
      "minScore": 50,
      "autoAction": false
    },
    "sources": {
      "ted": false,
      "sam_gov": false,
      "g2b": true
    },
    "industry": ["solar", "energy", "installation"],
    "region": ["KR"]
  }',
  'free',
  '234-56-78901',
  '태양광/설비',
  'small',
  ARRAY[
    '한국전력공사',
    '한국에너지공단',
    '한국남부발전',
    '부산광역시'
  ]
)
ON CONFLICT (slug) DO NOTHING;

-- 부경에너지 알림 설정
INSERT INTO notification_settings (tenant_id, email_enabled, notify_high_match, min_score_threshold)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  true,
  true,
  70
)
ON CONFLICT (tenant_id, profile_id) DO NOTHING;

-- 씨엠엔텍 알림 설정
INSERT INTO notification_settings (tenant_id, email_enabled, slack_enabled, notify_high_match, min_score_threshold)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  true,
  true,
  true,
  80
)
ON CONFLICT (tenant_id, profile_id) DO NOTHING;

COMMENT ON TABLE tenants IS '고객사 정보 - 기업 프로필 및 보증 관련 정보 포함';
