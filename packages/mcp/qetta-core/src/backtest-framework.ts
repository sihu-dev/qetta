/**
 * Qetta 백테스트 프레임워크 v1.0
 *
 * 과거 입찰 데이터를 기반으로 v2.1 엔진 성능 검증
 * - 예측 정확도 분석
 * - 수익성 시뮬레이션
 * - 파라미터 최적화
 */

import { generateBidPredictionV2 } from './bidding-engine-v2.1.js';
import type { BidType, ContractType, CreditRating } from './bidding-engine.js';

// ============================================================
// 타입 정의
// ============================================================

export interface HistoricalBid {
  id: string;
  title: string;
  organization: string;
  estimatedPrice: number;
  basePrice?: number;
  bidType: BidType;
  contractType: ContractType;
  deadline: string;

  // 실제 결과 (백테스트용)
  actualResult: {
    winningPrice: number;           // 낙찰가
    winningRate: number;            // 낙찰률 (낙찰가/예정가격)
    assessmentRate: number;         // 실제 사정률
    competitorCount: number;        // 실제 경쟁업체 수
    winnerQualificationScore?: number;  // 낙찰자 적격심사 점수
    didWeWin?: boolean;             // 우리가 낙찰받았는지
    ourBidPrice?: number;           // 우리 투찰가
    ourRank?: number;               // 우리 순위
  };

  // 입찰 시점 회사 정보
  companySnapshot: {
    creditRating: CreditRating;
    deliveryRecords: Array<{
      organization?: string;
      productName?: string;
      amount: number;
      completedAt: string;
      category: string;
      keywords?: string[];
    }>;
    certifications: string[];
    techStaffCount: number;
  };

  // 메타데이터
  category?: string;
  isUrgent?: boolean;
  tags?: string[];
}

export interface BacktestConfig {
  // 기본 설정
  tenantId: string;
  productId: string;
  strategy: 'aggressive' | 'balanced' | 'conservative';

  // 필터링
  dateRange?: {
    start: Date;
    end: Date;
  };
  organizations?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;

  // 시뮬레이션 설정
  simulateBidding: boolean;        // 실제 입찰 시뮬레이션
  followRecommendation: boolean;   // 엔진 추천 따르기

  // 분석 옵션
  compareWithV2: boolean;          // v2.0과 비교
  calculateOptimalParams: boolean; // 최적 파라미터 찾기
}

export interface BacktestResult {
  // 기본 정보
  config: BacktestConfig;
  totalBids: number;
  analyzedBids: number;
  dateRange: { start: string; end: string };

  // 예측 정확도
  accuracy: {
    // 사정률 예측
    assessmentRate: {
      mape: number;         // Mean Absolute Percentage Error
      rmse: number;         // Root Mean Square Error
      correlation: number;  // 상관계수
      withinRange: number;  // 예측 범위 내 비율
    };

    // 경쟁률 예측
    competitorCount: {
      mape: number;
      rmse: number;
      correlation: number;
      withinRange: number;
    };

    // 낙찰가 예측
    winningPrice: {
      mape: number;
      rmse: number;
      avgDeviation: number;
    };

    // 추천 정확도
    recommendation: {
      accuracy: number;      // BID/SKIP 정확도
      precision: number;     // BID 추천 중 실제 낙찰 비율
      recall: number;        // 실제 낙찰 중 BID 추천 비율
      f1Score: number;
    };
  };

  // 수익성 분석 (시뮬레이션)
  profitability?: {
    totalBidsParticipated: number;
    winsCount: number;
    winRate: number;
    totalRevenue: number;
    avgMargin: number;
    roi: number;
  };

  // 세부 분석
  breakdown: {
    byOrganization: Record<string, BreakdownStats>;
    byCategory: Record<string, BreakdownStats>;
    byPriceRange: Record<string, BreakdownStats>;
    byMonth: Record<string, BreakdownStats>;
  };

