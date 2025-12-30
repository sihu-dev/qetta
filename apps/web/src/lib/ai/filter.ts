/**
 * Qetta AI Filter Module
 *
 * Claude Haiku 기반 빠른 적합성 필터링
 * - 1차 스크리닝으로 대량 입찰 공고 빠르게 필터링
 * - 비용 효율적 (Haiku 모델 사용)
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  type BidForAnalysis,
  type CompanyProfile,
  type FilterInput,
  type FilterResult,
  AIError,
} from './types';
import { AI_CONFIG, PIPELINE_CONFIG, PROMPTS } from './config';

// ============================================================================
// Response Schema
// ============================================================================

const FilterResponseSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()).max(5),
  matchedKeywords: z.array(z.string()),
  matchedProducts: z.array(z.string()),
});

// ============================================================================
// Filter Service
// ============================================================================

export class BidFilter {
  private client: Anthropic;
  private threshold: number;

  constructor(apiKey?: string, threshold?: number) {
    const key = apiKey ?? AI_CONFIG.anthropicApiKey;

    if (!key) {
      console.warn('[BidFilter] API key not configured. Set ANTHROPIC_API_KEY.');
    }

    this.client = new Anthropic({ apiKey: key });
    this.threshold = threshold ?? PIPELINE_CONFIG.filter.threshold;
  }

  /**
   * 단일 입찰 필터링
   */
  async filter(input: FilterInput): Promise<FilterResult> {
    const startTime = Date.now();

    try {
      const bidStr = this.formatBid(input.bid);
      const profileStr = this.formatProfile(input.profile);

      const message = await this.client.messages.create({
        model: PIPELINE_CONFIG.filter.model,
        max_tokens: PIPELINE_CONFIG.filter.maxTokens,
        temperature: PIPELINE_CONFIG.filter.temperature,
        messages: [
          {
            role: 'user',
            content: PROMPTS.filter(bidStr, profileStr),
          },
        ],
      });

      const responseText = this.extractTextContent(message.content);
      const parsed = this.parseResponse(responseText);

      return {
        bidId: input.bid.id,
        passed: parsed.score >= this.threshold,
        score: parsed.score,
        reasons: parsed.reasons,
        matchedKeywords: parsed.matchedKeywords,
        matchedProducts: parsed.matchedProducts,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[BidFilter] Filter error:', error);

      // Return failed result instead of throwing
      return {
        bidId: input.bid.id,
        passed: false,
        score: 0,
        reasons: ['필터링 처리 실패'],
        matchedKeywords: [],
        matchedProducts: [],
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 배치 필터링
   */
  async filterBatch(
    bids: BidForAnalysis[],
    profile: CompanyProfile,
    options: { maxConcurrent?: number } = {}
  ): Promise<FilterResult[]> {
    const maxConcurrent = options.maxConcurrent ?? PIPELINE_CONFIG.batch.maxConcurrent;
    const results: FilterResult[] = [];

    console.log(`[BidFilter] Starting batch filter: ${bids.length} bids`);

    // Process in batches
    for (let i = 0; i < bids.length; i += maxConcurrent) {
      const batch = bids.slice(i, i + maxConcurrent);

      const batchResults = await Promise.all(batch.map((bid) => this.filter({ bid, profile })));

      results.push(...batchResults);

      // Progress log
      const processed = Math.min(i + maxConcurrent, bids.length);
      console.log(`[BidFilter] Processed ${processed}/${bids.length} bids`);

      // Rate limiting delay
      if (i + maxConcurrent < bids.length) {
        await this.delay(PIPELINE_CONFIG.batch.delayBetweenBatches);
      }
    }

    const passed = results.filter((r) => r.passed).length;
    console.log(`[BidFilter] Batch complete: ${passed}/${bids.length} passed`);

    return results;
  }

  /**
   * 빠른 키워드 기반 사전 필터링 (API 호출 없음)
   */
  preFilter(bid: BidForAnalysis, profile: CompanyProfile): boolean {
    const bidText = `${bid.title} ${bid.description ?? ''}`.toLowerCase();

    // Check exclude keywords
    for (const keyword of profile.excludeKeywords) {
      if (bidText.includes(keyword.toLowerCase())) {
        return false;
      }
    }

    // Check at least one matching keyword
    const hasMatch = profile.keywords.some((keyword) => bidText.includes(keyword.toLowerCase()));

    if (!hasMatch) {
      // Also check product keywords
      for (const product of profile.products) {
        for (const keyword of product.keywords) {
          if (bidText.includes(keyword.toLowerCase())) {
            return true;
          }
        }
      }
      return false;
    }

    return true;
  }

  /**
   * 사전 필터링 + AI 필터링 조합
   */
  async smartFilter(
    bids: BidForAnalysis[],
    profile: CompanyProfile,
    options: { maxConcurrent?: number } = {}
  ): Promise<FilterResult[]> {
    console.log(`[BidFilter] Smart filter starting: ${bids.length} bids`);

    // Stage 1: Fast keyword pre-filter
    const preFiltered = bids.filter((bid) => this.preFilter(bid, profile));
    console.log(`[BidFilter] Pre-filter passed: ${preFiltered.length}/${bids.length}`);

    // Stage 2: AI filter on pre-filtered bids
    const aiResults = await this.filterBatch(preFiltered, profile, options);

    // Create results for all bids
    const resultMap = new Map<string, FilterResult>();

    // Add AI results
    for (const result of aiResults) {
      resultMap.set(result.bidId, result);
    }

    // Add failed pre-filter results
    for (const bid of bids) {
      if (!resultMap.has(bid.id)) {
        resultMap.set(bid.id, {
          bidId: bid.id,
          passed: false,
          score: 0,
          reasons: ['키워드 매칭 실패'],
          matchedKeywords: [],
          matchedProducts: [],
          processingTime: 0,
        });
      }
    }

    return bids.map((bid) => resultMap.get(bid.id)!);
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private formatBid(bid: BidForAnalysis): string {
    return JSON.stringify(
      {
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
        source: bid.source,
        cpvCodes: bid.cpvCodes,
        naicsCode: bid.naicsCode,
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
        products: profile.products.map((p) => ({
          name: p.name,
          category: p.category,
          keywords: p.keywords,
        })),
        capabilities: profile.capabilities,
        certifications: profile.certifications,
        targetMarkets: profile.targetMarkets,
        preferredBudget: profile.preferredBudget,
        keywords: profile.keywords,
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

  private parseResponse(text: string): z.infer<typeof FilterResponseSchema> {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AIError('No JSON found in response', 'PARSE_ERROR', text);
    }

    try {
      const json = JSON.parse(jsonMatch[0]);
      return FilterResponseSchema.parse(json);
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

export const bidFilter = new BidFilter();
