/**
 * Qetta 적격심사 정밀 평가 시스템 v2.1
 *
 * 개선 사항:
 * - 납품실적 동종/유사 물품 구분
 * - 기술능력 세분화 (인증 유형별)
 * - 발주처별 히스토리 보너스
 * - 시장 경쟁도 반영
 */

import type { BidInfo, CompanyProfile, CreditRating } from './bidding-engine.js';

// ============================================================
// 타입 정의
// ============================================================

export interface EnhancedDeliveryRecord {
  id: string;
  organization: string;
  productName: string;
  amount: number;
  completedAt: Date;
  category: string;
  keywords: string[];  // 제품 키워드
  specs: string[];     // 규격 정보
}

export interface EnhancedCompanyProfile extends Omit<CompanyProfile, 'deliveryRecords' | 'certifications'> {
  deliveryRecords: EnhancedDeliveryRecord[];
  certifications: CertificationInfo[];
  orgHistory: OrgHistoryRecord[];
}

export interface CertificationInfo {
  type: CertificationType;
  name: string;
  issueDate: Date;
  expiryDate?: Date;
  isValid: boolean;
}

export type CertificationType =
  | 'iso9001' | 'iso14001' | 'iso45001' | 'iso27001'
  | 'patent_invention' | 'patent_utility' | 'patent_design'
  | 'kc' | 'ce' | 'ul' | 'ccc'
  | 'netp' | 'nep' | 'inno_biz' | 'main_biz'
  | 'venture' | 'family_friendly' | 'social_enterprise'
  | 'other';

export interface OrgHistoryRecord {
  organization: string;
  winCount: number;
  totalBidCount: number;
  lastWinDate?: Date;
  totalWinAmount: number;
  relationship: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface QualificationResult {
  // 기본 점수
  deliveryRecord: number;      // 납품실적 (0-25)
  techCapability: number;      // 기술능력 (0-5)
  financialStatus: number;     // 경영상태/신용등급 (0-15)
  priceScore: number;          // 가격점수 (0-50)
  reliability: number;         // 신인도 가감점 (-5 ~ +5)
  total: number;               // 총점

  // 세부 분석
  details: {
    deliveryBreakdown: DeliveryBreakdown;
    techBreakdown: TechBreakdown;
    reliabilityBreakdown: ReliabilityBreakdown;
  };

  // 통과 여부
  passThreshold: number;
  willPass: boolean;
  marginToPass: number;

  // 개선 제안
  recommendations: string[];
}

export interface DeliveryBreakdown {
  identicalRecords: { count: number; amount: number; score: number };
  similarRecords: { count: number; amount: number; score: number };
  relatedRecords: { count: number; amount: number; score: number };
  totalWeightedAmount: number;
  ratio: number;
}

export interface TechBreakdown {
  isoScore: number;
  patentScore: number;
  certificationScore: number;
  staffScore: number;
}

export interface ReliabilityBreakdown {
  penaltyPoints: number;
  bonusPoints: number;
  orgHistoryBonus: number;
  certificationBonus: number;
}

// ============================================================
// 상수 정의
// ============================================================

// 납품실적 매칭 가중치
const DELIVERY_MATCH_WEIGHTS = {
  identical: 1.0,    // 동종물품: 100%
  similar: 0.7,      // 유사물품: 70%
  related: 0.3,      // 관련물품: 30%
  unrelated: 0,      // 무관: 0%
};

// 기술능력 점수표 (총 5점)
const TECH_CAPABILITY_SCORES: Record<CertificationType, number> = {
  // ISO 인증 (최대 1.5점)
  iso9001: 1.0,
  iso14001: 0.3,
  iso45001: 0.2,
  iso27001: 0.3,

  // 특허 (최대 1.5점)
  patent_invention: 0.8,
  patent_utility: 0.4,
  patent_design: 0.3,

  // 제품 인증 (최대 1.0점)
  kc: 0.3,
  ce: 0.3,
  ul: 0.3,
  ccc: 0.2,

  // 기술 인증 (최대 1.0점)
  netp: 0.8,         // 신기술인증
  nep: 0.8,          // 신제품인증
  inno_biz: 0.5,     // 이노비즈
  main_biz: 0.4,     // 메인비즈

  // 기타
  venture: 0.3,
  family_friendly: 0.1,
  social_enterprise: 0.2,
  other: 0.1,
};

// 신용등급별 배점 (물품 적격심사 기준, 총 15점)
const CREDIT_RATING_SCORES: Record<CreditRating, number> = {
  'AAA': 15.0, 'AA+': 14.5, 'AA0': 14.0, 'AA-': 13.5,
  'A+': 13.0, 'A0': 12.5, 'A-': 12.0,
  'BBB+': 11.5, 'BBB0': 11.0, 'BBB-': 10.5,
  'BB+': 10.0, 'BB0': 9.5, 'BB-': 9.0,
  'B+': 8.0, 'B0': 7.0, 'B-': 6.0,
  'CCC': 5.0, 'CC': 4.0, 'C': 3.0, 'D': 1.0,
};

// 발주처 관계 보너스
const ORG_RELATIONSHIP_BONUS = {
  strong: 1.5,    // 최근 3년 3회 이상 낙찰
  moderate: 1.0,  // 최근 3년 1-2회 낙찰
  weak: 0.3,      // 입찰 참여 이력만 있음
  none: 0,
};

// ============================================================
// 핵심 클래스
// ============================================================

export class EnhancedQualificationScorer {
  private bid: BidInfo;
  private company: EnhancedCompanyProfile;
  private proposedBidRate: number;