  // 개별 결과
  details: BacktestDetailResult[];

  // 개선 제안
  insights: string[];
  parameterSuggestions?: ParameterSuggestion[];
}

export interface BreakdownStats {
  count: number;
  assessmentMape: number;
  competitorMape: number;
  winRate: number;
  avgProfit: number;
}

export interface BacktestDetailResult {
  bidId: string;
  bidTitle: string;
  organization: string;

  // 예측값
  predicted: {
    assessmentRate: number;
    competitorCount: number;
    optimalBidPrice: number;
    winProbability: number;
    recommendation: string;
    qualificationScore: number;
  };

  // 실제값
  actual: {
    assessmentRate: number;
    competitorCount: number;
    winningPrice: number;
    didWeWin: boolean;
    ourRank?: number;
  };

  // 오차
  errors: {
    assessmentRateError: number;
    competitorCountError: number;
    priceError: number;
  };

  // 시뮬레이션 결과
  simulation?: {
    wouldHaveWon: boolean;
    profit: number;
    rank: number;
  };
}

export interface ParameterSuggestion {
  parameter: string;
  currentValue: number;
  suggestedValue: number;
  expectedImprovement: string;
}

// ============================================================
// 백테스트 엔진
// ============================================================

export class BacktestEngine {
  private historicalBids: HistoricalBid[] = [];

  constructor() {}

  /**
   * 과거 데이터 로드 (배열)
   */
  public loadData(bids: HistoricalBid[]): void {
    this.historicalBids = bids;
    console.log(`Loaded ${bids.length} historical bids`);
  }

  /**
   * 백테스트 실행
   */
  public run(config: BacktestConfig): BacktestResult {
    const startTime = Date.now();

    // 1. 데이터 필터링
    const filteredBids = this.filterBids(config);
    console.log(`Filtered to ${filteredBids.length} bids`);

    if (filteredBids.length === 0) {
      throw new Error('No bids match the filter criteria');
    }

    // 2. 각 입찰에 대해 예측 실행
    const details: BacktestDetailResult[] = [];

    for (const bid of filteredBids) {
      const result = this.analyzeBid(bid, config);
      details.push(result);
    }

    // 3. 정확도 메트릭 계산
    const accuracy = this.calculateAccuracyMetrics(details);

    // 4. 수익성 분석 (시뮬레이션 옵션)
    const profitability = config.simulateBidding
      ? this.calculateProfitability(details, config)
      : undefined;

    // 5. 세부 분석
    const breakdown = this.calculateBreakdown(details, filteredBids);

    // 6. 인사이트 생성
    const insights = this.generateInsights(accuracy, breakdown, profitability);

    // 7. 파라미터 제안 (옵션)
    const parameterSuggestions = config.calculateOptimalParams
      ? this.suggestParameters(details)
      : undefined;

    const dateRange = {
      start: filteredBids.reduce((min, b) =>
        b.deadline < min ? b.deadline : min, filteredBids[0].deadline),
      end: filteredBids.reduce((max, b) =>
        b.deadline > max ? b.deadline : max, filteredBids[0].deadline),
    };

    console.log(`Backtest completed in ${Date.now() - startTime}ms`);

    return {
      config,
      totalBids: this.historicalBids.length,
      analyzedBids: filteredBids.length,
      dateRange,
      accuracy,
      profitability,
      breakdown,
      details,
      insights,
      parameterSuggestions,
    };
  }

