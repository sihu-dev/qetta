/**
 * TED Europa API 클라이언트
 * @see https://docs.ted.europa.eu/api/latest/index.html
 */
import { z } from 'zod';

// ============================================================================
// Configuration
// ============================================================================

const TED_CONFIG = {
  baseUrl: 'https://ted.europa.eu/api/v3',
  endpoints: {
    search: '/notices/search',
    notice: '/notices',
    documents: '/notices/{id}/documents',
  },
  // CPV codes for manufacturing (Common Procurement Vocabulary)
  manufacturingCPV: {
    industrialMachinery: '42*', // 산업용 기계류
    pumps: '42122*', // 펌프
    valves: '42131*', // 밸브
    compressors: '42123*', // 압축기
    labEquipment: '38*', // 실험/측정/제어 장비
    measurementDevices: '38410*', // 측정기기
    sensors: '38540*', // 센서
    flowMeters: '38411*', // 유량계
    electricalEquipment: '31*', // 전기기계/장치
    motors: '31161*', // 모터
    transformers: '31170*', // 변압기
    constructionMaterials: '44*', // 건설자재
    pipes: '44162*', // 파이프
    fittings: '44163*', // 피팅
  },
  defaultCPVCodes: ['42*', '38*', '31*', '44*'],
  rateLimit: {
    requestsPerMinute: 80, // Conservative (100 without key)
    requestsPerMinuteWithKey: 800, // With API key
  },
} as const;

// ============================================================================
// Schemas
// ============================================================================

const TEDNoticeSchema = z.object({
  id: z.string(),
  title: z.string().optional().default(''),
  summary: z.string().optional(),
  cpvCodes: z.array(z.string()).optional().default([]),
  publicationDate: z.string(),
  submissionDeadline: z.string().optional(),
  estimatedValue: z
    .object({
      amount: z.number(),
      currency: z.string(),
    })
    .optional(),
  buyerName: z.string().optional().default(''),
  buyerCountry: z.string().optional().default(''),
  noticeType: z.string().optional(),
  procedureType: z.string().optional(),
  noticeUrl: z.string().optional(),
  documentLinks: z.array(z.string()).optional().default([]),
});

const TEDSearchResponseSchema = z.object({
  notices: z.array(TEDNoticeSchema).optional().default([]),
  total: z.number().optional().default(0),
  page: z.number().optional().default(0),
  size: z.number().optional().default(50),
});

export type TEDNotice = z.infer<typeof TEDNoticeSchema>;

// ============================================================================
// Normalized Types
// ============================================================================

