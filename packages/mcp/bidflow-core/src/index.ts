/**
 * BIDFLOW Core MCP Server
 *
 * Tools:
 * - search_bids: 입찰 공고 검색
 * - get_bid_detail: 공고 상세 조회
 * - match_products: 제품-공고 매칭
 * - set_bid_action: 입찰 액션 설정
 * - get_matches: 매칭 결과 조회
 * - get_stats: 통계 조회
 * - crawl_g2b: 나라장터 크롤링
 * - get_stofo_prediction: StoFo 낙찰 예측 (v2.1)
 * - run_backtest: 백테스트 실행
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  generateBidPrediction,
  type CreditRating,
  type BidType,
  type ContractType,
} from './bidding-engine.js';
import { generateBidPredictionV2 } from './bidding-engine-v2.1.js';
import {
  getBacktestEngine,
  BacktestReporter,
  type HistoricalBid,
} from './backtest-framework.js';

// Supabase 클라이언트
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Tool 입력 스키마
const SearchBidsSchema = z.object({
  keywords: z.array(z.string()).optional(),
  source: z.enum(['g2b', 'ted', 'sam_gov']).optional(),
  deadline_from: z.string().optional(),
  deadline_to: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  limit: z.number().default(20),
});

// UUID 패턴 (RFC 4122 + 레거시 포맷 허용)
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidString = () => z.string().regex(uuidPattern, 'Invalid UUID format');

const GetBidDetailSchema = z.object({
  bid_id: uuidString(),
});

const MatchProductsSchema = z.object({
  bid_id: uuidString(),
  tenant_id: uuidString(),
  product_ids: z.array(uuidString()).optional(),
});

const SetBidActionSchema = z.object({
  match_id: uuidString(),
  action: z.enum(['BID', 'REVIEW', 'SKIP']),
  reason: z.string().optional(),
});

const GetMatchesSchema = z.object({
  tenant_id: uuidString(),
  action: z.enum(['BID', 'REVIEW', 'SKIP', 'pending']).optional(),
  min_score: z.number().optional(),
  limit: z.number().default(50),
});

const CrawlG2BSchema = z.object({
  days: z.number().default(7),
  keywords: z.array(z.string()).optional(),
  tenant_id: uuidString(),
});

const StoFoPredictionSchema = z.object({
  bid_id: uuidString(),
  product_id: uuidString(),
  tenant_id: uuidString(),
  proposed_price: z.number().optional(),
  strategy: z.enum(['aggressive', 'balanced', 'conservative']).optional(),
  bid_type: z.enum(['goods', 'service', 'construction']).optional(),
  contract_type: z.enum(['qualification_review', 'negotiation', 'sme_competition', 'lowest_price']).optional(),
  credit_rating: z.string().optional(),
  is_urgent: z.boolean().optional(),
  use_v2: z.boolean().default(true),  // v2.1 엔진 사용 여부 (기본: true)
});

const BacktestSchema = z.object({
  tenant_id: uuidString(),
  product_id: uuidString(),
  strategy: z.enum(['aggressive', 'balanced', 'conservative']).default('balanced'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  organizations: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  simulate_bidding: z.boolean().default(true),
  follow_recommendation: z.boolean().default(true),
  calculate_optimal_params: z.boolean().default(false),
  output_format: z.enum(['summary', 'full', 'markdown']).default('summary'),
});

// G2B API 설정
const G2B_CONFIG = {
  baseUrl: 'https://apis.data.go.kr/1230000',
  endpoints: {
    goodsBidList: '/BidPublicInfoService04/getBidPblancListInfoThngPPSSrch',
  },
};

// ============================================================
// Enhanced Matcher v2.0 - 한글 정규화 및 동의어 처리
// ============================================================

/**
 * 한글 키워드 정규화
 * - 공백 제거
 * - 특수문자 제거
 * - 소문자 변환
 */
function normalizeKorean(text: string): string {
  return text
    .replace(/\s+/g, '')  // 공백 제거
    .replace(/[^\w\uAC00-\uD7A3]/g, '')  // 특수문자 제거 (한글+영숫자만)
    .toLowerCase();
}

/**
 * 키워드 동의어/변형 매핑
 * 같은 의미의 다양한 표현을 매칭
 */
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  // 유량계 관련
  '초음파유량계': ['초음파 유량계', '초음파식유량계', '초음파식 유량계', 'ultrasonic flowmeter', 'ultrasonic flow meter'],
  '전자유량계': ['전자식유량계', '전자 유량계', '전자식 유량계', 'electromagnetic flowmeter', 'mag flowmeter'],
  '비만관유량계': ['비만관 유량계', '비만관식', '비만관식유량계', '비만관초음파', '비만관 초음파', 'non-full pipe', 'partial pipe'],
  '개수로유량계': ['개수로 유량계', '개수로식', '개방수로', '개방 수로', 'open channel'],

  // 열량계 관련
  '열량계': ['열량 계', '초음파열량계', '초음파 열량계', 'heat meter', 'calorimeter', 'btu meter'],

  // 규격 관련
  '일체형': ['일체식', '일체 형', 'compact', 'integrated'],
  '분리형': ['분리식', '분리 형', 'remote', 'separated'],
  '다회선': ['다회선식', '다채널', 'multi-path', 'multipath', 'multi channel'],

  // 용도/설치처
  '상수': ['상수도', '정수장', '취수장', '배수지', '급수'],
  '하수': ['하수도', '하수처리장', '오수', '폐수', '처리장'],
  '농업용수': ['농업용', '농업 용수', '관개', '관개용수', '영농용수'],
};

/**
 * 확장 키워드 매칭
 * 동의어 및 변형을 포함하여 매칭
 */
