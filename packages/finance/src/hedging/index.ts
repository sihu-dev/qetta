/**
 * Hedging Module - 환헤지 자동화
 */

import type { CurrencyPair, ExchangeRate, HedgeType } from '../types';

export interface HedgeSimulationInput {
  pair: CurrencyPair;
  amount: number;
  hedgeRatio: number; // 0-1
  days: number;
  type: HedgeType;
}

export interface HedgeSimulationResult {
  scenarios: {
    name: string;
    rateChange: number;
    unhedgedPnL: number;
    hedgedPnL: number;
    hedgeBenefit: number;
  }[];
  recommendation: string;
  optimalHedgeRatio: number;
  expectedCost: number;
}

export interface ForexExposure {
  currency: string;
  receivables: number; // 외화 매출채권
  payables: number; // 외화 매입채무
  netExposure: number; // 순 환 위험
}

export class HedgeSimulator {
  /**
   * 환헤지 시뮬레이션 실행
   */
  simulate(input: HedgeSimulationInput): HedgeSimulationResult {
    const { amount, hedgeRatio, type } = input;

    // 시나리오별 환율 변동
    const scenarios = [
      { name: '급락 (-10%)', rateChange: -0.1 },
      { name: '하락 (-5%)', rateChange: -0.05 },
      { name: '보합', rateChange: 0 },
      { name: '상승 (+5%)', rateChange: 0.05 },
      { name: '급등 (+10%)', rateChange: 0.1 },
    ].map((scenario) => {
      const unhedgedPnL = amount * scenario.rateChange;
      const unhedgedPortion = amount * (1 - hedgeRatio);
      const hedgedPnL = unhedgedPortion * scenario.rateChange;

      return {
        ...scenario,
        unhedgedPnL,
        hedgedPnL,
        hedgeBenefit: unhedgedPnL - hedgedPnL,
      };
    });

    // 헤지 비용 계산 (forward 기준)
    const hedgeCostRate = type === 'forward' ? 0.005 : type === 'option' ? 0.02 : 0.01;
    const expectedCost = amount * hedgeRatio * hedgeCostRate;

    // 최적 헤지 비율 추천
    const optimalHedgeRatio = this.calculateOptimalRatio(amount, input.days);

    return {
      scenarios,
      recommendation: this.generateRecommendation(optimalHedgeRatio, type),
      optimalHedgeRatio,
      expectedCost,
    };
  }

  /**
   * 최적 헤지 비율 계산
   */
  private calculateOptimalRatio(_amount: number, days: number): number {
    // 금액과 기간에 따른 최적 헤지 비율
    // 단기: 50%, 중기: 70%, 장기: 80%
    if (days <= 30) return 0.5;
    if (days <= 90) return 0.7;
    return 0.8;
  }

  /**
   * 헤지 추천 메시지 생성
   */
  private generateRecommendation(ratio: number, type: HedgeType): string {
    const typeNames: Record<HedgeType, string> = {
      forward: '선물환',
      option: '통화옵션',
      swap: '통화스왝',
    };

    return `${Math.round(ratio * 100)}% ${typeNames[type]} 헤지를 권장합니다.`;
  }

  /**
   * 환 노출 분석
   */
  analyzeExposure(receivables: number, payables: number, currency: string): ForexExposure {
    return {
      currency,
      receivables,
      payables,
      netExposure: receivables - payables,
    };
  }

  /**
   * 환율 변동성 계산 (30일 표준편차)
   */
  calculateVolatility(rates: ExchangeRate[]): number {
    if (rates.length < 2) return 0;

    const returns = rates.slice(1).map((rate, i) => Math.log(rate.rate / rates[i].rate));

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;

    return Math.sqrt(variance) * Math.sqrt(252); // 연환산
  }
}

export function createHedgeSimulator(): HedgeSimulator {
  return new HedgeSimulator();
}
