/**
 * Qetta 투찰 최적화 엔진 v1.0
 *
 * 핵심 기능:
 * - 최적 투찰률 계산 (적격심사 통과 + 낙찰확률 균형)
 * - 기관별 학습 시스템
 * - 민감도 분석
 * - 시나리오 기반 전략 제안
 */

import type { BidInfo } from './bidding-engine.js';
import { erf } from './bidding-engine.js';
import type { EnhancedCompanyProfile } from './qualification-scorer.js';
import { EnhancedQualificationScorer } from './qualification-scorer.js';

// ============================================================
// 타입 정의
// ============================================================

export interface OptimizationRequest {
  bid: BidInfo;
  company: EnhancedCompanyProfile;
  predictedPrice: number;
  lowerLimitRate: number;
  bidRateMean: number;
  bidRateStdDev: number;
  expectedCompetitors: number;
  targetMinScore?: number;  // 최소 적격심사 점수 (기본 85)
}

export interface OptimizationResult {
  // 최적 투찰률
  optimalBidRate: number;
  optimalBidPrice: number;

  // 균형점 분석
  balancePoint: {
    qualificationScore: number;
    winProbability: number;
    expectedValue: number;  // 점수 × 확률
  };

  // 대안 전략
  alternatives: AlternativeStrategy[];

  // 민감도 분석
  sensitivity: SensitivityAnalysis;

  // 추천
  recommendation: 'STRONG_BID' | 'BID' | 'REVIEW' | 'SKIP';
  reasoning: string[];
}

export interface AlternativeStrategy {
  name: string;
  bidRate: number;
  bidPrice: number;
  qualificationScore: number;
  winProbability: number;
  expectedValue: number;
  tradeoff: string;
}

export interface SensitivityAnalysis {
  // 투찰률 1% 변화 시 영향
  rateImpact: {
    priceScoreChange: number;
    winProbChange: number;
  };

  // 임계점
  thresholds: {
    minPassRate: number;      // 적격심사 통과 최소 투찰률
    maxCompetitiveRate: number;  // 경쟁력 있는 최대 투찰률
    optimalRange: { min: number; max: number };
  };

  // 리스크 구간
  riskZones: RiskZone[];
}

export interface RiskZone {
  rateRange: { min: number; max: number };
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

// ============================================================
// 기관별 학습 데이터
// ============================================================

export interface OrgLearningData {
  organization: string;
  samples: number;
  avgAssessmentRate: number;
  assessmentRateStdDev: number;
  avgCompetitors: number;
  avgWinningRate: number;
  seasonalPattern: Record<number, number>;  // 월별 보정
  priceRangePattern: Record<string, number>;  // 가격대별 보정
  lastUpdated: Date;
}

// 기관별 학습 데이터 저장소 (싱글톤)
class OrgLearningStore {
  private static instance: OrgLearningStore;
  private data: Map<string, OrgLearningData> = new Map();

  private constructor() {
    // 기본 데이터 초기화
    this.initializeDefaultData();
  }

  public static getInstance(): OrgLearningStore {
    if (!OrgLearningStore.instance) {
      OrgLearningStore.instance = new OrgLearningStore();
    }
    return OrgLearningStore.instance;
  }

  private initializeDefaultData(): void {
    // 주요 기관 기본 데이터
    const defaultOrgs: OrgLearningData[] = [
      {
        organization: '서울특별시',
        samples: 50,
        avgAssessmentRate: 1.0008,
        assessmentRateStdDev: 0.003,
        avgCompetitors: 12,
        avgWinningRate: 0.855,
        seasonalPattern: { 1: 0.9, 2: 0.95, 3: 1.1, 6: 1.05, 9: 1.1, 12: 1.15 },
        priceRangePattern: { 'under50m': 1.0, '50m-100m': 0.98, '100m-500m': 0.97, 'over500m': 0.95 },
        lastUpdated: new Date(),
      },
      {
        organization: '한국수자원공사',
        samples: 35,
        avgAssessmentRate: 0.9995,
        assessmentRateStdDev: 0.0025,
        avgCompetitors: 10,
        avgWinningRate: 0.858,
        seasonalPattern: { 3: 1.1, 6: 1.05, 9: 1.1, 12: 1.2 },
        priceRangePattern: { 'under50m': 1.0, '50m-100m': 0.99, '100m-500m': 0.98, 'over500m': 0.96 },
        lastUpdated: new Date(),
      },
      {
        organization: '한국지역난방공사',
        samples: 25,
        avgAssessmentRate: 1.0003,
        assessmentRateStdDev: 0.002,
        avgCompetitors: 8,
        avgWinningRate: 0.862,
        seasonalPattern: { 3: 1.05, 9: 1.1, 10: 1.15 },
        priceRangePattern: { 'under50m': 1.0, '50m-100m': 0.99, '100m-500m': 0.98 },
        lastUpdated: new Date(),
      },
    ];

    for (const org of defaultOrgs) {
      this.data.set(org.organization, org);
    }
  }