function matchKeywordWithSynonyms(bidText: string, keyword: string): boolean {
  const normalizedBid = normalizeKorean(bidText);
  const normalizedKeyword = normalizeKorean(keyword);

  // 직접 매칭
  if (normalizedBid.includes(normalizedKeyword)) {
    return true;
  }

  // 동의어 매칭
  for (const [mainKeyword, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
    const normalizedMain = normalizeKorean(mainKeyword);

    // 검색 키워드가 메인 키워드 또는 동의어에 해당하는지 확인
    if (normalizedKeyword === normalizedMain ||
        synonyms.some(s => normalizeKorean(s) === normalizedKeyword)) {
      // 공고 텍스트에서 메인 키워드 또는 동의어 중 하나라도 발견되면 매칭
      if (normalizedBid.includes(normalizedMain) ||
          synonyms.some(s => normalizedBid.includes(normalizeKorean(s)))) {
        return true;
      }
    }
  }

  // 부분 매칭 (3글자 이상 키워드만)
  if (normalizedKeyword.length >= 3) {
    // 키워드의 각 단어가 공고에 포함되어 있는지 확인
    const keywordParts = keyword.split(/[\s-_]+/).filter(p => p.length >= 2);
    if (keywordParts.length > 1) {
      const allPartsMatch = keywordParts.every(part =>
        normalizedBid.includes(normalizeKorean(part))
      );
      if (allPartsMatch) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 기관 점수 조회
 * org_scores 테이블에서 기관별 가중치 조회
 */
async function getOrganizationScore(
  tenantId: string,
  organization: string
): Promise<{ score: number; tier: string }> {
  // 기관명 정규화
  const normalizedOrg = normalizeKorean(organization);

  // org_scores 테이블 조회
  const { data: orgScores, error } = await supabase
    .from('org_scores')
    .select('organization_name, total_score, budget_tier, industry_tags')
    .eq('tenant_id', tenantId);

  if (error || !orgScores || orgScores.length === 0) {
    // 테이블에 데이터 없으면 기본 규칙 적용
    return getDefaultOrganizationScore(organization);
  }

  // 정확히 매칭되는 기관 찾기
  for (const org of orgScores) {
    if (normalizeKorean(org.organization_name) === normalizedOrg) {
      return { score: org.total_score || 0, tier: org.budget_tier || 'B' };
    }
  }

  // 부분 매칭 (기관명의 일부가 포함되어 있는지 확인)
  for (const org of orgScores) {
    const normalizedOrgName = normalizeKorean(org.organization_name);
    // 공고의 기관명에 DB 기관명이 포함되어 있거나, 그 반대인 경우
    if (normalizedOrg.includes(normalizedOrgName) || normalizedOrgName.includes(normalizedOrg)) {
      return { score: org.total_score || 0, tier: org.budget_tier || 'B' };
    }
  }

  // 산업 태그 기반 매칭
  for (const org of orgScores) {
    const industryTags = org.industry_tags as string[] || [];
    for (const tag of industryTags) {
      if (normalizedOrg.includes(normalizeKorean(tag))) {
        return { score: Math.floor((org.total_score || 0) * 0.8), tier: org.budget_tier || 'C' };
      }
    }
  }

  // 매칭 없으면 기본값
  return getDefaultOrganizationScore(organization);
}

/**
 * 기본 기관 점수 (규칙 기반)
 */
function getDefaultOrganizationScore(organization: string): { score: number; tier: string } {
  const normalizedOrg = normalizeKorean(organization);

  // Tier S (50점) - 주요 발주처
  const tierS = ['한국수자원공사', 'kwater', '상수도사업본부', '환경부', '국토교통부'];
  if (tierS.some(k => normalizedOrg.includes(normalizeKorean(k)))) {
    return { score: 50, tier: 'S' };
  }

  // Tier A (40점) - 우량 발주처
  const tierA = ['지역난방', '난방공사', '도시가스', '가스공사', '에너지공단', '발전공사'];
  if (tierA.some(k => normalizedOrg.includes(normalizeKorean(k)))) {
    return { score: 40, tier: 'A' };
  }

  // Tier B (30점) - 일반 공기업
  const tierB = ['농어촌공사', '환경공단', '시설공단', '개발공사', '도로공사'];
  if (tierB.some(k => normalizedOrg.includes(normalizeKorean(k)))) {
    return { score: 30, tier: 'B' };
  }

  // Tier C (20점) - 지자체
  const tierC = ['시청', '군청', '구청', '도청', '광역시', '특별시', '특별자치'];
  if (tierC.some(k => normalizedOrg.includes(normalizeKorean(k)))) {
    return { score: 20, tier: 'C' };
  }

  // Tier D (10점) - 기타 공공기관
  const tierD = ['대학교', '학교', '연구원', '연구소', '병원', '의료원'];
  if (tierD.some(k => normalizedOrg.includes(normalizeKorean(k)))) {
    return { score: 10, tier: 'D' };
  }

  // 기본값 (15점)
  return { score: 15, tier: 'E' };
}

// MCP 서버 생성
const server = new Server(
  {
    name: 'bidflow-core',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tools 목록
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_bids',
      description: '입찰 공고 검색. 키워드, 소스, 마감일, 금액으로 필터링 가능.',
      inputSchema: {
        type: 'object',
        properties: {
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: '검색 키워드',
          },
          source: {
            type: 'string',
            enum: ['g2b', 'ted', 'sam_gov'],
            description: '데이터 소스',
          },
          deadline_from: {
            type: 'string',
            description: '마감일 시작 (YYYY-MM-DD)',
          },
          deadline_to: {
            type: 'string',
            description: '마감일 종료 (YYYY-MM-DD)',
          },
          min_price: {
            type: 'number',
            description: '최소 추정가격',
          },
          max_price: {
            type: 'number',
            description: '최대 추정가격',
          },
          limit: {
            type: 'number',
            description: '결과 수 (기본 20)',
          },
        },
      },
    },
    {
      name: 'get_bid_detail',
      description: '입찰 공고 상세 정보 조회',
      inputSchema: {
        type: 'object',
        properties: {
          bid_id: {
            type: 'string',
            description: '공고 ID (UUID)',
          },
        },
        required: ['bid_id'],
      },
    },
    {
      name: 'match_products',
      description: '입찰 공고와 제품 매칭 (175점 체계)',
      inputSchema: {
        type: 'object',
        properties: {
          bid_id: {
            type: 'string',
            description: '공고 ID',
          },
          tenant_id: {
            type: 'string',
            description: '테넌트 ID',
          },
          product_ids: {
            type: 'array',
            items: { type: 'string' },
            description: '매칭할 제품 ID 목록 (생략 시 전체)',
          },
        },
        required: ['bid_id', 'tenant_id'],
      },
    },
    {
      name: 'set_bid_action',
      description: '입찰 액션 설정 (BID/REVIEW/SKIP)',
      inputSchema: {
        type: 'object',
        properties: {
          match_id: {
            type: 'string',
            description: '매칭 ID',
          },
          action: {
            type: 'string',
            enum: ['BID', 'REVIEW', 'SKIP'],
            description: '액션 유형',
          },
          reason: {
            type: 'string',
            description: '사유',
          },
        },
        required: ['match_id', 'action'],
      },
    },
    {
      name: 'get_matches',
      description: '매칭 결과 조회',
      inputSchema: {
        type: 'object',
        properties: {
          tenant_id: {
            type: 'string',
            description: '테넌트 ID',
          },
          action: {
            type: 'string',
            enum: ['BID', 'REVIEW', 'SKIP', 'pending'],
            description: '필터 액션',
          },
          min_score: {
            type: 'number',
            description: '최소 점수',
          },
          limit: {
            type: 'number',
            description: '결과 수 (기본 50)',
          },
        },
        required: ['tenant_id'],
      },
    },
    {
      name: 'get_stats',
      description: '대시보드 통계 조회',
      inputSchema: {
        type: 'object',
        properties: {
          tenant_id: {
            type: 'string',
            description: '테넌트 ID',
          },
          period: {
            type: 'string',
            enum: ['today', 'week', 'month'],
            description: '기간',
          },
        },
        required: ['tenant_id'],
      },
    },
    {
      name: 'crawl_g2b',
      description: '나라장터(G2B) 입찰공고 크롤링. 최근 N일간 공고를 가져와 DB에 저장.',
      inputSchema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: '크롤링할 기간 (기본 7일)',
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: '필터링 키워드 (유량계, 계측기 등)',
          },
          tenant_id: {
            type: 'string',
            description: '테넌트 ID',
          },
        },
        required: ['tenant_id'],
      },
    },
    {
      name: 'get_stofo_prediction',
      description: '입찰 전략 엔진 v2.1 - 2025년 공공조달 실제 로직 기반 낙찰 예측. 기관별 사정률 패턴, 카테고리/시즌별 경쟁률, 동종/유사 물품 구분, 시나리오 분석 포함.',
      inputSchema: {
        type: 'object',
        properties: {
          bid_id: {
            type: 'string',
            description: '공고 ID',
          },
          product_id: {
            type: 'string',
            description: '제품 ID',
          },
          tenant_id: {
            type: 'string',
            description: '테넌트 ID',
          },
          proposed_price: {
            type: 'number',
            description: '제안 가격 (선택, 미입력시 최적가 자동 계산)',
          },
          strategy: {
            type: 'string',
            enum: ['aggressive', 'balanced', 'conservative'],
            description: '입찰 전략 (aggressive: 하한가 근처, balanced: 균형, conservative: 88% 근처)',
          },
          bid_type: {
            type: 'string',
            enum: ['goods', 'service', 'construction'],
            description: '입찰 유형 (기본: goods)',
          },
          contract_type: {
            type: 'string',
            enum: ['qualification_review', 'negotiation', 'sme_competition', 'lowest_price'],
            description: '계약 유형 (기본: qualification_review 적격심사)',
          },
          credit_rating: {
            type: 'string',
            description: '신용등급 (AAA~D, 기본: BBB0)',
          },
          is_urgent: {
            type: 'boolean',
            description: '긴급 입찰 여부 (경쟁률 보정)',
          },
          use_v2: {
            type: 'boolean',
            description: 'v2.1 엔진 사용 여부 (기본: true)',
          },
        },
        required: ['bid_id', 'product_id', 'tenant_id'],
      },
    },
    {
      name: 'run_backtest',
      description: 'v2.1 엔진 백테스트 실행. 과거 입찰 데이터를 기반으로 예측 정확도, 수익성 분석, 파라미터 최적화 수행.',
      inputSchema: {
        type: 'object',
        properties: {
          tenant_id: {
            type: 'string',
            description: '테넌트 ID',
          },
          product_id: {
            type: 'string',
            description: '제품 ID',
          },
          strategy: {
            type: 'string',
            enum: ['aggressive', 'balanced', 'conservative'],
            description: '테스트할 전략 (기본: balanced)',
          },
          date_from: {
            type: 'string',
            description: '시작일 (YYYY-MM-DD)',
          },
          date_to: {
            type: 'string',
            description: '종료일 (YYYY-MM-DD)',
          },
          organizations: {
            type: 'array',
            items: { type: 'string' },
            description: '필터링할 발주처 목록',
          },
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: '필터링할 카테고리 목록',
          },
          min_price: {
            type: 'number',
            description: '최소 추정가격',
          },
          max_price: {
            type: 'number',
            description: '최대 추정가격',
          },
          simulate_bidding: {
            type: 'boolean',
            description: '입찰 시뮬레이션 여부 (기본: true)',
          },
          follow_recommendation: {
            type: 'boolean',
            description: '엔진 추천 따르기 (기본: true)',
          },
          calculate_optimal_params: {
            type: 'boolean',
            description: '최적 파라미터 계산 (기본: false)',
          },
          output_format: {
            type: 'string',
            enum: ['summary', 'full', 'markdown'],
            description: '출력 형식 (기본: summary)',
          },
        },
        required: ['tenant_id', 'product_id'],
      },
    },
  ],
}));

