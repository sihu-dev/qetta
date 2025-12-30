/**
 * BIDFLOW 백테스트 프레임워크 v3.0
 *
 * 현실적인 낙찰 시뮬레이션:
 * 1. 사정률 기반 예정가격 결정
 * 2. 경쟁자 시뮬레이션 (분포 기반)
 * 3. 적격심사 + 가격순위 복합 판정
 * 4. F1 Score 개선을 위한 추천 로직 검증
 */

import { generateBidPredictionV3, type BidStrategyV3 } from './bidding-engine-v3.js';
import type { BidType, ContractType, CreditRating } from './bidding-engine.js';
import { getLowerLimitRate, erf } from './bidding-engine.js';

// ============================================================
// 타입 정의
// ============================================================

export interface HistoricalBidV3 {
  id: string;
  title: string;
  organization: string;
  estimatedPrice: number;
  basePrice?: number;
  bidType: BidType;
  contractType: ContractType;
  deadline: string;

  // 실제 결과
  actualResult: {
    winningPrice: number;
    winningRate: number;
    assessmentRate: number;
    competitorCount: number;
    winnerQualificationScore?: number;
    didWeWin?: boolean;
    ourBidPrice?: number;
    ourRank?: number;
  };

  // 회사 스냅샷
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

  category?: string;
  isUrgent?: boolean;
}

export interface BacktestConfigV3 {
  tenantId: string;
  productId: string;
  strategy: 'aggressive' | 'balanced' | 'conservative' | 'optimal';

  // 필터
  dateRange?: { start: Date; end: Date };
  organizations?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;

  // 시뮬레이션
  simulateBidding: boolean;
  followRecommendation: boolean;
  useActualAssessmentRate: boolean;  // 실제 사정률 사용 (더 정확한 백테스트)

  // 분석
  calculateOptimalParams: boolean;
}

export interface BacktestResultV3 {
  config: BacktestConfigV3;
  totalBids: number;
  analyzedBids: number;
  dateRange: { start: string; end: string };

  accuracy: AccuracyMetricsV3;
  profitability?: ProfitabilityV3;
  breakdown: BreakdownV3;
  details: BacktestDetailV3[];

  insights: string[];
  parameterSuggestions?: ParameterSuggestion[];
}

export interface AccuracyMetricsV3 {
  assessmentRate: { mape: number; rmse: number; correlation: number; withinRange: number };
  competitorCount: { mape: number; rmse: number; correlation: number; withinRange: number };
  winningPrice: { mape: number; rmse: number; avgDeviation: number };
  recommendation: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: { tp: number; fp: number; fn: number; tn: number };
  };
}

export interface ProfitabilityV3 {
  totalBidsParticipated: number;
  winsCount: number;
  winRate: number;
  totalRevenue: number;
  avgMargin: number;
  roi: number;
}

export interface BreakdownV3 {
  byOrganization: Record<string, BreakdownStatsV3>;
  byCategory: Record<string, BreakdownStatsV3>;
  byPriceRange: Record<string, BreakdownStatsV3>;
}

export interface BreakdownStatsV3 {
  count: number;
  assessmentMape: number;
  competitorMape: number;
  winRate: number;
  avgProfit: number;
  f1Score: number;
}

export interface BacktestDetailV3 {
  bidId: string;
  bidTitle: string;
  organization: string;

  predicted: {
    budgetPrice: number;
    assessmentRate: number;
    competitorCount: number;
    optimalBidPrice: number;
    optimalBidRate: number;
    winProbability: number;
    qualificationScore: number;
    recommendation: string;
    recommendationConfidence: number;
  };

  actual: {
    budgetPrice: number;          // 실제 예정가격 = 추정가격 × 사정률
    assessmentRate: number;
    competitorCount: number;
    winningPrice: number;
    didWeWin: boolean;
    ourRank?: number;
  };

  errors: {
    assessmentRateError: number;
    competitorCountError: number;
    priceError: number;
  };

  simulation: {
    participatedBid: boolean;
    ourBidPrice: number;
    simulatedRank: number;
    wouldHaveWon: boolean;
    winReason?: string;
    profit: number;
  };

  // 추천 정확도 분석
  recommendationAnalysis: {
    predictedAction: string;
    actualOutcome: 'WIN' | 'LOSS' | 'NOT_PARTICIPATED';
    isCorrect: boolean;
    category: 'TP' | 'FP' | 'FN' | 'TN';
  };
}

