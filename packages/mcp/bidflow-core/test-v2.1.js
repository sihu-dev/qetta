/**
 * BIDFLOW v2.1 엔진 테스트
 */

import { generateBidPredictionV2 } from './dist/bidding-engine-v2.1.js';

console.log('='.repeat(60));
console.log('BIDFLOW 입찰 전략 엔진 v2.1 테스트');
console.log('='.repeat(60));

// 테스트 케이스 1: 서울시 유량계 입찰
console.log('\n[테스트 1] 서울시 초음파유량계 입찰');
console.log('-'.repeat(60));

const result1 = generateBidPredictionV2({
  bidId: 'test-bid-001',
  bidTitle: '2025년 초음파유량계 구매 설치',
  organization: '서울특별시 상수도사업본부',
  estimatedPrice: 120000000,
  bidType: 'goods',
  contractType: 'qualification_review',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  tenantId: 'test-tenant',
  productId: 'ur-1000-plus',
  creditRating: 'A0',
  deliveryRecords: [
    {
      organization: '서울시 상수도사업본부',
      productName: '초음파유량계 UR-1000',
      amount: 85000000,
      completedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'flow_meter',
      keywords: ['초음파', '유량계', '비만관'],
    },
    {
      organization: '한국수자원공사',
      productName: '전자유량계',
      amount: 45000000,
      completedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'flow_meter',
      keywords: ['전자', '유량계'],
    },
  ],
  certifications: ['iso9001', 'iso14001', 'patent_utility'],
  techStaffCount: 5,
  strategy: 'balanced',
  isUrgent: false,
});

console.log('\n[기본 정보]');
console.log(`  추천: ${result1.recommendation}`);
console.log(`  리스크: ${result1.riskLevel}`);
console.log(`  신뢰도: ${result1.confidenceLevel}`);

console.log('\n[낙찰 확률]');
console.log(`  확률: ${(result1.winProbability * 100).toFixed(1)}%`);

console.log('\n[투찰가 분석]');
console.log(`  최적가: ${result1.optimalBidPrice.toLocaleString()}원`);
console.log(`  공격적: ${result1.bidPriceRange.low.toLocaleString()}원`);
console.log(`  보수적: ${result1.bidPriceRange.high.toLocaleString()}원`);

console.log('\n[적격심사 점수]');
console.log(`  납품실적: ${result1.qualificationScore.deliveryRecord}/25`);
console.log(`  기술능력: ${result1.qualificationScore.techCapability}/5`);
console.log(`  신용등급: ${result1.qualificationScore.financialStatus}/15`);
console.log(`  가격점수: ${result1.qualificationScore.priceScore}/50`);
console.log(`  신인도: ${result1.qualificationScore.reliability}`);
console.log(`  총점: ${result1.qualificationScore.total}/100`);
console.log(`  통과여부: ${result1.qualificationDetails.willPass ? '✅ 통과' : '❌ 미달'}`);
console.log(`  마진: ${result1.qualificationDetails.marginToPass > 0 ? '+' : ''}${result1.qualificationDetails.marginToPass}점`);

console.log('\n[사정률 분석]');
console.log(`  예상 사정률: ${(result1.assessmentAnalysis.rate * 100).toFixed(2)}%`);
console.log(`  신뢰도: ${(result1.assessmentAnalysis.confidence * 100).toFixed(0)}%`);
console.log(`  범위: ${(result1.assessmentAnalysis.range.low * 100).toFixed(2)}%~${(result1.assessmentAnalysis.range.high * 100).toFixed(2)}%`);
console.log(`  데이터 소스: ${result1.assessmentAnalysis.source}`);

console.log('\n[경쟁률 분석]');
console.log(`  예상 경쟁업체: ${result1.competitionAnalysis.expectedCompetitors}개사`);
console.log(`  경쟁 수준: ${result1.competitionAnalysis.competitionLevel}`);
console.log(`  범위: ${result1.competitionAnalysis.distribution.min}~${result1.competitionAnalysis.distribution.max}개사`);
console.log(`  투찰 밀집도: ${(result1.competitionAnalysis.bidDensity * 100).toFixed(1)}%`);

