/**
 * BIDFLOW 입찰 전략 엔진 v2.1
 *
 * 고도화 내용:
 * - 적격심사 정밀화 (동종/유사 물품 구분, 기술능력 세분화)
 * - 기관별 사정률 패턴 분석
 * - 카테고리/시즌별 경쟁률 예측
 * - 신뢰도 기반 불확실성 표시
 * - 최적 투찰률 자동 계산 (v2.1.1)
 */

import type { BidInfo, CompanyProfile, BidType, ContractType, CreditRating, BidStrategy } from './bidding-engine.js';
import { getLowerLimitRate, erf } from './bidding-engine.js';
import {
  EnhancedQualificationScorer,
  toEnhancedProfile,
  type EnhancedCompanyProfile,
  type QualificationResult,
} from './qualification-scorer.js';
import {
  getAssessmentPredictor,
  type AssessmentPrediction,
} from './assessment-predictor.js';
import {
  getCompetitionPredictor,
  type CompetitionPrediction,
} from './competition-predictor.js';
import {
  getBidOptimizer,
  type SensitivityAnalysis,
} from './bid-optimizer.js';

// ============================================================
// v2.1 타입 정의
// ============================================================

export interface BidStrategyV2 extends BidStrategy {
  version: '2.1';

  // 상세 분석
  qualificationDetails: QualificationResult;
  assessmentAnalysis: AssessmentPrediction;
  competitionAnalysis: CompetitionPrediction;

  // 신뢰도
  confidenceLevel: 'low' | 'medium' | 'high';
  uncertaintyFactors: string[];

  // 시나리오 분석
  scenarios: {
    optimistic: ScenarioResult;
    base: ScenarioResult;
    pessimistic: ScenarioResult;
  };

  // v2.1.1: 최적화 분석
  optimization?: {
    optimalBidRate: number;
    balancePoint: {
      qualificationScore: number;
      winProbability: number;
      expectedValue: number;
    };
    sensitivity: SensitivityAnalysis;
    alternatives: Array<{
      name: string;
      bidRate: number;
      qualificationScore: number;
      winProbability: number;
      tradeoff: string;
    }>;
  };
}

export interface ScenarioResult {
  name: string;
  assessmentRate: number;
  competitors: number;
  optimalBidRate: number;
  optimalBidPrice: number;
  winProbability: number;
  expectedRank: number;
}

export interface PredictionRequestV2 {
  bidId: string;
  bidTitle: string;
  organization: string;
  estimatedPrice: number;
  basePrice?: number;
  bidType?: BidType;
  contractType?: ContractType;
  deadline: string;
  tenantId: string;
  productId: string;
  creditRating?: CreditRating;
  deliveryRecords?: Array<{
    organization?: string;
    productName?: string;
    amount: number;
    completedAt: string;
    category: string;
    keywords?: string[];
  }>;
  certifications?: string[];
  techStaffCount?: number;
  proposedPrice?: number;
  strategy?: 'aggressive' | 'balanced' | 'conservative' | 'optimal';
  isUrgent?: boolean;
}

// ============================================================
// 핵심 함수
// ============================================================

/**
 * v2.1 입찰 예측 생성
 */