export interface ParameterSuggestion {
  parameter: string;
  currentValue: number;
  suggestedValue: number;
  expectedImprovement: string;
}

// ============================================================
// 백테스트 엔진 v3
// ============================================================

export class BacktestEngineV3 {
  private historicalBids: HistoricalBidV3[] = [];

  public loadData(bids: HistoricalBidV3[]): void {
    this.historicalBids = bids;
    console.log(`Loaded ${bids.length} historical bids for v3 backtest`);
  }

  public run(config: BacktestConfigV3): BacktestResultV3 {
    const startTime = Date.now();

    // 1. 필터링
    const filteredBids = this.filterBids(config);
    console.log(`Filtered to ${filteredBids.length} bids`);

    if (filteredBids.length === 0) {
      throw new Error('No bids match the filter criteria');
    }

    // 2. 각 입찰 분석
    const details: BacktestDetailV3[] = [];
    for (const bid of filteredBids) {
      const result = this.analyzeBid(bid, config);
      details.push(result);
    }

    // 3. 정확도 계산
    const accuracy = this.calculateAccuracy(details);

    // 4. 수익성 분석
    const profitability = config.simulateBidding
      ? this.calculateProfitability(details, config)
      : undefined;

    // 5. 세부 분석
    const breakdown = this.calculateBreakdown(details, filteredBids);

    // 6. 인사이트
    const insights = this.generateInsights(accuracy, breakdown, profitability);

    // 7. 파라미터 제안
    const parameterSuggestions = config.calculateOptimalParams
      ? this.suggestParameters(details)
      : undefined;

    const dateRange = {
      start: filteredBids.reduce((min, b) => b.deadline < min ? b.deadline : min, filteredBids[0].deadline),
      end: filteredBids.reduce((max, b) => b.deadline > max ? b.deadline : max, filteredBids[0].deadline),
    };

    console.log(`Backtest v3 completed in ${Date.now() - startTime}ms`);

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

  private analyzeBid(bid: HistoricalBidV3, config: BacktestConfigV3): BacktestDetailV3 {
    // v3 엔진으로 예측
    const prediction = generateBidPredictionV3({
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
      deliveryRecords: bid.companySnapshot.deliveryRecords.map(r => ({
        organization: r.organization || '',
        productName: r.productName || '',
        amount: r.amount,
        completedAt: r.completedAt,
        category: r.category,
        keywords: r.keywords,
      })),
      certifications: bid.companySnapshot.certifications,
      techStaffCount: bid.companySnapshot.techStaffCount,
      strategy: config.strategy,
      isUrgent: bid.isUrgent,
      category: bid.category,
    });

    // 실제 예정가격 계산
    const actualBudgetPrice = bid.estimatedPrice * bid.actualResult.assessmentRate;

    // 오차 계산
    const errors = {
      assessmentRateError: Math.abs(prediction.assessmentAnalysis.rate - bid.actualResult.assessmentRate) / bid.actualResult.assessmentRate,
      competitorCountError: Math.abs(prediction.competitionAnalysis.expectedCompetitors - bid.actualResult.competitorCount) / Math.max(1, bid.actualResult.competitorCount),
      priceError: Math.abs(prediction.optimalBidPrice - bid.actualResult.winningPrice) / bid.actualResult.winningPrice,
    };

    // 시뮬레이션
    const simulation = this.simulateBidOutcome(
      bid, prediction, config, actualBudgetPrice
    );

    // 추천 분석
    const recommendationAnalysis = this.analyzeRecommendation(
      prediction.recommendation.action,
      simulation.wouldHaveWon,
      simulation.participatedBid
    );

    return {
      bidId: bid.id,
      bidTitle: bid.title,
      organization: bid.organization,

      predicted: {
        budgetPrice: prediction.winAnalysis.predictedBudgetPrice,
        assessmentRate: prediction.assessmentAnalysis.rate,
        competitorCount: prediction.competitionAnalysis.expectedCompetitors,
        optimalBidPrice: prediction.optimalBidPrice,
        optimalBidRate: prediction.optimalBidRate,
        winProbability: prediction.winProbability,
        qualificationScore: prediction.qualificationDetails.total,
        recommendation: prediction.recommendation.action,
        recommendationConfidence: prediction.recommendation.confidence,
      },

      actual: {
        budgetPrice: actualBudgetPrice,
        assessmentRate: bid.actualResult.assessmentRate,
        competitorCount: bid.actualResult.competitorCount,
        winningPrice: bid.actualResult.winningPrice,
        didWeWin: bid.actualResult.didWeWin || false,
        ourRank: bid.actualResult.ourRank,
      },

      errors,
      simulation,
      recommendationAnalysis,
    };
  }

  /**
   * 현실적인 낙찰 시뮬레이션
   */
  private simulateBidOutcome(
    bid: HistoricalBidV3,
    prediction: BidStrategyV3,
    config: BacktestConfigV3,
    actualBudgetPrice: number
  ): BacktestDetailV3['simulation'] {
    // 추천에 따라 참여 여부 결정
    const participatedBid = config.followRecommendation
      ? ['STRONG_BID', 'BID', 'CONDITIONAL_BID'].includes(prediction.recommendation.action)
      : true;

    // 참여 여부와 관계없이 항상 시뮬레이션 (FN/TN 판단을 위해)

    // 사정률 기반 투찰가 결정
    const effectiveAssessmentRate = config.useActualAssessmentRate
      ? bid.actualResult.assessmentRate
      : prediction.assessmentAnalysis.rate;

    const effectiveBudgetPrice = bid.estimatedPrice * effectiveAssessmentRate;

    // 우리 투찰가 = 예정가격 × 투찰률
    const ourBidPrice = Math.round(effectiveBudgetPrice * prediction.optimalBidRate);

    // 낙찰하한가
    const lowerLimitRate = getLowerLimitRate(bid.bidType, bid.contractType, bid.estimatedPrice);
    const floorPrice = actualBudgetPrice * lowerLimitRate;

    // 1. 낙찰하한가 미만 체크
    if (ourBidPrice < floorPrice) {
      return {
        participatedBid,
        ourBidPrice,
        simulatedRank: 0,
        wouldHaveWon: false,
        winReason: participatedBid ? 'BELOW_FLOOR_PRICE' : 'NOT_PARTICIPATED',
        profit: 0,
      };
    }

    // 2. 적격심사 통과 체크
    if (prediction.qualificationDetails.total < 85) {
      return {
        participatedBid,
        ourBidPrice,
        simulatedRank: 0,
        wouldHaveWon: false,
        winReason: participatedBid ? 'QUALIFICATION_FAILED' : 'NOT_PARTICIPATED',
        profit: 0,
      };
    }

    // 3. 경쟁자 시뮬레이션 (실제 낙찰 데이터 기반)
    const competitorMean = 0.855;
    const competitorStd = 0.015;
    const ourBidRate = ourBidPrice / actualBudgetPrice;

    const zScore = (ourBidRate - competitorMean) / competitorStd;
    const probLowerPrice = 0.5 * (1 + erf(zScore / Math.sqrt(2)));

    const qualPassRate = 0.7;
    const effectiveCompetitors = Math.round(bid.actualResult.competitorCount * qualPassRate);
    const expectedLowerCompetitors = Math.round(effectiveCompetitors * probLowerPrice);
    const simulatedRank = expectedLowerCompetitors + 1;

    // 4. 낙찰 여부 결정 (참여 여부와 관계없이 "만약 참여했다면" 시뮬레이션)
    const wouldHaveWon = ourBidPrice <= bid.actualResult.winningPrice &&
                         prediction.qualificationDetails.total >= 85 &&
                         ourBidPrice >= floorPrice;

    // 수익 계산 (실제 참여 + 낙찰 시에만)
    const profit = (participatedBid && wouldHaveWon) ? ourBidPrice * 0.12 : 0;

    let winReason: string;
    if (!participatedBid) {
      winReason = 'NOT_PARTICIPATED';
    } else if (wouldHaveWon) {
      winReason = 'WIN';
    } else if (simulatedRank > 1) {
      winReason = 'HIGHER_PRICE';
    } else {
      winReason = 'UNKNOWN';
    }

    return {
      participatedBid,
      ourBidPrice,
      simulatedRank,
      wouldHaveWon,
      winReason,
      profit,
    };
  }

  /**
   * 추천 정확도 분석
   */
  private analyzeRecommendation(
    predictedAction: string,
    wouldHaveWon: boolean,
    participatedBid: boolean
  ): BacktestDetailV3['recommendationAnalysis'] {
    // BID 추천 = STRONG_BID, BID, CONDITIONAL_BID
    const recommendedBid = ['STRONG_BID', 'BID', 'CONDITIONAL_BID'].includes(predictedAction);

    let category: 'TP' | 'FP' | 'FN' | 'TN';
    let actualOutcome: 'WIN' | 'LOSS' | 'NOT_PARTICIPATED';

    // 핵심 판단 기준: wouldHaveWon (만약 참여했다면 낙찰했을까?)
    // - 참여 여부와 관계없이, 시뮬레이션 결과로 TP/FP/FN/TN 분류
    if (wouldHaveWon) {
      // 낙찰 가능한 입찰이었음
      actualOutcome = participatedBid ? 'WIN' : 'NOT_PARTICIPATED';
      category = recommendedBid ? 'TP' : 'FN';  // BID 추천했으면 TP, 안했으면 FN
    } else {
      // 낙찰 불가능한 입찰이었음
      actualOutcome = participatedBid ? 'LOSS' : 'NOT_PARTICIPATED';
      category = recommendedBid ? 'FP' : 'TN';  // BID 추천했으면 FP, 안했으면 TN
    }

    const isCorrect = category === 'TP' || category === 'TN';

    return {
      predictedAction,
      actualOutcome,
      isCorrect,
      category,
    };
  }

  /**
   * 정확도 계산
   */
  private calculateAccuracy(details: BacktestDetailV3[]): AccuracyMetricsV3 {
    const n = details.length;

    // 사정률
    const assessmentErrors = details.map(d => d.errors.assessmentRateError);
    const assessmentMape = this.mean(assessmentErrors) * 100;
    const assessmentRmse = Math.sqrt(this.mean(assessmentErrors.map(e => e * e))) * 100;
    const assessmentCorr = this.correlation(
      details.map(d => d.predicted.assessmentRate),
      details.map(d => d.actual.assessmentRate)
    );

    // 경쟁률
    const competitorErrors = details.map(d => d.errors.competitorCountError);
    const competitorMape = this.mean(competitorErrors) * 100;
    const competitorRmse = Math.sqrt(this.mean(competitorErrors.map(e => e * e))) * 100;
    const competitorCorr = this.correlation(
      details.map(d => d.predicted.competitorCount),
      details.map(d => d.actual.competitorCount)
    );

    // 낙찰가
    const priceErrors = details.map(d => d.errors.priceError);
    const priceMape = this.mean(priceErrors) * 100;
    const priceRmse = Math.sqrt(this.mean(priceErrors.map(e => e * e))) * 100;

    // 추천 정확도 (Confusion Matrix)
    const tp = details.filter(d => d.recommendationAnalysis.category === 'TP').length;
    const fp = details.filter(d => d.recommendationAnalysis.category === 'FP').length;
    const fn = details.filter(d => d.recommendationAnalysis.category === 'FN').length;
    const tn = details.filter(d => d.recommendationAnalysis.category === 'TN').length;

    const precision = tp / Math.max(1, tp + fp);
    const recall = tp / Math.max(1, tp + fn);
    const f1Score = 2 * (precision * recall) / Math.max(0.001, precision + recall);
    const accuracy = (tp + tn) / n;

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
        confusionMatrix: { tp, fp, fn, tn },
      },
    };
  }

  /**
   * 수익성 분석
   */
  private calculateProfitability(
    details: BacktestDetailV3[],
    _config: BacktestConfigV3
  ): ProfitabilityV3 {
    const participated = details.filter(d => d.simulation.participatedBid);
    const wins = participated.filter(d => d.simulation.wouldHaveWon);
    const totalRevenue = wins.reduce((sum, d) => sum + d.simulation.profit, 0);

    return {
      totalBidsParticipated: participated.length,
      winsCount: wins.length,
      winRate: Math.round((wins.length / Math.max(1, participated.length)) * 1000) / 1000,
      totalRevenue: Math.round(totalRevenue),
      avgMargin: wins.length > 0 ? Math.round(totalRevenue / wins.length) : 0,
      roi: participated.length > 0 ? Math.round(totalRevenue / participated.length) : 0,
    };
  }

  /**
   * 세부 분석
   */
  private calculateBreakdown(
    details: BacktestDetailV3[],
    bids: HistoricalBidV3[]
  ): BreakdownV3 {
    const byOrganization: Record<string, BreakdownStatsV3 & { _sum: any }> = {};
    const byCategory: Record<string, BreakdownStatsV3 & { _sum: any }> = {};
    const byPriceRange: Record<string, BreakdownStatsV3 & { _sum: any }> = {};

    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      const bid = bids[i];

      // 기관별
      const org = detail.organization;
      if (!byOrganization[org]) {
        byOrganization[org] = this.initStats();
      }
      this.updateStats(byOrganization[org], detail);

      // 카테고리별
      const category = bid.category || 'other';
      if (!byCategory[category]) {
        byCategory[category] = this.initStats();
      }
      this.updateStats(byCategory[category], detail);

      // 가격대별
      const priceRange = this.getPriceRangeLabel(bid.estimatedPrice);
      if (!byPriceRange[priceRange]) {
        byPriceRange[priceRange] = this.initStats();
      }
      this.updateStats(byPriceRange[priceRange], detail);
    }

    this.finalizeStats(byOrganization);
    this.finalizeStats(byCategory);
    this.finalizeStats(byPriceRange);

    return {
      byOrganization: byOrganization as Record<string, BreakdownStatsV3>,
      byCategory: byCategory as Record<string, BreakdownStatsV3>,
      byPriceRange: byPriceRange as Record<string, BreakdownStatsV3>,
    };
  }

  /**
   * 인사이트 생성
   */
  private generateInsights(
    accuracy: AccuracyMetricsV3,
    breakdown: BreakdownV3,
    profitability?: ProfitabilityV3
  ): string[] {
    const insights: string[] = [];

    // 사정률
    if (accuracy.assessmentRate.mape < 0.5) {
      insights.push(`✅ 사정률 예측 우수 (MAPE ${accuracy.assessmentRate.mape}%)`);
    } else if (accuracy.assessmentRate.mape < 1.0) {
      insights.push(`⚠️ 사정률 예측 보통 (MAPE ${accuracy.assessmentRate.mape}%)`);
    } else {
      insights.push(`❌ 사정률 예측 개선 필요 (MAPE ${accuracy.assessmentRate.mape}%)`);
    }

    // 경쟁률
    if (accuracy.competitorCount.mape < 20) {
      insights.push(`✅ 경쟁률 예측 우수 (MAPE ${accuracy.competitorCount.mape}%)`);
    } else if (accuracy.competitorCount.mape < 40) {
      insights.push(`⚠️ 경쟁률 예측 보통 (MAPE ${accuracy.competitorCount.mape}%)`);
    } else {
      insights.push(`❌ 경쟁률 예측 개선 필요 (MAPE ${accuracy.competitorCount.mape}%)`);
    }

    // 추천 F1
    if (accuracy.recommendation.f1Score >= 0.6) {
      insights.push(`✅ 추천 알고리즘 우수 (F1 ${accuracy.recommendation.f1Score.toFixed(2)})`);
    } else if (accuracy.recommendation.f1Score >= 0.3) {
      insights.push(`⚠️ 추천 알고리즘 보통 (F1 ${accuracy.recommendation.f1Score.toFixed(2)})`);
    } else {
      insights.push(`❌ 추천 알고리즘 개선 필요 (F1 ${accuracy.recommendation.f1Score.toFixed(2)})`);
    }

    // Confusion Matrix 분석
    const { tp, fp, fn, tn } = accuracy.recommendation.confusionMatrix;
    insights.push(`📊 추천 분석: TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}`);

    // 수익성
    if (profitability) {
      if (profitability.winRate >= 0.3) {
        insights.push(`💰 높은 낙찰률 (${(profitability.winRate * 100).toFixed(1)}%)`);
      } else if (profitability.winRate >= 0.15) {
        insights.push(`📈 적정 낙찰률 (${(profitability.winRate * 100).toFixed(1)}%)`);
      }

      if (profitability.totalRevenue > 0) {
        insights.push(`💵 예상 수익: ${profitability.totalRevenue.toLocaleString()}원`);
      }
    }

    // 기관별 최고
    const orgEntries = Object.entries(breakdown.byOrganization);
    if (orgEntries.length > 0) {
      const bestOrg = orgEntries.reduce((best, [org, stats]) =>
        stats.winRate > (best[1]?.winRate || 0) ? [org, stats] : best, ['', null as any]);
      if (bestOrg[1] && bestOrg[1].winRate > 0) {
        insights.push(`🏆 최고 낙찰률 기관: ${bestOrg[0]} (${(bestOrg[1].winRate * 100).toFixed(1)}%)`);
      }
    }

    return insights;
  }

  /**
   * 파라미터 제안
   */
  private suggestParameters(details: BacktestDetailV3[]): ParameterSuggestion[] {
    const suggestions: ParameterSuggestion[] = [];

    // 사정률 편향
    const assessmentBias = this.mean(details.map(d =>
      d.predicted.assessmentRate - d.actual.assessmentRate
    ));
    if (Math.abs(assessmentBias) > 0.001) {
      suggestions.push({
        parameter: 'assessmentRateBias',
        currentValue: 0,
        suggestedValue: -assessmentBias,
        expectedImprovement: `사정률 편향 ${(assessmentBias * 100).toFixed(2)}% 보정`,
      });
    }

    // 경쟁률 편향
    const competitorBias = this.mean(details.map(d =>
      d.predicted.competitorCount - d.actual.competitorCount
    ));
    if (Math.abs(competitorBias) > 1) {
      suggestions.push({
        parameter: 'competitorCountBias',
        currentValue: 0,
        suggestedValue: -competitorBias,
        expectedImprovement: `경쟁률 편향 ${competitorBias.toFixed(1)}개사 보정`,
      });
    }

    // 투찰가 조정
    const participatedDetails = details.filter(d => d.simulation.participatedBid);
    if (participatedDetails.length > 0) {
      const priceGap = this.mean(participatedDetails.map(d =>
        d.simulation.ourBidPrice - d.actual.winningPrice
      ));
      if (priceGap > 0) {
        suggestions.push({
          parameter: 'bidPriceAdjustment',
          currentValue: 0,
          suggestedValue: -priceGap * 0.5,  // 50% 보정
          expectedImprovement: `투찰가 ${(priceGap / 2).toLocaleString()}원 하향으로 낙찰률 개선`,
        });
      }
    }

    return suggestions;
  }

  // ============================================================
  // 유틸리티
  // ============================================================

  private filterBids(config: BacktestConfigV3): HistoricalBidV3[] {
    return this.historicalBids.filter(bid => {
      if (config.dateRange) {
        const deadline = new Date(bid.deadline);
        if (deadline < config.dateRange.start || deadline > config.dateRange.end) return false;
      }
      if (config.organizations?.length) {
        if (!config.organizations.some(org => bid.organization.includes(org))) return false;
      }
      if (config.categories?.length) {
        if (!bid.category || !config.categories.includes(bid.category)) return false;
      }
      if (config.minPrice && bid.estimatedPrice < config.minPrice) return false;
      if (config.maxPrice && bid.estimatedPrice > config.maxPrice) return false;
      return true;
    });
  }

  private mean(values: number[]): number {
    return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
  }

  private correlation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const meanX = this.mean(x);
    const meanY = this.mean(y);

    let num = 0, denX = 0, denY = 0;
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

  private calculateWithinRange(details: BacktestDetailV3[], type: 'assessment' | 'competitor'): number {
    const threshold = type === 'assessment' ? 0.01 : 0.3;
    const withinRange = details.filter(d =>
      type === 'assessment' ? d.errors.assessmentRateError < threshold : d.errors.competitorCountError < threshold
    ).length;
    return Math.round((withinRange / details.length) * 1000) / 1000;
  }

  private initStats(): BreakdownStatsV3 & { _sum: any } {
    return {
      count: 0, assessmentMape: 0, competitorMape: 0, winRate: 0, avgProfit: 0, f1Score: 0,
      _sum: { mape1: 0, mape2: 0, wins: 0, profit: 0, tp: 0, fp: 0, fn: 0, tn: 0 },
    };
  }

  private updateStats(stats: BreakdownStatsV3 & { _sum: any }, detail: BacktestDetailV3): void {
    stats.count++;
    stats._sum.mape1 += detail.errors.assessmentRateError;
    stats._sum.mape2 += detail.errors.competitorCountError;
    if (detail.simulation.wouldHaveWon) {
      stats._sum.wins++;
      stats._sum.profit += detail.simulation.profit;
    }
    const cat = detail.recommendationAnalysis.category;
    if (cat === 'TP') stats._sum.tp++;
    else if (cat === 'FP') stats._sum.fp++;
    else if (cat === 'FN') stats._sum.fn++;
    else if (cat === 'TN') stats._sum.tn++;
  }

  private finalizeStats(breakdown: Record<string, BreakdownStatsV3 & { _sum?: any }>): void {
    for (const stats of Object.values(breakdown)) {
      if (stats._sum && stats.count > 0) {
        stats.assessmentMape = Math.round((stats._sum.mape1 / stats.count) * 10000) / 100;
        stats.competitorMape = Math.round((stats._sum.mape2 / stats.count) * 10000) / 100;
        stats.winRate = Math.round((stats._sum.wins / stats.count) * 1000) / 1000;
        stats.avgProfit = stats._sum.wins > 0 ? Math.round(stats._sum.profit / stats._sum.wins) : 0;

        const { tp, fp, fn } = stats._sum;
        const precision = tp / Math.max(1, tp + fp);
        const recall = tp / Math.max(1, tp + fn);
        stats.f1Score = 2 * (precision * recall) / Math.max(0.001, precision + recall);
        stats.f1Score = Math.round(stats.f1Score * 1000) / 1000;

        delete stats._sum;
      }
    }
  }

  private getPriceRangeLabel(price: number): string {
    if (price < 50000000) return 'under_50m';
    if (price < 100000000) return '50m_100m';
    if (price < 500000000) return '100m_500m';
    return 'over_500m';
  }
}

