/**
 * Qetta AI Pipeline Types
 *
 * Claude AI 기반 입찰 분석 파이프라인 타입 정의
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface AIConfig {
  anthropicApiKey: string;
  defaultModel: ClaudeModel;
  maxRetries: number;
  timeout: number;
}

export type ClaudeModel =
  | 'claude-3-haiku-20240307'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-opus-20240229';

export const CLAUDE_MODELS = {
  haiku: 'claude-3-haiku-20240307' as const,
  sonnet: 'claude-3-5-sonnet-20241022' as const,
  opus: 'claude-3-5-opus-20240229' as const,
} as const;

// ============================================================================
// Company Profile Types
// ============================================================================

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  products: ProductInfo[];
  capabilities: string[];
  certifications: string[];
  targetMarkets: string[];
  preferredBudget: {
    min: number;
    max: number;
    currency: string;
  };
  keywords: string[];
  excludeKeywords: string[];
}

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: Record<string, string>;
  cpvCodes?: string[];
  naicsCodes?: string[];
  keywords: string[];
}

// ============================================================================
// Filter Stage Types
// ============================================================================

export interface FilterInput {
  bid: BidForAnalysis;
  profile: CompanyProfile;
}

export interface FilterResult {
  bidId: string;
  passed: boolean;
  score: number; // 0-100
  reasons: string[];
  matchedKeywords: string[];
  matchedProducts: string[];
  processingTime: number;
}

export interface BidForAnalysis {
  id: string;
  source: 'g2b' | 'ted' | 'sam';
  title: string;
  description: string | null;
  deadline: Date | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  country: string;
  buyerName: string;
  cpvCodes?: string[];
  naicsCode?: string | null;
  originalUrl: string | null;
}

// ============================================================================
// Analysis Stage Types
// ============================================================================

export interface AnalysisInput {
  bid: BidForAnalysis;
  profile: CompanyProfile;
  filterResult: FilterResult;
}

export interface AnalysisResult {
  bidId: string;
  matchScore: number; // 0-100
  recommendation: 'bid' | 'review' | 'skip';
  analysis: {
    productFit: ProductFitAnalysis;
    competitivePosition: CompetitiveAnalysis;
    riskAssessment: RiskAssessment;
    actionItems: ActionItem[];
  };
  koreanSummary: string;
  englishSummary: string;
  processingTime: number;
}

export interface ProductFitAnalysis {
  score: number;
  matchedProducts: ProductMatch[];
  gaps: string[];
  suggestions: string[];
}

export interface ProductMatch {
  productId: string;
  productName: string;
  matchScore: number;
  matchReasons: string[];
}

export interface CompetitiveAnalysis {
  advantageScore: number;
  strengths: string[];
  weaknesses: string[];
  differentiators: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
}

export interface RiskFactor {
  category: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  task: string;
  deadline?: string;
  responsible?: string;
}

// ============================================================================
// Translation Types
// ============================================================================

export interface TranslationInput {
  text: string;
  sourceLanguage?: string;
  targetLanguage: 'ko' | 'en';
  context?: 'bid' | 'technical' | 'legal';
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  processingTime: number;
}

// ============================================================================
// Pipeline Types
// ============================================================================

export interface PipelineInput {
  bids: BidForAnalysis[];
  profile: CompanyProfile;
  options?: PipelineOptions;
}

export interface PipelineOptions {
  filterThreshold?: number; // Default: 50
  analyzeTopN?: number; // Default: 20
  translateToKorean?: boolean; // Default: true
  maxConcurrent?: number; // Default: 5
}

export interface PipelineResult {
  totalBids: number;
  filteredBids: number;
  analyzedBids: number;
  results: BidMatchResult[];
  summary: PipelineSummary;
  processingTime: number;
}

export interface BidMatchResult {
  bid: BidForAnalysis;
  filterResult: FilterResult;
  analysisResult?: AnalysisResult;
}

export interface PipelineSummary {
  recommendedBids: number;
  reviewBids: number;
  skippedBids: number;
  topMatches: string[];
  averageMatchScore: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export type AIErrorCode =
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_INPUT'
  | 'PARSE_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';
