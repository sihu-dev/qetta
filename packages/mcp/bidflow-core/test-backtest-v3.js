/**
 * BIDFLOW 백테스트 v3.0 테스트
 *
 * 현실적인 낙찰 시뮬레이션 검증
 */

import { getBacktestEngineV3, BacktestReporterV3 } from './dist/backtest-framework-v3.js';

console.log('='.repeat(70));
console.log('BIDFLOW 백테스트 v3.0 테스트 (현실화 버전)');
console.log('='.repeat(70));

// 샘플 과거 데이터 (실적 + 키워드 포함)
const sampleHistoricalBids = [
  {
    id: 'hist-001',
    title: '2024년 초음파유량계 구매',
    organization: '서울특별시 상수도사업본부',
    estimatedPrice: 150000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-06-15T10:00:00Z',
    category: 'flow_meter',
    actualResult: {
      winningPrice: 127500000,
      winningRate: 0.85,
      assessmentRate: 1.0012,
      competitorCount: 14,
      winnerQualificationScore: 92,
      didWeWin: true,
      ourBidPrice: 127500000,
      ourRank: 1,
    },
    companySnapshot: {
      creditRating: 'A0',
      deliveryRecords: [
        {
          organization: '서울시 상수도사업본부',
          productName: '초음파유량계',
          amount: 200000000,
          completedAt: '2023-12-01T00:00:00Z',
          category: 'flow_meter',
          keywords: ['초음파', '유량계'],
        },
        {
          organization: '부산시 상수도사업본부',
          productName: '초음파유량계',
          amount: 100000000,
          completedAt: '2023-06-01T00:00:00Z',
          category: 'flow_meter',
          keywords: ['초음파', '유량계'],
        },
      ],
      certifications: ['iso9001', 'iso14001', 'patent_utility', 'patent_invention'],
      techStaffCount: 8,
    },
  },
  {
    id: 'hist-002',
    title: '열량계 교체 사업',
    organization: '한국지역난방공사',
    estimatedPrice: 80000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-07-20T14:00:00Z',
    category: 'heat_meter',
    actualResult: {
      winningPrice: 68000000,
      winningRate: 0.85,
      assessmentRate: 1.0003,
      competitorCount: 8,
      winnerQualificationScore: 89,
      didWeWin: false,
      ourBidPrice: 70000000,
      ourRank: 3,
    },
    companySnapshot: {
      creditRating: 'A0',
      deliveryRecords: [
        {
          organization: '한국지역난방공사',
          productName: '열량계',
          amount: 100000000,
          completedAt: '2024-01-15T00:00:00Z',
          category: 'heat_meter',
          keywords: ['열량계', '초음파'],
        },
        {
          organization: '서울에너지공사',
          productName: '열량계',
          amount: 60000000,
          completedAt: '2023-08-15T00:00:00Z',
          category: 'heat_meter',
          keywords: ['열량계'],
        },
      ],
      certifications: ['iso9001', 'iso14001', 'patent_utility'],
      techStaffCount: 6,
    },
  },
  {
    id: 'hist-003',
    title: '수질측정장비 구매',
    organization: '한국환경공단',
    estimatedPrice: 200000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-08-10T10:00:00Z',
    category: 'water_quality',
    actualResult: {
      winningPrice: 171000000,
      winningRate: 0.855,
      assessmentRate: 0.9998,
      competitorCount: 11,
      winnerQualificationScore: 91,
      didWeWin: false,
      ourBidPrice: 175000000,
      ourRank: 5,
    },
    companySnapshot: {
      creditRating: 'A-',
      deliveryRecords: [],  // 실적 없음
      certifications: ['iso9001'],
      techStaffCount: 3,
    },
  },
  {
    id: 'hist-004',
    title: '비만관유량계 설치',
    organization: '한국수자원공사',
    estimatedPrice: 250000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-09-05T11:00:00Z',
    category: 'flow_meter',
    actualResult: {
      winningPrice: 212500000,
      winningRate: 0.85,
      assessmentRate: 0.9995,
      competitorCount: 12,
      winnerQualificationScore: 93,
      didWeWin: true,
      ourBidPrice: 212500000,
      ourRank: 1,
    },
    companySnapshot: {
      creditRating: 'A0',
      deliveryRecords: [
        {
          organization: '한국수자원공사',
          productName: '비만관유량계',
          amount: 180000000,
          completedAt: '2024-03-20T00:00:00Z',
          category: 'flow_meter',
          keywords: ['비만관', '유량계', '초음파'],
        },
        {
          organization: '서울시',
          productName: '초음파유량계',
          amount: 120000000,
          completedAt: '2024-06-15T00:00:00Z',
          category: 'flow_meter',
          keywords: ['초음파', '유량계'],
        },
      ],
      certifications: ['iso9001', 'iso14001', 'patent_invention', 'patent_utility'],
      techStaffCount: 7,
    },
  },
  {
    id: 'hist-005',
    title: '압력계 일괄 구매',
    organization: '인천광역시',
    estimatedPrice: 45000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-10-12T09:00:00Z',
    category: 'pressure_gauge',
    isUrgent: true,
    actualResult: {
      winningPrice: 38250000,
      winningRate: 0.85,
      assessmentRate: 1.0008,
      competitorCount: 9,
      winnerQualificationScore: 88,
      didWeWin: false,
      ourBidPrice: 39000000,
      ourRank: 4,
    },
    companySnapshot: {
      creditRating: 'BBB+',
      deliveryRecords: [],  // 실적 없음
      certifications: ['iso9001'],
      techStaffCount: 2,
    },
  },
  {
    id: 'hist-006',
    title: '전자유량계 신규 설치',
    organization: '부산광역시 상수도사업본부',
    estimatedPrice: 180000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-11-08T10:00:00Z',
    category: 'flow_meter',
    actualResult: {
      winningPrice: 153000000,
      winningRate: 0.85,
      assessmentRate: 1.0005,
      competitorCount: 15,
      winnerQualificationScore: 90,
      didWeWin: true,
      ourBidPrice: 153000000,
      ourRank: 1,
    },
    companySnapshot: {
      creditRating: 'A0',
      deliveryRecords: [
        {
          organization: '서울시',
          productName: '초음파유량계',
          amount: 120000000,
          completedAt: '2024-06-15T00:00:00Z',
          category: 'flow_meter',
          keywords: ['초음파', '유량계'],
        },
        {
          organization: '한국수자원공사',
          productName: '비만관유량계',
          amount: 180000000,
          completedAt: '2024-03-20T00:00:00Z',
          category: 'flow_meter',
          keywords: ['비만관', '유량계'],
        },
      ],
      certifications: ['iso9001', 'iso14001', 'iso27001', 'patent_invention'],
      techStaffCount: 8,
    },
  },
  {
    id: 'hist-007',
    title: '레벨센서 교체',
    organization: '한국농어촌공사',
    estimatedPrice: 60000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-11-22T14:00:00Z',
    category: 'level_sensor',
    actualResult: {
      winningPrice: 51000000,
      winningRate: 0.85,
      assessmentRate: 1.0000,
      competitorCount: 7,
      winnerQualificationScore: 87,
      didWeWin: false,
      ourBidPrice: 52500000,
      ourRank: 2,
    },
    companySnapshot: {
      creditRating: 'A0',
      deliveryRecords: [
        {
          organization: '한국농어촌공사',
          productName: '레벨센서',
          amount: 80000000,
          completedAt: '2024-05-10T00:00:00Z',
          category: 'level_sensor',
          keywords: ['레벨', '센서'],
        },
        {
          organization: '한국수자원공사',
          productName: '수위계',
          amount: 40000000,
          completedAt: '2023-11-10T00:00:00Z',
          category: 'level_sensor',
          keywords: ['수위', '레벨'],
        },
      ],
      certifications: ['iso9001', 'iso14001', 'kc', 'patent_utility'],
      techStaffCount: 5,
    },
  },
  {
    id: 'hist-008',
    title: '밸브류 일괄 구매',
    organization: '대구광역시',
    estimatedPrice: 95000000,
    bidType: 'goods',
    contractType: 'qualification_review',
    deadline: '2024-12-05T10:00:00Z',
    category: 'valve',
    actualResult: {
      winningPrice: 82000000,
      winningRate: 0.863,
      assessmentRate: 1.0015,
      competitorCount: 18,
      winnerQualificationScore: 89,
      didWeWin: false,
      ourBidPrice: 85000000,
      ourRank: 6,
    },
    companySnapshot: {
      creditRating: 'BBB0',
      deliveryRecords: [],  // 실적 없음
      certifications: ['iso9001'],
      techStaffCount: 2,
    },
  },
];

