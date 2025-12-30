# Qetta API 연동 가이드

> 나라장터, TED Europa, SAM.gov 공식 API 연동 상세 가이드
> **작성일**: 2025-12-29

---

## 개요

Qetta는 4개의 공식 공공조달 API를 통합합니다:

| 플랫폼 | 지역 | API | 비용 | 일일 입찰 |
|--------|------|-----|------|----------|
| 나라장터 (G2B) | 한국 | 공공데이터포털 | 무료 | 300-500건 |
| TED Europa | EU | TED API v3 | 무료 | 2,000-3,000건 |
| SAM.gov | 미국 | Opportunities API | 무료 | 500-800건 |
| World Bank | 글로벌 | Procurement API | 무료 | 100-200건 |

---

## 1. 나라장터 (G2B) API

### 1.1 개요

- **제공처**: [공공데이터포털](https://www.data.go.kr/data/15129394/openapi.do)
- **인증**: API 키 (서비스키)
- **형식**: XML/JSON
- **호출제한**: 일 10,000회 (무료)

### 1.2 API 신청 절차

```
1. 공공데이터포털 회원가입
   https://www.data.go.kr/

2. "조달청 입찰공고정보서비스" 검색
   https://www.data.go.kr/data/15129394/openapi.do

3. "활용신청" 버튼 클릭
   - 활용목적 입력
   - 승인까지 1-3일 소요

4. API 키 발급 확인
   마이페이지 > 오픈API > 활용신청현황
```

### 1.3 주요 엔드포인트

```typescript
const G2B_BASE_URL = 'https://apis.data.go.kr/1230000';

const G2B_ENDPOINTS = {
  // 물품 입찰 공고 목록
  goodsBidList: '/BidPublicInfoService04/getBidPblancListInfoThngPPSSrch',

  // 용역 입찰 공고 목록
  serviceBidList: '/BidPublicInfoService04/getBidPblancListInfoServcPPSSrch',

  // 공사 입찰 공고 목록
  constructionBidList: '/BidPublicInfoService04/getBidPblancListInfoCnstwkPPSSrch',

  // 입찰 공고 상세
  bidDetail: '/BidPublicInfoService04/getBidPblancDtlInfo',

  // 개찰 결과
  bidResult: '/BidResultInfoService04/getBidPblancResultInfo'
};
```

### 1.4 요청 파라미터

```typescript
interface G2BRequestParams {
  serviceKey: string;        // API 키 (필수)
  numOfRows?: number;        // 결과 수 (기본 10, 최대 500)
  pageNo?: number;           // 페이지 번호
  inqryDiv?: '1' | '2';      // 조회구분: 1=등록일시, 2=공고일시
  inqryBgnDt?: string;       // 조회시작일시 (YYYYMMDDHHMM)
  inqryEndDt?: string;       // 조회종료일시 (YYYYMMDDHHMM)
  bidNtceNo?: string;        // 입찰공고번호
  type?: 'json' | 'xml';     // 응답형식 (기본 xml)
}
```

### 1.5 TypeScript 클라이언트 구현

```typescript
// lib/clients/g2b.ts
import { z } from 'zod';

const G2B_CONFIG = {
  baseUrl: 'https://apis.data.go.kr/1230000',
  serviceKey: process.env.G2B_API_KEY!,
};

// 응답 스키마
const G2BBidSchema = z.object({
  bidNtceNo: z.string(),           // 입찰공고번호
  bidNtceOrd: z.string(),          // 입찰공고차수
  bidNtceNm: z.string(),           // 입찰공고명
  ntceInsttNm: z.string(),         // 공고기관명
  dminsttNm: z.string(),           // 수요기관명
  bidNtceDt: z.string(),           // 입찰공고일시
  bidClseDt: z.string(),           // 입찰마감일시
  presmptPrce: z.string().optional(), // 추정가격
  bidNtceDtlUrl: z.string().optional(), // 상세URL
});

type G2BBid = z.infer<typeof G2BBidSchema>;

class G2BClient {
  private async fetch(endpoint: string, params: Record<string, string>): Promise<unknown> {
    const url = new URL(`${G2B_CONFIG.baseUrl}${endpoint}`);
    url.searchParams.set('serviceKey', G2B_CONFIG.serviceKey);
    url.searchParams.set('type', 'json');

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`G2B API Error: ${response.status}`);
    }

    return response.json();
  }

  async fetchGoodsBids(options: {
    startDate: string;  // YYYYMMDD
    endDate: string;    // YYYYMMDD
    numOfRows?: number;
    pageNo?: number;
  }): Promise<G2BBid[]> {
    const response = await this.fetch(
      '/BidPublicInfoService04/getBidPblancListInfoThngPPSSrch',
      {
        inqryDiv: '1',
        inqryBgnDt: `${options.startDate}0000`,
        inqryEndDt: `${options.endDate}2359`,
        numOfRows: String(options.numOfRows ?? 100),
        pageNo: String(options.pageNo ?? 1),
      }
    );

    // XML 파싱 또는 JSON 처리
    const items = (response as any).response?.body?.items ?? [];
    return items.map((item: unknown) => G2BBidSchema.parse(item));
  }

  async fetchBidDetail(bidNtceNo: string, bidNtceOrd: string): Promise<G2BBid> {
    const response = await this.fetch(
      '/BidPublicInfoService04/getBidPblancDtlInfo',
      { bidNtceNo, bidNtceOrd }
    );

    const item = (response as any).response?.body?.items?.[0];
    return G2BBidSchema.parse(item);
  }
}

export const g2bClient = new G2BClient();
```

### 1.6 제조업 필터링

```typescript
// 물품분류코드 (기계/장비 관련)
const MANUFACTURING_CODES = [
  '421',  // 일반기계
  '422',  // 전기기계
  '423',  // 전자기계
  '424',  // 측정/광학기기
  '425',  // 의료기기
  '431',  // 금속가공기계
  '432',  // 공작기계
];

// 키워드 필터
const MANUFACTURING_KEYWORDS = [
  '유량계', '계측기', '센서', '밸브', '펌프',
  '모터', '변압기', '제어기', '측정기', '분석기',
];
```

---

## 2. TED Europa API

### 2.1 개요

- **제공처**: [TED (Tenders Electronic Daily)](https://ted.europa.eu/)
- **문서**: [TED API Documentation](https://docs.ted.europa.eu/api/latest/index.html)
- **인증**: API 키 (선택사항, 더 높은 rate limit)
- **형식**: JSON
- **호출제한**: 인증 없이 100 req/min, 인증 시 1,000 req/min

### 2.2 API 키 신청

```
1. EU Login 계정 생성
   https://webgate.ec.europa.eu/cas/

2. TED API 포털 접속
   https://ted.europa.eu/en/subscription

3. API 키 요청
   - 사용 목적 설명
   - 예상 호출량 입력
   - 승인까지 1-5일 소요
```

### 2.3 주요 엔드포인트

```typescript
const TED_BASE_URL = 'https://ted.europa.eu/api/v3';

const TED_ENDPOINTS = {
  // 공고 검색
  searchNotices: '/notices/search',

  // 공고 상세
  getNotice: '/notices/{notice-id}',

  // 공고 문서 다운로드
  getDocument: '/notices/{notice-id}/documents/{document-id}',
};
```

### 2.4 CPV 코드 (제조업)

```typescript
// Common Procurement Vocabulary (CPV) - 제조업 관련
const MANUFACTURING_CPV = {
  // 42 - 산업용 기계류
  industrialMachinery: '42*',
  pumps: '42122*',        // 펌프
  valves: '42131*',       // 밸브
  compressors: '42123*',  // 압축기

  // 38 - 실험/측정/제어 장비
  labEquipment: '38*',
  measurementDevices: '38410*',  // 측정기기
  sensors: '38540*',             // 센서
  flowMeters: '38411*',          // 유량계

  // 31 - 전기기계/장치
  electricalEquipment: '31*',
  motors: '31161*',       // 모터
  transformers: '31170*', // 변압기

  // 44 - 건설자재
  constructionMaterials: '44*',
  pipes: '44162*',        // 파이프
  fittings: '44163*',     // 피팅
};
```

### 2.5 TypeScript 클라이언트 구현

```typescript
// lib/clients/ted.ts
import { z } from 'zod';

const TED_CONFIG = {
  baseUrl: 'https://ted.europa.eu/api/v3',
  apiKey: process.env.TED_API_KEY, // optional
};

// 검색 요청 스키마
const TEDSearchRequestSchema = z.object({
  query: z.string().optional(),
  cpv: z.array(z.string()).optional(),
  publicationDate: z.object({
    gte: z.string().optional(),
    lte: z.string().optional(),
  }).optional(),
  submissionDeadline: z.object({
    gte: z.string().optional(),
  }).optional(),
  country: z.array(z.string()).optional(),
  size: z.number().default(50),
  page: z.number().default(0),
});

// 공고 스키마
const TEDNoticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  cpvCodes: z.array(z.string()),
  publicationDate: z.string(),
  submissionDeadline: z.string().optional(),
  estimatedValue: z.object({
    amount: z.number(),
    currency: z.string(),
  }).optional(),
  buyerName: z.string(),
  buyerCountry: z.string(),
  noticeUrl: z.string(),
});

type TEDNotice = z.infer<typeof TEDNoticeSchema>;

class TEDClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      ...(TED_CONFIG.apiKey && { 'X-API-KEY': TED_CONFIG.apiKey }),
    };
  }

  async search(params: z.infer<typeof TEDSearchRequestSchema>): Promise<TEDNotice[]> {
    const response = await fetch(`${TED_CONFIG.baseUrl}/notices/search`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        query: params.query,
        filters: {
          cpv: params.cpv,
          publicationDate: params.publicationDate,
          submissionDeadline: params.submissionDeadline,
          buyerCountry: params.country,
        },
        pagination: {
          size: params.size,
          page: params.page,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`TED API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.notices.map((n: unknown) => TEDNoticeSchema.parse(n));
  }

  async getNotice(noticeId: string): Promise<TEDNotice> {
    const response = await fetch(`${TED_CONFIG.baseUrl}/notices/${noticeId}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`TED API Error: ${response.status}`);
    }

    const data = await response.json();
    return TEDNoticeSchema.parse(data);
  }

  // 제조업 입찰 검색 헬퍼
  async searchManufacturing(options: {
    deadlineAfter?: string;  // ISO date
    countries?: string[];
    size?: number;
  }): Promise<TEDNotice[]> {
    return this.search({
      cpv: ['42*', '38*', '31*', '44*'],
      submissionDeadline: {
        gte: options.deadlineAfter ?? new Date().toISOString().split('T')[0],
      },
      country: options.countries,
      size: options.size ?? 100,
    });
  }
}

export const tedClient = new TEDClient();
```

---

## 3. SAM.gov API

### 3.1 개요

- **제공처**: [SAM.gov](https://sam.gov/)
- **문서**: [Get Opportunities API](https://open.gsa.gov/api/get-opportunities-public-api/)
- **인증**: API 키 필수
- **형식**: JSON
- **호출제한**: 10,000 req/day

### 3.2 API 키 신청

```
1. SAM.gov 계정 생성
   https://sam.gov/

2. API 키 요청
   https://open.gsa.gov/api/get-opportunities-public-api/

3. Entity Registration (필요시)
   - 미국 정부 조달 참여를 위해 필요
   - DUNS 번호 등록
```

### 3.3 주요 엔드포인트

```typescript
const SAM_BASE_URL = 'https://api.sam.gov/opportunities/v2';

const SAM_ENDPOINTS = {
  // 기회 검색
  search: '/search',

  // 기회 상세
  getOpportunity: '/opportunity/{opportunityId}',
};
```

### 3.4 NAICS 코드 (제조업)

```typescript
// North American Industry Classification System
const MANUFACTURING_NAICS = {
  // 332 - 금속제품 제조
  fabricatedMetal: '332*',
  metalValve: '332911',    // 산업용 밸브
  metalFitting: '332919',  // 금속 피팅

  // 333 - 기계 제조
  machinery: '333*',
  pumpEquipment: '333911',     // 펌프 및 펌프 장비
  measuringDevice: '333314',   // 광학 측정 장치
  flowMeter: '334515',         // 유량계

  // 334 - 컴퓨터/전자제품
  computerElectronic: '334*',
  industrialControl: '334513', // 산업용 제어 장비

  // 335 - 전기장비
  electricalEquipment: '335*',
  motorGenerator: '335312',    // 모터 및 발전기

  // 336 - 운송장비
  transportation: '336*',
};
```

### 3.5 TypeScript 클라이언트 구현

```typescript
// lib/clients/sam.ts
import { z } from 'zod';

const SAM_CONFIG = {
  baseUrl: 'https://api.sam.gov/opportunities/v2',
  apiKey: process.env.SAM_API_KEY!,
};

// 검색 파라미터
interface SAMSearchParams {
  postedFrom?: string;      // MM/DD/YYYY
  postedTo?: string;        // MM/DD/YYYY
  responseDeadLine?: string; // MM/DD/YYYY
  naics?: string[];
  ptype?: string[];         // 조달 유형
  limit?: number;
  offset?: number;
}

// 기회 스키마
const SAMOpportunitySchema = z.object({
  opportunityId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  naicsCode: z.string().optional(),
  classificationCode: z.string().optional(),
  postedDate: z.string(),
  responseDeadLine: z.string().optional(),
  type: z.string(),
  organizationName: z.string(),
  pointOfContact: z.array(z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })).optional(),
  uiLink: z.string(),
});

type SAMOpportunity = z.infer<typeof SAMOpportunitySchema>;

class SAMClient {
  private async fetch(endpoint: string, params: Record<string, string>): Promise<unknown> {
    const url = new URL(`${SAM_CONFIG.baseUrl}${endpoint}`);
    url.searchParams.set('api_key', SAM_CONFIG.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`SAM API Error: ${response.status}`);
    }

    return response.json();
  }

  async search(params: SAMSearchParams): Promise<SAMOpportunity[]> {
    const response = await this.fetch('/search', {
      postedFrom: params.postedFrom ?? '',
      postedTo: params.postedTo ?? '',
      rdlfrom: params.responseDeadLine ?? '',
      naics: params.naics?.join(',') ?? '',
      ptype: params.ptype?.join(',') ?? '',
      limit: String(params.limit ?? 100),
      offset: String(params.offset ?? 0),
    });

    const opportunities = (response as any).opportunitiesData ?? [];
    return opportunities.map((o: unknown) => SAMOpportunitySchema.parse(o));
  }

  async getOpportunity(opportunityId: string): Promise<SAMOpportunity> {
    const response = await this.fetch(`/opportunity/${opportunityId}`, {});
    return SAMOpportunitySchema.parse(response);
  }

  // 제조업 기회 검색 헬퍼
  async searchManufacturing(options: {
    deadlineAfter?: string;  // MM/DD/YYYY
    limit?: number;
  }): Promise<SAMOpportunity[]> {
    const today = new Date();
    const postedFrom = new Date(today);
    postedFrom.setDate(postedFrom.getDate() - 30); // 최근 30일

    return this.search({
      postedFrom: postedFrom.toLocaleDateString('en-US'),
      responseDeadLine: options.deadlineAfter ?? today.toLocaleDateString('en-US'),
      naics: ['332', '333', '334', '335', '336'],
      limit: options.limit ?? 100,
    });
  }
}

export const samClient = new SAMClient();
```

---

## 4. World Bank Procurement API

### 4.1 개요

- **제공처**: [World Bank](https://projects.worldbank.org/)
- **문서**: [Procurement API](https://projects.worldbank.org/en/projects-operations/products-and-services/brief/procurement)
- **인증**: 불필요
- **형식**: JSON
- **호출제한**: 1,000 req/day

### 4.2 TypeScript 클라이언트 구현

```typescript
// lib/clients/world-bank.ts
const WB_CONFIG = {
  baseUrl: 'https://projects.worldbank.org/procurement',
};

interface WBProcurement {
  id: string;
  title: string;
  description: string;
  country: string;
  sector: string;
  procurementMethod: string;
  deadline: string;
  estimatedAmount: number;
  currency: string;
  projectId: string;
  noticeUrl: string;
}

class WorldBankClient {
  async search(options: {
    sector?: string[];
    country?: string[];
    deadline?: string;
    limit?: number;
  }): Promise<WBProcurement[]> {
    const params = new URLSearchParams();
    if (options.sector) params.set('sector', options.sector.join(','));
    if (options.country) params.set('country', options.country.join(','));
    if (options.deadline) params.set('deadline_gte', options.deadline);
    if (options.limit) params.set('rows', String(options.limit));

    const response = await fetch(
      `${WB_CONFIG.baseUrl}/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`World Bank API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.procurements ?? [];
  }

  // 제조업 조달 검색
  async searchManufacturing(options: {
    countries?: string[];
    limit?: number;
  }): Promise<WBProcurement[]> {
    return this.search({
      sector: ['Industry', 'Energy', 'Water'],
      country: options.countries,
      deadline: new Date().toISOString().split('T')[0],
      limit: options.limit ?? 50,
    });
  }
}

export const worldBankClient = new WorldBankClient();
```

---

## 5. 통합 데이터 동기화

### 5.1 데이터 정규화

```typescript
// lib/domain/bid-normalizer.ts
import { BidSource, NormalizedBid } from '@/types';

interface NormalizedBid {
  id: string;
  source: 'g2b' | 'ted' | 'sam' | 'wb';
  externalId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  country: string;
  cpvCodes: string[];
  naicsCodes: string[];
  originalUrl: string;
  rawData: unknown;
}

export function normalizeG2BBid(raw: G2BBid): NormalizedBid {
  return {
    id: crypto.randomUUID(),
    source: 'g2b',
    externalId: `${raw.bidNtceNo}-${raw.bidNtceOrd}`,
    title: raw.bidNtceNm,
    description: null,
    deadline: raw.bidClseDt ? parseG2BDate(raw.bidClseDt) : null,
    budgetMin: raw.presmptPrce ? Number(raw.presmptPrce) : null,
    budgetMax: null,
    currency: 'KRW',
    country: 'KR',
    cpvCodes: [],
    naicsCodes: [],
    originalUrl: raw.bidNtceDtlUrl ?? '',
    rawData: raw,
  };
}

export function normalizeTEDBid(raw: TEDNotice): NormalizedBid {
  return {
    id: crypto.randomUUID(),
    source: 'ted',
    externalId: raw.id,
    title: raw.title,
    description: raw.summary ?? null,
    deadline: raw.submissionDeadline ? new Date(raw.submissionDeadline) : null,
    budgetMin: raw.estimatedValue?.amount ?? null,
    budgetMax: null,
    currency: raw.estimatedValue?.currency ?? 'EUR',
    country: raw.buyerCountry,
    cpvCodes: raw.cpvCodes,
    naicsCodes: [],
    originalUrl: raw.noticeUrl,
    rawData: raw,
  };
}

export function normalizeSAMBid(raw: SAMOpportunity): NormalizedBid {
  return {
    id: crypto.randomUUID(),
    source: 'sam',
    externalId: raw.opportunityId,
    title: raw.title,
    description: raw.description ?? null,
    deadline: raw.responseDeadLine ? parseSAMDate(raw.responseDeadLine) : null,
    budgetMin: null,
    budgetMax: null,
    currency: 'USD',
    country: 'US',
    cpvCodes: [],
    naicsCodes: raw.naicsCode ? [raw.naicsCode] : [],
    originalUrl: raw.uiLink,
    rawData: raw,
  };
}
```

### 5.2 동기화 스케줄러

```typescript
// lib/sync/scheduler.ts
import { g2bClient } from '../clients/g2b';
import { tedClient } from '../clients/ted';
import { samClient } from '../clients/sam';
import { supabase } from '../supabase';
import { normalizeG2BBid, normalizeTEDBid, normalizeSAMBid } from '../domain/bid-normalizer';

export async function syncAllSources(): Promise<{
  g2b: number;
  ted: number;
  sam: number;
  total: number;
}> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // 병렬 조회
  const [g2bBids, tedBids, samBids] = await Promise.all([
    g2bClient.fetchGoodsBids({
      startDate: today,
      endDate: today,
      numOfRows: 500,
    }),
    tedClient.searchManufacturing({
      deadlineAfter: new Date().toISOString().split('T')[0],
      size: 200,
    }),
    samClient.searchManufacturing({
      limit: 200,
    }),
  ]);

  // 정규화
  const normalizedBids = [
    ...g2bBids.map(normalizeG2BBid),
    ...tedBids.map(normalizeTEDBid),
    ...samBids.map(normalizeSAMBid),
  ];

  // Supabase upsert
  const { error } = await supabase
    .from('bids')
    .upsert(
      normalizedBids.map(bid => ({
        source: bid.source,
        external_id: bid.externalId,
        title: bid.title,
        description: bid.description,
        deadline: bid.deadline?.toISOString(),
        budget_min: bid.budgetMin,
        budget_max: bid.budgetMax,
        currency: bid.currency,
        country: bid.country,
        cpv_codes: bid.cpvCodes,
        naics_codes: bid.naicsCodes,
        original_url: bid.originalUrl,
        raw_data: bid.rawData,
      })),
      { onConflict: 'source,external_id' }
    );

  if (error) {
    console.error('[Sync] Failed to upsert bids:', error);
    throw error;
  }

  return {
    g2b: g2bBids.length,
    ted: tedBids.length,
    sam: samBids.length,
    total: normalizedBids.length,
  };
}
```

### 5.3 Cron 설정 (Vercel)

```typescript
// app/api/cron/sync/route.ts
import { NextResponse } from 'next/server';
import { syncAllSources } from '@/lib/sync/scheduler';

export const runtime = 'edge';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel Cron 인증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await syncAllSources();
    return NextResponse.json({
      success: true,
      synced: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Sync failed:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 */3 * * *"
    }
  ]
}
```

---

## 6. 에러 처리 및 재시도

### 6.1 재시도 로직

```typescript
// lib/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: 'linear' | 'exponential';
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoff = 'exponential' } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Retry] Attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries - 1) {
        const delay = backoff === 'exponential'
          ? delayMs * Math.pow(2, attempt)
          : delayMs * (attempt + 1);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

### 6.2 Rate Limit 처리

```typescript
// lib/utils/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const apiLimiters = {
  g2b: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
    prefix: 'ratelimit:g2b',
  }),
  ted: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(80, '1 m'), // 80 req/min (conservative)
    prefix: 'ratelimit:ted',
  }),
  sam: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, '1 h'), // 500 req/hour
    prefix: 'ratelimit:sam',
  }),
};

