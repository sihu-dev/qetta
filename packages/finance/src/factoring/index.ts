/**
 * Factoring Module - 팩토링 중개
 */

import type { Invoice, FactoringOffer } from '../types';

export interface InvoiceEvaluation {
  invoiceId: string;
  creditScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  estimatedAdvanceRate: number; // 70-90%
  estimatedDiscountRate: number; // 1-5%
  recommendation: string;
}

export interface FactoringServiceConfig {
  supabase: unknown;
}

export class FactoringService {
  constructor(_config: FactoringServiceConfig) {
    // Config stored for future implementation
  }

  /**
   * 송장 평가
   */
  async evaluateInvoice(invoice: Invoice): Promise<InvoiceEvaluation> {
    // AI 기반 송장 평가 로직
    const creditScore = this.calculateCreditScore(invoice);
    const riskLevel = creditScore >= 70 ? 'low' : creditScore >= 50 ? 'medium' : 'high';

    return {
      invoiceId: invoice.id,
      creditScore,
      riskLevel,
      estimatedAdvanceRate: this.getAdvanceRate(riskLevel),
      estimatedDiscountRate: this.getDiscountRate(riskLevel),
      recommendation: this.generateRecommendation(creditScore, riskLevel),
    };
  }

  /**
   * 팩토링 제안 요청
   */
  async requestOffers(_invoiceId: string): Promise<FactoringOffer[]> {
    // TODO: 금융사 API 연동
    throw new Error('Not implemented');
  }

  /**
   * 팩토링 제안 수락
   */
  async acceptOffer(_offerId: string): Promise<void> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  /**
   * 신용 점수 계산
   */
  private calculateCreditScore(invoice: Invoice): number {
    let score = 50; // 기본 점수

    // 금액에 따른 점수 (너무 크면 리스크)
    if (invoice.amount <= 100_000_000) score += 20;
    else if (invoice.amount <= 500_000_000) score += 10;

    // 만기일까지 기간
    const daysUntilDue = Math.ceil(
      (invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 30) score += 20;
    else if (daysUntilDue <= 60) score += 10;

    // 서류 존재 여부
    if (invoice.documentUrl) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 선지급률 계산
   */
  private getAdvanceRate(riskLevel: 'low' | 'medium' | 'high'): number {
    const rates = { low: 0.9, medium: 0.8, high: 0.7 };
    return rates[riskLevel];
  }

  /**
   * 할인율 계산
   */
  private getDiscountRate(riskLevel: 'low' | 'medium' | 'high'): number {
    const rates = { low: 0.015, medium: 0.025, high: 0.04 };
    return rates[riskLevel];
  }

  /**
   * 추천 메시지 생성
   */
  private generateRecommendation(score: number, _riskLevel: string): string {
    if (score >= 70) {
      return '팩토링 적합: 높은 신용점수로 유리한 조건 기대';
    } else if (score >= 50) {
      return '팩토링 가능: 일부 금융사에서 제안 가능';
    }
    return '팩토링 권장 안함: 불리한 조건 예상';
  }

  /**
   * 실수령액 계산
   */
  calculateNetAmount(
    invoiceAmount: number,
    advanceRate: number,
    discountRate: number,
    days: number
  ): number {
    const advanceAmount = invoiceAmount * advanceRate;
    const discount = invoiceAmount * discountRate * (days / 365);
    return advanceAmount - discount;
  }
}

export function createFactoringService(config: FactoringServiceConfig): FactoringService {
  return new FactoringService(config);
}
