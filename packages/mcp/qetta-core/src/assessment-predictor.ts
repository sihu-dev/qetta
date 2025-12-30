/**
 * Qetta 사정률 예측 시스템 v2.1
 *
 * 기관별/시계열/예산규모별 사정률 패턴 분석
 */

// ============================================================
// 타입 정의
// ============================================================

export interface AssessmentPattern {
  organizationName: string;
  organizationType: OrgType;

  // 통계 데이터
  sampleCount: number;
  meanRate: number;
  stdDeviation: number;
  minRate: number;
  maxRate: number;

  // 분포 히스토그램
  distribution: Record<string, number>;  // { "99.5-99.6": 5, "99.6-99.7": 12, ... }

  // 시계열 패턴
  monthlyPattern: Record<number, number>;    // { 1: 1.001, 2: 0.998, ... }
  quarterlyPattern: Record<string, number>;  // { Q1: 0.999, Q4: 1.002, ... }

  // 예산 규모별 패턴
  priceRangePatterns: Record<PriceRange, number>;

  updatedAt: Date;
}

export interface AssessmentPrediction {
  rate: number;
  std: number;
  confidence: number;
  range: {
    low: number;
    high: number;
    p25: number;
    p75: number;
  };
  factors: {
    base: number;
    seasonal: number;
    priceAdjust: number;
    historical: number;
  };
  source: 'historical' | 'pattern' | 'default';
}

export type OrgType = 'central' | 'local' | 'public_corp' | 'education' | 'military';
export type PriceRange = 'under_50m' | '50m_100m' | '100m_500m' | '500m_1b' | '1b_5b' | 'over_5b';

// ============================================================
// 기본 패턴 데이터 (초기 시드)
// ============================================================

const DEFAULT_ORG_PATTERNS: Record<OrgType, Partial<AssessmentPattern>> = {
  central: {
    meanRate: 1.0002,
    stdDeviation: 0.0012,
    monthlyPattern: {
      1: 1.001, 2: 1.000, 3: 0.999,
      4: 1.000, 5: 1.001, 6: 0.999,
      7: 1.000, 8: 1.000, 9: 1.001,
      10: 1.000, 11: 0.999, 12: 1.002,
    },
    quarterlyPattern: { Q1: 1.000, Q2: 0.999, Q3: 1.000, Q4: 1.001 },
  },
  local: {
    meanRate: 1.0008,
    stdDeviation: 0.0018,
    monthlyPattern: {
      1: 1.001, 2: 1.000, 3: 1.002,
      4: 0.999, 5: 1.000, 6: 1.001,
      7: 0.999, 8: 1.000, 9: 1.001,
      10: 1.000, 11: 1.001, 12: 1.003,
    },
    quarterlyPattern: { Q1: 1.001, Q2: 0.999, Q3: 1.000, Q4: 1.002 },
  },
  public_corp: {
    meanRate: 0.9998,
    stdDeviation: 0.0014,
    monthlyPattern: {
      1: 1.000, 2: 0.999, 3: 1.000,
      4: 1.000, 5: 1.001, 6: 0.999,
      7: 1.000, 8: 0.999, 9: 1.000,
      10: 1.001, 11: 1.000, 12: 1.001,
    },
    quarterlyPattern: { Q1: 1.000, Q2: 1.000, Q3: 0.999, Q4: 1.001 },
  },
  education: {
    meanRate: 1.0005,
    stdDeviation: 0.0020,
    monthlyPattern: {
      1: 0.999, 2: 1.002, 3: 1.001,
      4: 1.000, 5: 1.000, 6: 1.001,
      7: 0.998, 8: 0.999, 9: 1.002,
      10: 1.001, 11: 1.000, 12: 1.002,
    },
    quarterlyPattern: { Q1: 1.001, Q2: 1.000, Q3: 0.999, Q4: 1.002 },
  },
  military: {
    meanRate: 1.0000,
    stdDeviation: 0.0010,
    monthlyPattern: {
      1: 1.000, 2: 1.000, 3: 1.000,
      4: 1.000, 5: 1.000, 6: 1.000,
      7: 1.000, 8: 1.000, 9: 1.000,
      10: 1.000, 11: 1.000, 12: 1.001,
    },
    quarterlyPattern: { Q1: 1.000, Q2: 1.000, Q3: 1.000, Q4: 1.001 },
  },
};

const PRICE_RANGE_FACTORS: Record<PriceRange, number> = {
  under_50m: 1.002,    // 5천만 미만: 약간 높음
  '50m_100m': 1.001,   // 5천만~1억
  '100m_500m': 1.000,  // 1억~5억: 기준
  '500m_1b': 0.999,    // 5억~10억
  '1b_5b': 0.998,      // 10억~50억
  over_5b: 0.997,      // 50억 이상: 약간 낮음
};

