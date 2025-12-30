/**
 * BIDFLOW 경쟁률 예측 시스템 v2.1
 *
 * 카테고리/발주처/시즌/예산규모별 경쟁률 분석
 */

// ============================================================
// 타입 정의
// ============================================================

export interface CompetitionPrediction {
  expectedCompetitors: number;
  confidence: number;
  distribution: {
    min: number;
    likely: number;
    max: number;
    p10: number;
    p90: number;
  };
  factors: CompetitionFactors;
  competitionLevel: 'low' | 'medium' | 'high' | 'very_high';
  bidDensity: number;  // 예상 투찰 밀집도 (하한율 근처 집중도)
}

export interface CompetitionFactors {
  category: number;
  organization: number;
  seasonality: number;
  priceRange: number;
  dayOfWeek: number;
  urgency: number;
}

export type ProductCategory =
  | 'flow_meter'        // 유량계
  | 'heat_meter'        // 열량계
  | 'water_quality'     // 수질측정기
  | 'pressure_gauge'    // 압력계
  | 'level_sensor'      // 레벨센서
  | 'valve'             // 밸브
  | 'pump'              // 펌프
  | 'pipe_fitting'      // 배관자재
  | 'electrical'        // 전기설비
  | 'construction'      // 건설
  | 'it_software'       // IT/소프트웨어
  | 'general_goods'     // 일반물품
  | 'other';

// ============================================================
// 기본 경쟁률 데이터
// ============================================================

// 카테고리별 기본 경쟁업체 수
const CATEGORY_BASE_COMPETITORS: Record<ProductCategory, number> = {
  flow_meter: 12,
  heat_meter: 8,
  water_quality: 10,
  pressure_gauge: 15,
  level_sensor: 11,
  valve: 18,
  pump: 16,
  pipe_fitting: 22,
  electrical: 20,
  construction: 25,
  it_software: 14,
  general_goods: 18,
  other: 15,
};

// 발주처별 인기도 (경쟁률 승수)
const ORG_POPULARITY: Record<string, number> = {
  '조달청': 1.3,
  '서울시': 1.4,
  '한국수자원공사': 1.2,
  '한국지역난방공사': 1.1,
  '한국농어촌공사': 1.0,
  '한국환경공단': 1.1,
  '한국도로공사': 1.2,
  '한국철도공사': 1.2,
  '인천국제공항공사': 1.3,
  // 기본값
  default_central: 1.2,
  default_local: 1.0,
  default_public: 1.1,
};

// 분기별 계절성 (결산기 영향)
const QUARTERLY_SEASONALITY: Record<string, number> = {
  Q1: 0.95,  // 1분기: 연초 예산 집행 시작, 경쟁 약간 낮음
  Q2: 1.00,  // 2분기: 정상
  Q3: 1.05,  // 3분기: 하반기 시작, 경쟁 약간 높음
  Q4: 0.90,  // 4분기: 결산기 급한 발주, 경쟁 낮음
};

// 월별 세부 계절성
const MONTHLY_SEASONALITY: Record<number, number> = {
  1: 0.90,   // 1월: 새해 시작, 경쟁 낮음
  2: 0.95,   // 2월: 연초 예산 집행
  3: 1.00,   // 3월: 정상화
  4: 1.00,   // 4월: 정상
  5: 1.00,   // 5월: 정상
  6: 1.05,   // 6월: 상반기 마감, 경쟁 약간 높음
  7: 1.00,   // 7월: 하반기 시작
  8: 0.95,   // 8월: 휴가철
  9: 1.05,   // 9월: 하반기 본격 시작
  10: 1.10,  // 10월: 예산 소진 시작, 경쟁 높음
  11: 1.00,  // 11월: 정상
  12: 0.85,  // 12월: 결산기, 급한 발주, 경쟁 낮음
};

// 예산 규모별 경쟁률 승수
const PRICE_RANGE_MULTIPLIERS: Record<string, number> = {
  under_50m: 0.7,      // 5천만 미만: 소규모, 경쟁 낮음
  '50m_100m': 0.85,    // 5천만~1억
  '100m_500m': 1.0,    // 1억~5억: 기준
  '500m_1b': 1.15,     // 5억~10억: 경쟁 높음
  '1b_5b': 1.3,        // 10억~50억: 대형, 경쟁 매우 높음
  over_5b: 1.5,        // 50억 이상: 초대형
};