  public get(organization: string): OrgLearningData | undefined {
    // 정확히 매칭
    if (this.data.has(organization)) {
      return this.data.get(organization);
    }

    // 부분 매칭
    for (const [key, value] of this.data.entries()) {
      if (organization.includes(key) || key.includes(organization)) {
        return value;
      }
    }

    return undefined;
  }

  public update(organization: string, newData: Partial<OrgLearningData>): void {
    const existing = this.get(organization);
    if (existing) {
      this.data.set(organization, { ...existing, ...newData, lastUpdated: new Date() });
    } else {
      this.data.set(organization, {
        organization,
        samples: 1,
        avgAssessmentRate: newData.avgAssessmentRate || 1.0,
        assessmentRateStdDev: newData.assessmentRateStdDev || 0.003,
        avgCompetitors: newData.avgCompetitors || 10,
        avgWinningRate: newData.avgWinningRate || 0.85,
        seasonalPattern: newData.seasonalPattern || {},
        priceRangePattern: newData.priceRangePattern || {},
        lastUpdated: new Date(),
      });
    }
  }

  public learnFromResult(
    organization: string,
    assessmentRate: number,
    competitorCount: number,
    winningRate: number,
    month: number,
    priceRange: string
  ): void {
    const existing = this.get(organization);
    if (existing) {
      // 이동 평균 업데이트
      const n = existing.samples;
      const newAvgAssessment = (existing.avgAssessmentRate * n + assessmentRate) / (n + 1);
      const newAvgCompetitors = (existing.avgCompetitors * n + competitorCount) / (n + 1);
      const newAvgWinningRate = (existing.avgWinningRate * n + winningRate) / (n + 1);

      // 계절 패턴 업데이트
      const seasonalPattern = { ...existing.seasonalPattern };
      seasonalPattern[month] = (seasonalPattern[month] || 1.0) * 0.9 + (assessmentRate / newAvgAssessment) * 0.1;

      // 가격대 패턴 업데이트
      const priceRangePattern = { ...existing.priceRangePattern };
      priceRangePattern[priceRange] = (priceRangePattern[priceRange] || 1.0) * 0.9 + (assessmentRate / newAvgAssessment) * 0.1;

      this.update(organization, {
        samples: n + 1,
        avgAssessmentRate: newAvgAssessment,
        avgCompetitors: newAvgCompetitors,
        avgWinningRate: newAvgWinningRate,
        seasonalPattern,
        priceRangePattern,
      });
    } else {
      this.update(organization, {
        avgAssessmentRate: assessmentRate,
        avgCompetitors: competitorCount,
        avgWinningRate: winningRate,
      });
    }
  }

  public getAll(): OrgLearningData[] {
    return Array.from(this.data.values());
  }
}

// ============================================================
// 최적화 엔진
// ============================================================

export class BidOptimizer {
  private learningStore = OrgLearningStore.getInstance();