// 특정 기관별 패턴 (실제 데이터 기반 튜닝)
const KNOWN_ORG_PATTERNS: Record<string, Partial<AssessmentPattern>> = {
  '조달청': {
    organizationType: 'central',
    meanRate: 1.0001,
    stdDeviation: 0.0010,
  },
  '서울시': {
    organizationType: 'local',
    meanRate: 1.0012,
    stdDeviation: 0.0015,
  },
  '한국수자원공사': {
    organizationType: 'public_corp',
    meanRate: 0.9995,
    stdDeviation: 0.0012,
  },
  '한국지역난방공사': {
    organizationType: 'public_corp',
    meanRate: 1.0003,
    stdDeviation: 0.0014,
  },
  '한국농어촌공사': {
    organizationType: 'public_corp',
    meanRate: 1.0000,
    stdDeviation: 0.0015,
  },
};

// ============================================================
// 핵심 클래스
// ============================================================

export class AssessmentRatePredictor {
  private patterns: Map<string, AssessmentPattern> = new Map();
  private historicalRates: Map<string, number[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  /**
   * 기본 패턴 초기화
   */
  private initializePatterns(): void {
    for (const [orgName, pattern] of Object.entries(KNOWN_ORG_PATTERNS)) {
      const orgType = pattern.organizationType || 'local';
      const defaultPattern = DEFAULT_ORG_PATTERNS[orgType];

      this.patterns.set(orgName, {
        organizationName: orgName,
        organizationType: orgType,
        sampleCount: 0,
        meanRate: pattern.meanRate || defaultPattern.meanRate || 1.0,
        stdDeviation: pattern.stdDeviation || defaultPattern.stdDeviation || 0.0015,
        minRate: 0.97,
        maxRate: 1.03,
        distribution: {},
        monthlyPattern: defaultPattern.monthlyPattern || {},
        quarterlyPattern: defaultPattern.quarterlyPattern || {},
        priceRangePatterns: {} as Record<PriceRange, number>,
        updatedAt: new Date(),
      });
    }
  }

  /**
   * 사정률 예측
   */
  public predict(
    organization: string,
    estimatedPrice: number,
    bidDate: Date = new Date()
  ): AssessmentPrediction {
    // 1. 기관 패턴 조회
    const pattern = this.findPattern(organization);
    const orgType = this.detectOrgType(organization);

    // 2. 기본 통계값
    let baseMean: number;
    let baseStd: number;
    let source: AssessmentPrediction['source'];

    if (pattern) {
      baseMean = pattern.meanRate;
      baseStd = pattern.stdDeviation;
      source = pattern.sampleCount > 10 ? 'historical' : 'pattern';
    } else {
      const defaultPattern = DEFAULT_ORG_PATTERNS[orgType];
      baseMean = defaultPattern.meanRate || 1.0;
      baseStd = defaultPattern.stdDeviation || 0.0015;
      source = 'default';
    }

    // 3. 시계열 보정
    const month = bidDate.getMonth() + 1;
    const quarter = `Q${Math.ceil(month / 3)}`;
    const monthlyFactor = pattern?.monthlyPattern?.[month] ||
      DEFAULT_ORG_PATTERNS[orgType]?.monthlyPattern?.[month] || 1.0;
    const quarterlyFactor = pattern?.quarterlyPattern?.[quarter] ||
      DEFAULT_ORG_PATTERNS[orgType]?.quarterlyPattern?.[quarter] || 1.0;
    const seasonalFactor = (monthlyFactor + quarterlyFactor) / 2;

    // 4. 예산 규모 보정
    const priceRange = this.getPriceRange(estimatedPrice);
    const priceFactor = PRICE_RANGE_FACTORS[priceRange];

    // 5. 최종 예측값 계산
    const adjustedMean = baseMean * seasonalFactor * priceFactor;

    // 6. 신뢰도 계산
    const confidence = this.calculateConfidence(pattern?.sampleCount || 0, source);

    // 7. 분위수 계산
    const p25 = adjustedMean - 0.674 * baseStd;
    const p75 = adjustedMean + 0.674 * baseStd;

    return {
      rate: Math.round(adjustedMean * 10000) / 10000,
      std: Math.round(baseStd * 10000) / 10000,
      confidence,
      range: {
        low: Math.max(0.97, adjustedMean - 2 * baseStd),
        high: Math.min(1.03, adjustedMean + 2 * baseStd),
        p25: Math.round(p25 * 10000) / 10000,
        p75: Math.round(p75 * 10000) / 10000,
      },
      factors: {
        base: baseMean,
        seasonal: seasonalFactor,
        priceAdjust: priceFactor,
        historical: pattern?.sampleCount ? adjustedMean / baseMean : 1.0,
      },
      source,
    };
  }

  /**
   * 과거 데이터로 패턴 학습
   */
  public learn(
    organization: string,
    actualRate: number,
    _estimatedPrice: number,  // 향후 가격대별 패턴 분석용
    bidDate: Date
  ): void {
    const orgKey = this.normalizeOrgName(organization);

    // 히스토리 추가
    if (!this.historicalRates.has(orgKey)) {
      this.historicalRates.set(orgKey, []);
    }
    this.historicalRates.get(orgKey)!.push(actualRate);

    // 패턴 업데이트
    const history = this.historicalRates.get(orgKey)!;
    const pattern = this.patterns.get(orgKey) || this.createDefaultPattern(organization);

    // 통계 재계산
    pattern.sampleCount = history.length;
    pattern.meanRate = history.reduce((a, b) => a + b, 0) / history.length;
    pattern.stdDeviation = Math.sqrt(
      history.reduce((sum, r) => sum + Math.pow(r - pattern.meanRate, 2), 0) / history.length
    );
    pattern.minRate = Math.min(...history);
    pattern.maxRate = Math.max(...history);

    // 월별 패턴 업데이트 (간소화)
    const month = bidDate.getMonth() + 1;
    if (!pattern.monthlyPattern[month]) {
      pattern.monthlyPattern[month] = actualRate;
    } else {
      pattern.monthlyPattern[month] = (pattern.monthlyPattern[month] + actualRate) / 2;
    }

    pattern.updatedAt = new Date();
    this.patterns.set(orgKey, pattern);
  }

  /**
   * 패턴 찾기
   */
  private findPattern(organization: string): AssessmentPattern | undefined {
    const normalized = this.normalizeOrgName(organization);

    // 정확 매칭
    if (this.patterns.has(normalized)) {
      return this.patterns.get(normalized);
    }

    // 부분 매칭
    for (const [key, pattern] of this.patterns) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return pattern;
      }
    }