// 요일별 영향 (마감일 기준)
const DAY_OF_WEEK_FACTORS: Record<number, number> = {
  0: 1.05,  // 일요일 마감: 주말 포함, 경쟁 약간 높음
  1: 1.0,   // 월요일: 정상
  2: 1.0,   // 화요일: 정상
  3: 1.0,   // 수요일: 정상
  4: 0.95,  // 목요일: 주말 전, 약간 낮음
  5: 0.90,  // 금요일: 주말 전, 낮음
  6: 1.00,  // 토요일: 정상
};

// ============================================================
// 핵심 클래스
// ============================================================

export class CompetitionPredictor {
  /**
   * 경쟁률 예측
   */
  public predict(
    category: ProductCategory | string,
    organization: string,
    estimatedPrice: number,
    deadline: Date,
    isUrgent: boolean = false
  ): CompetitionPrediction {
    // 1. 카테고리 기본값
    const normalizedCategory = this.normalizeCategory(category);
    const baseCompetitors = CATEGORY_BASE_COMPETITORS[normalizedCategory];

    // 2. 발주처 인기도
    const orgFactor = this.getOrgPopularity(organization);

    // 3. 계절성 (월/분기)
    const month = deadline.getMonth() + 1;
    const quarter = `Q${Math.ceil(month / 3)}`;
    const monthlyFactor = MONTHLY_SEASONALITY[month] || 1.0;
    const quarterlyFactor = QUARTERLY_SEASONALITY[quarter] || 1.0;
    const seasonalFactor = (monthlyFactor + quarterlyFactor) / 2;

    // 4. 예산 규모
    const priceRange = this.getPriceRange(estimatedPrice);
    const priceFactor = PRICE_RANGE_MULTIPLIERS[priceRange] || 1.0;

    // 5. 요일
    const dayOfWeek = deadline.getDay();
    const dayFactor = DAY_OF_WEEK_FACTORS[dayOfWeek] || 1.0;

    // 6. 긴급 여부
    const urgencyFactor = isUrgent ? 0.8 : 1.0;

    // 7. 최종 예상 경쟁업체 수
    const rawExpected = baseCompetitors * orgFactor * seasonalFactor *
      priceFactor * dayFactor * urgencyFactor;
    const expectedCompetitors = Math.round(Math.max(3, rawExpected));

    // 8. 분포 계산
    const stdDev = expectedCompetitors * 0.25;
    const distribution = {
      min: Math.max(2, Math.round(expectedCompetitors - 2 * stdDev)),
      likely: expectedCompetitors,
      max: Math.round(expectedCompetitors + 2 * stdDev),
      p10: Math.max(3, Math.round(expectedCompetitors - 1.28 * stdDev)),
      p90: Math.round(expectedCompetitors + 1.28 * stdDev),
    };

    // 9. 경쟁 수준 판정
    let competitionLevel: CompetitionPrediction['competitionLevel'];
    if (expectedCompetitors >= 25) competitionLevel = 'very_high';
    else if (expectedCompetitors >= 15) competitionLevel = 'high';
    else if (expectedCompetitors >= 8) competitionLevel = 'medium';
    else competitionLevel = 'low';

    // 10. 투찰 밀집도 계산 (경쟁이 치열할수록 하한가 근처 집중)
    const bidDensity = Math.min(0.95, 0.5 + (expectedCompetitors / 50));

    // 11. 신뢰도 계산
    const confidence = this.calculateConfidence(normalizedCategory, organization);

    return {
      expectedCompetitors,
      confidence,
      distribution,
      factors: {
        category: baseCompetitors,
        organization: orgFactor,
        seasonality: seasonalFactor,
        priceRange: priceFactor,
        dayOfWeek: dayFactor,
        urgency: urgencyFactor,
      },
      competitionLevel,
      bidDensity,
    };
  }