// v3 백테스트 엔진 초기화
const engine = getBacktestEngineV3();
engine.loadData(sampleHistoricalBids);

console.log('\n[테스트 1] optimal 전략 + 실제 사정률 사용');
console.log('-'.repeat(70));

const result1 = engine.run({
  tenantId: 'test-tenant',
  productId: 'ur-1000-plus',
  strategy: 'optimal',
  simulateBidding: true,
  followRecommendation: true,
  useActualAssessmentRate: true,  // 실제 사정률 사용
  calculateOptimalParams: true,
});

BacktestReporterV3.printReport(result1);

console.log('\n\n[테스트 2] balanced 전략 + 예측 사정률 사용');
console.log('-'.repeat(70));

const result2 = engine.run({
  tenantId: 'test-tenant',
  productId: 'ur-1000-plus',
  strategy: 'balanced',
  simulateBidding: true,
  followRecommendation: true,
  useActualAssessmentRate: false,  // 예측 사정률 사용
  calculateOptimalParams: false,
});

BacktestReporterV3.printReport(result2);

console.log('\n\n[테스트 3] 유량계만 aggressive 전략');
console.log('-'.repeat(70));

const result3 = engine.run({
  tenantId: 'test-tenant',
  productId: 'ur-1000-plus',
  strategy: 'aggressive',
  categories: ['flow_meter'],
  simulateBidding: true,
  followRecommendation: false,  // 모든 입찰 참여
  useActualAssessmentRate: true,
  calculateOptimalParams: false,
});