export interface NormalizedBid {
  id: string;
  source: 'ted';
  externalId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  country: string;
  buyerName: string;
  cpvCodes: string[];
  originalUrl: string | null;
  rawData: TEDNotice;
  createdAt: Date;
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeTEDNotice(notice: TEDNotice): NormalizedBid {
  return {
    id: crypto.randomUUID(),
    source: 'ted',
    externalId: notice.id,
    title: notice.title,
    description: notice.summary ?? null,
    deadline: notice.submissionDeadline ? new Date(notice.submissionDeadline) : null,
    budgetMin: notice.estimatedValue?.amount ?? null,
    budgetMax: null,
    currency: notice.estimatedValue?.currency ?? 'EUR',
    country: notice.buyerCountry,
    buyerName: notice.buyerName,
    cpvCodes: notice.cpvCodes,
    originalUrl: notice.noticeUrl ?? `https://ted.europa.eu/notice/${notice.id}`,
    rawData: notice,
    createdAt: new Date(),
  };
}

// ============================================================================
// TED Client Class
// ============================================================================

export class TEDClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.TED_API_KEY;
    this.baseUrl = TED_CONFIG.baseUrl;
  }

  /**
   * 헤더 생성
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-KEY'] = this.apiKey;
    }

    return headers;
  }

  /**
   * 입찰 공고 검색
   */
  async search(options: {
    query?: string;
    cpv?: string[];
    countries?: string[];
    publicationDateFrom?: string;
    publicationDateTo?: string;
    deadlineFrom?: string;
    deadlineTo?: string;
    noticeType?: string[];
    size?: number;
    page?: number;
  }): Promise<NormalizedBid[]> {
    const requestBody = {
      query: options.query,
      filters: {
        cpv: options.cpv,
        buyerCountry: options.countries,
        publicationDate:
          options.publicationDateFrom || options.publicationDateTo
            ? {
                gte: options.publicationDateFrom,
                lte: options.publicationDateTo,
              }
            : undefined,
        submissionDeadline:
          options.deadlineFrom || options.deadlineTo
            ? {
                gte: options.deadlineFrom,
                lte: options.deadlineTo,
              }
            : undefined,
        noticeType: options.noticeType,
      },
      pagination: {
        size: options.size ?? 50,
        page: options.page ?? 0,
      },
    };

    console.log(`[TED] Searching notices...`);

    const response = await fetch(`${this.baseUrl}${TED_CONFIG.endpoints.search}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`[TED] API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = TEDSearchResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('[TED] Response parsing failed:', parsed.error);
      return [];
    }

    console.log(`[TED] Found ${parsed.data.notices.length} notices (total: ${parsed.data.total})`);
    return parsed.data.notices.map(normalizeTEDNotice);
  }

  /**
   * 공고 상세 조회
   */
  async getNotice(noticeId: string): Promise<NormalizedBid | null> {
    const response = await fetch(`${this.baseUrl}${TED_CONFIG.endpoints.notice}/${noticeId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`[TED] API Error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = TEDNoticeSchema.safeParse(data);

    if (!parsed.success) {
      console.error('[TED] Notice parsing failed:', parsed.error);
      return null;
    }

    return normalizeTEDNotice(parsed.data);
  }

  /**
   * 제조업 입찰 검색 (헬퍼)
   */
  async searchManufacturing(
    options: {
      deadlineAfter?: string; // ISO date
      countries?: string[];
      size?: number;
    } = {}
  ): Promise<NormalizedBid[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.search({
      cpv: [...TED_CONFIG.defaultCPVCodes],
      deadlineFrom: options.deadlineAfter ?? today,
      countries: options.countries,
      size: options.size ?? 100,
    });
  }

  /**
   * 특정 국가 입찰 검색
   */
  async searchByCountry(
    countryCodes: string[],
    options: { size?: number } = {}
  ): Promise<NormalizedBid[]> {
    return this.search({
      countries: countryCodes,
      cpv: [...TED_CONFIG.defaultCPVCodes],
      size: options.size ?? 100,
    });
  }

  /**
   * 최근 공개된 입찰 검색
   */
  async searchRecent(days: number = 7): Promise<NormalizedBid[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.search({
      cpv: [...TED_CONFIG.defaultCPVCodes],
      publicationDateFrom: startDate.toISOString().split('T')[0],
      publicationDateTo: endDate.toISOString().split('T')[0],
      size: 200,
    });
  }

  /**
   * 특정 CPV 코드로 검색
   */
  async searchByCPV(
    cpvCodes: string[],
    options: {
      deadlineAfter?: string;
      size?: number;
    } = {}
  ): Promise<NormalizedBid[]> {
    return this.search({
      cpv: cpvCodes,
      deadlineFrom: options.deadlineAfter,
      size: options.size ?? 100,
    });
  }

  /**
   * 유량계 관련 입찰 검색
   */
  async searchFlowMeters(): Promise<NormalizedBid[]> {
    return this.searchByCPV([TED_CONFIG.manufacturingCPV.flowMeters], { size: 50 });
  }

  /**
   * 펌프/밸브 관련 입찰 검색
   */
  async searchPumpsAndValves(): Promise<NormalizedBid[]> {
    return this.searchByCPV([
      TED_CONFIG.manufacturingCPV.pumps,
      TED_CONFIG.manufacturingCPV.valves,
    ]);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const tedClient = new TEDClient();

// ============================================================================
// Constants Export
// ============================================================================

export { TED_CONFIG };
