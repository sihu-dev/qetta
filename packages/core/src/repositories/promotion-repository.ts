/**
 * @qetta/core - Promotion Repository
 * L2 (Cells) - 프로모션/쿠폰 데이터 저장소
 */

import type {
  ICoupon,
  ICouponUsage,
  IReferralCode,
  IReferral,
  IMarketingCampaign,
  IPromotionAnalytics,
  PromotionStatus,
  PromotionType,
  IResult,
  IPaginatedResult,
  IPagination,
} from '@qetta/types';

/**
 * 프로모션 저장소 인터페이스
 */
export interface IPromotionRepository {
  // ═══════════════════════════════════════════════════════════════
  // 쿠폰 관리
  // ═══════════════════════════════════════════════════════════════

  /** 쿠폰 저장 */
  saveCoupon(coupon: ICoupon): Promise<IResult<ICoupon>>;

  /** 쿠폰 코드로 조회 */
  getCouponByCode(code: string): Promise<IResult<ICoupon | null>>;

  /** 쿠폰 ID로 조회 */
  getCouponById(id: string): Promise<IResult<ICoupon | null>>;

  /** 쿠폰 목록 조회 */
  listCoupons(
    options?: {
      status?: PromotionStatus;
      search?: string;
    },
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<ICoupon>>;

  /** 쿠폰 업데이트 */
  updateCoupon(id: string, updates: Partial<ICoupon>): Promise<IResult<ICoupon>>;

  /** 쿠폰 삭제 */
  deleteCoupon(id: string): Promise<IResult<boolean>>;

  /** 쿠폰 사용 횟수 증가 */
  incrementCouponUsage(id: string): Promise<IResult<ICoupon>>;

  // ═══════════════════════════════════════════════════════════════
  // 쿠폰 사용 기록
  // ═══════════════════════════════════════════════════════════════

  /** 쿠폰 사용 기록 저장 */
  saveCouponUsage(usage: ICouponUsage): Promise<IResult<ICouponUsage>>;

  /** 사용자의 쿠폰 사용 횟수 조회 */
  getUserCouponUsageCount(userId: string, couponId: string): Promise<IResult<number>>;

  /** 쿠폰 사용 이력 조회 */
  getCouponUsageHistory(
    couponId: string,
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<ICouponUsage>>;

  // ═══════════════════════════════════════════════════════════════
  // 추천 코드 관리
  // ═══════════════════════════════════════════════════════════════

  /** 추천 코드 저장 */
  saveReferralCode(referralCode: IReferralCode): Promise<IResult<IReferralCode>>;

  /** 추천 코드 조회 */
  getReferralCodeByCode(code: string): Promise<IResult<IReferralCode | null>>;

  /** 사용자의 추천 코드 조회 */
  getReferralCodeByUserId(userId: string): Promise<IResult<IReferralCode | null>>;

  /** 추천 코드 통계 업데이트 */
  updateReferralStats(
    codeId: string,
    updates: Partial<
      Pick<IReferralCode, 'totalReferrals' | 'successfulReferrals' | 'totalRewardsEarned'>
    >
  ): Promise<IResult<IReferralCode>>;

  // ═══════════════════════════════════════════════════════════════
  // 추천 기록
  // ═══════════════════════════════════════════════════════════════

  /** 추천 기록 저장 */
  saveReferral(referral: IReferral): Promise<IResult<IReferral>>;

  /** 추천 기록 조회 */
  getReferral(id: string): Promise<IResult<IReferral | null>>;

  /** 사용자의 추천 기록 목록 (추천인으로서) */
  getReferralsByReferrer(
    referrerId: string,
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<IReferral>>;

  /** 추천 상태 업데이트 */
  updateReferralStatus(
    id: string,
    status: IReferral['status'],
    rewardedAt?: Date
  ): Promise<IResult<IReferral>>;

  // ═══════════════════════════════════════════════════════════════
  // 마케팅 캠페인
  // ═══════════════════════════════════════════════════════════════

  /** 캠페인 저장 */
  saveCampaign(campaign: IMarketingCampaign): Promise<IResult<IMarketingCampaign>>;

  /** 캠페인 조회 */
  getCampaign(id: string): Promise<IResult<IMarketingCampaign | null>>;

  /** 캠페인 목록 조회 */
  listCampaigns(
    options?: {
      status?: PromotionStatus;
      type?: PromotionType;
    },
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<IMarketingCampaign>>;

  /** 캠페인 업데이트 */
  updateCampaign(
    id: string,
    updates: Partial<IMarketingCampaign>
  ): Promise<IResult<IMarketingCampaign>>;

  /** 캠페인 통계 업데이트 */
  updateCampaignStats(
    id: string,
    stats: Partial<IMarketingCampaign['stats']>
  ): Promise<IResult<IMarketingCampaign>>;

  /** 캠페인 삭제 */
  deleteCampaign(id: string): Promise<IResult<boolean>>;

  // ═══════════════════════════════════════════════════════════════
  // 분석
  // ═══════════════════════════════════════════════════════════════

  /** 프로모션 분석 데이터 저장 */
  saveAnalytics(analytics: IPromotionAnalytics): Promise<IResult<IPromotionAnalytics>>;

  /** 프로모션 분석 데이터 조회 */
  getAnalytics(
    promotionId: string,
    period?: { start: Date; end: Date }
  ): Promise<IResult<IPromotionAnalytics | null>>;
}

/**
 * 프로모션 저장소 구현 (In-Memory - 개발용)
 */
export class InMemoryPromotionRepository implements IPromotionRepository {
  private coupons: Map<string, ICoupon> = new Map();
  private couponUsages: Map<string, ICouponUsage[]> = new Map();
  private referralCodes: Map<string, IReferralCode> = new Map();
  private referrals: Map<string, IReferral> = new Map();
  private campaigns: Map<string, IMarketingCampaign> = new Map();
  private analytics: Map<string, IPromotionAnalytics> = new Map();

  // ═══════════════════════════════════════════════════════════════
  // 쿠폰 관리
  // ═══════════════════════════════════════════════════════════════

  async saveCoupon(coupon: ICoupon): Promise<IResult<ICoupon>> {
    const startTime = Date.now();

    try {
      this.coupons.set(coupon.id, { ...coupon });

      return {
        success: true,
        data: coupon,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getCouponByCode(code: string): Promise<IResult<ICoupon | null>> {
    const startTime = Date.now();

    try {
      const coupon = Array.from(this.coupons.values()).find(
        (c) => c.code.toUpperCase() === code.toUpperCase()
      );

      return {
        success: true,
        data: coupon ? { ...coupon } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getCouponById(id: string): Promise<IResult<ICoupon | null>> {
    const startTime = Date.now();

    try {
      const coupon = this.coupons.get(id);

      return {
        success: true,
        data: coupon ? { ...coupon } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async listCoupons(
    options?: {
      status?: PromotionStatus;
      search?: string;
    },
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<ICoupon>> {
    const startTime = Date.now();
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    try {
      let coupons = Array.from(this.coupons.values());

      // 필터 적용
      if (options?.status) {
        coupons = coupons.filter((c) => c.status === options.status);
      }
      if (options?.search) {
        const search = options.search.toLowerCase();
        coupons = coupons.filter(
          (c) => c.code.toLowerCase().includes(search) || c.name.toLowerCase().includes(search)
        );
      }

      // 생성일순 정렬 (최신 먼저)
      coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = coupons.length;
      const offset = (page - 1) * limit;
      const paged = coupons.slice(offset, offset + limit);

      return {
        success: true,
        data: paged.map((c) => ({ ...c })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error(String(error)),
        pagination: { page, limit, total: 0, hasMore: false },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async updateCoupon(id: string, updates: Partial<ICoupon>): Promise<IResult<ICoupon>> {
    const startTime = Date.now();

    try {
      const existing = this.coupons.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Coupon not found: ${id}`),
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      const updated: ICoupon = {
        ...existing,
        ...updates,
        id: existing.id,
        code: existing.code,
        updatedAt: new Date(),
      };

      this.coupons.set(id, updated);

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async deleteCoupon(id: string): Promise<IResult<boolean>> {
    const startTime = Date.now();

    try {
      const deleted = this.coupons.delete(id);

      return {
        success: true,
        data: deleted,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async incrementCouponUsage(id: string): Promise<IResult<ICoupon>> {
    const startTime = Date.now();

    try {
      const existing = this.coupons.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Coupon not found: ${id}`),
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      const updated: ICoupon = {
        ...existing,
        usageCount: existing.usageCount + 1,
        updatedAt: new Date(),
      };

      this.coupons.set(id, updated);

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 쿠폰 사용 기록
  // ═══════════════════════════════════════════════════════════════

  async saveCouponUsage(usage: ICouponUsage): Promise<IResult<ICouponUsage>> {
    const startTime = Date.now();

    try {
      const key = `${usage.couponId}:${usage.userId}`;
      const usages = this.couponUsages.get(key) ?? [];
      usages.push({ ...usage });
      this.couponUsages.set(key, usages);

      return {
        success: true,
        data: usage,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getUserCouponUsageCount(userId: string, couponId: string): Promise<IResult<number>> {
    const startTime = Date.now();

    try {
      const key = `${couponId}:${userId}`;
      const usages = this.couponUsages.get(key) ?? [];

      return {
        success: true,
        data: usages.length,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getCouponUsageHistory(
    couponId: string,
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<ICouponUsage>> {
    const startTime = Date.now();
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    try {
      // 모든 사용 기록에서 해당 쿠폰 찾기
      const allUsages: ICouponUsage[] = [];
      const entries = Array.from(this.couponUsages.entries());
      for (const [key, usages] of entries) {
        if (key.startsWith(`${couponId}:`)) {
          allUsages.push(...usages);
        }
      }

      // 사용일순 정렬 (최신 먼저)
      allUsages.sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());

      const total = allUsages.length;
      const offset = (page - 1) * limit;
      const paged = allUsages.slice(offset, offset + limit);

      return {
        success: true,
        data: paged.map((u) => ({ ...u })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error(String(error)),
        pagination: { page, limit, total: 0, hasMore: false },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 추천 코드 관리
  // ═══════════════════════════════════════════════════════════════

  async saveReferralCode(referralCode: IReferralCode): Promise<IResult<IReferralCode>> {
    const startTime = Date.now();

    try {
      this.referralCodes.set(referralCode.id, { ...referralCode });

      return {
        success: true,
        data: referralCode,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getReferralCodeByCode(code: string): Promise<IResult<IReferralCode | null>> {
    const startTime = Date.now();

    try {
      const referralCode = Array.from(this.referralCodes.values()).find(
        (r) => r.code.toUpperCase() === code.toUpperCase()
      );

      return {
        success: true,
        data: referralCode ? { ...referralCode } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getReferralCodeByUserId(userId: string): Promise<IResult<IReferralCode | null>> {
    const startTime = Date.now();

    try {
      const referralCode = Array.from(this.referralCodes.values()).find((r) => r.userId === userId);

      return {
        success: true,
        data: referralCode ? { ...referralCode } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async updateReferralStats(
    codeId: string,
    updates: Partial<
      Pick<IReferralCode, 'totalReferrals' | 'successfulReferrals' | 'totalRewardsEarned'>
    >
  ): Promise<IResult<IReferralCode>> {
    const startTime = Date.now();

    try {
      const existing = this.referralCodes.get(codeId);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Referral code not found: ${codeId}`),
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      const updated: IReferralCode = {
        ...existing,
        ...updates,
      };

      this.referralCodes.set(codeId, updated);

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 추천 기록
  // ═══════════════════════════════════════════════════════════════

  async saveReferral(referral: IReferral): Promise<IResult<IReferral>> {
    const startTime = Date.now();

    try {
      this.referrals.set(referral.id, { ...referral });

      return {
        success: true,
        data: referral,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getReferral(id: string): Promise<IResult<IReferral | null>> {
    const startTime = Date.now();

    try {
      const referral = this.referrals.get(id);

      return {
        success: true,
        data: referral ? { ...referral } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getReferralsByReferrer(
    referrerId: string,
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<IReferral>> {
    const startTime = Date.now();
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    try {
      let referrals = Array.from(this.referrals.values()).filter(
        (r) => r.referrerId === referrerId
      );

      // 생성일순 정렬 (최신 먼저)
      referrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = referrals.length;
      const offset = (page - 1) * limit;
      const paged = referrals.slice(offset, offset + limit);

      return {
        success: true,
        data: paged.map((r) => ({ ...r })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error(String(error)),
        pagination: { page, limit, total: 0, hasMore: false },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async updateReferralStatus(
    id: string,
    status: IReferral['status'],
    rewardedAt?: Date
  ): Promise<IResult<IReferral>> {
    const startTime = Date.now();

    try {
      const existing = this.referrals.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Referral not found: ${id}`),
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      const updated: IReferral = {
        ...existing,
        status,
        rewardedAt: rewardedAt ?? existing.rewardedAt,
      };

      this.referrals.set(id, updated);

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 마케팅 캠페인
  // ═══════════════════════════════════════════════════════════════

  async saveCampaign(campaign: IMarketingCampaign): Promise<IResult<IMarketingCampaign>> {
    const startTime = Date.now();

    try {
      this.campaigns.set(campaign.id, { ...campaign });

      return {
        success: true,
        data: campaign,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getCampaign(id: string): Promise<IResult<IMarketingCampaign | null>> {
    const startTime = Date.now();

    try {
      const campaign = this.campaigns.get(id);

      return {
        success: true,
        data: campaign ? { ...campaign } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async listCampaigns(
    options?: {
      status?: PromotionStatus;
      type?: PromotionType;
    },
    pagination?: Partial<IPagination>
  ): Promise<IPaginatedResult<IMarketingCampaign>> {
    const startTime = Date.now();
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    try {
      let campaigns = Array.from(this.campaigns.values());

      // 필터 적용
      if (options?.status) {
        campaigns = campaigns.filter((c) => c.status === options.status);
      }
      if (options?.type) {
        campaigns = campaigns.filter((c) => c.type === options.type);
      }

      // 생성일순 정렬 (최신 먼저)
      campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = campaigns.length;
      const offset = (page - 1) * limit;
      const paged = campaigns.slice(offset, offset + limit);

      return {
        success: true,
        data: paged.map((c) => ({ ...c })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error(String(error)),
        pagination: { page, limit, total: 0, hasMore: false },
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async updateCampaign(
    id: string,
    updates: Partial<IMarketingCampaign>
  ): Promise<IResult<IMarketingCampaign>> {
    const startTime = Date.now();

    try {
      const existing = this.campaigns.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Campaign not found: ${id}`),
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      const updated: IMarketingCampaign = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date(),
      };

      this.campaigns.set(id, updated);

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async updateCampaignStats(
    id: string,
    stats: Partial<IMarketingCampaign['stats']>
  ): Promise<IResult<IMarketingCampaign>> {
    const startTime = Date.now();

    try {
      const existing = this.campaigns.get(id);

      if (!existing) {
        return {
          success: false,
          error: new Error(`Campaign not found: ${id}`),
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      const updated: IMarketingCampaign = {
        ...existing,
        stats: {
          ...existing.stats,
          ...stats,
        },
        updatedAt: new Date(),
      };

      this.campaigns.set(id, updated);

      return {
        success: true,
        data: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async deleteCampaign(id: string): Promise<IResult<boolean>> {
    const startTime = Date.now();

    try {
      const deleted = this.campaigns.delete(id);

      return {
        success: true,
        data: deleted,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 분석
  // ═══════════════════════════════════════════════════════════════

  async saveAnalytics(analytics: IPromotionAnalytics): Promise<IResult<IPromotionAnalytics>> {
    const startTime = Date.now();

    try {
      const key = `${analytics.promotionId}:${analytics.period.start.toISOString()}`;
      this.analytics.set(key, { ...analytics });

      return {
        success: true,
        data: analytics,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }

  async getAnalytics(
    promotionId: string,
    period?: { start: Date; end: Date }
  ): Promise<IResult<IPromotionAnalytics | null>> {
    const startTime = Date.now();

    try {
      // 가장 최근 분석 데이터 찾기
      const allAnalytics = Array.from(this.analytics.values()).filter(
        (a) => a.promotionId === promotionId
      );

      if (period) {
        const found = allAnalytics.find(
          (a) =>
            new Date(a.period.start).getTime() === period.start.getTime() &&
            new Date(a.period.end).getTime() === period.end.getTime()
        );

        return {
          success: true,
          data: found ? { ...found } : null,
          metadata: {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          },
        };
      }

      // 기간 미지정 시 최신 분석 반환
      allAnalytics.sort(
        (a, b) => new Date(b.period.end).getTime() - new Date(a.period.end).getTime()
      );

      return {
        success: true,
        data: allAnalytics.length > 0 ? { ...allAnalytics[0] } : null,
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
      };
    }
  }
}

/**
 * 프로모션 저장소 인스턴스 생성
 */
export function createPromotionRepository(
  type: 'memory' | 'supabase' = 'memory'
): IPromotionRepository {
  switch (type) {
    case 'memory':
      return new InMemoryPromotionRepository();
    case 'supabase':
      // TODO: Supabase 구현
      throw new Error('Supabase promotion repository not implemented yet');
    default:
      throw new Error(`Unknown repository type: ${type}`);
  }
}