  /**
   * 개별 입찰 분석
   */
  private analyzeBid(bid: HistoricalBid, config: BacktestConfig): BacktestDetailResult {
    // v2.1 엔진으로 예측
    const prediction = generateBidPredictionV2({
      bidId: bid.id,
      bidTitle: bid.title,
      organization: bid.organization,
      estimatedPrice: bid.estimatedPrice,
      basePrice: bid.basePrice,
      bidType: bid.bidType,
      contractType: bid.contractType,
      deadline: bid.deadline,
      tenantId: config.tenantId,
      productId: config.productId,
      creditRating: bid.companySnapshot.creditRating,
      deliveryRecords: bid.companySnapshot.deliveryRecords,
      certifications: bid.companySnapshot.certifications,
      techStaffCount: bid.companySnapshot.techStaffCount,
      strategy: config.strategy,
      isUrgent: bid.isUrgent,
    });

    // 오차 계산
    const assessmentRateError = Math.abs(
      prediction.assessmentAnalysis.rate - bid.actualResult.assessmentRate
    ) / bid.actualResult.assessmentRate;

    const competitorCountError = Math.abs(
      prediction.competitionAnalysis.expectedCompetitors - bid.actualResult.competitorCount
    ) / Math.max(1, bid.actualResult.competitorCount);

    const priceError = Math.abs(
      prediction.optimalBidPrice - bid.actualResult.winningPrice
    ) / bid.actualResult.winningPrice;

    // 시뮬레이션 (우리 투찰가로 낙찰받았을지)
    let simulation: BacktestDetailResult['simulation'];
    if (config.simulateBidding) {
      const ourBidPrice = config.followRecommendation
        ? (prediction.recommendation === 'SKIP' ? 0 : prediction.optimalBidPrice)
        : prediction.optimalBidPrice;

      if (ourBidPrice > 0) {
        const wouldHaveWon = ourBidPrice <= bid.actualResult.winningPrice &&
          prediction.qualificationScore.total >= 85;
        const profit = wouldHaveWon
          ? ourBidPrice * 0.15  // 예상 마진 15%
          : 0;

        simulation = {
          wouldHaveWon,
          profit,
          rank: this.estimateRank(ourBidPrice, bid),
        };
      }
    }

    return {
      bidId: bid.id,
      bidTitle: bid.title,
      organization: bid.organization,
      predicted: {
        assessmentRate: prediction.assessmentAnalysis.rate,
        competitorCount: prediction.competitionAnalysis.expectedCompetitors,
        optimalBidPrice: prediction.optimalBidPrice,
        winProbability: prediction.winProbability,
        recommendation: prediction.recommendation,
        qualificationScore: prediction.qualificationScore.total,
      },
      actual: {
        assessmentRate: bid.actualResult.assessmentRate,
        competitorCount: bid.actualResult.competitorCount,
        winningPrice: bid.actualResult.winningPrice,
        didWeWin: bid.actualResult.didWeWin || false,
        ourRank: bid.actualResult.ourRank,
      },
      errors: {
        assessmentRateError,
        competitorCountError,
        priceError,
      },
      simulation,
    };
  }

