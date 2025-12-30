/**
 * Guarantee Module - 이행보증 관리
 */

import type { Guarantee, CreateGuaranteeInput, GuaranteeStatus, GuaranteeType } from '../types';

export interface GuaranteeServiceConfig {
  supabase: unknown; // SupabaseClient type
}

export class GuaranteeService {
  constructor(_config: GuaranteeServiceConfig) {
    // Config stored for future implementation
  }

  /**
   * 새 이행보증 생성
   */
  async create(_input: CreateGuaranteeInput): Promise<Guarantee> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  /**
   * 이행보증 조회
   */
  async getById(_id: string): Promise<Guarantee | null> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  /**
   * 사용자의 모든 이행보증 조회
   */
  async getByUserId(_userId: string): Promise<Guarantee[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  /**
   * 이행보증 상태 업데이트
   */
  async updateStatus(_id: string, _status: GuaranteeStatus): Promise<Guarantee> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  /**
   * 만료 예정 이행보증 조회
   * @param days 만료까지 남은 일수
   */
  async getExpiringWithin(_userId: string, _days: number): Promise<Guarantee[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  /**
   * 보증금액 최적화 계산
   * @param contractAmount 계약 금액
   * @param type 보증 종류
   */
  calculateOptimalAmount(contractAmount: number, type: GuaranteeType): number {
    const rates: Record<GuaranteeType, number> = {
      performance: 0.1, // 10%
      bid: 0.05, // 5%
      advance_payment: 0.1, // 10%
      defect: 0.03, // 3%
      retention: 0.05, // 5%
    };
    return contractAmount * (rates[type] || 0.1);
  }

  /**
   * 보증 수수료 계산
   * @param amount 보증 금액
   * @param days 보증 기간 (일)
   * @param annualRate 연 수수료율
   */
  calculateFee(amount: number, days: number, annualRate: number = 0.02): number {
    return amount * ((annualRate * days) / 365);
  }
}

export function createGuaranteeService(config: GuaranteeServiceConfig): GuaranteeService {
  return new GuaranteeService(config);
}