  constructor(
    bid: BidInfo,
    company: EnhancedCompanyProfile,
    proposedBidRate: number
  ) {
    this.bid = bid;
    this.company = company;
    this.proposedBidRate = proposedBidRate;
  }

  /**
   * 전체 적격심사 점수 계산
   */
  public calculate(): QualificationResult {
    const deliveryResult = this.calculateDeliveryScore();
    const techResult = this.calculateTechScore();
    const creditScore = this.calculateCreditScore();
    const priceScore = this.calculatePriceScore();
    const reliabilityResult = this.calculateReliabilityScore();

    const total =
      deliveryResult.score +
      techResult.score +
      creditScore +
      priceScore +
      reliabilityResult.score;

    const passThreshold = 85;
    const willPass = total >= passThreshold;
    const marginToPass = total - passThreshold;

    // 개선 제안 생성
    const recommendations = this.generateRecommendations({
      delivery: deliveryResult,
      tech: techResult,
      credit: creditScore,
      price: priceScore,
      reliability: reliabilityResult,
      total,
      passThreshold,
    });

    return {
      deliveryRecord: Math.round(deliveryResult.score * 10) / 10,
      techCapability: Math.round(techResult.score * 10) / 10,
      financialStatus: Math.round(creditScore * 10) / 10,
      priceScore: Math.round(priceScore * 10) / 10,
      reliability: Math.round(reliabilityResult.score * 10) / 10,
      total: Math.round(total * 10) / 10,

      details: {
        deliveryBreakdown: deliveryResult.breakdown,
        techBreakdown: techResult.breakdown,
        reliabilityBreakdown: reliabilityResult.breakdown,
      },

      passThreshold,
      willPass,
      marginToPass: Math.round(marginToPass * 10) / 10,

      recommendations,
    };
  }