  /**
   * 정확도 메트릭 계산
   */
  private calculateAccuracyMetrics(details: BacktestDetailResult[]): BacktestResult['accuracy'] {
    const n = details.length;

    // 사정률 예측 정확도
    const assessmentErrors = details.map(d => d.errors.assessmentRateError);
    const assessmentMape = this.mean(assessmentErrors) * 100;
    const assessmentRmse = Math.sqrt(this.mean(assessmentErrors.map(e => e * e))) * 100;

    const assessmentPredicted = details.map(d => d.predicted.assessmentRate);
    const assessmentActual = details.map(d => d.actual.assessmentRate);
    const assessmentCorr = this.correlation(assessmentPredicted, assessmentActual);

    // 경쟁률 예측 정확도
    const competitorErrors = details.map(d => d.errors.competitorCountError);
    const competitorMape = this.mean(competitorErrors) * 100;
    const competitorRmse = Math.sqrt(this.mean(competitorErrors.map(e => e * e))) * 100;

    const competitorPredicted = details.map(d => d.predicted.competitorCount);
    const competitorActual = details.map(d => d.actual.competitorCount);
    const competitorCorr = this.correlation(competitorPredicted, competitorActual);

    // 낙찰가 예측 정확도
    const priceErrors = details.map(d => d.errors.priceError);
    const priceMape = this.mean(priceErrors) * 100;
    const priceRmse = Math.sqrt(this.mean(priceErrors.map(e => e * e))) * 100;

    // 추천 정확도 (BID vs SKIP)
    const bidRecommended = details.filter(d =>
      d.predicted.recommendation === 'BID' || d.predicted.recommendation === 'STRONG_BID'
    );
    const skipRecommended = details.filter(d =>
      d.predicted.recommendation === 'SKIP'
    );

    const truePositives = bidRecommended.filter(d => d.actual.didWeWin).length;
    const falsePositives = bidRecommended.filter(d => !d.actual.didWeWin).length;
    const falseNegatives = skipRecommended.filter(d => d.actual.didWeWin).length;
    const trueNegatives = skipRecommended.filter(d => !d.actual.didWeWin).length;

    const precision = truePositives / Math.max(1, truePositives + falsePositives);
    const recall = truePositives / Math.max(1, truePositives + falseNegatives);
    const f1Score = 2 * (precision * recall) / Math.max(0.001, precision + recall);
    const accuracy = (truePositives + trueNegatives) / n;

    return {
      assessmentRate: {
        mape: Math.round(assessmentMape * 100) / 100,
        rmse: Math.round(assessmentRmse * 100) / 100,
        correlation: Math.round(assessmentCorr * 1000) / 1000,
        withinRange: this.calculateWithinRange(details, 'assessment'),
      },
      competitorCount: {
        mape: Math.round(competitorMape * 100) / 100,
        rmse: Math.round(competitorRmse * 100) / 100,
        correlation: Math.round(competitorCorr * 1000) / 1000,
        withinRange: this.calculateWithinRange(details, 'competitor'),
      },
      winningPrice: {
        mape: Math.round(priceMape * 100) / 100,
        rmse: Math.round(priceRmse * 100) / 100,
        avgDeviation: Math.round(this.mean(priceErrors) * 10000) / 100,
      },
      recommendation: {
        accuracy: Math.round(accuracy * 1000) / 1000,
        precision: Math.round(precision * 1000) / 1000,
        recall: Math.round(recall * 1000) / 1000,
        f1Score: Math.round(f1Score * 1000) / 1000,
      },
    };
  }

  /**
   * 수익성 분석
   */
  private calculateProfitability(
    details: BacktestDetailResult[],
    config: BacktestConfig
  ): BacktestResult['profitability'] {
    const participated = details.filter(d =>
      d.simulation && (
        !config.followRecommendation ||
        d.predicted.recommendation !== 'SKIP'
      )
    );

    const wins = participated.filter(d => d.simulation?.wouldHaveWon);
    const totalRevenue = wins.reduce((sum, d) => sum + (d.simulation?.profit || 0), 0);

    return {
      totalBidsParticipated: participated.length,
      winsCount: wins.length,
      winRate: Math.round((wins.length / Math.max(1, participated.length)) * 1000) / 1000,
      totalRevenue: Math.round(totalRevenue),
      avgMargin: wins.length > 0
        ? Math.round((totalRevenue / wins.length) * 100) / 100
        : 0,
      roi: participated.length > 0
        ? Math.round((totalRevenue / participated.length) * 100) / 100
        : 0,
    };
  }