  /**
   * 카테고리 정규화
   */
  private normalizeCategory(category: string): ProductCategory {
    const lower = category.toLowerCase();

    // 유량계
    if (lower.includes('유량계') || lower.includes('flow meter') || lower.includes('flowmeter')) {
      return 'flow_meter';
    }

    // 열량계
    if (lower.includes('열량계') || lower.includes('heat meter') || lower.includes('btu')) {
      return 'heat_meter';
    }

    // 수질
    if (lower.includes('수질') || lower.includes('water quality')) {
      return 'water_quality';
    }

    // 압력계
    if (lower.includes('압력') || lower.includes('pressure')) {
      return 'pressure_gauge';
    }

    // 레벨
    if (lower.includes('레벨') || lower.includes('level')) {
      return 'level_sensor';
    }

    // 밸브
    if (lower.includes('밸브') || lower.includes('valve')) {
      return 'valve';
    }

    // 펌프
    if (lower.includes('펌프') || lower.includes('pump')) {
      return 'pump';
    }

    // 배관
    if (lower.includes('배관') || lower.includes('pipe') || lower.includes('fitting')) {
      return 'pipe_fitting';
    }

    // 전기
    if (lower.includes('전기') || lower.includes('electrical') || lower.includes('전력')) {
      return 'electrical';
    }

    // 건설
    if (lower.includes('건설') || lower.includes('construction') || lower.includes('공사')) {
      return 'construction';
    }

    // IT
    if (lower.includes('소프트웨어') || lower.includes('software') ||
        lower.includes('시스템') || lower.includes('it')) {
      return 'it_software';
    }

    return 'other';
  }

  /**
   * 발주처 인기도 조회
   */
  private getOrgPopularity(organization: string): number {
    // 정확 매칭
    for (const [key, value] of Object.entries(ORG_POPULARITY)) {
      if (organization.includes(key) || key.includes(organization)) {
        return value;
      }
    }

    // 기관 유형별 기본값
    const lower = organization.toLowerCase();
    if (lower.includes('조달청') || lower.includes('관세청')) {
      return ORG_POPULARITY.default_central;
    }
    if (lower.includes('공사') || lower.includes('공단')) {
      return ORG_POPULARITY.default_public;
    }

    return ORG_POPULARITY.default_local;
  }

  /**
   * 예산 구간 판정
   */
  private getPriceRange(price: number): string {
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
  private calculateConfidence(category: ProductCategory, organization: string): number {
    let confidence = 0.6;

    // 알려진 카테고리면 신뢰도 상승
    if (category !== 'other') {
      confidence += 0.1;
    }

    // 알려진 발주처면 신뢰도 상승
    for (const key of Object.keys(ORG_POPULARITY)) {
      if (organization.includes(key)) {
        confidence += 0.1;
        break;
      }
    }

    return Math.min(0.85, confidence);
  }

  /**
   * 투찰가 분포 표준편차 계산
   * 경쟁이 치열할수록 표준편차 감소 (하한가 근처 집중)
   */
  public getBidRateStdDev(competitionLevel: CompetitionPrediction['competitionLevel']): number {
    switch (competitionLevel) {
      case 'very_high':
        return 0.012;  // 1.2% - 매우 좁은 분포
      case 'high':
        return 0.015;  // 1.5%
      case 'medium':
        return 0.020;  // 2.0%
      case 'low':
        return 0.025;  // 2.5% - 넓은 분포
      default:
        return 0.020;
    }
  }

  /**
   * 예상 투찰률 분포 평균 계산
   * 경쟁이 치열할수록 하한율에 가깝게
   */
  public getExpectedBidRateMean(
    lowerLimitRate: number,
    competitionLevel: CompetitionPrediction['competitionLevel']
  ): number {
    const targetRate = 0.88;

    switch (competitionLevel) {
      case 'very_high':
        return lowerLimitRate + (targetRate - lowerLimitRate) * 0.2;
      case 'high':
        return lowerLimitRate + (targetRate - lowerLimitRate) * 0.35;
      case 'medium':
        return lowerLimitRate + (targetRate - lowerLimitRate) * 0.5;
      case 'low':
        return lowerLimitRate + (targetRate - lowerLimitRate) * 0.7;
      default:
        return (lowerLimitRate + targetRate) / 2;
    }
  }
}

// ============================================================
// 싱글톤 인스턴스
// ============================================================

let predictorInstance: CompetitionPredictor | null = null;

export function getCompetitionPredictor(): CompetitionPredictor {
  if (!predictorInstance) {
    predictorInstance = new CompetitionPredictor();
  }
  return predictorInstance;
}