  /**
   * 납품실적 점수 계산 (정밀화)
   */
  private calculateDeliveryScore(): { score: number; breakdown: DeliveryBreakdown } {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const validRecords = this.company.deliveryRecords.filter(
      r => new Date(r.completedAt) >= fiveYearsAgo
    );

    if (validRecords.length === 0) {
      return {
        score: 0,
        breakdown: {
          identicalRecords: { count: 0, amount: 0, score: 0 },
          similarRecords: { count: 0, amount: 0, score: 0 },
          relatedRecords: { count: 0, amount: 0, score: 0 },
          totalWeightedAmount: 0,
          ratio: 0,
        },
      };
    }

    // 입찰 공고 키워드 추출
    const bidKeywords = this.extractKeywords(this.bid.title);

    // 각 납품실적 분류
    let identicalAmount = 0;
    let identicalCount = 0;
    let similarAmount = 0;
    let similarCount = 0;
    let relatedAmount = 0;
    let relatedCount = 0;

    for (const record of validRecords) {
      const matchType = this.classifyDeliveryRecord(record, bidKeywords);

      if (matchType === 'identical') {
        identicalAmount += record.amount;
        identicalCount++;
      } else if (matchType === 'similar') {
        similarAmount += record.amount;
        similarCount++;
      } else if (matchType === 'related') {
        relatedAmount += record.amount;
        relatedCount++;
      }
    }

    // 가중 금액 계산
    const totalWeightedAmount =
      identicalAmount * DELIVERY_MATCH_WEIGHTS.identical +
      similarAmount * DELIVERY_MATCH_WEIGHTS.similar +
      relatedAmount * DELIVERY_MATCH_WEIGHTS.related;

    const ratio = totalWeightedAmount / this.bid.estimatedPrice;

    // 점수 산정 (최대 25점)
    let score: number;
    if (ratio >= 2.0) score = 25;
    else if (ratio >= 1.5) score = 23;
    else if (ratio >= 1.2) score = 21;
    else if (ratio >= 1.0) score = 19;
    else if (ratio >= 0.8) score = 17;
    else if (ratio >= 0.6) score = 15;
    else if (ratio >= 0.4) score = 12;
    else if (ratio >= 0.2) score = 9;
    else if (ratio >= 0.1) score = 6;
    else score = Math.max(0, ratio * 60);

    return {
      score,
      breakdown: {
        identicalRecords: {
          count: identicalCount,
          amount: identicalAmount,
          score: identicalAmount * DELIVERY_MATCH_WEIGHTS.identical / this.bid.estimatedPrice * 25,
        },
        similarRecords: {
          count: similarCount,
          amount: similarAmount,
          score: similarAmount * DELIVERY_MATCH_WEIGHTS.similar / this.bid.estimatedPrice * 25,
        },
        relatedRecords: {
          count: relatedCount,
          amount: relatedAmount,
          score: relatedAmount * DELIVERY_MATCH_WEIGHTS.related / this.bid.estimatedPrice * 25,
        },
        totalWeightedAmount,
        ratio,
      },
    };
  }

  /**
   * 납품실적 분류 (동종/유사/관련)
   */
  private classifyDeliveryRecord(
    record: EnhancedDeliveryRecord,
    bidKeywords: string[]
  ): 'identical' | 'similar' | 'related' | 'unrelated' {
    const recordKeywords = [...record.keywords, ...this.extractKeywords(record.productName)];

    // 키워드 매칭 점수 계산
    let matchCount = 0;
    for (const bidKw of bidKeywords) {
      for (const recKw of recordKeywords) {
        if (this.isKeywordMatch(bidKw, recKw)) {
          matchCount++;
          break;
        }
      }
    }

    const matchRatio = bidKeywords.length > 0 ? matchCount / bidKeywords.length : 0;

    if (matchRatio >= 0.7) return 'identical';
    if (matchRatio >= 0.4) return 'similar';
    if (matchRatio >= 0.2) return 'related';
    return 'unrelated';
  }

  /**
   * 키워드 매칭 확인
   */
  private isKeywordMatch(kw1: string, kw2: string): boolean {
    const n1 = this.normalizeKeyword(kw1);
    const n2 = this.normalizeKeyword(kw2);

    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // 동의어 체크
    const synonymGroups = [
      ['유량계', 'flow meter', 'flowmeter'],
      ['초음파', 'ultrasonic', 'ultra sonic'],
      ['전자', 'electromagnetic', 'mag'],
      ['열량계', 'heat meter', 'btu meter'],
      ['수도', '상수도', 'water supply'],
    ];

    for (const group of synonymGroups) {
      const n1InGroup = group.some(s => n1.includes(s.toLowerCase()));
      const n2InGroup = group.some(s => n2.includes(s.toLowerCase()));
      if (n1InGroup && n2InGroup) return true;
    }

    return false;
  }

  /**
   * 키워드 정규화
   */
  private normalizeKeyword(keyword: string): string {
    return keyword
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '')
      .trim();
  }

