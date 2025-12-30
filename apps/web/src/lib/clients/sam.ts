/**
 * SAM.gov API 클라이언트
 * @see https://open.gsa.gov/api/get-opportunities-public-api/
 */
import { z } from 'zod';

// ============================================================================
// Configuration
// ============================================================================

const SAM_CONFIG = {
  baseUrl: 'https://api.sam.gov/opportunities/v2',
  endpoints: {
    search: '/search',
    opportunity: '/opportunity',
  },
  // NAICS codes for manufacturing
  manufacturingNAICS: {
    fabricatedMetal: '332', // 금속제품 제조
    metalValve: '332911', // 산업용 밸브
    metalFitting: '332919', // 금속 피팅
    machinery: '333', // 기계 제조
    pumpEquipment: '333911', // 펌프 및 펌프 장비
    measuringDevice: '333314', // 광학 측정 장치
    flowMeter: '334515', // 유량계
    computerElectronic: '334', // 컴퓨터/전자제품
    industrialControl: '334513', // 산업용 제어 장비
    electricalEquipment: '335', // 전기장비
    motorGenerator: '335312', // 모터 및 발전기
    transportation: '336', // 운송장비
  },
  defaultNAICSCodes: ['332', '333', '334', '335', '336'],
  opportunityTypes: [
    'o', // Combined Synopsis/Solicitation
    'p', // Presolicitation
    'k', // Sources Sought
    'r', // Special Notice
  ],
  rateLimit: {
    requestsPerDay: 10000,
  },
} as const;

// ============================================================================
// Schemas
// ============================================================================

const SAMContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  type: z.string().optional(),
});

const SAMOpportunitySchema = z.object({
  opportunityId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  naicsCode: z.string().optional(),
  classificationCode: z.string().optional(),
  postedDate: z.string(),
  responseDeadLine: z.string().optional(),
  archiveDate: z.string().optional(),
  type: z.string().optional(),
  typeOfSetAsideDescription: z.string().optional(),
  organizationName: z.string().optional(),
  organizationDepartment: z.string().optional(),
  organizationSubTier: z.string().optional(),
  pointOfContact: z.array(SAMContactSchema).optional().default([]),
  uiLink: z.string(),
  placeOfPerformance: z
    .object({
      city: z.object({ name: z.string().optional() }).optional(),
      state: z.object({ name: z.string().optional(), code: z.string().optional() }).optional(),
      country: z.object({ name: z.string().optional(), code: z.string().optional() }).optional(),
    })
    .optional(),
  award: z
    .object({
      amount: z.number().optional(),
      date: z.string().optional(),
    })
    .optional(),
});

const SAMSearchResponseSchema = z.object({
  totalRecords: z.number().optional().default(0),
  opportunitiesData: z.array(SAMOpportunitySchema).optional().default([]),
});

export type SAMOpportunity = z.infer<typeof SAMOpportunitySchema>;

// ============================================================================
// Normalized Types
// ============================================================================

export interface NormalizedBid {
  id: string;
  source: 'sam';
  externalId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: 'USD';
  country: 'US';
  buyerName: string;
  naicsCode: string | null;
  classificationCode: string | null;
  contacts: Array<{ name?: string; email?: string; phone?: string }>;
  originalUrl: string;
  rawData: SAMOpportunity;
  createdAt: Date;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * SAM 날짜 파싱 (MM/DD/YYYY 형식)
 */
function parseSAMDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  // MM/DD/YYYY 형식
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/');
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }

  // ISO 형식
  if (dateStr.includes('-')) {
    return new Date(dateStr);
  }

  return null;
}

/**
 * SAM 기회를 정규화된 형식으로 변환
 */
function normalizeSAMOpportunity(opp: SAMOpportunity): NormalizedBid {
  return {
    id: crypto.randomUUID(),
    source: 'sam',
    externalId: opp.opportunityId,
    title: opp.title,
    description: opp.description ?? null,
    deadline: parseSAMDate(opp.responseDeadLine),
    budgetMin: opp.award?.amount ?? null,
    budgetMax: null,
    currency: 'USD',
    country: 'US',
    buyerName: opp.organizationName ?? 'Unknown',
    naicsCode: opp.naicsCode ?? null,
    classificationCode: opp.classificationCode ?? null,
    contacts: opp.pointOfContact.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
    })),
    originalUrl: opp.uiLink,
    rawData: opp,
    createdAt: new Date(),
  };
}

/**
 * 날짜를 MM/DD/YYYY 형식으로 변환
 */
function formatSAMDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// ============================================================================
// SAM Client Class
// ============================================================================