// Tool 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_bids': {
        const input = SearchBidsSchema.parse(args);
        let query = supabase
          .from('bids')
          .select('*')
          .order('deadline', { ascending: true })
          .limit(input.limit);

        if (input.source) {
          query = query.eq('source_id', input.source);
        }
        if (input.deadline_from) {
          query = query.gte('deadline', input.deadline_from);
        }
        if (input.deadline_to) {
          query = query.lte('deadline', input.deadline_to);
        }
        if (input.min_price) {
          query = query.gte('estimated_price', input.min_price);
        }
        if (input.max_price) {
          query = query.lte('estimated_price', input.max_price);
        }
        if (input.keywords && input.keywords.length > 0) {
          const keywordFilter = input.keywords
            .map(k => `title.ilike.%${k}%`)
            .join(',');
          query = query.or(keywordFilter);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: data?.length || 0,
                bids: data,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_bid_detail': {
        const input = GetBidDetailSchema.parse(args);
        const { data, error } = await supabase
          .from('bids')
          .select('*')
          .eq('id', input.bid_id)
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'match_products': {
        const input = MatchProductsSchema.parse(args);

        // 공고 조회
        const { data: bid, error: bidError } = await supabase
          .from('bids')
          .select('*')
          .eq('id', input.bid_id)
          .single();

        if (bidError) throw bidError;

        // 제품 조회
        let productQuery = supabase
          .from('products')
          .select('*')
          .eq('tenant_id', input.tenant_id)
          .eq('is_active', true);

        if (input.product_ids && input.product_ids.length > 0) {
          productQuery = productQuery.in('id', input.product_ids);
        }

        const { data: products, error: productError } = await productQuery;
        if (productError) throw productError;

        // 기관 점수 조회 (비동기)
        const orgResult = await getOrganizationScore(
          input.tenant_id,
          bid.organization || ''
        );

        // Enhanced Matcher v2.0 로직 (175점 체계)
        const matches = await Promise.all((products || []).map(async (product) => {
          const bidText = `${bid.title} ${bid.description || ''}`;
          const keywords = product.keywords as {
            primary: string[];
            secondary: string[];
            specs: string[];
            exclude: string[];
          };

          // 1. 제외 키워드 체크
          // - Primary 키워드가 공고에 있으면 제외 안함 (Primary 우선)
          // - Primary 키워드의 부분 문자열인 제외 키워드는 무시
          const normalizedBid = normalizeKorean(bidText);
          const primaryNormalized = (keywords.primary || []).map(k => normalizeKorean(k));

          // Primary 매칭 여부 먼저 확인
          const hasPrimaryMatch = primaryNormalized.some(pk => normalizedBid.includes(pk));

          // Primary가 매칭되면 제외 검사 스킵 (Primary 우선권)
          let excludeMatched: string[] = [];
          if (!hasPrimaryMatch) {
            for (const excludeKeyword of keywords.exclude || []) {
              const normalizedExclude = normalizeKorean(excludeKeyword);

              // 제외 키워드가 Primary의 부분 문자열이면 스킵
              // 예: "만관"이 "비만관"의 부분이므로 스킵
              const isSubstringOfPrimary = primaryNormalized.some(pk =>
                pk.includes(normalizedExclude) && pk.length > normalizedExclude.length
              );

              if (!isSubstringOfPrimary && normalizedBid.includes(normalizedExclude)) {
                excludeMatched.push(excludeKeyword);
              }
            }
          }

          if (excludeMatched.length > 0) {
            return {
              product_id: product.id,
              product_name: product.name,
              total_score: 0,
              keyword_score: 0,
              spec_score: 0,
              org_score: 0,
              org_tier: 'X',
              action: 'SKIP' as const,
              reason: `제외 키워드 발견: ${excludeMatched.join(', ')}`,
              matched_keywords: [],
              matched_specs: [],
            };
          }

          // 2. 키워드 점수 (0-100) - Enhanced 매칭
          let keywordScore = 0;
          const matchedKeywords: string[] = [];

          // Primary 키워드 (각 25점, 최대 100점)
          for (const k of keywords.primary || []) {
            if (matchKeywordWithSynonyms(bidText, k)) {
              keywordScore += 25;
              matchedKeywords.push(k);
            }
          }

          // Secondary 키워드 (각 10점)
          for (const k of keywords.secondary || []) {
            if (matchKeywordWithSynonyms(bidText, k) && keywordScore < 100) {
              keywordScore += 10;
              matchedKeywords.push(k);
            }
          }

          keywordScore = Math.min(keywordScore, 100);

          // 3. 규격 점수 (0-25) - DN, 규격 등
          let specScore = 0;
          const specMatches: string[] = [];

          for (const spec of keywords.specs || []) {
            // DN 규격은 정규식으로 매칭 (DN50, DN100 등)
            if (spec.startsWith('DN')) {
              const dnPattern = new RegExp(`DN\\s*${spec.slice(2)}`, 'i');
              if (dnPattern.test(bidText)) {
                specScore += 5;
                specMatches.push(spec);
              }
            } else if (matchKeywordWithSynonyms(bidText, spec)) {
              specScore += 5;
              specMatches.push(spec);
            }
          }

          specScore = Math.min(specScore, 25);

          // 4. 기관 점수 (0-50) - 실제 계산됨
          const orgScore = orgResult.score;

          const totalScore = keywordScore + specScore + orgScore;

          // 액션 결정 (조정된 임계값)
          let action: 'BID' | 'REVIEW' | 'SKIP';
          if (totalScore >= 100) {
            action = 'BID';  // 100점 이상 → 적극 입찰
          } else if (totalScore >= 50) {
            action = 'REVIEW';  // 50점 이상 → 검토 필요
          } else {
            action = 'SKIP';  // 50점 미만 → 스킵
          }

          return {
            product_id: product.id,
            product_name: product.name,
            total_score: totalScore,
            keyword_score: keywordScore,
            spec_score: specScore,
            org_score: orgScore,
            org_tier: orgResult.tier,
            action,
            matched_keywords: matchedKeywords,
            matched_specs: specMatches,
          };
        }));

        // 점수 순 정렬
        matches.sort((a, b) => b.total_score - a.total_score);

        // 매칭 결과 저장
        for (const match of matches) {
          await supabase.from('matches').upsert({
            tenant_id: input.tenant_id,
            bid_id: input.bid_id,
            product_id: match.product_id,
            total_score: match.total_score,
            keyword_score: match.keyword_score,
            spec_score: match.spec_score,
            org_score: match.org_score,
            action: match.action,
            match_details: {
              matched_keywords: match.matched_keywords,
              matched_specs: match.matched_specs,
              org_tier: match.org_tier,
              matcher_version: 'v2.0',
            },
          }, {
            onConflict: 'tenant_id,bid_id,product_id',
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                bid_id: input.bid_id,
                bid_title: bid.title,
                organization: bid.organization,
                org_tier: orgResult.tier,
                org_score: orgResult.score,
                matcher_version: 'v2.0',
                matches,
              }, null, 2),
            },
          ],
        };
      }

      case 'set_bid_action': {
        const input = SetBidActionSchema.parse(args);

        const { data, error } = await supabase
          .from('matches')
          .update({
            user_action: input.action,
            actioned_at: new Date().toISOString(),
          })
          .eq('id', input.match_id)
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                match: data,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_matches': {
        const input = GetMatchesSchema.parse(args);

        let query = supabase
          .from('matches')
          .select(`
            *,
            bids (id, title, organization, deadline, estimated_price),
            products (id, name, model_number)
          `)
          .eq('tenant_id', input.tenant_id)
          .order('total_score', { ascending: false })
          .limit(input.limit);

        if (input.action) {
          if (input.action === 'pending') {
            query = query.is('user_action', null);
          } else {
            query = query.eq('action', input.action);
          }
        }

        if (input.min_score) {
          query = query.gte('total_score', input.min_score);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: data?.length || 0,
                matches: data,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_stats': {
        const input = z.object({
          tenant_id: z.string().uuid(),
          period: z.enum(['today', 'week', 'month']).default('week'),
        }).parse(args);

        const now = new Date();
        let fromDate: Date;

        switch (input.period) {
          case 'today':
            fromDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            fromDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            fromDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        }

        // 통계 쿼리
        const { data: matchStats } = await supabase
          .from('matches')
          .select('action, total_score')
          .eq('tenant_id', input.tenant_id)
          .gte('created_at', fromDate.toISOString());

        const stats = {
          total_matches: matchStats?.length || 0,
          bid_count: matchStats?.filter(m => m.action === 'BID').length || 0,
          review_count: matchStats?.filter(m => m.action === 'REVIEW').length || 0,
          skip_count: matchStats?.filter(m => m.action === 'SKIP').length || 0,
          avg_score: matchStats?.length
            ? matchStats.reduce((sum, m) => sum + m.total_score, 0) / matchStats.length
            : 0,
          high_confidence_count: matchStats?.filter(m => m.total_score >= 120).length || 0,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case 'crawl_g2b': {
        const input = CrawlG2BSchema.parse(args);

        // 날짜 범위 계산
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);

        // G2B API 호출
        const g2bApiKey = process.env.G2B_API_KEY || '';
        const url = new URL(`${G2B_CONFIG.baseUrl}${G2B_CONFIG.endpoints.goodsBidList}`);
        url.searchParams.set('serviceKey', g2bApiKey);
        url.searchParams.set('type', 'json');
        url.searchParams.set('inqryDiv', '1');
        url.searchParams.set('inqryBgnDt', `${startStr}0000`);
        url.searchParams.set('inqryEndDt', `${endStr}2359`);
        url.searchParams.set('numOfRows', '500');
        url.searchParams.set('pageNo', '1');

        const response = await fetch(url.toString());
        const data = await response.json();

        const items = data?.response?.body?.items || [];
        let processedCount = 0;

        // 키워드 필터링
        const keywords = input.keywords || ['유량계', '계측기', '센서', '밸브', '펌프'];
        const filteredItems = items.filter((item: { bidNtceNm: string }) => {
          const title = item.bidNtceNm?.toLowerCase() || '';
          return keywords.some(k => title.includes(k.toLowerCase()));
        });

        // Supabase에 저장
        for (const item of filteredItems) {
          const bidData = {
            tenant_id: input.tenant_id,
            source_id: 'g2b',
            external_id: `${item.bidNtceNo}-${item.bidNtceOrd || '0'}`,
            title: item.bidNtceNm,
            organization: item.ntceInsttNm,
            deadline: item.bidClseDt ? new Date(
              item.bidClseDt.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:00')
            ).toISOString() : null,
            estimated_price: parseInt(item.presmptPrce || '0', 10) || null,
            url: item.bidNtceDtlUrl || item.bidNtceUrl || null,
            raw_data: item,
            status: 'new',
          };

          const { error } = await supabase
            .from('bids')
            .upsert(bidData, { onConflict: 'tenant_id,external_id' });

          if (!error) processedCount++;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total_fetched: items.length,
                filtered_count: filteredItems.length,
                saved_count: processedCount,
                period: { from: startStr, to: endStr },
              }, null, 2),
            },
          ],
        };
      }

      case 'get_stofo_prediction': {
        const input = StoFoPredictionSchema.parse(args);

        // 공고 정보 조회
        const { data: bid } = await supabase
          .from('bids')
          .select('*')
          .eq('id', input.bid_id)
          .single();

        if (!bid) throw new Error('Bid not found');

        // 제품 정보 조회
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', input.product_id)
          .single();

        if (!product) throw new Error('Product not found');

        // 테넌트 납품실적 조회
        const { data: deliveryRecords } = await supabase
          .from('org_scores')
          .select('win_count, total_amount, organization_name')
          .eq('tenant_id', input.tenant_id);

        // 캐시된 예측 확인 (1시간 이내)
        const { data: cached } = await supabase
          .from('stofo_predictions')
          .select('*')
          .eq('bid_id', input.bid_id)
          .eq('product_id', input.product_id)
          .eq('tenant_id', input.tenant_id)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (cached && !input.proposed_price) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  cached: true,
                  prediction: cached,
                }, null, 2),
              },
            ],
          };
        }

        // v2.1 또는 v2.0 엔진 선택
        const useV2 = input.use_v2 !== false;  // 기본값 true

        if (useV2) {
          // ===== 입찰 전략 엔진 v2.1 =====
          const strategyResult = generateBidPredictionV2({
            bidId: input.bid_id,
            bidTitle: bid.title,
            organization: bid.organization || '',
            estimatedPrice: bid.estimated_price || 100000000,
            basePrice: bid.base_price,
            bidType: (input.bid_type || 'goods') as BidType,
            contractType: (input.contract_type || 'qualification_review') as ContractType,
            deadline: bid.deadline,
            tenantId: input.tenant_id,
            productId: input.product_id,
            creditRating: (input.credit_rating || 'BBB0') as CreditRating,
            deliveryRecords: (deliveryRecords || []).map(r => ({
              organization: r.organization_name || '',
              amount: r.total_amount || 0,
              completedAt: new Date().toISOString(),
              category: 'general',
            })),
            certifications: product.certifications || [],
            proposedPrice: input.proposed_price,
            strategy: input.strategy || 'balanced',
            isUrgent: input.is_urgent,
          });

          // 결과 저장
          const prediction = {
            tenant_id: input.tenant_id,
            bid_id: input.bid_id,
            product_id: input.product_id,
            win_probability: strategyResult.winProbability,
            optimal_price: strategyResult.optimalBidPrice,
            price_range_low: strategyResult.bidPriceRange.low,
            price_range_high: strategyResult.bidPriceRange.high,
            competition_level: strategyResult.competitionAnalysis.competitionLevel,
            expected_competitors: strategyResult.competitionAnalysis.expectedCompetitors,
            model_version: '2.1',
            confidence_score: strategyResult.assessmentAnalysis.confidence,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            input_params: {
              estimated_price: bid.estimated_price,
              proposed_price: input.proposed_price,
              strategy: input.strategy,
              bid_type: input.bid_type,
              contract_type: input.contract_type,
              is_urgent: input.is_urgent,
            },
            qualification_score: strategyResult.qualificationScore,
            reasoning: strategyResult.reasoning,
          };

          await supabase.from('stofo_predictions').upsert(prediction, {
            onConflict: 'tenant_id,bid_id,product_id',
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  cached: false,
                  engine_version: '2.1',
                  prediction: {
                    // 기본 정보
                    bid_id: input.bid_id,
                    bid_title: bid.title,
                    organization: bid.organization,
                    estimated_price: bid.estimated_price,

                    // 핵심 결과
                    recommendation: strategyResult.recommendation,
                    win_probability: strategyResult.winProbability,
                    win_probability_percent: `${(strategyResult.winProbability * 100).toFixed(1)}%`,
                    risk_level: strategyResult.riskLevel,
                    confidence_level: strategyResult.confidenceLevel,

                    // 투찰가 정보
                    optimal_bid_price: strategyResult.optimalBidPrice,
                    bid_price_range: {
                      aggressive: strategyResult.bidPriceRange.low,
                      balanced: strategyResult.bidPriceRange.mid,
                      conservative: strategyResult.bidPriceRange.high,
                    },
                    optimal_bid_rate: `${((strategyResult.optimalBidPrice / bid.estimated_price) * 100).toFixed(3)}%`,

                    // 적격심사 점수 (상세)
                    qualification_score: {
                      ...strategyResult.qualificationScore,
                      pass_threshold: 85,
                      will_pass: strategyResult.qualificationDetails.willPass,
                      margin_to_pass: strategyResult.qualificationDetails.marginToPass,
                    },
                    qualification_details: {
                      delivery_breakdown: strategyResult.qualificationDetails.details.deliveryBreakdown,
                      tech_breakdown: strategyResult.qualificationDetails.details.techBreakdown,
                      recommendations: strategyResult.qualificationDetails.recommendations,
                    },

                    // 사정률 분석
                    assessment_analysis: {
                      rate: `${(strategyResult.assessmentAnalysis.rate * 100).toFixed(2)}%`,
                      confidence: `${(strategyResult.assessmentAnalysis.confidence * 100).toFixed(0)}%`,
                      range: {
                        low: `${(strategyResult.assessmentAnalysis.range.low * 100).toFixed(2)}%`,
                        high: `${(strategyResult.assessmentAnalysis.range.high * 100).toFixed(2)}%`,
                      },
                      source: strategyResult.assessmentAnalysis.source,
                    },

                    // 경쟁률 분석
                    competition_analysis: {
                      expected_competitors: strategyResult.competitionAnalysis.expectedCompetitors,
                      competition_level: strategyResult.competitionAnalysis.competitionLevel,
                      distribution: strategyResult.competitionAnalysis.distribution,
                      bid_density: `${(strategyResult.competitionAnalysis.bidDensity * 100).toFixed(1)}%`,
                    },

                    // 시나리오 분석
                    scenarios: {
                      optimistic: {
                        ...strategyResult.scenarios.optimistic,
                        win_probability_percent: `${(strategyResult.scenarios.optimistic.winProbability * 100).toFixed(1)}%`,
                      },
                      base: {
                        ...strategyResult.scenarios.base,
                        win_probability_percent: `${(strategyResult.scenarios.base.winProbability * 100).toFixed(1)}%`,
                      },
                      pessimistic: {
                        ...strategyResult.scenarios.pessimistic,
                        win_probability_percent: `${(strategyResult.scenarios.pessimistic.winProbability * 100).toFixed(1)}%`,
                      },
                    },

                    // 불확실성 요인
                    uncertainty_factors: strategyResult.uncertaintyFactors,

                    // 분석 근거
                    reasoning: strategyResult.reasoning,

                    // 메타
                    model_version: '2.1',
                    calculated_at: new Date().toISOString(),
                  },
                }, null, 2),
              },
            ],
          };
        } else {
          // ===== 레거시 v2.0 엔진 =====
          const strategyResult = generateBidPrediction({
            bidId: input.bid_id,
            bidTitle: bid.title,
            organization: bid.organization || '',
            estimatedPrice: bid.estimated_price || 100000000,
            basePrice: bid.base_price,
            bidType: (input.bid_type || 'goods') as BidType,
            contractType: (input.contract_type || 'qualification_review') as ContractType,
            deadline: bid.deadline,
            tenantId: input.tenant_id,
            productId: input.product_id,
            creditRating: (input.credit_rating || 'BBB0') as CreditRating,
            deliveryRecords: (deliveryRecords || []).map(r => ({
              amount: r.total_amount || 0,
              completedAt: new Date().toISOString(),
              category: 'general',
            })),
            certifications: product.certifications || [],
            proposedPrice: input.proposed_price,
            strategy: input.strategy || 'balanced',
          });

          // 결과 저장
          const prediction = {
            tenant_id: input.tenant_id,
            bid_id: input.bid_id,
            product_id: input.product_id,
            win_probability: strategyResult.winProbability,
            optimal_price: strategyResult.optimalBidPrice,
            price_range_low: strategyResult.bidPriceRange.low,
            price_range_high: strategyResult.bidPriceRange.high,
            competition_level: strategyResult.riskLevel.toLowerCase(),
            expected_competitors: Math.round(1 / (strategyResult.winProbability || 0.1)),
            model_version: strategyResult.modelVersion,
            confidence_score: strategyResult.expectedAssessmentRate,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            input_params: {
              estimated_price: bid.estimated_price,
              proposed_price: input.proposed_price,
              strategy: input.strategy,
              bid_type: input.bid_type,
              contract_type: input.contract_type,
            },
            qualification_score: strategyResult.qualificationScore,
            reasoning: strategyResult.reasoning,
          };

          await supabase.from('stofo_predictions').upsert(prediction, {
            onConflict: 'tenant_id,bid_id,product_id',
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  cached: false,
                  engine_version: '2.0',
                  prediction: {
                    bid_id: input.bid_id,
                    bid_title: bid.title,
                    organization: bid.organization,
                    estimated_price: bid.estimated_price,
                    recommendation: strategyResult.recommendation,
                    win_probability: strategyResult.winProbability,
                    win_probability_percent: `${(strategyResult.winProbability * 100).toFixed(1)}%`,
                    risk_level: strategyResult.riskLevel,
                    optimal_bid_price: strategyResult.optimalBidPrice,
                    bid_price_range: {
                      aggressive: strategyResult.bidPriceRange.low,
                      balanced: strategyResult.bidPriceRange.mid,
                      conservative: strategyResult.bidPriceRange.high,
                    },
                    optimal_bid_rate: `${((strategyResult.optimalBidPrice / bid.estimated_price) * 100).toFixed(3)}%`,
                    qualification_score: {
                      ...strategyResult.qualificationScore,
                      pass_threshold: 85,
                      will_pass: strategyResult.qualificationScore.total >= 85,
                    },
                    expected_assessment_rate: `${(strategyResult.expectedAssessmentRate * 100).toFixed(2)}%`,
                    reasoning: strategyResult.reasoning,
                    model_version: strategyResult.modelVersion,
                    calculated_at: new Date().toISOString(),
                  },
                }, null, 2),
              },
            ],
          };
        }
      }

      case 'run_backtest': {
        const input = BacktestSchema.parse(args);

        // 과거 입찰 데이터 로드 (Supabase에서)
        let query = supabase
          .from('bid_results')  // 과거 결과가 저장된 테이블
          .select(`
            *,
            bids (id, title, organization, estimated_price, base_price, deadline)
          `)
          .eq('tenant_id', input.tenant_id);

        if (input.date_from) {
          query = query.gte('bid_date', input.date_from);
        }
        if (input.date_to) {
          query = query.lte('bid_date', input.date_to);
        }

        const { data: bidResults, error: bidError } = await query;

        if (bidError) {
          // bid_results 테이블이 없으면 샘플 데이터로 테스트
          console.error('bid_results table not found, using sample data');
        }

        // 데이터 변환
        const historicalBids: HistoricalBid[] = (bidResults || []).map((r: {
          id: string;
          bids: {
            id: string;
            title: string;
            organization: string;
            estimated_price: number;
            base_price?: number;
            deadline: string;
          };
          winning_price: number;
          winning_rate: number;
          assessment_rate: number;
          competitor_count: number;
          did_we_win: boolean;
          our_bid_price?: number;
          our_rank?: number;
          category?: string;
          is_urgent?: boolean;
          credit_rating: string;
          delivery_records: Array<{
            organization?: string;
            productName?: string;
            amount: number;
            completedAt: string;
            category: string;
            keywords?: string[];
          }>;
          certifications: string[];
          tech_staff_count: number;
        }) => ({
          id: r.bids?.id || r.id,
          title: r.bids?.title || '',
          organization: r.bids?.organization || '',
          estimatedPrice: r.bids?.estimated_price || 0,
          basePrice: r.bids?.base_price,
          bidType: 'goods' as BidType,
          contractType: 'qualification_review' as ContractType,
          deadline: r.bids?.deadline || '',
          category: r.category,
          isUrgent: r.is_urgent,
          actualResult: {
            winningPrice: r.winning_price,
            winningRate: r.winning_rate,
            assessmentRate: r.assessment_rate,
            competitorCount: r.competitor_count,
            didWeWin: r.did_we_win,
            ourBidPrice: r.our_bid_price,
            ourRank: r.our_rank,
          },
          companySnapshot: {
            creditRating: (r.credit_rating || 'BBB0') as CreditRating,
            deliveryRecords: r.delivery_records || [],
            certifications: r.certifications || [],
            techStaffCount: r.tech_staff_count || 3,
          },
        }));

        if (historicalBids.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: false,
                  message: '백테스트할 과거 데이터가 없습니다. bid_results 테이블에 과거 입찰 결과를 저장해주세요.',
                  required_schema: {
                    bid_results: {
                      tenant_id: 'UUID',
                      bid_id: 'UUID (FK to bids)',
                      winning_price: 'number',
                      winning_rate: 'number (0-1)',
                      assessment_rate: 'number (0.97-1.03)',
                      competitor_count: 'number',
                      did_we_win: 'boolean',
                      our_bid_price: 'number (optional)',
                      our_rank: 'number (optional)',
                      category: 'string (optional)',
                      credit_rating: 'string',
                      delivery_records: 'jsonb',
                      certifications: 'jsonb',
                      tech_staff_count: 'number',
                    },
                  },
                }, null, 2),
              },
            ],
          };
        }

        // 백테스트 실행
        const engine = getBacktestEngine();
        engine.loadData(historicalBids);

        const result = engine.run({
          tenantId: input.tenant_id,
          productId: input.product_id,
          strategy: input.strategy,
          dateRange: input.date_from && input.date_to ? {
            start: new Date(input.date_from),
            end: new Date(input.date_to),
          } : undefined,
          organizations: input.organizations,
          categories: input.categories,
          minPrice: input.min_price,
          maxPrice: input.max_price,
          simulateBidding: input.simulate_bidding,
          followRecommendation: input.follow_recommendation,
          compareWithV2: false,
          calculateOptimalParams: input.calculate_optimal_params,
        });

        // 출력 형식에 따른 응답
        let responseText: string;
        if (input.output_format === 'markdown') {
          responseText = BacktestReporter.toMarkdown(result);
        } else if (input.output_format === 'full') {
          responseText = BacktestReporter.toJSON(result);
        } else {
          // summary
          responseText = JSON.stringify({
            summary: {
              analyzed_bids: result.analyzedBids,
              date_range: result.dateRange,
              strategy: result.config.strategy,
            },
            accuracy: {
              assessment_rate_mape: `${result.accuracy.assessmentRate.mape}%`,
              competitor_mape: `${result.accuracy.competitorCount.mape}%`,
              recommendation_f1: result.accuracy.recommendation.f1Score,
            },
            profitability: result.profitability ? {
              win_rate: `${(result.profitability.winRate * 100).toFixed(1)}%`,
              total_revenue: result.profitability.totalRevenue,
              roi_per_bid: result.profitability.roi,
            } : null,
            insights: result.insights,
            parameter_suggestions: result.parameterSuggestions,
          }, null, 2);
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      ],
      isError: true,
    };
  }
});

// Resources 목록
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'bidflow://bids/today',
      name: '오늘의 공고',
      description: '오늘 마감인 입찰 공고 목록',
      mimeType: 'application/json',
    },
    {
      uri: 'bidflow://matches/high',
      name: '고신뢰도 매칭',
      description: '점수 120점 이상 매칭 결과',
      mimeType: 'application/json',
    },
  ],
}));

// Resource 읽기
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'bidflow://bids/today') {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const { data } = await supabase
      .from('bids')
      .select('*')
      .gte('deadline', today)
      .lt('deadline', tomorrow)
      .order('deadline');

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BIDFLOW Core MCP Server running on stdio');
}

main().catch(console.error);