console.log('\n[시나리오 분석]');
console.log(`  낙관적: 확률 ${(result1.scenarios.optimistic.winProbability * 100).toFixed(1)}%, 경쟁 ${result1.scenarios.optimistic.competitors}개사`);
console.log(`  기본: 확률 ${(result1.scenarios.base.winProbability * 100).toFixed(1)}%, 경쟁 ${result1.scenarios.base.competitors}개사`);
console.log(`  비관적: 확률 ${(result1.scenarios.pessimistic.winProbability * 100).toFixed(1)}%, 경쟁 ${result1.scenarios.pessimistic.competitors}개사`);

if (result1.uncertaintyFactors.length > 0) {
  console.log('\n[불확실성 요인]');
  result1.uncertaintyFactors.forEach(f => console.log(`  - ${f}`));
}

console.log('\n[분석 근거]');
result1.reasoning.forEach(r => console.log(`  - ${r}`));

console.log('\n[개선 제안]');
result1.qualificationDetails.recommendations.forEach(r => console.log(`  - ${r}`));

// 테스트 케이스 2: 신규 진입 (납품실적 없음)
console.log('\n\n[테스트 2] 신규 진입 케이스 (납품실적 없음)');
console.log('-'.repeat(60));

const result2 = generateBidPredictionV2({
  bidId: 'test-bid-002',
  bidTitle: '열량계 구매',
  organization: '한국지역난방공사',
  estimatedPrice: 80000000,
  bidType: 'goods',
  contractType: 'qualification_review',
  deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  tenantId: 'test-tenant',
  productId: 'heat-meter-01',
  creditRating: 'BBB0',
  deliveryRecords: [], // 납품실적 없음
  certifications: ['iso9001'],
  techStaffCount: 2,
  strategy: 'conservative',
  isUrgent: false,
});

console.log(`  추천: ${result2.recommendation}`);
console.log(`  낙찰확률: ${(result2.winProbability * 100).toFixed(1)}%`);
console.log(`  적격심사: ${result2.qualificationScore.total}점 (${result2.qualificationDetails.willPass ? '통과' : '미달'})`);
console.log(`  마진: ${result2.qualificationDetails.marginToPass > 0 ? '+' : ''}${result2.qualificationDetails.marginToPass}점`);

console.log('\n  [개선 제안]');
result2.qualificationDetails.recommendations.forEach(r => console.log(`    - ${r}`));

// 테스트 케이스 3: 긴급 입찰 (경쟁률 낮음 예상)
console.log('\n\n[테스트 3] 긴급 입찰 케이스');
console.log('-'.repeat(60));

const result3 = generateBidPredictionV2({
  bidId: 'test-bid-003',
  bidTitle: '긴급 배관자재 구매',
  organization: '인천광역시',
  estimatedPrice: 35000000,
  bidType: 'goods',
  contractType: 'qualification_review',
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  tenantId: 'test-tenant',
  productId: 'pipe-fitting-01',
  creditRating: 'A-',
  deliveryRecords: [
    {
      organization: '인천시',
      productName: '배관자재',
      amount: 20000000,
      completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'pipe_fitting',
    },
  ],
  certifications: ['iso9001', 'kc'],
  techStaffCount: 3,
  strategy: 'aggressive',
  isUrgent: true,  // 긴급 입찰
});

console.log(`  추천: ${result3.recommendation}`);
console.log(`  낙찰확률: ${(result3.winProbability * 100).toFixed(1)}%`);
console.log(`  예상 경쟁업체: ${result3.competitionAnalysis.expectedCompetitors}개사 (긴급 입찰로 경쟁 낮음)`);
console.log(`  적격심사: ${result3.qualificationScore.total}점`);

console.log('\n' + '='.repeat(60));
console.log('v2.1 테스트 완료');
console.log('='.repeat(60));