  /**
   * 세부 분석 (기관/카테고리/가격대/월별)
   */
  private calculateBreakdown(
    details: BacktestDetailResult[],
    bids: HistoricalBid[]
  ): BacktestResult['breakdown'] {
    const byOrganization: Record<string, BreakdownStats> = {};
    const byCategory: Record<string, BreakdownStats> = {};
    const byPriceRange: Record<string, BreakdownStats> = {};
    const byMonth: Record<string, BreakdownStats> = {};

    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      const bid = bids[i];

      // 기관별
      const org = detail.organization;
      if (!byOrganization[org]) {
        byOrganization[org] = this.initBreakdownStats();
      }
      this.updateBreakdownStats(byOrganization[org], detail);

      // 카테고리별
      const category = bid.category || 'other';
      if (!byCategory[category]) {
        byCategory[category] = this.initBreakdownStats();
      }
      this.updateBreakdownStats(byCategory[category], detail);

      // 가격대별
      const priceRange = this.getPriceRangeLabel(bid.estimatedPrice);
      if (!byPriceRange[priceRange]) {
        byPriceRange[priceRange] = this.initBreakdownStats();
      }
      this.updateBreakdownStats(byPriceRange[priceRange], detail);

      // 월별
      const month = bid.deadline.substring(0, 7); // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = this.initBreakdownStats();
      }
      this.updateBreakdownStats(byMonth[month], detail);
    }

    // 평균 계산
    this.finalizeBreakdownStats(byOrganization);
    this.finalizeBreakdownStats(byCategory);
    this.finalizeBreakdownStats(byPriceRange);
    this.finalizeBreakdownStats(byMonth);

    return { byOrganization, byCategory, byPriceRange, byMonth };
  }

  /**
   * 인사이트 생성
   */
  private generateInsights(
    accuracy: BacktestResult['accuracy'],
    breakdown: BacktestResult['breakdown'],
    profitability?: BacktestResult['profitability']
  ): string[] {
    const insights: string[] = [];

    // 사정률 예측 정확도
    if (accuracy.assessmentRate.mape < 0.5) {
      insights.push(`✅ 사정률 예측 정확도 우수 (MAPE ${accuracy.assessmentRate.mape}%)`);
    } else if (accuracy.assessmentRate.mape < 1.0) {
      insights.push(`⚠️ 사정률 예측 정확도 보통 (MAPE ${accuracy.assessmentRate.mape}%)`);
    } else {
      insights.push(`❌ 사정률 예측 정확도 개선 필요 (MAPE ${accuracy.assessmentRate.mape}%)`);
    }

    // 경쟁률 예측 정확도
    if (accuracy.competitorCount.mape < 20) {
      insights.push(`✅ 경쟁률 예측 정확도 우수 (MAPE ${accuracy.competitorCount.mape}%)`);
    } else if (accuracy.competitorCount.mape < 40) {
      insights.push(`⚠️ 경쟁률 예측 정확도 보통 (MAPE ${accuracy.competitorCount.mape}%)`);
    } else {
      insights.push(`❌ 경쟁률 예측 개선 필요 (MAPE ${accuracy.competitorCount.mape}%)`);
    }

    // 추천 정확도
    if (accuracy.recommendation.f1Score >= 0.7) {
      insights.push(`✅ 입찰 추천 정확도 우수 (F1 ${accuracy.recommendation.f1Score})`);
    } else if (accuracy.recommendation.f1Score >= 0.5) {
      insights.push(`⚠️ 입찰 추천 정확도 보통 (F1 ${accuracy.recommendation.f1Score})`);
    } else {
      insights.push(`❌ 입찰 추천 알고리즘 개선 필요 (F1 ${accuracy.recommendation.f1Score})`);
    }

    // 기관별 분석
    const orgEntries = Object.entries(breakdown.byOrganization);
    const bestOrg = orgEntries.reduce((best, [org, stats]) =>
      stats.winRate > (best[1]?.winRate || 0) ? [org, stats] : best, ['', null as any]);
    const worstOrg = orgEntries.reduce((worst, [org, stats]) =>
      stats.assessmentMape > (worst[1]?.assessmentMape || 0) ? [org, stats] : worst, ['', null as any]);

    if (bestOrg[1]) {
      insights.push(`🏆 최고 낙찰률 기관: ${bestOrg[0]} (${(bestOrg[1].winRate * 100).toFixed(1)}%)`);
    }
    if (worstOrg[1] && worstOrg[1].assessmentMape > 1) {
      insights.push(`⚠️ 예측 개선 필요 기관: ${worstOrg[0]} (사정률 MAPE ${worstOrg[1].assessmentMape.toFixed(1)}%)`);
    }

    // 수익성
    if (profitability) {
      if (profitability.winRate >= 0.2) {
        insights.push(`💰 높은 낙찰률 달성 가능 (${(profitability.winRate * 100).toFixed(1)}%)`);
      }
      if (profitability.roi > 0) {
        insights.push(`📈 예상 입찰당 수익: ${profitability.roi.toLocaleString()}원`);
      }
    }

    return insights;
  }

  /**
   * 파라미터 최적화 제안
   */
  private suggestParameters(details: BacktestDetailResult[]): ParameterSuggestion[] {
    const suggestions: ParameterSuggestion[] = [];

    // 사정률 편향 분석
    const assessmentBias = this.mean(details.map(d =>
      d.predicted.assessmentRate - d.actual.assessmentRate
    ));

    if (Math.abs(assessmentBias) > 0.001) {
      suggestions.push({
        parameter: 'assessmentRateBias',
        currentValue: 0,
        suggestedValue: -assessmentBias,
        expectedImprovement: `사정률 예측 편향 ${(assessmentBias * 100).toFixed(2)}% 보정`,
      });
    }

    // 경쟁률 편향 분석
    const competitorBias = this.mean(details.map(d =>
      d.predicted.competitorCount - d.actual.competitorCount
    ));

    if (Math.abs(competitorBias) > 1) {
      suggestions.push({
        parameter: 'competitorCountBias',
        currentValue: 0,
        suggestedValue: -competitorBias,
        expectedImprovement: `경쟁률 예측 편향 ${competitorBias.toFixed(1)}개사 보정`,
      });
    }

    // 가격 전략 분석
    const priceGap = this.mean(details.map(d =>
      d.predicted.optimalBidPrice - d.actual.winningPrice
    ));

    if (priceGap > 0) {
      suggestions.push({
        parameter: 'bidPriceAdjustment',
        currentValue: 0,
        suggestedValue: -priceGap,
        expectedImprovement: `투찰가 ${Math.abs(priceGap).toLocaleString()}원 하향 조정으로 낙찰률 개선`,
      });
    }

    return suggestions;
  }

  // ============================================================
  // 유틸리티 함수
  // ============================================================

  private filterBids(config: BacktestConfig): HistoricalBid[] {
    return this.historicalBids.filter(bid => {
      // 날짜 범위
      if (config.dateRange) {
        const deadline = new Date(bid.deadline);
        if (deadline < config.dateRange.start || deadline > config.dateRange.end) {
          return false;
        }
      }

      // 기관
      if (config.organizations && config.organizations.length > 0) {
        if (!config.organizations.some(org => bid.organization.includes(org))) {
          return false;
        }
      }

      // 카테고리
      if (config.categories && config.categories.length > 0) {
        if (!bid.category || !config.categories.includes(bid.category)) {
          return false;
        }
      }

      // 가격 범위
      if (config.minPrice && bid.estimatedPrice < config.minPrice) return false;
      if (config.maxPrice && bid.estimatedPrice > config.maxPrice) return false;

      return true;
    });
  }

  private estimateRank(ourBidPrice: number, bid: HistoricalBid): number {
    // 간단한 순위 추정 (우리 가격이 낙찰가보다 높으면 순위 낮음)
    if (ourBidPrice <= bid.actualResult.winningPrice) {
      return 1;
    }
    const priceDiff = (ourBidPrice - bid.actualResult.winningPrice) / bid.actualResult.winningPrice;
    return Math.min(bid.actualResult.competitorCount, Math.ceil(priceDiff * 10) + 1);
  }

  private calculateWithinRange(details: BacktestDetailResult[], type: 'assessment' | 'competitor'): number {
    // 예측값이 ±20% 범위 내인 비율
    const threshold = type === 'assessment' ? 0.01 : 0.3;
    const withinRange = details.filter(d =>
      type === 'assessment'
        ? d.errors.assessmentRateError < threshold
        : d.errors.competitorCountError < threshold
    ).length;
    return Math.round((withinRange / details.length) * 1000) / 1000;
  }

  private initBreakdownStats(): BreakdownStats & { _sum: { mape1: number; mape2: number; wins: number } } {
    return {
      count: 0,
      assessmentMape: 0,
      competitorMape: 0,
      winRate: 0,
      avgProfit: 0,
      _sum: { mape1: 0, mape2: 0, wins: 0 },
    };
  }

  private updateBreakdownStats(
    stats: BreakdownStats & { _sum?: { mape1: number; mape2: number; wins: number } },
    detail: BacktestDetailResult
  ): void {
    stats.count++;
    if (stats._sum) {
      stats._sum.mape1 += detail.errors.assessmentRateError;
      stats._sum.mape2 += detail.errors.competitorCountError;
      if (detail.actual.didWeWin) stats._sum.wins++;
    }
  }

  private finalizeBreakdownStats(breakdown: Record<string, BreakdownStats>): void {
    for (const stats of Object.values(breakdown)) {
      const s = stats as BreakdownStats & { _sum?: { mape1: number; mape2: number; wins: number } };
      if (s._sum && s.count > 0) {
        s.assessmentMape = Math.round((s._sum.mape1 / s.count) * 10000) / 100;
        s.competitorMape = Math.round((s._sum.mape2 / s.count) * 10000) / 100;
        s.winRate = Math.round((s._sum.wins / s.count) * 1000) / 1000;
        delete s._sum;
      }
    }
  }

  private getPriceRangeLabel(price: number): string {
    if (price < 50000000) return 'under_50m';
    if (price < 100000000) return '50m_100m';
    if (price < 500000000) return '100m_500m';
    if (price < 1000000000) return '500m_1b';
    if (price < 5000000000) return '1b_5b';
    return 'over_5b';
  }

  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private correlation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const meanX = this.mean(x);
    const meanY = this.mean(y);

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : num / den;
  }
}