export class SAMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.SAM_API_KEY ?? '';
    this.baseUrl = SAM_CONFIG.baseUrl;

    if (!this.apiKey) {
      console.warn('[SAM] API key not configured. Set SAM_API_KEY environment variable.');
    }
  }

  /**
   * API 요청 실행
   */
  private async fetch(
    endpoint: string,
    params: Record<string, string | number | undefined>
  ): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // API 키 추가
    url.searchParams.set('api_key', this.apiKey);

    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    console.log(`[SAM] Fetching: ${endpoint}`);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`[SAM] API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 기회 검색
   */
  async search(options: {
    postedFrom?: string; // MM/DD/YYYY
    postedTo?: string; // MM/DD/YYYY
    responseDeadLine?: string; // MM/DD/YYYY (deadline from)
    naics?: string[];
    ptype?: string[]; // opportunity types
    limit?: number;
    offset?: number;
  }): Promise<NormalizedBid[]> {
    const response = await this.fetch(SAM_CONFIG.endpoints.search, {
      postedFrom: options.postedFrom,
      postedTo: options.postedTo,
      rdlfrom: options.responseDeadLine,
      naics: options.naics?.join(','),
      ptype: options.ptype?.join(','),
      limit: options.limit ?? 100,
      offset: options.offset ?? 0,
    });

    const parsed = SAMSearchResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.error('[SAM] Response parsing failed:', parsed.error);
      return [];
    }

    console.log(
      `[SAM] Found ${parsed.data.opportunitiesData.length} opportunities (total: ${parsed.data.totalRecords})`
    );
    return parsed.data.opportunitiesData.map(normalizeSAMOpportunity);
  }

  /**
   * 특정 기회 상세 조회
   */
  async getOpportunity(opportunityId: string): Promise<NormalizedBid | null> {
    try {
      const response = await this.fetch(`${SAM_CONFIG.endpoints.opportunity}/${opportunityId}`, {});

      const parsed = SAMOpportunitySchema.safeParse(response);

      if (!parsed.success) {
        console.error('[SAM] Opportunity parsing failed:', parsed.error);
        return null;
      }

      return normalizeSAMOpportunity(parsed.data);
    } catch {
      return null;
    }
  }

  /**
   * 제조업 기회 검색 (헬퍼)
   */
  async searchManufacturing(
    options: {
      deadlineAfter?: string; // MM/DD/YYYY
      limit?: number;
    } = {}
  ): Promise<NormalizedBid[]> {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.search({
      postedFrom: formatSAMDate(thirtyDaysAgo),
      responseDeadLine: options.deadlineAfter ?? formatSAMDate(today),
      naics: [...SAM_CONFIG.defaultNAICSCodes],
      limit: options.limit ?? 100,
    });
  }

  /**
   * 활성 기회만 검색 (마감일 유효)
   */
  async searchActive(
    options: {
      naics?: string[];
      limit?: number;
    } = {}
  ): Promise<NormalizedBid[]> {
    const today = new Date();

    return this.search({
      responseDeadLine: formatSAMDate(today),
      naics: options.naics ?? [...SAM_CONFIG.defaultNAICSCodes],
      ptype: [...SAM_CONFIG.opportunityTypes],
      limit: options.limit ?? 100,
    });
  }

  /**
   * 최근 게시된 기회 검색
   */
  async searchRecent(days: number = 7): Promise<NormalizedBid[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.search({
      postedFrom: formatSAMDate(startDate),
      postedTo: formatSAMDate(endDate),
      naics: [...SAM_CONFIG.defaultNAICSCodes],
      limit: 200,
    });
  }

  /**
   * 특정 NAICS 코드로 검색
   */
  async searchByNAICS(
    naicsCodes: string[],
    options: { limit?: number } = {}
  ): Promise<NormalizedBid[]> {
    return this.search({
      naics: naicsCodes,
      responseDeadLine: formatSAMDate(new Date()),
      limit: options.limit ?? 100,
    });
  }

  /**
   * 펌프/밸브 관련 기회 검색
   */
  async searchPumpsAndValves(): Promise<NormalizedBid[]> {
    return this.searchByNAICS([
      SAM_CONFIG.manufacturingNAICS.pumpEquipment,
      SAM_CONFIG.manufacturingNAICS.metalValve,
    ]);
  }

  /**
   * 계측/제어 장비 관련 기회 검색
   */
  async searchMeasurementEquipment(): Promise<NormalizedBid[]> {
    return this.searchByNAICS([
      SAM_CONFIG.manufacturingNAICS.flowMeter,
      SAM_CONFIG.manufacturingNAICS.measuringDevice,
      SAM_CONFIG.manufacturingNAICS.industrialControl,
    ]);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const samClient = new SAMClient();

// ============================================================================
// Constants Export
// ============================================================================

export { SAM_CONFIG };