  /**
   * 텍스트에서 키워드 추출 (불용어 필터링 포함)
   */
  private extractKeywords(text: string): string[] {
    // 불용어 목록 (입찰 공고에서 자주 나오는 일반 단어)
    const stopWords = new Set([
      // 동작
      '구매', '설치', '공급', '납품', '교체', '유지', '보수', '운영',
      '관리', '시공', '제작', '용역', '사업', '추진', '개발',
      // 시간
      '년', '월', '일', '분기', '반기', '상반기', '하반기',
      // 일반
      '외', '및', '등', '건', '차', '차분', '물량', '일괄', '일체',
      '단가', '계약', '입찰', '조달', '긴급', '추가', '신규',
    ]);

    const keywords: string[] = [];

    // 한글 키워드
    const koreanPattern = /[가-힣]+/g;
    const koreanMatches = text.match(koreanPattern) || [];
    for (const k of koreanMatches) {
      if (k.length >= 2 && !stopWords.has(k)) {
        keywords.push(k);
      }
    }

    // 영문 키워드
    const englishPattern = /[a-zA-Z]+/g;
    const englishMatches = text.match(englishPattern) || [];
    keywords.push(...englishMatches.filter(k => k.length >= 3));

    return [...new Set(keywords)];
  }

  /**
   * 기술능력 점수 계산 (세분화)
   */
  private calculateTechScore(): { score: number; breakdown: TechBreakdown } {
    const validCerts = this.company.certifications.filter(c => c.isValid);

    let isoScore = 0;
    let patentScore = 0;
    let certificationScore = 0;
    let staffScore = 0;

    // ISO 점수 (최대 1.5점)
    for (const cert of validCerts) {
      if (cert.type.startsWith('iso')) {
        isoScore += TECH_CAPABILITY_SCORES[cert.type] || 0;
      }
    }
    isoScore = Math.min(1.5, isoScore);

    // 특허 점수 (최대 1.5점)
    for (const cert of validCerts) {
      if (cert.type.startsWith('patent_')) {
        patentScore += TECH_CAPABILITY_SCORES[cert.type] || 0;
      }
    }
    patentScore = Math.min(1.5, patentScore);

    // 인증 점수 (최대 1.0점)
    for (const cert of validCerts) {
      if (['kc', 'ce', 'ul', 'ccc', 'netp', 'nep', 'inno_biz', 'main_biz'].includes(cert.type)) {
        certificationScore += TECH_CAPABILITY_SCORES[cert.type] || 0;
      }
    }
    certificationScore = Math.min(1.0, certificationScore);

    // 기술인력 점수 (최대 1.0점)
    const techStaff = this.company.techStaffCount;
    if (techStaff >= 10) staffScore = 1.0;
    else if (techStaff >= 5) staffScore = 0.7;
    else if (techStaff >= 3) staffScore = 0.5;
    else if (techStaff >= 1) staffScore = 0.3;

    const totalScore = isoScore + patentScore + certificationScore + staffScore;

    return {
      score: Math.min(5, totalScore),
      breakdown: {
        isoScore,
        patentScore,
        certificationScore,
        staffScore,
      },
    };
  }

  /**
   * 신용등급 점수 계산
   */
  private calculateCreditScore(): number {
    return CREDIT_RATING_SCORES[this.company.creditRating] || 11.0;
  }

  /**
   * 가격점수 계산
   * 공식: 50 - 20 × |88/100 - 입찰가격/예정가격| × 100
   */
  private calculatePriceScore(): number {
    // 적격심사 가격점수 계산 (실제 나라장터 기준)
    // 공식: 가격점수 = 50 × (하한가 / 투찰가)
    // - 하한가(84.245%)로 입찰 시 최고 점수 (50점)
    // - 높은 가격(100%)으로 입찰 시 낮은 점수 (~42점)
    // - 하한가 미만 시 0점 (무효)
    const floorRate = 0.84245;

    // 하한율 미만이면 0점
    if (this.proposedBidRate < floorRate) {
      return 0;
    }

    // 가격점수 = 50 × (하한가율 / 투찰률)
    // 예: 85%로 입찰 시 = 50 × (0.84245 / 0.85) = 49.6점
    // 예: 88%로 입찰 시 = 50 × (0.84245 / 0.88) = 47.9점
    const score = 50 * (floorRate / this.proposedBidRate);

    return Math.max(0, Math.min(50, Math.round(score * 10) / 10));
  }

  /**
   * 신인도 가감점 계산 (정밀화)
   */
  private calculateReliabilityScore(): { score: number; breakdown: ReliabilityBreakdown } {
    let penaltyPoints = 0;
    let bonusPoints = 0;
    let orgHistoryBonus = 0;
    let certificationBonus = 0;

    // 1. 감점 요소 (최근 2년 제재 이력)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const recentPenalties = this.company.penalties.filter(
      p => new Date(p.date) >= twoYearsAgo
    );

    for (const penalty of recentPenalties) {
      penaltyPoints += penalty.points;
    }