export function generateBidPredictionV2(request: PredictionRequestV2): BidStrategyV2 {
  const reasoning: string[] = [];
  const uncertaintyFactors: string[] = [];

  // 1. BidInfo 구성
  const bid: BidInfo = {
    id: request.bidId,
    title: request.bidTitle,
    organization: request.organization,
    estimatedPrice: request.estimatedPrice,
    basePrice: request.basePrice,
    bidType: request.bidType || 'goods',
    contractType: request.contractType || 'qualification_review',
    deadline: new Date(request.deadline),
  };

  // 2. CompanyProfile 구성 (Enhanced)
  const deliveryRecordsRaw = request.deliveryRecords || [];
  const baseProfile: CompanyProfile = {
    tenantId: request.tenantId,
    creditRating: request.creditRating || 'BBB0',
    deliveryRecords: deliveryRecordsRaw.map(r => ({
      organization: r.organization || '',
      productName: r.productName || '',
      amount: r.amount,
      completedAt: new Date(r.completedAt),
      category: r.category,
    })),
    certifications: request.certifications || [],
    techStaffCount: request.techStaffCount || 3,
    penalties: [],
    preferredOrgs: [],
  };

  // 외부 키워드 맵 구성 (제공된 경우 우선 사용)
  const deliveryKeywords: Record<number, string[]> = {};
  deliveryRecordsRaw.forEach((r, idx) => {
    if (r.keywords && r.keywords.length > 0) {
      deliveryKeywords[idx] = r.keywords;
    }
  });

  const company = toEnhancedProfile(
    baseProfile,
    Object.keys(deliveryKeywords).length > 0 ? deliveryKeywords : undefined
  );

  // 3. 사정률 예측
  const assessmentPredictor = getAssessmentPredictor();
  const assessmentAnalysis = assessmentPredictor.predict(
    bid.organization,
    bid.estimatedPrice,
    bid.deadline
  );
  reasoning.push(
    `예상 사정률: ${(assessmentAnalysis.rate * 100).toFixed(2)}% ` +
    `(신뢰도: ${(assessmentAnalysis.confidence * 100).toFixed(0)}%, ` +
    `범위: ${(assessmentAnalysis.range.low * 100).toFixed(2)}%~${(assessmentAnalysis.range.high * 100).toFixed(2)}%)`
  );

  if (assessmentAnalysis.source === 'default') {
    uncertaintyFactors.push('발주처 사정률 데이터 부족');
  }

  // 4. 예정가격 예측
  const predictedPrice = bid.basePrice
    ? bid.basePrice * assessmentAnalysis.rate
    : bid.estimatedPrice;

  // 5. 낙찰하한율 계산
  const lowerLimitRate = getLowerLimitRate(bid.bidType, bid.contractType, bid.estimatedPrice);
  const lowerLimitPrice = Math.round(predictedPrice * lowerLimitRate);
  reasoning.push(`낙찰하한율: ${(lowerLimitRate * 100).toFixed(3)}%, 하한가: ${lowerLimitPrice.toLocaleString()}원`);

  // 6. 경쟁률 예측
  const competitionPredictor = getCompetitionPredictor();
  const competitionAnalysis = competitionPredictor.predict(
    bid.title,
    bid.organization,
    bid.estimatedPrice,
    bid.deadline,
    request.isUrgent
  );
  reasoning.push(
    `예상 경쟁업체: ${competitionAnalysis.expectedCompetitors}개사 ` +
    `(${competitionAnalysis.competitionLevel}, 범위: ${competitionAnalysis.distribution.min}~${competitionAnalysis.distribution.max})`
  );

  if (competitionAnalysis.confidence < 0.7) {
    uncertaintyFactors.push('경쟁률 예측 불확실성 높음');
  }

  // 7. 최적 투찰률 계산 (최적화 엔진 사용)
  const strategy = request.strategy || 'balanced';
  const bidRateStdDev = competitionPredictor.getBidRateStdDev(competitionAnalysis.competitionLevel);
  const bidRateMean = competitionPredictor.getExpectedBidRateMean(lowerLimitRate, competitionAnalysis.competitionLevel);

  // 최적화 엔진으로 최적 투찰률 계산
  const optimizer = getBidOptimizer();
  const optimizationResult = optimizer.optimize({
    bid,
    company,
    predictedPrice,
    lowerLimitRate,
    bidRateMean,
    bidRateStdDev,
    expectedCompetitors: competitionAnalysis.expectedCompetitors,
  });

  // 전략에 따른 투찰률 결정
  let targetRate: number;
  if (strategy === 'aggressive') {
    targetRate = lowerLimitRate + 0.005;
  } else if (strategy === 'conservative') {
    targetRate = 0.88;
  } else if (strategy === 'optimal') {
    // 새로운 전략: 최적화 엔진 추천 사용
    targetRate = optimizationResult.optimalBidRate;
  } else {
    // balanced: 최적화 결과와 기존 방식 중 더 나은 것 선택
    const balancedRate = competitionPredictor.getExpectedBidRateMean(
      lowerLimitRate,
      competitionAnalysis.competitionLevel
    );
    // 최적화 결과가 적격심사 통과 가능하면 사용
    if (optimizationResult.balancePoint.qualificationScore >= 85) {
      targetRate = optimizationResult.optimalBidRate;
    } else {
      targetRate = balancedRate;
    }
  }

  // 8. 투찰가 계산
  const optimalBidPrice = Math.round(predictedPrice * targetRate);
  const bidPriceRange = {
    low: Math.round(predictedPrice * (lowerLimitRate + 0.002)),
    mid: Math.round(predictedPrice * ((lowerLimitRate + 0.88) / 2)),
    high: Math.round(predictedPrice * 0.88),
  };

  // 9. 적격심사 점수 계산 (Enhanced)
  const proposedBidRate = optimalBidPrice / predictedPrice;
  const scorer = new EnhancedQualificationScorer(bid, company, proposedBidRate);
  const qualificationDetails = scorer.calculate();

  reasoning.push(
    `적격심사 점수: ${qualificationDetails.total}점 ` +
    `(${qualificationDetails.willPass ? '✅ 통과' : '❌ 미달'}, 마진: ${qualificationDetails.marginToPass > 0 ? '+' : ''}${qualificationDetails.marginToPass}점)`
  );

  // 10. 낙찰 확률 계산 (개선된 모델)
  const winProbability = calculateWinProbabilityV2(
    proposedBidRate,
    lowerLimitRate,
    bidRateMean,
    bidRateStdDev,
    competitionAnalysis.expectedCompetitors,
    qualificationDetails.total
  );
  reasoning.push(`예상 낙찰 확률: ${(winProbability * 100).toFixed(1)}%`);

  // 11. 시나리오 분석
  const scenarios = generateScenarios(
    bid,
    company,
    lowerLimitRate,
    assessmentAnalysis,
    competitionAnalysis,
    strategy
  );

  // 12. 추천 결정
  let recommendation: BidStrategy['recommendation'];
  let riskLevel: BidStrategy['riskLevel'];

  if (!qualificationDetails.willPass) {
    // 적격심사 미달
    recommendation = 'SKIP';
    riskLevel = 'HIGH';
    reasoning.push('적격심사 통과 점수 미달 - 입찰 비추천');
  } else if (winProbability >= 0.25) {
    recommendation = 'STRONG_BID';
    riskLevel = 'LOW';
    reasoning.push('높은 낙찰 확률 - 적극 입찰 권장');
  } else if (winProbability >= 0.10) {
    recommendation = 'BID';
    riskLevel = 'MEDIUM';
    reasoning.push('적정 낙찰 확률 - 입찰 권장');
  } else if (winProbability >= 0.05) {
    recommendation = 'REVIEW';
    riskLevel = 'MEDIUM';
    reasoning.push('낮은 낙찰 확률 - 추가 검토 필요');
  } else if (qualificationDetails.marginToPass >= 3) {
    // 적격심사 여유있게 통과 시 낙찰확률 낮아도 참여 가치 있음
    recommendation = 'REVIEW';
    riskLevel = 'MEDIUM';
    reasoning.push('적격심사 통과 - 낙찰확률 낮으나 참여 가능');
  } else {
    // 적격심사 간신히 통과 + 낙찰확률 낮음
    recommendation = 'REVIEW';
    riskLevel = 'HIGH';
    reasoning.push('낙찰 경쟁 치열 - 적극적 투찰률 검토 필요');
  }

  // 개선 제안 추가
  if (qualificationDetails.recommendations.length > 0) {
    reasoning.push('개선 제안: ' + qualificationDetails.recommendations[0]);
  }

  // 13. 신뢰도 레벨 결정
  const avgConfidence = (assessmentAnalysis.confidence + competitionAnalysis.confidence) / 2;
  let confidenceLevel: BidStrategyV2['confidenceLevel'];
  if (avgConfidence >= 0.75) confidenceLevel = 'high';
  else if (avgConfidence >= 0.6) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  return {
    version: '2.1',
    optimalBidPrice,
    bidPriceRange,
    winProbability,
    expectedAssessmentRate: assessmentAnalysis.rate,
    qualificationScore: {
      deliveryRecord: qualificationDetails.deliveryRecord,
      techCapability: qualificationDetails.techCapability,
      financialStatus: qualificationDetails.financialStatus,
      priceScore: qualificationDetails.priceScore,
      reliability: qualificationDetails.reliability,
      total: qualificationDetails.total,
    },
    recommendation,
    reasoning,
    riskLevel,

    // v2.1 추가 필드
    qualificationDetails,
    assessmentAnalysis,
    competitionAnalysis,
    confidenceLevel,
    uncertaintyFactors,
    scenarios,

    // v2.1.1: 최적화 분석 결과
    optimization: {
      optimalBidRate: optimizationResult.optimalBidRate,
      balancePoint: optimizationResult.balancePoint,
      sensitivity: optimizationResult.sensitivity,
      alternatives: optimizationResult.alternatives.map(alt => ({
        name: alt.name,
        bidRate: alt.bidRate,
        qualificationScore: alt.qualificationScore,
        winProbability: alt.winProbability,
        tradeoff: alt.tradeoff,
      })),
    },
  };
}

