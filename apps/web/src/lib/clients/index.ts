/**
 * Qetta API Clients
 *
 * 나라장터 (G2B), TED Europa, SAM.gov 통합 클라이언트
 */

// Re-export with explicit names to avoid collision
export {
  g2bClient,
  G2BClient,
  G2B_CONFIG,
  type G2BBidItem,
  type NormalizedBid as G2BNormalizedBid,
} from './g2b';
export {
  tedClient,
  TEDClient,
  TED_CONFIG,
  type TEDNotice,
  type NormalizedBid as TEDNormalizedBid,
} from './ted';
export {
  samClient,
  SAMClient,
  SAM_CONFIG,
  type SAMOpportunity,
  type NormalizedBid as SAMNormalizedBid,
} from './sam';

import { G2BClient, type NormalizedBid as G2BBid } from './g2b';
import { TEDClient, type NormalizedBid as TEDBid } from './ted';
import { SAMClient, type NormalizedBid as SAMBid } from './sam';

// Google Sheets Client
export {
  googleSheetsClient,
  GoogleSheetsClient,
  type GoogleSheetsConfig,
  type BidRow,
  type SheetSyncResult,
} from './google-sheets';

// Re-export normalized bid types for external use
export type { G2BBid, TEDBid, SAMBid };

// ============================================================================
// Unified Bid Type
// ============================================================================

export type BidSource = 'g2b' | 'ted' | 'sam';

export interface UnifiedBid {
  id: string;
  source: BidSource;
  externalId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  country: string;
  buyerName: string;
  originalUrl: string | null;
  createdAt: Date;

  // Source-specific fields (optional)
  cpvCodes?: string[];
  naicsCode?: string | null;
  rawData: unknown;
}

// ============================================================================
// Unified Client
// ============================================================================

export class UnifiedBidClient {
  private g2b: G2BClient;
  private ted: TEDClient;
  private sam: SAMClient;

  constructor(options?: { g2bApiKey?: string; tedApiKey?: string; samApiKey?: string }) {
    this.g2b = new G2BClient(options?.g2bApiKey);
    this.ted = new TEDClient(options?.tedApiKey);
    this.sam = new SAMClient(options?.samApiKey);
  }

  /**
   * 모든 소스에서 입찰 조회
   */
  async fetchAllSources(): Promise<{
    g2b: G2BBid[];
    ted: TEDBid[];
    sam: SAMBid[];
    total: number;
  }> {
    console.log('[UnifiedClient] Fetching from all sources...');

    const [g2bBids, tedBids, samBids] = await Promise.allSettled([
      this.g2b.fetchTodayBids(),
      this.ted.searchManufacturing(),
      this.sam.searchManufacturing(),
    ]);

    const g2b = g2bBids.status === 'fulfilled' ? g2bBids.value : [];
    const ted = tedBids.status === 'fulfilled' ? tedBids.value : [];
    const sam = samBids.status === 'fulfilled' ? samBids.value : [];

    if (g2bBids.status === 'rejected') {
      console.error('[G2B] Fetch failed:', g2bBids.reason);
    }
    if (tedBids.status === 'rejected') {
      console.error('[TED] Fetch failed:', tedBids.reason);
    }
    if (samBids.status === 'rejected') {
      console.error('[SAM] Fetch failed:', samBids.reason);
    }

    const total = g2b.length + ted.length + sam.length;
    console.log(
      `[UnifiedClient] Total bids: ${total} (G2B: ${g2b.length}, TED: ${ted.length}, SAM: ${sam.length})`
    );

    return { g2b, ted, sam, total };
  }

  /**
   * 통합 형식으로 모든 입찰 조회
   */
  async fetchUnified(): Promise<UnifiedBid[]> {
    const { g2b, ted, sam } = await this.fetchAllSources();

    const unified: UnifiedBid[] = [
      ...g2b.map((b) => this.normalizeG2B(b)),
      ...ted.map((b) => this.normalizeTED(b)),
      ...sam.map((b) => this.normalizeSAM(b)),
    ];

    // 마감일 기준 정렬 (가까운 순)
    unified.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });

    return unified;
  }

  /**
   * 제조업 관련 입찰만 조회
   */
  async fetchManufacturing(): Promise<UnifiedBid[]> {
    const all = await this.fetchUnified();

    // G2B는 이미 필터링된 상태로 오거나, 키워드 필터링 필요
    // TED/SAM은 CPV/NAICS 코드로 필터링됨
    return all;
  }

  private normalizeG2B(bid: G2BBid): UnifiedBid {
    return {
      id: bid.id,
      source: 'g2b',
      externalId: bid.externalId,
      title: bid.title,
      description: bid.description,
      deadline: bid.deadline,
      budgetMin: bid.budgetMin,
      budgetMax: bid.budgetMax,
      currency: bid.currency,
      country: bid.country,
      buyerName: bid.buyerName,
      originalUrl: bid.originalUrl,
      createdAt: bid.createdAt,
      rawData: bid.rawData,
    };
  }

  private normalizeTED(bid: TEDBid): UnifiedBid {
    return {
      id: bid.id,
      source: 'ted',
      externalId: bid.externalId,
      title: bid.title,
      description: bid.description,
      deadline: bid.deadline,
      budgetMin: bid.budgetMin,
      budgetMax: bid.budgetMax,
      currency: bid.currency,
      country: bid.country,
      buyerName: bid.buyerName,
      originalUrl: bid.originalUrl,
      createdAt: bid.createdAt,
      cpvCodes: bid.cpvCodes,
      rawData: bid.rawData,
    };
  }

  private normalizeSAM(bid: SAMBid): UnifiedBid {
    return {
      id: bid.id,
      source: 'sam',
      externalId: bid.externalId,
      title: bid.title,
      description: bid.description,
      deadline: bid.deadline,
      budgetMin: bid.budgetMin,
      budgetMax: bid.budgetMax,
      currency: bid.currency,
      country: bid.country,
      buyerName: bid.buyerName,
      originalUrl: bid.originalUrl,
      createdAt: bid.createdAt,
      naicsCode: bid.naicsCode,
      rawData: bid.rawData,
    };
  }

  /**
   * 개별 클라이언트 접근
   */
  get clients() {
    return {
      g2b: this.g2b,
      ted: this.ted,
      sam: this.sam,
    };
  }
}

// ============================================================================
// Singleton Exports
// ============================================================================

export const unifiedClient = new UnifiedBidClient();