BacktestReporterV3.printReport(result3);

console.log('\n\n[테스트 4] conservative 전략 + 전체 참여');
console.log('-'.repeat(70));

const result4 = engine.run({
  tenantId: 'test-tenant',
  productId: 'ur-1000-plus',
  strategy: 'conservative',
  simulateBidding: true,
  followRecommendation: false,  // 모든 입찰 참여
  useActualAssessmentRate: true,
  calculateOptimalParams: false,
});

console.log(`\n분석 건수: ${result4.analyzedBids}건`);
console.log(`낙찰률: ${(result4.profitability.winRate * 100).toFixed(1)}%`);
console.log(`F1 Score: ${result4.accuracy.recommendation.f1Score.toFixed(3)}`);
console.log(`총 수익: ${result4.profitability.totalRevenue.toLocaleString()}원`);

console.log('\n\n' + '='.repeat(70));
console.log('v3 백테스트 완료');
console.log('='.repeat(70));

// 상세 결과 출력
console.log('\n[개별 입찰 상세 분석]');
console.log('-'.repeat(70));

result1.details.forEach((d, i) => {
  console.log(`\n${i + 1}. ${d.bidTitle}`);
  console.log(`   예측 투찰가: ${d.predicted.optimalBidPrice.toLocaleString()}원 (${(d.predicted.optimalBidRate * 100).toFixed(1)}%)`);
  console.log(`   실제 낙찰가: ${d.actual.winningPrice.toLocaleString()}원`);
  console.log(`   시뮬레이션: ${d.simulation.wouldHaveWon ? '낙찰' : '미낙찰'} (${d.simulation.winReason})`);
  console.log(`   추천: ${d.predicted.recommendation} → ${d.recommendationAnalysis.category}`);
  console.log(`   적격심사: ${d.predicted.qualificationScore.toFixed(1)}점`);
});