  /**
   * 최적 투찰률 계산
   */
  public optimize(request: OptimizationRequest): OptimizationResult {
    const { bid, company, predictedPrice, lowerLimitRate, bidRateMean, bidRateStdDev, expectedCompetitors } = request;
    const targetMinScore = request.targetMinScore || 85;

    const reasoning: string[] = [];

    // 1. 가능한 투찰률 범위 탐색
    const candidates = this.exploreRateRange(
      bid, company, predictedPrice, lowerLimitRate,
      bidRateMean, bidRateStdDev, expectedCompetitors
    );

    // 2. 최적점 찾기 (Expected Value 최대화)
    const validCandidates = candidates.filter(c => c.qualificationScore >= targetMinScore);

    let optimal: typeof candidates[0];
    if (validCandidates.length > 0) {
      // 적격심사 통과 가능한 후보 중 기대값 최대
      optimal = validCandidates.reduce((best, curr) =>
        curr.expectedValue > best.expectedValue ? curr : best
      );
      reasoning.push(`적격심사 통과 가능한 ${validCandidates.length}개 투찰률 중 최적점 선택`);
    } else {
      // 통과 불가 시 점수 최대화
      optimal = candidates.reduce((best, curr) =>
        curr.qualificationScore > best.qualificationScore ? curr : best
      );
      reasoning.push('적격심사 통과 불가 - 점수 최대화 전략');
    }

    // 3. 대안 전략 생성
    const alternatives = this.generateAlternatives(
      candidates, optimal, lowerLimitRate, targetMinScore
    );

    // 4. 민감도 분석
    const sensitivity = this.analyzeSensitivity(
      bid, company, predictedPrice, lowerLimitRate,
      bidRateMean, bidRateStdDev, expectedCompetitors, targetMinScore
    );

    // 5. 추천 결정
    const recommendation = this.determineRecommendation(
      optimal, targetMinScore, expectedCompetitors
    );

    // 추가 분석
    if (optimal.qualificationScore >= targetMinScore) {
      reasoning.push(`적격심사 ${optimal.qualificationScore.toFixed(1)}점 (마진 +${(optimal.qualificationScore - targetMinScore).toFixed(1)}점)`);
    } else {
      reasoning.push(`적격심사 ${optimal.qualificationScore.toFixed(1)}점 (부족 ${(targetMinScore - optimal.qualificationScore).toFixed(1)}점)`);
    }

    reasoning.push(`예상 낙찰확률 ${(optimal.winProbability * 100).toFixed(1)}%`);
    reasoning.push(`기대값 ${optimal.expectedValue.toFixed(2)} (점수×확률)`);

    return {
      optimalBidRate: optimal.bidRate,
      optimalBidPrice: Math.round(predictedPrice * optimal.bidRate),
      balancePoint: {
        qualificationScore: optimal.qualificationScore,
        winProbability: optimal.winProbability,
        expectedValue: optimal.expectedValue,
      },
      alternatives,
      sensitivity,
      recommendation,
      reasoning,
    };
  }

  /**
   * 투찰률 범위 탐색
   */
  private exploreRateRange(
    bid: BidInfo,
    company: EnhancedCompanyProfile,
    _predictedPrice: number,
    lowerLimitRate: number,
    bidRateMean: number,
    bidRateStdDev: number,
    expectedCompetitors: number
  ): Array<{
    bidRate: number;
    qualificationScore: number;
    winProbability: number;
    expectedValue: number;
  }> {
    const results: Array<{
      bidRate: number;
      qualificationScore: number;
      winProbability: number;
      expectedValue: number;
    }> = [];

    // 낙찰하한율부터 90%까지 0.5% 단위로 탐색
    for (let rate = lowerLimitRate; rate <= 0.90; rate += 0.005) {
      const scorer = new EnhancedQualificationScorer(bid, company, rate);
      const qualResult = scorer.calculate();

      const winProb = this.calculateWinProbability(
        rate, lowerLimitRate, bidRateMean, bidRateStdDev,
        expectedCompetitors, qualResult.total
      );

      // 기대값 = 적격심사 점수 × 낙찰확률
      // 적격심사 통과(85점) 이상일 때만 의미 있음
      const expectedValue = qualResult.total >= 85
        ? (qualResult.total - 85 + 1) * winProb * 100
        : qualResult.total * winProb * 0.1;  // 미달 시 페널티

      results.push({
        bidRate: Math.round(rate * 10000) / 10000,
        qualificationScore: qualResult.total,
        winProbability: winProb,
        expectedValue,
      });
    }

    return results;
  }