    // 2. 발주처 거래 이력 보너스
    const orgHistory = this.company.orgHistory.find(h =>
      this.bid.organization.includes(h.organization) ||
      h.organization.includes(this.bid.organization)
    );

    if (orgHistory) {
      orgHistoryBonus = ORG_RELATIONSHIP_BONUS[orgHistory.relationship];
    }

    // 3. 우수 인증 보너스
    const validCerts = this.company.certifications.filter(c => c.isValid);

    if (validCerts.some(c => c.type === 'inno_biz')) {
      certificationBonus += 0.5;
    }
    if (validCerts.some(c => c.type === 'main_biz')) {
      certificationBonus += 0.3;
    }
    if (validCerts.some(c => c.type === 'venture')) {
      certificationBonus += 0.2;
    }
    if (validCerts.some(c => c.type === 'social_enterprise')) {
      certificationBonus += 0.3;
    }

    bonusPoints = orgHistoryBonus + certificationBonus;

    const totalScore = Math.max(-5, Math.min(5, bonusPoints - penaltyPoints));

    return {
      score: totalScore,
      breakdown: {
        penaltyPoints,
        bonusPoints,
        orgHistoryBonus,
        certificationBonus,
      },
    };
  }

  /**
   * 개선 제안 생성
   */
  private generateRecommendations(scores: {
    delivery: { score: number; breakdown: DeliveryBreakdown };
    tech: { score: number; breakdown: TechBreakdown };
    credit: number;
    price: number;
    reliability: { score: number; breakdown: ReliabilityBreakdown };
    total: number;
    passThreshold: number;
  }): string[] {
    const recommendations: string[] = [];

    // 통과 못할 경우 부족 점수 안내
    if (scores.total < scores.passThreshold) {
      const gap = scores.passThreshold - scores.total;
      recommendations.push(`통과까지 ${gap.toFixed(1)}점 부족`);
    }

    // 납품실적 개선
    if (scores.delivery.score < 15) {
      recommendations.push(
        '동종물품 납품실적 확보 필요 (현재 ' +
        (scores.delivery.breakdown.ratio * 100).toFixed(0) + '% → 목표 100%+)'
      );
    }

    // 기술능력 개선
    if (scores.tech.score < 3) {
      const { breakdown } = scores.tech;
      if (breakdown.isoScore < 1) {
        recommendations.push('ISO 9001 인증 취득 권장 (+1.0점)');
      }
      if (breakdown.patentScore < 0.5) {
        recommendations.push('특허 등록 권장 (발명 +0.8점, 실용신안 +0.4점)');
      }
    }

    // 가격점수 개선
    if (scores.price < 40) {
      const optimalRate = 0.88;
      recommendations.push(
        `투찰률 ${(this.proposedBidRate * 100).toFixed(1)}% → ${(optimalRate * 100).toFixed(1)}% 조정 시 +${(40 - scores.price).toFixed(1)}점`
      );
    }

    // 신용등급 개선
    if (scores.credit < 12) {
      recommendations.push('신용등급 향상 권장 (현재 ' + this.company.creditRating + ')');
    }

    return recommendations;
  }
}

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 간편 적격심사 점수 계산 (기존 인터페이스 호환)
 */
export function calculateEnhancedQualificationScore(
  bid: BidInfo,
  company: EnhancedCompanyProfile,
  proposedBidRate: number
): QualificationResult {
  const scorer = new EnhancedQualificationScorer(bid, company, proposedBidRate);
  return scorer.calculate();
}

/**
 * 기본 CompanyProfile을 Enhanced로 변환
 */
export function toEnhancedProfile(
  profile: CompanyProfile,
  deliveryKeywords?: Record<number, string[]>  // 인덱스별 키워드 맵 (레거시 호환)
): EnhancedCompanyProfile {
  return {
    ...profile,
    deliveryRecords: profile.deliveryRecords.map((r, idx) => ({
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      organization: r.organization,
      productName: r.productName,
      amount: r.amount,
      completedAt: r.completedAt,
      category: r.category,
      // 우선순위: 1) DeliveryRecord.keywords 2) deliveryKeywords 맵 3) 제품명에서 추출
      keywords: r.keywords?.length ? r.keywords : (deliveryKeywords?.[idx] || extractProductKeywords(r.productName)),
      specs: [],
    })),
    certifications: profile.certifications.map(c => ({
      type: detectCertificationType(c),
      name: c,
      issueDate: new Date(),
      isValid: true,
    })),
    orgHistory: [],
  };
}

