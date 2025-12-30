/**
 * Qetta AI Analysis Module
 *
 * Claude Sonnet 기반 상세 매칭 분석
 * - 필터 통과 입찰에 대한 심층 분석
 * - 제품 적합성, 경쟁력, 리스크 평가
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  type BidForAnalysis,
  type CompanyProfile,
  type FilterResult,
  type AnalysisInput,
  type AnalysisResult,
  AIError,
} from './types';
import { AI_CONFIG, PIPELINE_CONFIG, PROMPTS } from './config';

// ============================================================================
// Response Schema
// ============================================================================

const ProductMatchSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  matchScore: z.number().min(0).max(100),
  matchReasons: z.array(z.string()),
});

const RiskFactorSchema = z.object({
  category: z.string(),
  level: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  mitigation: z.string().optional(),
});

const ActionItemSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  task: z.string(),
  deadline: z.string().optional(),
  responsible: z.string().optional(),
});

const AnalysisResponseSchema = z.object({
  matchScore: z.number().min(0).max(100),
  recommendation: z.enum(['bid', 'review', 'skip']),
  analysis: z.object({
    productFit: z.object({
      score: z.number(),
      matchedProducts: z.array(ProductMatchSchema),
      gaps: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    competitivePosition: z.object({
      advantageScore: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      differentiators: z.array(z.string()),
    }),
    riskAssessment: z.object({
      overallRisk: z.enum(['low', 'medium', 'high']),
      factors: z.array(RiskFactorSchema),
    }),
    actionItems: z.array(ActionItemSchema),
  }),
  koreanSummary: z.string(),
  englishSummary: z.string(),
});

// ============================================================================
// Analyzer Service
// ============================================================================

export class BidAnalyzer {
  private client: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey ?? AI_CONFIG.anthropicApiKey;

    if (!key) {
      console.warn('[BidAnalyzer] API key not configured. Set ANTHROPIC_API_KEY.');
    }

    this.client = new Anthropic({ apiKey: key });
  }

  /**
   * 단일 입찰 분석
   */
  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const bidStr = this.formatBid(input.bid);
      const profileStr = this.formatProfile(input.profile);
      const filterStr = this.formatFilterResult(input.filterResult);

      const message = await this.client.messages.create({
        model: PIPELINE_CONFIG.analyze.model,
        max_tokens: PIPELINE_CONFIG.analyze.maxTokens,
        temperature: PIPELINE_CONFIG.analyze.temperature,
        messages: [
          {
            role: 'user',
            content: PROMPTS.analyze(bidStr, profileStr, filterStr),
          },
        ],
      });

      const responseText = this.extractTextContent(message.content);
      const parsed = this.parseResponse(responseText);

      return {
        bidId: input.bid.id,
        matchScore: parsed.matchScore,
        recommendation: parsed.recommendation,
        analysis: parsed.analysis,
        koreanSummary: parsed.koreanSummary,
        englishSummary: parsed.englishSummary,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[BidAnalyzer] Analysis error:', error);
      throw new AIError('Analysis failed', 'API_ERROR', error);
    }
  }

  /**
   * 배치 분석
   */
  async analyzeBatch(
    inputs: AnalysisInput[],
    options: { maxConcurrent?: number } = {}
  ): Promise<AnalysisResult[]> {
    const maxConcurrent = options.maxConcurrent ?? PIPELINE_CONFIG.batch.maxConcurrent;
    const results: AnalysisResult[] = [];

    console.log(`[BidAnalyzer] Starting batch analysis: ${inputs.length} bids`);

    // Process in batches
    for (let i = 0; i < inputs.length; i += maxConcurrent) {
      const batch = inputs.slice(i, i + maxConcurrent);

      const batchResults = await Promise.allSettled(batch.map((input) => this.analyze(input)));

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('[BidAnalyzer] Analysis failed:', result.reason);
        }
      }

      // Progress log
      const processed = Math.min(i + maxConcurrent, inputs.length);
      console.log(`[BidAnalyzer] Processed ${processed}/${inputs.length} bids`);

      // Rate limiting delay
      if (i + maxConcurrent < inputs.length) {
        await this.delay(PIPELINE_CONFIG.batch.delayBetweenBatches * 2); // Longer delay for Sonnet
      }
    }

    console.log(`[BidAnalyzer] Batch complete: ${results.length}/${inputs.length} successful`);

    return results;
  }

  /**
   * 빠른 요약 생성 (Haiku 사용)
   */
  async quickSummary(bid: BidForAnalysis): Promise<string> {
    try {
      const bidStr = this.formatBid(bid);

      const message = await this.client.messages.create({
        model: PIPELINE_CONFIG.filter.model, // Use Haiku for speed
        max_tokens: 512,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: PROMPTS.summarize(bidStr),
          },
        ],
      });

      return this.extractTextContent(message.content);
    } catch (error) {
      console.error('[BidAnalyzer] Summary error:', error);
      return '요약 생성 실패';
    }
  }

  /**
   * 추천 액션 생성
   */
  generateRecommendation(result: AnalysisResult): string[] {
    const actions: string[] = [];

    if (result.recommendation === 'bid') {
      actions.push('✅ 입찰 참여 권장');
      actions.push(`매칭 점수: ${result.matchScore}점`);

      const topProduct = result.analysis.productFit.matchedProducts[0];
      if (topProduct) {
        actions.push(`주력 제품: ${topProduct.productName} (${topProduct.matchScore}점 매칭)`);
      }

      const highPriorityTasks = result.analysis.actionItems.filter(
        (item) => item.priority === 'high'
      );
      if (highPriorityTasks.length > 0) {
        actions.push('우선 조치 사항:');
        highPriorityTasks.forEach((task) => {
          actions.push(`  - ${task.task}`);
        });
      }
    } else if (result.recommendation === 'review') {
      actions.push('🔍 추가 검토 필요');
      actions.push(`매칭 점수: ${result.matchScore}점`);

      if (result.analysis.productFit.gaps.length > 0) {
        actions.push('보완 필요 사항:');
        result.analysis.productFit.gaps.slice(0, 3).forEach((gap) => {
          actions.push(`  - ${gap}`);
        });
      }
    } else {
      actions.push('❌ 입찰 불참 권장');
      actions.push(`매칭 점수: ${result.matchScore}점`);
      actions.push('사유: ' + (result.analysis.productFit.gaps[0] ?? '제품 적합성 부족'));
    }

    return actions;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private formatBid(bid: BidForAnalysis): string {
    return JSON.stringify(
      {
        id: bid.id,
        source: bid.source,
        title: bid.title,
        description: bid.description,
        deadline: bid.deadline?.toISOString(),
        budget: {
          min: bid.budgetMin,
          max: bid.budgetMax,
          currency: bid.currency,
        },
        country: bid.country,
        buyer: bid.buyerName,
        cpvCodes: bid.cpvCodes,
        naicsCode: bid.naicsCode,
        originalUrl: bid.originalUrl,
      },
      null,
      2
    );
  }

  private formatProfile(profile: CompanyProfile): string {
    return JSON.stringify(
      {
        name: profile.name,
        industry: profile.industry,
        products: profile.products,
        capabilities: profile.capabilities,
        certifications: profile.certifications,
        targetMarkets: profile.targetMarkets,
        preferredBudget: profile.preferredBudget,
      },
      null,
      2
    );
  }

  private formatFilterResult(result: FilterResult): string {
    return JSON.stringify(
      {
        score: result.score,
        passed: result.passed,
        reasons: result.reasons,
        matchedKeywords: result.matchedKeywords,
        matchedProducts: result.matchedProducts,
      },
      null,
      2
    );
  }

  private extractTextContent(content: Anthropic.ContentBlock[]): string {
    for (const block of content) {
      if (block.type === 'text') {
        return block.text;
      }
    }
    throw new AIError('No text content in response', 'PARSE_ERROR');
  }

  private parseResponse(text: string): z.infer<typeof AnalysisResponseSchema> {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AIError('No JSON found in response', 'PARSE_ERROR', text);
    }

    try {
      const json = JSON.parse(jsonMatch[0]);
      return AnalysisResponseSchema.parse(json);
    } catch (error) {
      throw new AIError('Failed to parse response', 'PARSE_ERROR', { text, error });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const bidAnalyzer = new BidAnalyzer();