  /**
   * 낙찰 확률 계산
   */
  private calculateWinProbability(
    proposedBidRate: number,
    lowerLimitRate: number,
    bidRateMean: number,
    bidRateStdDev: number,
    expectedCompetitors: number,
    qualificationScore: number
  ): number {
    if (qualificationScore < 85) return 0;
    if (proposedBidRate < lowerLimitRate) return 0;

    const zScore = (proposedBidRate - bidRateMean) / bidRateStdDev;
    const cdf = 0.5 * (1 + erf(zScore / Math.sqrt(2)));
    const lowerPriceRatio = cdf;

    const baseProb = Math.pow(1 - lowerPriceRatio, expectedCompetitors - 1);
    const qualPassRate = 0.6;
    const adjustedProb = baseProb * qualPassRate;

    const qualBonus = qualificationScore > 85
      ? 1 + (qualificationScore - 85) / 100
      : 1;

    return Math.min(0.95, Math.round(adjustedProb * qualBonus * 1000) / 1000);
  }

  /**
   * 대안 전략 생성
   */
  private generateAlternatives(
    candidates: Array<{ bidRate: number; qualificationScore: number; winProbability: number; expectedValue: number }>,
    optimal: { bidRate: number; qualificationScore: number; winProbability: number; expectedValue: number },
    lowerLimitRate: number,
    targetMinScore: number
  ): AlternativeStrategy[] {
    const alternatives: AlternativeStrategy[] = [];

    // 공격적 전략 (낙찰하한율 + 0.5%)
    const aggressiveRate = lowerLimitRate + 0.005;
    const aggressive = candidates.find(c => Math.abs(c.bidRate - aggressiveRate) < 0.003);
    if (aggressive && aggressive.bidRate !== optimal.bidRate) {
      alternatives.push({
        name: '공격적 전략',
        bidRate: aggressive.bidRate,
        bidPrice: 0,  // 나중에 계산
        qualificationScore: aggressive.qualificationScore,
        winProbability: aggressive.winProbability,
        expectedValue: aggressive.expectedValue,
        tradeoff: aggressive.qualificationScore >= targetMinScore
          ? '높은 낙찰확률, 적격심사 통과'
          : '높은 낙찰확률, 적격심사 위험',
      });
    }

    // 보수적 전략 (88%)
    const conservative = candidates.find(c => Math.abs(c.bidRate - 0.88) < 0.003);
    if (conservative && conservative.bidRate !== optimal.bidRate) {
      alternatives.push({
        name: '보수적 전략',
        bidRate: conservative.bidRate,
        bidPrice: 0,
        qualificationScore: conservative.qualificationScore,
        winProbability: conservative.winProbability,
        expectedValue: conservative.expectedValue,
        tradeoff: '최고 적격심사 점수, 낮은 낙찰확률',
      });
    }

    // 균형 전략 (86%)
    const balanced = candidates.find(c => Math.abs(c.bidRate - 0.86) < 0.003);
    if (balanced && balanced.bidRate !== optimal.bidRate) {
      alternatives.push({
        name: '균형 전략',
        bidRate: balanced.bidRate,
        bidPrice: 0,
        qualificationScore: balanced.qualificationScore,
        winProbability: balanced.winProbability,
        expectedValue: balanced.expectedValue,
        tradeoff: '적격심사와 낙찰확률 균형',
      });
    }

    // 적격심사 통과 최소 투찰률
    const minPassCandidate = candidates.find(c => c.qualificationScore >= targetMinScore);
    if (minPassCandidate && minPassCandidate.bidRate !== optimal.bidRate) {
      alternatives.push({
        name: '최소 통과 전략',
        bidRate: minPassCandidate.bidRate,
        bidPrice: 0,
        qualificationScore: minPassCandidate.qualificationScore,
        winProbability: minPassCandidate.winProbability,
        expectedValue: minPassCandidate.expectedValue,
        tradeoff: '적격심사 간신히 통과, 최대 낙찰확률',
      });
    }

    return alternatives;
  }