/**
 * 인증 유형 자동 감지
 */
function detectCertificationType(certName: string): CertificationType {
  const lower = certName.toLowerCase().replace(/[\s_-]/g, '');

  // 직접 타입명 매칭 (우선)
  const directTypes: CertificationType[] = [
    'iso9001', 'iso14001', 'iso45001', 'iso27001',
    'patent_invention', 'patent_utility', 'patent_design',
    'kc', 'ce', 'ul', 'ccc',
    'netp', 'nep', 'inno_biz', 'main_biz', 'venture',
  ];
  for (const t of directTypes) {
    if (lower === t.replace('_', '') || certName === t) return t;
  }

  // 자연어 패턴 매칭
  if (lower.includes('iso9001') || lower.includes('iso 9001')) return 'iso9001';
  if (lower.includes('iso14001') || lower.includes('iso 14001')) return 'iso14001';
  if (lower.includes('iso45001') || lower.includes('iso 45001')) return 'iso45001';
  if (lower.includes('iso27001') || lower.includes('iso 27001')) return 'iso27001';

  if (lower.includes('발명특허') || lower.includes('inventionpatent') || lower.includes('patentinvention')) return 'patent_invention';
  if (lower.includes('실용신안') || lower.includes('patentutility') || lower.includes('utilitypatent')) return 'patent_utility';
  if (lower.includes('디자인특허') || lower.includes('patentdesign') || lower.includes('designpatent')) return 'patent_design';
  if (lower.includes('특허')) return 'patent_invention';

  if (lower.includes('kc') || lower.includes('케이씨')) return 'kc';
  if (lower.includes('ce') || lower.includes('씨이')) return 'ce';
  if (lower.includes('ul')) return 'ul';

  if (lower.includes('신기술') || lower.includes('net') || lower.includes('netp')) return 'netp';
  if (lower.includes('신제품') || lower.includes('nep')) return 'nep';
  if (lower.includes('이노비즈') || lower.includes('innobiz')) return 'inno_biz';
  if (lower.includes('메인비즈') || lower.includes('mainbiz')) return 'main_biz';
  if (lower.includes('벤처')) return 'venture';

  return 'other';
}

/**
 * 제품명에서 키워드 추출
 * - 한글: 2글자 이상
 * - 영문: 3글자 이상
 * - 복합어 분리 (초음파유량계 → 초음파, 유량계)
 */
export function extractProductKeywords(productName: string): string[] {
  const keywords: string[] = [];

  // 복합어 패턴 (주요 제품 키워드)
  const compoundPatterns = [
    { pattern: /초음파유량계/g, parts: ['초음파', '유량계'] },
    { pattern: /전자유량계/g, parts: ['전자', '유량계'] },
    { pattern: /전자식유량계/g, parts: ['전자식', '유량계'] },
    { pattern: /비만관유량계/g, parts: ['비만관', '유량계'] },
    { pattern: /열량계/g, parts: ['열량계'] },
    { pattern: /수질측정/g, parts: ['수질', '측정'] },
    { pattern: /레벨센서/g, parts: ['레벨', '센서'] },
    { pattern: /수위계/g, parts: ['수위계'] },
    { pattern: /압력계/g, parts: ['압력계'] },
  ];

  // 복합어 분리
  let processed = productName;
  for (const { pattern, parts } of compoundPatterns) {
    if (pattern.test(productName)) {
      keywords.push(...parts);
      processed = processed.replace(pattern, ' ');
    }
  }

  // 한글 키워드 (2글자 이상)
  const koreanPattern = /[가-힣]+/g;
  const koreanMatches = processed.match(koreanPattern) || [];
  for (const match of koreanMatches) {
    if (match.length >= 2 && !keywords.includes(match)) {
      keywords.push(match);
    }
  }

  // 영문 키워드 (3글자 이상)
  const englishPattern = /[a-zA-Z]+/g;
  const englishMatches = processed.match(englishPattern) || [];
  for (const match of englishMatches) {
    if (match.length >= 3 && !keywords.includes(match.toLowerCase())) {
      keywords.push(match.toLowerCase());
    }
  }

  return [...new Set(keywords)];
}