// ============================================================
// 리포트 생성기
// ============================================================

export class BacktestReporter {
  /**
   * 콘솔 리포트 출력
   */
  public static printReport(result: BacktestResult): void {
    console.log('\n' + '='.repeat(70));
    console.log('Qetta v2.1 백테스트 리포트');
    console.log('='.repeat(70));

    console.log(`\n분석 기간: ${result.dateRange.start} ~ ${result.dateRange.end}`);
    console.log(`분석 건수: ${result.analyzedBids} / ${result.totalBids}`);
    console.log(`전략: ${result.config.strategy}`);

    console.log('\n' + '-'.repeat(70));
    console.log('[예측 정확도]');
    console.log('-'.repeat(70));

    console.log('\n사정률 예측:');
    console.log(`  MAPE: ${result.accuracy.assessmentRate.mape}%`);
    console.log(`  RMSE: ${result.accuracy.assessmentRate.rmse}%`);
    console.log(`  상관계수: ${result.accuracy.assessmentRate.correlation}`);
    console.log(`  범위 내 비율: ${(result.accuracy.assessmentRate.withinRange * 100).toFixed(1)}%`);

    console.log('\n경쟁률 예측:');
    console.log(`  MAPE: ${result.accuracy.competitorCount.mape}%`);
    console.log(`  RMSE: ${result.accuracy.competitorCount.rmse}%`);
    console.log(`  상관계수: ${result.accuracy.competitorCount.correlation}`);
    console.log(`  범위 내 비율: ${(result.accuracy.competitorCount.withinRange * 100).toFixed(1)}%`);

    console.log('\n낙찰가 예측:');
    console.log(`  MAPE: ${result.accuracy.winningPrice.mape}%`);
    console.log(`  평균 편차: ${result.accuracy.winningPrice.avgDeviation}%`);

    console.log('\n추천 정확도:');
    console.log(`  정확도: ${(result.accuracy.recommendation.accuracy * 100).toFixed(1)}%`);
    console.log(`  정밀도: ${(result.accuracy.recommendation.precision * 100).toFixed(1)}%`);
    console.log(`  재현율: ${(result.accuracy.recommendation.recall * 100).toFixed(1)}%`);
    console.log(`  F1 Score: ${result.accuracy.recommendation.f1Score}`);

    if (result.profitability) {
      console.log('\n' + '-'.repeat(70));
      console.log('[수익성 시뮬레이션]');
      console.log('-'.repeat(70));
      console.log(`  참여 입찰: ${result.profitability.totalBidsParticipated}건`);
      console.log(`  낙찰: ${result.profitability.winsCount}건 (${(result.profitability.winRate * 100).toFixed(1)}%)`);
      console.log(`  총 수익: ${result.profitability.totalRevenue.toLocaleString()}원`);
      console.log(`  평균 마진: ${result.profitability.avgMargin.toLocaleString()}원`);
      console.log(`  입찰당 ROI: ${result.profitability.roi.toLocaleString()}원`);
    }

    console.log('\n' + '-'.repeat(70));
    console.log('[기관별 분석]');
    console.log('-'.repeat(70));
    Object.entries(result.breakdown.byOrganization)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .forEach(([org, stats]) => {
        console.log(`  ${org}: ${stats.count}건, 낙찰률 ${(stats.winRate * 100).toFixed(1)}%, MAPE ${stats.assessmentMape}%`);
      });

    console.log('\n' + '-'.repeat(70));
    console.log('[인사이트]');
    console.log('-'.repeat(70));
    result.insights.forEach(insight => console.log(`  ${insight}`));

    if (result.parameterSuggestions && result.parameterSuggestions.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('[파라미터 최적화 제안]');
      console.log('-'.repeat(70));
      result.parameterSuggestions.forEach(s => {
        console.log(`  ${s.parameter}: ${s.currentValue} → ${s.suggestedValue.toFixed(4)}`);
        console.log(`    효과: ${s.expectedImprovement}`);
      });
    }

    console.log('\n' + '='.repeat(70));
  }