// ============================================================
// 리포터
// ============================================================

export class BacktestReporterV3 {
  public static printReport(result: BacktestResultV3): void {
    console.log('\n' + '='.repeat(70));
    console.log('BIDFLOW v3.0 백테스트 리포트 (현실화 버전)');
    console.log('='.repeat(70));

    console.log(`\n분석 기간: ${result.dateRange.start} ~ ${result.dateRange.end}`);
    console.log(`분석 건수: ${result.analyzedBids} / ${result.totalBids}`);
    console.log(`전략: ${result.config.strategy}`);
    console.log(`실제 사정률 사용: ${result.config.useActualAssessmentRate ? 'YES' : 'NO'}`);

    console.log('\n' + '-'.repeat(70));
    console.log('[예측 정확도]');
    console.log('-'.repeat(70));

    console.log('\n사정률 예측:');
    console.log(`  MAPE: ${result.accuracy.assessmentRate.mape}%`);
    console.log(`  상관계수: ${result.accuracy.assessmentRate.correlation}`);

    console.log('\n경쟁률 예측:');
    console.log(`  MAPE: ${result.accuracy.competitorCount.mape}%`);
    console.log(`  상관계수: ${result.accuracy.competitorCount.correlation}`);

    console.log('\n낙찰가 예측:');
    console.log(`  MAPE: ${result.accuracy.winningPrice.mape}%`);

    console.log('\n추천 정확도:');
    console.log(`  정확도: ${(result.accuracy.recommendation.accuracy * 100).toFixed(1)}%`);
    console.log(`  정밀도: ${(result.accuracy.recommendation.precision * 100).toFixed(1)}%`);
    console.log(`  재현율: ${(result.accuracy.recommendation.recall * 100).toFixed(1)}%`);
    console.log(`  F1 Score: ${result.accuracy.recommendation.f1Score.toFixed(3)}`);
    const cm = result.accuracy.recommendation.confusionMatrix;
    console.log(`  [Confusion Matrix] TP=${cm.tp}, FP=${cm.fp}, FN=${cm.fn}, TN=${cm.tn}`);

    if (result.profitability) {
      console.log('\n' + '-'.repeat(70));
      console.log('[수익성 시뮬레이션]');
      console.log('-'.repeat(70));
      console.log(`  참여 입찰: ${result.profitability.totalBidsParticipated}건`);
      console.log(`  낙찰: ${result.profitability.winsCount}건 (${(result.profitability.winRate * 100).toFixed(1)}%)`);
      console.log(`  총 수익: ${result.profitability.totalRevenue.toLocaleString()}원`);
      console.log(`  입찰당 ROI: ${result.profitability.roi.toLocaleString()}원`);
    }

    console.log('\n' + '-'.repeat(70));
    console.log('[인사이트]');
    console.log('-'.repeat(70));
    result.insights.forEach(i => console.log(`  ${i}`));

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
}

// ============================================================
// 싱글톤
// ============================================================

let engineInstance: BacktestEngineV3 | null = null;

export function getBacktestEngineV3(): BacktestEngineV3 {
  if (!engineInstance) {
    engineInstance = new BacktestEngineV3();
  }
  return engineInstance;
}