  /**
   * 민감도 분석
   */
  private analyzeSensitivity(
    bid: BidInfo,
    company: EnhancedCompanyProfile,
    _predictedPrice: number,
    lowerLimitRate: number,
    bidRateMean: number,
    bidRateStdDev: number,
    expectedCompetitors: number,
    targetMinScore: number
  ): SensitivityAnalysis {
    // 1% 변화 영향
    const rate86 = 0.86;
    const rate87 = 0.87;

    const scorer86 = new EnhancedQualificationScorer(bid, company, rate86);
    const scorer87 = new EnhancedQualificationScorer(bid, company, rate87);

    const score86 = scorer86.calculate().total;
    const score87 = scorer87.calculate().total;

    const winProb86 = this.calculateWinProbability(rate86, lowerLimitRate, bidRateMean, bidRateStdDev, expectedCompetitors, score86);
    const winProb87 = this.calculateWinProbability(rate87, lowerLimitRate, bidRateMean, bidRateStdDev, expectedCompetitors, score87);

    // 임계점 찾기
    let minPassRate = 0.90;
    let maxCompetitiveRate = lowerLimitRate;

    for (let rate = lowerLimitRate; rate <= 0.90; rate += 0.002) {
      const scorer = new EnhancedQualificationScorer(bid, company, rate);
      const score = scorer.calculate().total;

      if (score >= targetMinScore && rate < minPassRate) {
        minPassRate = rate;
      }

      const winProb = this.calculateWinProbability(rate, lowerLimitRate, bidRateMean, bidRateStdDev, expectedCompetitors, score);
      if (winProb >= 0.05 && rate > maxCompetitiveRate) {
        maxCompetitiveRate = rate;
      }
    }

    // 리스크 구간
    const riskZones: RiskZone[] = [
      {
        rateRange: { min: lowerLimitRate, max: Math.min(minPassRate - 0.01, lowerLimitRate + 0.02) },
        risk: 'HIGH',
        description: '적격심사 미달 위험',
      },
      {
        rateRange: { min: minPassRate, max: Math.min(maxCompetitiveRate, 0.88) },
        risk: 'LOW',
        description: '최적 구간 (통과 + 경쟁력)',
      },
      {
        rateRange: { min: 0.88, max: 0.90 },
        risk: 'MEDIUM',
        description: '안전하나 경쟁력 낮음',
      },
    ];

    return {
      rateImpact: {
        priceScoreChange: Math.round((score87 - score86) * 10) / 10,
        winProbChange: Math.round((winProb87 - winProb86) * 1000) / 10,
      },
      thresholds: {
        minPassRate: Math.round(minPassRate * 10000) / 10000,
        maxCompetitiveRate: Math.round(maxCompetitiveRate * 10000) / 10000,
        optimalRange: {
          min: Math.round(minPassRate * 10000) / 10000,
          max: Math.round(Math.min(maxCompetitiveRate, 0.88) * 10000) / 10000,
        },
      },
      riskZones,
    };
  }

  /**
   * 추천 결정
   */
  private determineRecommendation(
    optimal: { qualificationScore: number; winProbability: number; expectedValue: number },
    targetMinScore: number,
    _expectedCompetitors: number
  ): 'STRONG_BID' | 'BID' | 'REVIEW' | 'SKIP' {
    if (optimal.qualificationScore < targetMinScore) {
      return 'SKIP';
    }

    const margin = optimal.qualificationScore - targetMinScore;

    if (optimal.winProbability >= 0.20 && margin >= 5) {
      return 'STRONG_BID';
    }

    if (optimal.winProbability >= 0.10 && margin >= 3) {
      return 'BID';
    }

    if (optimal.winProbability >= 0.05 || margin >= 5) {
      return 'REVIEW';
    }

    if (margin >= 0) {
      return 'REVIEW';
    }

    return 'SKIP';
  }

  /**
   * 기관 데이터 가져오기
   */
  public getOrgData(organization: string): OrgLearningData | undefined {
    return this.learningStore.get(organization);
  }

  /**
   * 기관 데이터 학습
   */
  public learnFromBidResult(
    organization: string,
    assessmentRate: number,
    competitorCount: number,
    winningRate: number,
    bidDate: Date,
    estimatedPrice: number
  ): void {
    const month = bidDate.getMonth() + 1;
    const priceRange = this.getPriceRange(estimatedPrice);

    this.learningStore.learnFromResult(
      organization,
      assessmentRate,
      competitorCount,
      winningRate,
      month,
      priceRange
    );
  }

  private getPriceRange(price: number): string {
    if (price < 50000000) return 'under50m';
    if (price < 100000000) return '50m-100m';
    if (price < 500000000) return '100m-500m';
    return 'over500m';
  }
}

// 싱글톤 인스턴스
let optimizerInstance: BidOptimizer | null = null;

export function getBidOptimizer(): BidOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new BidOptimizer();
  }
  return optimizerInstance;
}

// Export for testing
export { OrgLearningStore };