    return undefined;
  }

  /**
   * 기관 유형 감지
   */
  private detectOrgType(organization: string): OrgType {
    const lower = organization.toLowerCase();

    if (lower.includes('조달청') || lower.includes('관세청') || lower.includes('국세청')) {
      return 'central';
    }
    if (lower.includes('교육') || lower.includes('학교') || lower.includes('대학')) {
      return 'education';
    }
    if (lower.includes('군') || lower.includes('국방') || lower.includes('방위')) {
      return 'military';
    }
    if (lower.includes('공사') || lower.includes('공단') || lower.includes('진흥원')) {
      return 'public_corp';
    }

    // 지자체 키워드
    const localKeywords = ['시', '군', '구', '도', '특별시', '광역시', '도청', '시청', '군청', '구청'];
    if (localKeywords.some(k => lower.includes(k))) {
      return 'local';
    }

    return 'local';  // 기본값
  }

  /**
   * 예산 구간 판정
   */
  private getPriceRange(price: number): PriceRange {
    if (price < 50000000) return 'under_50m';
    if (price < 100000000) return '50m_100m';
    if (price < 500000000) return '100m_500m';
    if (price < 1000000000) return '500m_1b';
    if (price < 5000000000) return '1b_5b';
    return 'over_5b';
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidence(sampleCount: number, source: string): number {
    if (source === 'default') return 0.5;

    // 샘플 수에 따른 신뢰도
    if (sampleCount >= 100) return 0.95;
    if (sampleCount >= 50) return 0.85;
    if (sampleCount >= 20) return 0.75;
    if (sampleCount >= 10) return 0.65;
    if (sampleCount >= 5) return 0.55;
    return 0.5;
  }

  /**
   * 기관명 정규화
   */
  private normalizeOrgName(organization: string): string {
    return organization
      .replace(/\s+/g, '')
      .replace(/[()]/g, '')
      .toLowerCase();
  }

  /**
   * 기본 패턴 생성
   */
  private createDefaultPattern(organization: string): AssessmentPattern {
    const orgType = this.detectOrgType(organization);
    const defaultPattern = DEFAULT_ORG_PATTERNS[orgType];

    return {
      organizationName: organization,
      organizationType: orgType,
      sampleCount: 0,
      meanRate: defaultPattern.meanRate || 1.0,
      stdDeviation: defaultPattern.stdDeviation || 0.0015,
      minRate: 0.97,
      maxRate: 1.03,
      distribution: {},
      monthlyPattern: defaultPattern.monthlyPattern || {},
      quarterlyPattern: defaultPattern.quarterlyPattern || {},
      priceRangePatterns: {} as Record<PriceRange, number>,
      updatedAt: new Date(),
    };
  }

  /**
   * 패턴 내보내기 (저장용)
   */
  public exportPatterns(): AssessmentPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * 패턴 가져오기 (로드용)
   */
  public importPatterns(patterns: AssessmentPattern[]): void {
    for (const pattern of patterns) {
      this.patterns.set(this.normalizeOrgName(pattern.organizationName), pattern);
    }
  }
}

// ============================================================
// 싱글톤 인스턴스
// ============================================================

let predictorInstance: AssessmentRatePredictor | null = null;

export function getAssessmentPredictor(): AssessmentRatePredictor {
  if (!predictorInstance) {
    predictorInstance = new AssessmentRatePredictor();
  }
  return predictorInstance;
}
