/**
 * 나라장터 (G2B) API 클라이언트
 * @see https://www.data.go.kr/data/15129394/openapi.do
 */
import { z } from 'zod';

// ============================================================================
// Configuration
// ============================================================================

const G2B_CONFIG = {
  baseUrl: 'https://apis.data.go.kr/1230000',
  endpoints: {
    goodsBidList: '/BidPublicInfoService04/getBidPblancListInfoThngPPSSrch',
    serviceBidList: '/BidPublicInfoService04/getBidPblancListInfoServcPPSSrch',
    constructionBidList: '/BidPublicInfoService04/getBidPblancListInfoCnstwkPPSSrch',
    bidDetail: '/BidPublicInfoService04/getBidPblancDtlInfo',
    bidResult: '/BidResultInfoService04/getBidPblancResultInfo',
  },
  manufacturingCodes: [
    '421', // 일반기계
    '422', // 전기기계
    '423', // 전자기계
    '424', // 측정/광학기기
    '425', // 의료기기
    '431', // 금속가공기계
    '432', // 공작기계
  ],
  manufacturingKeywords: [
    '유량계',
    '계측기',
    '센서',
    '밸브',
    '펌프',
    '모터',
    '변압기',
    '제어기',
    '측정기',
    '분석기',
    '컴프레서',
    '인버터',
    'PLC',
    '계장',
    '플랜트',
  ],
} as const;

// ============================================================================
// Schemas
// ============================================================================

const G2BBidItemSchema = z.object({
  bidNtceNo: z.string(), // 입찰공고번호
  bidNtceOrd: z.string(), // 입찰공고차수
  bidNtceNm: z.string(), // 입찰공고명
  ntceInsttNm: z.string(), // 공고기관명
  dminsttNm: z.string().optional(), // 수요기관명
  bidNtceDt: z.string(), // 입찰공고일시
  bidClseDt: z.string(), // 입찰마감일시
  presmptPrce: z.string().optional(), // 추정가격
  asignBdgtAmt: z.string().optional(), // 배정예산금액
  bidNtceDtlUrl: z.string().optional(), // 상세URL
  bidNtceUrl: z.string().optional(), // 공고URL
  ntceKindNm: z.string().optional(), // 공고종류명
  cntrctMthdNm: z.string().optional(), // 계약방법명
  bidPrcePmtcdNm: z.string().optional(), // 입찰가격방식명
  exctvNm: z.string().optional(), // 집행관명
  bidMthdNm: z.string().optional(), // 입찰방식명
  reNtceYn: z.string().optional(), // 재공고여부
  rgstDt: z.string().optional(), // 등록일시
});

const G2BResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z
      .object({
        items: z.array(G2BBidItemSchema).optional().default([]),
        numOfRows: z.number().optional(),
        pageNo: z.number().optional(),
        totalCount: z.number().optional(),
      })
      .optional(),
  }),
});

export type G2BBidItem = z.infer<typeof G2BBidItemSchema>;

// ============================================================================
// Normalized Types
// ============================================================================

export interface NormalizedBid {
  id: string;
  source: 'g2b';
  externalId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: 'KRW';
  country: 'KR';
  buyerName: string;
  buyerOrg: string | null;
  originalUrl: string | null;
  rawData: G2BBidItem;
  createdAt: Date;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * G2B 날짜 문자열 파싱 (YYYYMMDDHHMM 또는 YYYY-MM-DD HH:MM:SS)
 */
function parseG2BDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // YYYYMMDDHHMM 형식
  if (/^\d{12}$/.test(dateStr)) {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(8, 10);
    const minute = dateStr.slice(10, 12);
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+09:00`);
  }

  // YYYY-MM-DD HH:MM:SS 형식
  if (dateStr.includes('-')) {
    return new Date(dateStr);
  }

  return null;
}

/**
 * 추정가격 문자열을 숫자로 변환
 */
function parsePrice(priceStr: string | undefined): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * G2B API 응답 정규화
 */
function normalizeG2BBid(item: G2BBidItem): NormalizedBid {
  return {
    id: crypto.randomUUID(),
    source: 'g2b',
    externalId: `${item.bidNtceNo}-${item.bidNtceOrd}`,
    title: item.bidNtceNm,
    description: null,
    deadline: parseG2BDate(item.bidClseDt),
    budgetMin: parsePrice(item.presmptPrce) ?? parsePrice(item.asignBdgtAmt),
    budgetMax: null,
    currency: 'KRW',
    country: 'KR',
    buyerName: item.ntceInsttNm,
    buyerOrg: item.dminsttNm ?? null,
    originalUrl: item.bidNtceDtlUrl ?? item.bidNtceUrl ?? null,
    rawData: item,
    createdAt: new Date(),
  };
}

// ============================================================================
// G2B Client Class
// ============================================================================

export class G2BClient {
  private serviceKey: string;
  private baseUrl: string;

  constructor(serviceKey?: string) {
    this.serviceKey = serviceKey ?? process.env.G2B_API_KEY ?? '';
    this.baseUrl = G2B_CONFIG.baseUrl;

    if (!this.serviceKey) {
      console.warn('[G2B] API key not configured. Set G2B_API_KEY environment variable.');
    }
  }

  /**
   * API 요청 실행
   */
  private async fetch(endpoint: string, params: Record<string, string | number>): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // 서비스키 추가
    url.searchParams.set('serviceKey', this.serviceKey);
    url.searchParams.set('type', 'json');

    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    console.log(`[G2B] Fetching: ${endpoint}`);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`[G2B] API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * 물품 입찰 공고 조회
   */
  async fetchGoodsBids(options: {
    startDate: string; // YYYYMMDD
    endDate: string; // YYYYMMDD
    numOfRows?: number;
    pageNo?: number;
  }): Promise<NormalizedBid[]> {
    const response = await this.fetch(G2B_CONFIG.endpoints.goodsBidList, {
      inqryDiv: '1', // 등록일시 기준
      inqryBgnDt: `${options.startDate}0000`,
      inqryEndDt: `${options.endDate}2359`,
      numOfRows: options.numOfRows ?? 100,
      pageNo: options.pageNo ?? 1,
    });

    const parsed = G2BResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.error('[G2B] Response parsing failed:', parsed.error);
      return [];
    }

    const items = parsed.data.response.body?.items ?? [];
    return items.map(normalizeG2BBid);
  }

