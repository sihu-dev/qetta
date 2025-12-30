/**
 * Trade Finance Core Types
 */

import { z } from 'zod'

// Currency Types
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY'

export interface CurrencyPair {
  base: Currency
  quote: Currency
}

// Guarantee Types
export type GuaranteeType = 
  | 'performance'      // 이행보증
  | 'bid'              // 입찰보증
  | 'advance_payment'  // 선급금환급보증
  | 'defect'           // 하자보증
  | 'retention'        // 유보보증

export type GuaranteeStatus = 'draft' | 'pending' | 'active' | 'expired' | 'cancelled'

export const GuaranteeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['performance', 'bid', 'advance_payment', 'defect', 'retention']),
  amount: z.number().positive(),
  currency: z.enum(['KRW', 'USD', 'EUR', 'JPY', 'CNY']).default('KRW'),
  beneficiary: z.string().min(1),
  bankId: z.string().uuid().optional(),
  issueDate: z.date(),
  expiryDate: z.date(),
  status: z.enum(['draft', 'pending', 'active', 'expired', 'cancelled']).default('draft'),
  contractId: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Guarantee = z.infer<typeof GuaranteeSchema>

export interface CreateGuaranteeInput {
  type: GuaranteeType
  amount: number
  currency?: Currency
  beneficiary: string
  bankId?: string
  expiryDate: Date
  contractId?: string
  notes?: string
}

// Exchange Rate Types
export const ExchangeRateSchema = z.object({
  id: z.string().uuid(),
  baseCurrency: z.string(),
  quoteCurrency: z.string(),
  rate: z.number().positive(),
  timestamp: z.date(),
  source: z.string(),
})

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>

// Hedge Position Types
export type HedgeType = 'forward' | 'option' | 'swap'
export type HedgeStatus = 'open' | 'closed' | 'expired'

export const HedgePositionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  pair: z.string(),
  amount: z.number().positive(),
  rate: z.number().positive(),
  type: z.enum(['forward', 'option', 'swap']),
  maturityDate: z.date(),
  status: z.enum(['open', 'closed', 'expired']).default('open'),
  premium: z.number().optional(),
  createdAt: z.date(),
})

export type HedgePosition = z.infer<typeof HedgePositionSchema>

// Factoring Types
export type InvoiceStatus = 'pending' | 'submitted' | 'funded' | 'paid' | 'rejected'

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  debtorName: z.string(),
  debtorId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.enum(['KRW', 'USD', 'EUR', 'JPY', 'CNY']).default('KRW'),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.enum(['pending', 'submitted', 'funded', 'paid', 'rejected']).default('pending'),
  documentUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

export const FactoringOfferSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  factorId: z.string().uuid(),
  factorName: z.string(),
  advanceRate: z.number().min(0).max(100), // 선지급률 (%)
  discountRate: z.number().min(0).max(100), // 할인율 (%)
  fee: z.number().min(0), // 수수료
  totalAmount: z.number().positive(), // 실수령액
  validUntil: z.date(),
  createdAt: z.date(),
})

export type FactoringOffer = z.infer<typeof FactoringOfferSchema>