export async function checkRateLimit(source: 'g2b' | 'ted' | 'sam'): Promise<boolean> {
  const limiter = apiLimiters[source];
  const result = await limiter.limit('global');
  return result.success;
}
```

---

## 7. 모니터링

### 7.1 로깅

```typescript
// lib/sync/logger.ts
import { supabase } from '../supabase';

export async function logSyncResult(
  source: string,
  success: boolean,
  count: number,
  error?: string
): Promise<void> {
  await supabase.from('system_logs').insert({
    event_type: 'sync',
    source,
    success,
    metadata: {
      count,
      error,
      timestamp: new Date().toISOString(),
    },
  });
}
```

### 7.2 Health Check

```typescript
// app/api/health/sources/route.ts
import { g2bClient } from '@/lib/clients/g2b';
import { tedClient } from '@/lib/clients/ted';
import { samClient } from '@/lib/clients/sam';

export async function GET() {
  const results = await Promise.allSettled([
    g2bClient.fetchGoodsBids({ startDate: '20250101', endDate: '20250101', numOfRows: 1 }),
    tedClient.search({ size: 1 }),
    samClient.search({ limit: 1 }),
  ]);

  return Response.json({
    g2b: results[0].status === 'fulfilled' ? 'ok' : 'error',
    ted: results[1].status === 'fulfilled' ? 'ok' : 'error',
    sam: results[2].status === 'fulfilled' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
  });
}
```

---

## 8. 참고 자료

### API 문서 링크

| 플랫폼 | 문서 링크 |
|--------|----------|
| 나라장터 | [공공데이터포털](https://www.data.go.kr/data/15129394/openapi.do) |
| TED | [TED API Docs](https://docs.ted.europa.eu/api/latest/index.html) |
| SAM.gov | [GSA API Docs](https://open.gsa.gov/api/get-opportunities-public-api/) |
| World Bank | [Procurement API](https://projects.worldbank.org/en/projects-operations/products-and-services/brief/procurement) |

### 관련 코드

| 분류 코드 | 설명 | 링크 |
|----------|------|------|
| CPV | EU 공통조달분류 | [SIMAP](https://simap.ted.europa.eu/cpv) |
| NAICS | 북미산업분류 | [Census](https://www.census.gov/naics/) |
| UNSPSC | 유엔상품분류 | [UNSPSC](https://www.unspsc.org/) |

---

*Qetta API Integration Guide v1.0*
*2025-12-29*