  /**
   * 용역 입찰 공고 조회
   */
  async fetchServiceBids(options: {
    startDate: string;
    endDate: string;
    numOfRows?: number;
    pageNo?: number;
  }): Promise<NormalizedBid[]> {
    const response = await this.fetch(G2B_CONFIG.endpoints.serviceBidList, {
      inqryDiv: '1',
      inqryBgnDt: `${options.startDate}0000`,
      inqryEndDt: `${options.endDate}2359`,
      numOfRows: options.numOfRows ?? 100,
      pageNo: options.pageNo ?? 1,
    });

    const parsed = G2BResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.error('[G2B] Response parsing failed:', parsed.error);
      return [];
    }

    const items = parsed.data.response.body?.items ?? [];
    return items.map(normalizeG2BBid);
  }

  /**
   * 공사 입찰 공고 조회
   */
  async fetchConstructionBids(options: {
    startDate: string;
    endDate: string;
    numOfRows?: number;
    pageNo?: number;
  }): Promise<NormalizedBid[]> {
    const response = await this.fetch(G2B_CONFIG.endpoints.constructionBidList, {
      inqryDiv: '1',
      inqryBgnDt: `${options.startDate}0000`,
      inqryEndDt: `${options.endDate}2359`,
      numOfRows: options.numOfRows ?? 100,
      pageNo: options.pageNo ?? 1,
    });

    const parsed = G2BResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.error('[G2B] Response parsing failed:', parsed.error);
      return [];
    }

    const items = parsed.data.response.body?.items ?? [];
    return items.map(normalizeG2BBid);
  }

  /**
   * 모든 유형의 입찰 공고 통합 조회
   */
  async fetchAllBids(options: {
    startDate: string;
    endDate: string;
    numOfRows?: number;
  }): Promise<NormalizedBid[]> {
    const [goods, services, construction] = await Promise.all([
      this.fetchGoodsBids(options),
      this.fetchServiceBids(options),
      this.fetchConstructionBids(options),
    ]);

    return [...goods, ...services, ...construction];
  }

  /**
   * 입찰 공고 상세 조회
   */
  async fetchBidDetail(bidNtceNo: string, bidNtceOrd: string): Promise<NormalizedBid | null> {
    const response = await this.fetch(G2B_CONFIG.endpoints.bidDetail, {
      bidNtceNo,
      bidNtceOrd,
    });

    const parsed = G2BResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.error('[G2B] Response parsing failed:', parsed.error);
      return null;
    }

    const items = parsed.data.response.body?.items ?? [];
    if (items.length === 0) return null;

    return normalizeG2BBid(items[0]);
  }

  /**
   * 제조업 관련 입찰만 필터링
   */
  filterManufacturingBids(bids: NormalizedBid[]): NormalizedBid[] {
    return bids.filter((bid) => {
      const title = bid.title.toLowerCase();

      // 키워드 매칭
      return G2B_CONFIG.manufacturingKeywords.some((keyword) =>
        title.includes(keyword.toLowerCase())
      );
    });
  }

  /**
   * 오늘 날짜 입찰 공고 조회 (헬퍼)
   */
  async fetchTodayBids(): Promise<NormalizedBid[]> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    return this.fetchAllBids({
      startDate: dateStr,
      endDate: dateStr,
      numOfRows: 500,
    });
  }

  /**
   * 최근 N일 입찰 공고 조회 (헬퍼)
   */
  async fetchRecentBids(days: number = 7): Promise<NormalizedBid[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startStr = startDate.toISOString().slice(0, 10).replace(/-/g, '');
    const endStr = endDate.toISOString().slice(0, 10).replace(/-/g, '');

    return this.fetchAllBids({
      startDate: startStr,
      endDate: endStr,
      numOfRows: 500,
    });
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const g2bClient = new G2BClient();

// ============================================================================
// Constants Export
// ============================================================================

export { G2B_CONFIG };