/**
 * 개선된 낙찰 확률 계산
 */
function calculateWinProbabilityV2(
  proposedBidRate: number,
  lowerLimitRate: number,
  bidRateMean: number,
  bidRateStdDev: number,
  expectedCompetitors: number,
  qualificationScore: number
): number {
  // 적격심사 통과 못하면 확률 0
  if (qualificationScore < 85) {
    return 0;
  }

  // 낙찰하한율 미만이면 무효
  if (proposedBidRate < lowerLimitRate) {
    return 0;
  }

  // Z-score 계산 (내 투찰률이 분포에서 어디에 위치하는지)
  const zScore = (proposedBidRate - bidRateMean) / bidRateStdDev;

  // 정규분포 CDF
  const cdf = 0.5 * (1 + erf(zScore / Math.sqrt(2)));

  // 나보다 낮은 가격 업체 비율
  const lowerPriceRatio = cdf;

  // 낙찰 확률 계산 (가장 낮은 유효 가격이 낙찰)
  // P(win) = P(내가 최저가) × P(내가 적격심사 통과)
  const baseProb = Math.pow(1 - lowerPriceRatio, expectedCompetitors - 1);

  // 적격심사 통과율 보정 (평균 60% 가정)
  const qualPassRate = 0.6;
  const adjustedProb = baseProb * qualPassRate;

  // 적격심사 점수 보너스 (85점 이상에서 점수에 비례)
  const qualBonus = qualificationScore > 85
    ? 1 + (qualificationScore - 85) / 100
    : 1;

  const finalProb = Math.min(0.95, adjustedProb * qualBonus);

  return Math.round(finalProb * 1000) / 1000;
}

