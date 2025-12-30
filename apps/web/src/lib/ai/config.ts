/**
 * AI Pipeline Configuration
 *
 * Claude AI 설정 및 프롬프트 템플릿
 */

import { CLAUDE_MODELS, type AIConfig, type CompanyProfile } from './types';

// ============================================================================
// Configuration
// ============================================================================

export const AI_CONFIG: AIConfig = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  defaultModel: CLAUDE_MODELS.sonnet,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

export const PIPELINE_CONFIG = {
  filter: {
    model: CLAUDE_MODELS.haiku,
    maxTokens: 1024,
    temperature: 0.1,
    threshold: 50, // Minimum score to pass filter
  },
  analyze: {
    model: CLAUDE_MODELS.sonnet,
    maxTokens: 4096,
    temperature: 0.3,
  },
  translate: {
    model: CLAUDE_MODELS.haiku,
    maxTokens: 2048,
    temperature: 0.1,
  },
  batch: {
    maxConcurrent: 5,
    delayBetweenBatches: 100, // ms
  },
} as const;

// ============================================================================
// Prompt Templates
// ============================================================================

export const PROMPTS = {
  /**
   * 필터링 프롬프트 (Claude Haiku)
   * 빠른 적합성 판단
   */
  filter: (bid: string, profile: string) => `
당신은 입찰 적합성 분석 전문가입니다.

## 회사 프로필
${profile}

## 입찰 공고
${bid}

## 분석 지침
이 입찰 공고가 위 회사에 적합한지 빠르게 판단하세요.

다음 JSON 형식으로만 응답하세요:
{
  "passed": boolean,
  "score": number (0-100),
  "reasons": string[] (최대 3개),
  "matchedKeywords": string[],
  "matchedProducts": string[]
}

## 판단 기준
- 제품/서비스 적합성 (40%)
- 예산 범위 적합성 (20%)
- 지역/시장 적합성 (20%)
- 자격/인증 요구사항 (20%)

JSON만 출력하세요.
`,

  /**
   * 분석 프롬프트 (Claude Sonnet)
   * 상세 매칭 분석
   */
  analyze: (bid: string, profile: string, filterResult: string) => `
당신은 입찰 전략 컨설턴트입니다.

## 회사 프로필
${profile}

## 입찰 공고
${bid}

## 1차 필터 결과
${filterResult}

## 분석 지침
이 입찰에 대한 상세 분석을 수행하세요.

다음 JSON 형식으로 응답하세요:
{
  "matchScore": number (0-100),
  "recommendation": "bid" | "review" | "skip",
  "analysis": {
    "productFit": {
      "score": number,
      "matchedProducts": [
        {
          "productId": string,
          "productName": string,
          "matchScore": number,
          "matchReasons": string[]
        }
      ],
      "gaps": string[],
      "suggestions": string[]
    },
    "competitivePosition": {
      "advantageScore": number,
      "strengths": string[],
      "weaknesses": string[],
      "differentiators": string[]
    },
    "riskAssessment": {
      "overallRisk": "low" | "medium" | "high",
      "factors": [
        {
          "category": string,
          "level": "low" | "medium" | "high",
          "description": string,
          "mitigation": string
        }
      ]
    },
    "actionItems": [
      {
        "priority": "high" | "medium" | "low",
        "task": string,
        "deadline": string (optional),
        "responsible": string (optional)
      }
    ]
  },
  "koreanSummary": string (200자 이내 한국어 요약),
  "englishSummary": string (200 chars English summary)
}

## 분석 기준

### matchScore (0-100)
- 80-100: 강력 추천 (bid)
- 60-79: 검토 필요 (review)
- 0-59: 제외 권장 (skip)

### recommendation
- bid: 즉시 입찰 준비 권장
- review: 추가 검토 후 결정
- skip: 입찰 불참 권장

JSON만 출력하세요.
`,

  /**
   * 번역 프롬프트 (Claude Haiku)
   * 한국어 번역
   */
  translate: (text: string, context: string) => `
입찰 공고 전문 번역가로서 다음 텍스트를 한국어로 번역하세요.

## 원문
${text}

## 문맥
${context}

## 번역 지침
1. 기술 용어는 업계 표준 한국어 번역 사용
2. 약어는 최초 등장 시 풀어서 작성
3. 금액/날짜 형식은 한국 표준 사용
4. 자연스럽고 전문적인 어투 유지

번역문만 출력하세요.
`,

  /**
   * 요약 프롬프트 (Claude Haiku)
   * 입찰 공고 요약
   */
  summarize: (bid: string) => `
입찰 공고를 한국어로 간결하게 요약하세요.

## 입찰 공고
${bid}

## 요약 형식
- 발주처:
- 공고명:
- 예산:
- 마감:
- 핵심 요구사항: (3줄 이내)

위 형식으로만 출력하세요.
`,
} as const;

