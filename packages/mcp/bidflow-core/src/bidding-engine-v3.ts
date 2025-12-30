/**
 * BIDFLOW 입찰 전략 엔진 v3.0 - 현실화 버전
 *
 * 핵심 개선:
 * 1. 현실적인 낙찰 판정 (사정률 기반 예정가격 + 가격순위 + 적격심사)
 * 2. 개선된 추천 알고리즘 (ROI 기반)
 * 3. 동적 가격점수 모델 (사정률 반영)
 * 4. 기관/카테고리별 패턴 학습
 */

import type { BidInfo, CompanyProfile, BidType, ContractType, CreditRating } from './bidding-engine.js';
import { getLowerLimitRate, erf } from './bidding-engine.js';
import {
  EnhancedQualificationScorer,
  toEnhancedProfile,
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

// ============================================================
// v3.0 타입 정의
// ============================================================

export interface BidStrategyV3 {
  version: '3.0';

  // 기본 정보 (BidStrategy 호환)
  optimalBidPrice: number;
  bidPriceRange: { low: number; mid: number; high: number };
  winProbability: number;
  expectedAssessmentRate: number;
  qualificationScore: QualificationResult;
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  // 추가 필드
  lowerLimitRate: number;
  optimalBidRate: number;
  predictedPrice: number;
  assessmentRate: number;
  expectedCompetitors: number;
  insights: string[];

  // 상세 분석
  qualificationDetails: QualificationResult;
  assessmentAnalysis: AssessmentPrediction;
  competitionAnalysis: CompetitionPrediction;

  // 현실적인 낙찰 분석
  winAnalysis: WinAnalysis;

  // 추천 (개선된)
  recommendation: RecommendationV3;
  recommendationReason: string[];

  // 최적 전략
  optimalStrategy: OptimalStrategyV3;

  // 신뢰도
  confidenceLevel: 'low' | 'medium' | 'high';
  uncertaintyFactors: string[];
}

export interface WinAnalysis {
  // 예정가격 예측
  predictedBudgetPrice: number;
  budgetPriceRange: { min: number; max: number };

  // 낙찰하한가
  floorPrice: number;

  // 우리 입찰 분석
  ourBidPrice: number;
  ourBidRate: number;

  // 적격심사 통과 여부
  qualificationPassed: boolean;
  qualificationScore: number;
  qualificationMargin: number;

  // 가격 경쟁력
  priceRank: PriceRankAnalysis;

  // 종합 낙찰 확률
  winProbability: number;
  winProbabilityBreakdown: {
    priceCompetitiveness: number;
    qualificationAdvantage: number;
    orgRelationship: number;
  };
}

export interface PriceRankAnalysis {
  estimatedRank: number;
  totalCompetitors: number;
  percentile: number;
  isLowestValid: boolean;
}

export interface RecommendationV3 {
  action: 'STRONG_BID' | 'BID' | 'CONDITIONAL_BID' | 'REVIEW' | 'SKIP';
  confidence: number;
  expectedROI: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface OptimalStrategyV3 {
  bidRateRange: { min: number; max: number; optimal: number };
  bidPriceRange: { min: number; max: number; optimal: number };
  scenarios: BidScenario[];
  recommendedScenario: string;
}

export interface BidScenario {
  name: string;
  bidRate: number;
  bidPrice: number;
  qualificationScore: number;
  winProbability: number;
  expectedProfit: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

// ============================================================
// 핵심 상수
// ============================================================

const QUALIFICATION_PASS_THRESHOLD = 85;
const EXPECTED_MARGIN_RATE = 0.12;
const BID_PARTICIPATION_COST = 500000;

const RECOMMENDATION_THRESHOLDS = {
  STRONG_BID: { minWinProb: 0.25, minQualMargin: 5, minROI: 0.15 },
  BID: { minWinProb: 0.12, minQualMargin: 2, minROI: 0.08 },
  CONDITIONAL_BID: { minWinProb: 0.05, minQualMargin: 0, minROI: 0.03 },
  REVIEW: { minWinProb: 0.02, minQualMargin: -3, minROI: 0 },
};

// ============================================================
// 메인 함수
// ============================================================

export interface BidPredictionRequestV3 {
  bidId: string;
  bidTitle: string;
  organization: string;
  estimatedPrice: number;
  basePrice?: number;
  bidType: BidType;
  contractType: ContractType;
  deadline: string;

  tenantId: string;
  productId: string;
  creditRating: CreditRating;
  deliveryRecords: Array<{
    organization: string;
    productName: string;
    amount: number;
    completedAt: string;
    category: string;
    keywords?: string[];
  }>;
  certifications: string[];
  techStaffCount: number;

  strategy?: 'aggressive' | 'balanced' | 'conservative' | 'optimal';
  isUrgent?: boolean;
  category?: string;
}

export function generateBidPredictionV3(request: BidPredictionRequestV3): BidStrategyV3 {
  const strategy = request.strategy || 'balanced';
  const bidDate = new Date(request.deadline);

  // 1. 기본 정보 구성
  const bid: BidInfo = {
    id: request.bidId,
    title: request.bidTitle,
    organization: request.organization,
    estimatedPrice: request.estimatedPrice,
    basePrice: request.basePrice,
    bidType: request.bidType,
    contractType: request.contractType,
    deadline: bidDate,
  };

  const companyProfile: CompanyProfile = {
    tenantId: request.tenantId,
    creditRating: request.creditRating,
    deliveryRecords: request.deliveryRecords.map(r => ({
      organization: r.organization,
      productName: r.productName,
      amount: r.amount,
      completedAt: new Date(r.completedAt),
      category: r.category,
      keywords: r.keywords,  // 키워드 전달 (적격심사 점수 계산에 필수)
    })),
    certifications: request.certifications,
    techStaffCount: request.techStaffCount,
    penalties: [],
    preferredOrgs: [],
  };

  // 2. 낙찰하한율 계산
  const lowerLimitRate = getLowerLimitRate(request.bidType, request.contractType, request.estimatedPrice);

  // 3. 사정률 예측
  const assessmentPredictor = getAssessmentPredictor();
  const assessmentAnalysis = assessmentPredictor.predict(
    request.organization,
    request.estimatedPrice,
    bidDate
  );

  // 4. 경쟁률 예측
  const competitionPredictor = getCompetitionPredictor();
  const competitionAnalysis = competitionPredictor.predict(
    request.category || 'other',
    request.organization,
    request.estimatedPrice,
    bidDate,
    request.isUrgent || false
  );

  // 5. 예정가격 예측
  const predictedBudgetPrice = request.estimatedPrice * assessmentAnalysis.rate;

  // 6. 낙찰하한가
  const floorPrice = predictedBudgetPrice * lowerLimitRate;

  // 7. 최적 투찰률 계산
  const optimalStrategy = calculateOptimalStrategyV3(
    bid, companyProfile, predictedBudgetPrice, lowerLimitRate,
    competitionAnalysis.expectedCompetitors, strategy
  );

  // 8. 선택된 전략으로 분석
  const selectedBidRate = optimalStrategy.bidRateRange.optimal;
  const selectedBidPrice = Math.round(predictedBudgetPrice * selectedBidRate);

  // 9. 적격심사 계산
  const enhancedProfile = toEnhancedProfile(companyProfile);
  const scorer = new EnhancedQualificationScorer(bid, enhancedProfile, selectedBidRate);
  const qualificationDetails = scorer.calculate();

  // 10. 투찰률 분포 (경쟁자 평균 85.5%, 표준편차 1.5%)
  // - 실제 낙찰 데이터 기반: 84.5% ~ 86.5% 범위에서 대부분 낙찰
  const bidRateDistribution = { mean: 0.855, stdDev: 0.015 };

  // 11. 낙찰 분석
  const winAnalysis = analyzeWinProbability(
    selectedBidPrice,
    selectedBidRate,
    qualificationDetails,
    predictedBudgetPrice,
    floorPrice,
    competitionAnalysis.expectedCompetitors,
    bidRateDistribution
  );

  // 12. 추천 결정
  const { recommendation, reasons } = determineRecommendationV3(
    winAnalysis,
    qualificationDetails
  );

  // 13. 신뢰도 평가
  const { confidenceLevel, uncertaintyFactors } = assessConfidence(
    assessmentAnalysis,
    competitionAnalysis,
    qualificationDetails
  );

  return {
    version: '3.0',

    // 기본 정보
    optimalBidPrice: selectedBidPrice,
    bidPriceRange: {
      low: optimalStrategy.bidPriceRange.min,
      mid: optimalStrategy.bidPriceRange.optimal,
      high: optimalStrategy.bidPriceRange.max,
    },
    winProbability: winAnalysis.winProbability,
    expectedAssessmentRate: assessmentAnalysis.rate,
    qualificationScore: qualificationDetails,
    reasoning: reasons,
    riskLevel: recommendation.riskLevel,

    // 추가 필드
    lowerLimitRate,
    optimalBidRate: selectedBidRate,
    predictedPrice: predictedBudgetPrice,
    assessmentRate: assessmentAnalysis.rate,
    expectedCompetitors: competitionAnalysis.expectedCompetitors,
    insights: generateInsights(winAnalysis, qualificationDetails, recommendation),

    // 상세 분석
    qualificationDetails,
    assessmentAnalysis,
    competitionAnalysis,
    winAnalysis,

    // 추천
    recommendation,
    recommendationReason: reasons,

    // 최적 전략
    optimalStrategy,

    // 신뢰도
    confidenceLevel,
    uncertaintyFactors,
  };
}

// ============================================================
// 최적 전략 계산
// ============================================================

function calculateOptimalStrategyV3(
  bid: BidInfo,
  company: CompanyProfile,
  predictedBudgetPrice: number,
  lowerLimitRate: number,
  expectedCompetitors: number,
  strategyType: string
): OptimalStrategyV3 {
  const enhancedProfile = toEnhancedProfile(company);
  const scenarios: BidScenario[] = [];

  const rateStep = 0.005;
  let bestExpectedValue = -Infinity;
  let optimalRate = 0.86;

  for (let rate = lowerLimitRate; rate <= 0.90; rate += rateStep) {
    const scorer = new EnhancedQualificationScorer(bid, enhancedProfile, rate);
    const qual = scorer.calculate();

    if (qual.total < QUALIFICATION_PASS_THRESHOLD) continue;

    const winProb = calculateRealisticWinProb(
      rate, lowerLimitRate, expectedCompetitors, qual.total
    );

    const bidPrice = Math.round(predictedBudgetPrice * rate);
    const expectedProfit = bidPrice * EXPECTED_MARGIN_RATE * winProb - BID_PARTICIPATION_COST * (1 - winProb);

    if (expectedProfit > bestExpectedValue) {
      bestExpectedValue = expectedProfit;
      optimalRate = rate;
    }
  }

  const strategyRates: Record<string, number> = {
    aggressive: lowerLimitRate + 0.005,  // 84.75%: 하한가 근접
    balanced: 0.855,                      // 85.5%: 평균 낙찰률 근접
    conservative: 0.865,                  // 86.5%: 안정적
    optimal: optimalRate,                 // ROI 최적화
  };

  const targetRate = strategyRates[strategyType] || optimalRate;

  const scenarioConfigs = [
    { name: '공격적 (최저가)', rate: lowerLimitRate + 0.005, risk: 'HIGH' as const },
    { name: '균형 (표준)', rate: 0.86, risk: 'MEDIUM' as const },
    { name: '보수적 (안전)', rate: 0.88, risk: 'LOW' as const },
    { name: '최적화 (ROI)', rate: optimalRate, risk: 'MEDIUM' as const },
  ];

  for (const config of scenarioConfigs) {
    const scorer = new EnhancedQualificationScorer(bid, enhancedProfile, config.rate);
    const qual = scorer.calculate();
    const winProb = calculateRealisticWinProb(
      config.rate, lowerLimitRate, expectedCompetitors, qual.total
    );
    const bidPrice = Math.round(predictedBudgetPrice * config.rate);
    const expectedProfit = bidPrice * EXPECTED_MARGIN_RATE * winProb;

    scenarios.push({
      name: config.name,
      bidRate: Math.round(config.rate * 10000) / 10000,
      bidPrice,
      qualificationScore: qual.total,
      winProbability: winProb,
      expectedProfit: Math.round(expectedProfit),
      risk: config.risk,
      description: getScenarioDescription(qual.total, winProb),
    });
  }

  return {
    bidRateRange: {
      min: lowerLimitRate + 0.005,
      max: 0.88,
      optimal: Math.round(targetRate * 10000) / 10000,
    },
    bidPriceRange: {
      min: Math.round(predictedBudgetPrice * (lowerLimitRate + 0.005)),
      max: Math.round(predictedBudgetPrice * 0.88),
      optimal: Math.round(predictedBudgetPrice * targetRate),
    },
    scenarios,
    recommendedScenario: strategyType === 'optimal' ? '최적화 (ROI)' : scenarios.find(s => Math.abs(s.bidRate - targetRate) < 0.01)?.name || '균형 (표준)',
  };
}

function getScenarioDescription(qualScore: number, winProb: number): string {
  if (qualScore < 85) return '적격심사 미달 위험';
  if (winProb >= 0.25) return '높은 낙찰 확률, 적정 마진';
  if (winProb >= 0.10) return '보통 낙찰 확률, 안정적 점수';
  return '균형잡힌 전략';
}

// ============================================================
// 현실적인 낙찰 확률 계산
// ============================================================

function calculateRealisticWinProb(
  bidRate: number,
  lowerLimitRate: number,
  competitors: number,
  qualificationScore: number
): number {
  if (qualificationScore < QUALIFICATION_PASS_THRESHOLD) return 0;
  if (bidRate < lowerLimitRate) return 0;

  // 경쟁자 투찰률 분포 (실제 데이터 기반)
  const competitorMean = 0.855;
  const competitorStd = 0.015;

  const zScore = (bidRate - competitorMean) / competitorStd;
  const cdf = 0.5 * (1 + erf(zScore / Math.sqrt(2)));
  const higherThanUs = 1 - cdf;

  const competitorPassRate = 0.70;
  const effectiveCompetitors = competitors * competitorPassRate;
  const adjustedLowestProb = Math.pow(higherThanUs, Math.max(0, effectiveCompetitors - 1));

  const avgCompetitorScore = 88;
  const qualAdvantage = qualificationScore > avgCompetitorScore
    ? 1 + (qualificationScore - avgCompetitorScore) * 0.02
    : 1 - (avgCompetitorScore - qualificationScore) * 0.03;

  const rawProb = adjustedLowestProb * qualAdvantage;
  return Math.max(0, Math.min(0.60, rawProb));
}

// ============================================================
// 낙찰 분석
// ============================================================

function analyzeWinProbability(
  bidPrice: number,
  bidRate: number,
  qualification: QualificationResult,
  predictedBudgetPrice: number,
  floorPrice: number,
  competitors: number,
  bidRateDistribution: { mean: number; stdDev: number }
): WinAnalysis {
  const qualificationPassed = qualification.total >= QUALIFICATION_PASS_THRESHOLD;
  const qualificationMargin = qualification.total - QUALIFICATION_PASS_THRESHOLD;

  const zScore = (bidRate - bidRateDistribution.mean) / bidRateDistribution.stdDev;
  const percentile = 0.5 * (1 + erf(zScore / Math.sqrt(2)));
  const estimatedRank = Math.ceil(percentile * competitors);
  const isLowestValid = bidPrice >= floorPrice && qualificationPassed;

  const priceCompetitiveness = Math.max(0, 1 - percentile);
  const qualificationAdvantage = qualificationPassed
    ? Math.min(1, 0.5 + qualificationMargin * 0.05)
    : 0;
  const orgRelationship = 0.1;

  const winProbability = calculateRealisticWinProb(
    bidRate,
    floorPrice / predictedBudgetPrice,
    competitors,
    qualification.total
  );

  return {
    predictedBudgetPrice: Math.round(predictedBudgetPrice),
    budgetPriceRange: {
      min: Math.round(predictedBudgetPrice * 0.995),
      max: Math.round(predictedBudgetPrice * 1.005),
    },
    floorPrice: Math.round(floorPrice),
    ourBidPrice: bidPrice,
    ourBidRate: Math.round(bidRate * 10000) / 10000,
    qualificationPassed,
    qualificationScore: qualification.total,
    qualificationMargin: Math.round(qualificationMargin * 10) / 10,
    priceRank: {
      estimatedRank,
      totalCompetitors: competitors,
      percentile: Math.round(percentile * 100) / 100,
      isLowestValid,
    },
    winProbability: Math.round(winProbability * 1000) / 1000,
    winProbabilityBreakdown: {
      priceCompetitiveness: Math.round(priceCompetitiveness * 100) / 100,
      qualificationAdvantage: Math.round(qualificationAdvantage * 100) / 100,
      orgRelationship: Math.round(orgRelationship * 100) / 100,
    },
  };
}

// ============================================================
// 추천 결정
// ============================================================

function determineRecommendationV3(
  winAnalysis: WinAnalysis,
  qualification: QualificationResult
): { recommendation: RecommendationV3; reasons: string[] } {
  const reasons: string[] = [];

  const expectedRevenue = winAnalysis.ourBidPrice * EXPECTED_MARGIN_RATE * winAnalysis.winProbability;
  const expectedCost = BID_PARTICIPATION_COST * (1 - winAnalysis.winProbability);
  const expectedProfit = expectedRevenue - expectedCost;
  const expectedROI = expectedProfit / BID_PARTICIPATION_COST;

  if (!winAnalysis.qualificationPassed) {
    reasons.push(`적격심사 미달 (${qualification.total.toFixed(1)}점 < 85점)`);
    return {
      recommendation: { action: 'SKIP', confidence: 90, expectedROI: -1, riskLevel: 'HIGH' },
      reasons,
    };
  }

  if (
    winAnalysis.winProbability >= RECOMMENDATION_THRESHOLDS.STRONG_BID.minWinProb &&
    winAnalysis.qualificationMargin >= RECOMMENDATION_THRESHOLDS.STRONG_BID.minQualMargin &&
    expectedROI >= RECOMMENDATION_THRESHOLDS.STRONG_BID.minROI
  ) {
    reasons.push(`높은 낙찰 확률 (${(winAnalysis.winProbability * 100).toFixed(1)}%)`);
    reasons.push(`안정적 적격점수 (마진 +${winAnalysis.qualificationMargin.toFixed(1)}점)`);
    reasons.push(`기대 수익 양호 (ROI ${(expectedROI * 100).toFixed(1)}%)`);
    return {
      recommendation: { action: 'STRONG_BID', confidence: 85, expectedROI: Math.round(expectedROI * 100) / 100, riskLevel: 'LOW' },
      reasons,
    };
  }

  if (
    winAnalysis.winProbability >= RECOMMENDATION_THRESHOLDS.BID.minWinProb &&
    winAnalysis.qualificationMargin >= RECOMMENDATION_THRESHOLDS.BID.minQualMargin &&
    expectedROI >= RECOMMENDATION_THRESHOLDS.BID.minROI
  ) {
    reasons.push(`적정 낙찰 확률 (${(winAnalysis.winProbability * 100).toFixed(1)}%)`);
    reasons.push(`적격심사 통과 (마진 +${winAnalysis.qualificationMargin.toFixed(1)}점)`);
    return {
      recommendation: { action: 'BID', confidence: 70, expectedROI: Math.round(expectedROI * 100) / 100, riskLevel: 'MEDIUM' },
      reasons,
    };
  }

  if (
    winAnalysis.winProbability >= RECOMMENDATION_THRESHOLDS.CONDITIONAL_BID.minWinProb &&
    winAnalysis.qualificationMargin >= RECOMMENDATION_THRESHOLDS.CONDITIONAL_BID.minQualMargin
  ) {
    reasons.push(`낮은 낙찰 확률 (${(winAnalysis.winProbability * 100).toFixed(1)}%) - 조건부 참여`);
    if (winAnalysis.qualificationMargin < 3) {
      reasons.push(`적격심사 마진 부족 (+${winAnalysis.qualificationMargin.toFixed(1)}점)`);
    }
    return {
      recommendation: { action: 'CONDITIONAL_BID', confidence: 50, expectedROI: Math.round(expectedROI * 100) / 100, riskLevel: 'HIGH' },
      reasons,
    };
  }

  if (
    winAnalysis.winProbability >= RECOMMENDATION_THRESHOLDS.REVIEW.minWinProb ||
    winAnalysis.qualificationMargin >= 0
  ) {
    reasons.push(`검토 필요 - 낙찰 확률 ${(winAnalysis.winProbability * 100).toFixed(1)}%`);
    if (winAnalysis.qualificationMargin < 2) {
      reasons.push(`적격심사 마진 낮음 (+${winAnalysis.qualificationMargin.toFixed(1)}점)`);
    }
    return {
      recommendation: { action: 'REVIEW', confidence: 40, expectedROI: Math.round(expectedROI * 100) / 100, riskLevel: 'HIGH' },
      reasons,
    };
  }

  reasons.push(`낙찰 가능성 낮음 (${(winAnalysis.winProbability * 100).toFixed(1)}%)`);
  reasons.push(`예상 ROI 음수 (${(expectedROI * 100).toFixed(1)}%)`);
  return {
    recommendation: { action: 'SKIP', confidence: 75, expectedROI: Math.round(expectedROI * 100) / 100, riskLevel: 'HIGH' },
    reasons,
  };
}

// ============================================================
// 신뢰도 평가
// ============================================================

function assessConfidence(
  assessment: AssessmentPrediction,
  competition: CompetitionPrediction,
  qualification: QualificationResult
): { confidenceLevel: 'low' | 'medium' | 'high'; uncertaintyFactors: string[] } {
  const uncertaintyFactors: string[] = [];
  let confidenceScore = 100;

  // 문자열과 숫자 비교 수정
  const assessConfStr = String(assessment.confidence);
  const compConfStr = String(competition.confidence);

  if (assessConfStr === 'low') {
    confidenceScore -= 30;
    uncertaintyFactors.push('사정률 예측 신뢰도 낮음');
  } else if (assessConfStr === 'medium') {
    confidenceScore -= 15;
  }

  if (compConfStr === 'low') {
    confidenceScore -= 25;
    uncertaintyFactors.push('경쟁률 예측 신뢰도 낮음');
  } else if (compConfStr === 'medium') {
    confidenceScore -= 10;
  }

  if (qualification.marginToPass < 3 && qualification.marginToPass >= 0) {
    confidenceScore -= 15;
    uncertaintyFactors.push('적격심사 통과 마진 부족');
  } else if (qualification.marginToPass < 0) {
    confidenceScore -= 30;
    uncertaintyFactors.push('적격심사 미달 예상');
  }

  if (qualification.deliveryRecord < 15) {
    confidenceScore -= 10;
    uncertaintyFactors.push('납품실적 점수 낮음');
  }

  const confidenceLevel: 'low' | 'medium' | 'high' =
    confidenceScore >= 70 ? 'high' :
    confidenceScore >= 45 ? 'medium' : 'low';

  return { confidenceLevel, uncertaintyFactors };
}

// ============================================================
// 인사이트 생성
// ============================================================

function generateInsights(
  winAnalysis: WinAnalysis,
  qualification: QualificationResult,
  recommendation: RecommendationV3
): string[] {
  const insights: string[] = [];

  if (qualification.total >= 90) {
    insights.push('적격심사 점수 우수 (90점+)');
  } else if (qualification.total < 85) {
    insights.push(`적격심사 미달 - ${qualification.recommendations[0] || '개선 필요'}`);
  }

  if (winAnalysis.priceRank.percentile <= 0.3) {
    insights.push('가격 경쟁력 상위권');
  } else if (winAnalysis.priceRank.percentile >= 0.7) {
    insights.push('가격 경쟁력 낮음 - 투찰률 조정 검토');
  }

  if (recommendation.action === 'STRONG_BID') {
    insights.push('적극 참여 권장 - 높은 낙찰 가능성');
  } else if (recommendation.action === 'SKIP') {
    insights.push('참여 비권장 - 낙찰 가능성 낮음');
  }

  if (winAnalysis.winProbability >= 0.20 && winAnalysis.qualificationMargin >= 5) {
    insights.push('황금 기회 - 높은 확률 + 안정적 점수');
  }

  return insights;
}

// ============================================================
// Export
// ============================================================

export type { BidPredictionRequestV3 as BidRequestV3 };