  /**
   * JSON 리포트 생성
   */
  public static toJSON(result: BacktestResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * 마크다운 리포트 생성
   */
  public static toMarkdown(result: BacktestResult): string {
    let md = '# Qetta v2.1 백테스트 리포트\n\n';

    md += '## 개요\n\n';
    md += `| 항목 | 값 |\n|------|------|\n`;
    md += `| 분석 기간 | ${result.dateRange.start} ~ ${result.dateRange.end} |\n`;
    md += `| 분석 건수 | ${result.analyzedBids} / ${result.totalBids} |\n`;
    md += `| 전략 | ${result.config.strategy} |\n\n`;

    md += '## 예측 정확도\n\n';
    md += '### 사정률 예측\n';
    md += `- MAPE: ${result.accuracy.assessmentRate.mape}%\n`;
    md += `- 상관계수: ${result.accuracy.assessmentRate.correlation}\n\n`;

    md += '### 경쟁률 예측\n';
    md += `- MAPE: ${result.accuracy.competitorCount.mape}%\n`;
    md += `- 상관계수: ${result.accuracy.competitorCount.correlation}\n\n`;

    md += '### 추천 정확도\n';
    md += `- F1 Score: ${result.accuracy.recommendation.f1Score}\n\n`;

    md += '## 인사이트\n\n';
    result.insights.forEach(insight => {
      md += `- ${insight}\n`;
    });

    return md;
  }
}

// ============================================================
// 싱글톤 인스턴스
// ============================================================

let engineInstance: BacktestEngine | null = null;

export function getBacktestEngine(): BacktestEngine {
  if (!engineInstance) {
    engineInstance = new BacktestEngine();
  }
  return engineInstance;
}