// ============================================================================
// Default Company Profile (CMNTech - 씨엠엔텍)
// ============================================================================

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: 'cmntech-001',
  name: '씨엠엔텍 (CMNTech)',
  industry: '계측기기 제조업',
  products: [
    {
      id: 'fm-001',
      name: '초음파 유량계',
      category: '유량계',
      description: '비침습식 초음파 유량계, 산업용/플랜트용',
      specifications: {
        '측정 범위': '0.01-12 m/s',
        정확도: '±0.5%',
        '파이프 직경': '15-6000mm',
        '온도 범위': '-40~150°C',
      },
      cpvCodes: ['38411*', '38540*'],
      naicsCodes: ['334515'],
      keywords: ['flowmeter', 'ultrasonic', '유량계', '초음파'],
    },
    {
      id: 'fm-002',
      name: '전자기 유량계',
      category: '유량계',
      description: '전도성 액체용 전자기 유량계',
      specifications: {
        '측정 범위': '0.5-10 m/s',
        정확도: '±0.3%',
        '파이프 직경': '10-2000mm',
      },
      cpvCodes: ['38411*'],
      naicsCodes: ['334515'],
      keywords: ['electromagnetic', 'magnetic flowmeter', '전자기'],
    },
    {
      id: 'lm-001',
      name: '레벨 트랜스미터',
      category: '레벨계',
      description: '압력식/초음파식 레벨 측정기',
      specifications: {
        '측정 범위': '0-100m',
        정확도: '±0.1%',
      },
      cpvCodes: ['38410*'],
      naicsCodes: ['334513'],
      keywords: ['level transmitter', '레벨계', 'level sensor'],
    },
    {
      id: 'pt-001',
      name: '압력 트랜스미터',
      category: '압력계',
      description: '산업용 디지털 압력 트랜스미터',
      specifications: {
        '측정 범위': '0-700 bar',
        정확도: '±0.05%',
      },
      cpvCodes: ['38420*'],
      naicsCodes: ['334513'],
      keywords: ['pressure transmitter', '압력계', 'pressure sensor'],
    },
    {
      id: 'tt-001',
      name: '온도 트랜스미터',
      category: '온도계',
      description: 'RTD/열전대 기반 온도 트랜스미터',
      specifications: {
        '측정 범위': '-200~1800°C',
        정확도: '±0.1°C',
      },
      cpvCodes: ['38410*'],
      naicsCodes: ['334513'],
      keywords: ['temperature transmitter', '온도계', 'RTD', 'thermocouple'],
    },
  ],
  capabilities: [
    '자체 R&D 센터 보유',
    'ISO 9001 품질경영시스템',
    'KS 인증 제품',
    '해외 수출 실적 (동남아, 중동)',
    '24시간 기술지원',
    '맞춤형 제작 가능',
  ],
  certifications: ['ISO 9001:2015', 'CE 마킹', 'KS C IEC 61010', 'ATEX (방폭)', 'SIL2/SIL3'],
  targetMarkets: [
    'KR', // 한국
    'US', // 미국
    'EU', // 유럽
    'VN', // 베트남
    'TH', // 태국
    'MY', // 말레이시아
    'SA', // 사우디아라비아
    'AE', // UAE
  ],
  preferredBudget: {
    min: 10000000, // 1천만원
    max: 5000000000, // 50억원
    currency: 'KRW',
  },
  keywords: [
    'flowmeter',
    'flow meter',
    '유량계',
    'level meter',
    'level transmitter',
    '레벨계',
    'pressure transmitter',
    '압력계',
    'temperature sensor',
    '온도계',
    'instrumentation',
    '계측기',
    'process control',
    '공정제어',
    'water treatment',
    '수처리',
    'oil gas',
    '석유가스',
    'petrochemical',
    '석유화학',
    'power plant',
    '발전소',
    'semiconductor',
    '반도체',
    'SCADA',
    'DCS',
    'PLC',
  ],
  excludeKeywords: [
    'consulting only',
    'software only',
    'medical device',
    'consumer electronics',
    'construction only',
  ],
};

// ============================================================================
// Currency Conversion (Approximate rates for budget comparison)
// ============================================================================

export const CURRENCY_RATES: Record<string, number> = {
  KRW: 1,
  USD: 1400,
  EUR: 1500,
  GBP: 1750,
  JPY: 9.5,
  CNY: 195,
};

export function convertToKRW(amount: number, currency: string): number {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Math.round(amount * rate);
}