/**
 * 시나리오 분석 생성
 */
function generateScenarios(
  bid: BidInfo,
  _company: EnhancedCompanyProfile,  // 향후 회사 프로필 기반 시나리오 분석용
  lowerLimitRate: number,
  assessment: AssessmentPrediction,
  competition: CompetitionPrediction,
  strategy: string
): BidStrategyV2['scenarios'] {
  const competitionPredictor = getCompetitionPredictor();

  // 낙관적 시나리오 (사정률 높음, 경쟁 적음)
  const optimisticRate = assessment.range.p75;
  const optimisticCompetitors = competition.distribution.p10;
  const optimisticBidRate = strategy === 'aggressive'
    ? lowerLimitRate + 0.005
    : competitionPredictor.getExpectedBidRateMean(lowerLimitRate, 'low');
  const optimisticPrice = Math.round(bid.estimatedPrice * optimisticRate);
  const optimisticBidPrice = Math.round(optimisticPrice * optimisticBidRate);

  // 기본 시나리오
  const baseRate = assessment.rate;
  const baseCompetitors = competition.expectedCompetitors;
  const baseBidRate = strategy === 'aggressive'
    ? lowerLimitRate + 0.005
    : competitionPredictor.getExpectedBidRateMean(lowerLimitRate, competition.competitionLevel);
  const basePrice = Math.round(bid.estimatedPrice * baseRate);
  const baseBidPrice = Math.round(basePrice * baseBidRate);

  // 비관적 시나리오 (사정률 낮음, 경쟁 많음)
  const pessimisticRate = assessment.range.p25;
  const pessimisticCompetitors = competition.distribution.p90;
  const pessimisticBidRate = strategy === 'conservative'
    ? 0.88
    : competitionPredictor.getExpectedBidRateMean(lowerLimitRate, 'very_high');
  const pessimisticPrice = Math.round(bid.estimatedPrice * pessimisticRate);
  const pessimisticBidPrice = Math.round(pessimisticPrice * pessimisticBidRate);

  // 각 시나리오별 적격심사 및 확률 계산
  const bidRateStdDev = competitionPredictor.getBidRateStdDev(competition.competitionLevel);
  const bidRateMean = competitionPredictor.getExpectedBidRateMean(lowerLimitRate, competition.competitionLevel);

  // 기본 점수 (company 정보 기반)
  const baseQualScore = 87; // 간소화

  return {
    optimistic: {
      name: '낙관적',
      assessmentRate: optimisticRate,
      competitors: optimisticCompetitors,
      optimalBidRate: optimisticBidRate,
      optimalBidPrice: optimisticBidPrice,
      winProbability: calculateWinProbabilityV2(
        optimisticBidRate, lowerLimitRate, bidRateMean, 0.025,
        optimisticCompetitors, baseQualScore
      ),
      expectedRank: Math.ceil(optimisticCompetitors * 0.2),
    },
    base: {
      name: '기본',
      assessmentRate: baseRate,
      competitors: baseCompetitors,
      optimalBidRate: baseBidRate,
      optimalBidPrice: baseBidPrice,
      winProbability: calculateWinProbabilityV2(
        baseBidRate, lowerLimitRate, bidRateMean, bidRateStdDev,
        baseCompetitors, baseQualScore
      ),
      expectedRank: Math.ceil(baseCompetitors * 0.3),
    },
    pessimistic: {
      name: '비관적',
      assessmentRate: pessimisticRate,
      competitors: pessimisticCompetitors,
      optimalBidRate: pessimisticBidRate,
      optimalBidPrice: pessimisticBidPrice,
      winProbability: calculateWinProbabilityV2(
        pessimisticBidRate, lowerLimitRate, bidRateMean, 0.012,
        pessimisticCompetitors, baseQualScore
      ),
      expectedRank: Math.ceil(pessimisticCompetitors * 0.4),
    },
  };
}

// erf 함수 재export
export { erf };
