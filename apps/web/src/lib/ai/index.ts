/**
 * Qetta AI Pipeline
 *
 * Claude AI 기반 입찰 매칭 파이프라인
 *
 * 파이프라인 구조:
 * 1. Pre-filter (키워드 기반) - 무료
 * 2. Filter (Claude Haiku) - 빠른 적합성 판단
 * 3. Analyze (Claude Sonnet) - 상세 분석
 * 4. Translate (Claude Haiku) - 한국어 번역
 */

export * from './types';
export * from './config';
export * from './filter';
export * from './analyze';
export * from './translate';

import {
  type BidForAnalysis,
  type CompanyProfile,
  type PipelineInput,
  type PipelineOptions,
  type PipelineResult,
  type BidMatchResult,
  type PipelineSummary,
  type AnalysisInput,
} from './types';
import { DEFAULT_COMPANY_PROFILE } from './config';
import { BidFilter, bidFilter } from './filter';
import { BidAnalyzer, bidAnalyzer } from './analyze';
import { BidTranslator, bidTranslator } from './translate';

// ============================================================================
// Pipeline Class
// ============================================================================

export class BidMatchingPipeline {
  private filter: BidFilter;
  private analyzer: BidAnalyzer;
  private translator: BidTranslator;

  constructor(options?: { apiKey?: string; filterThreshold?: number }) {
    this.filter = new BidFilter(options?.apiKey, options?.filterThreshold);
    this.analyzer = new BidAnalyzer(options?.apiKey);
    this.translator = new BidTranslator(options?.apiKey);
  }

  /**
   * 전체 파이프라인 실행
   */
  async run(input: PipelineInput): Promise<PipelineResult> {
    const startTime = Date.now();
    const options = this.normalizeOptions(input.options);

    console.log(`[Pipeline] Starting with ${input.bids.length} bids`);

    // Stage 1: Smart Filter (pre-filter + AI filter)
    const filterResults = await this.filter.smartFilter(input.bids, input.profile, {
      maxConcurrent: options.maxConcurrent,
    });

    // Get passed bids
    const passedBids = input.bids.filter((bid) => {
      const result = filterResults.find((r) => r.bidId === bid.id);
      return result?.passed;
    });

    console.log(`[Pipeline] Filter passed: ${passedBids.length}/${input.bids.length}`);

    // Stage 2: Analyze top N
    const bidsToAnalyze = passedBids.slice(0, options.analyzeTopN);
    const analysisInputs: AnalysisInput[] = bidsToAnalyze.map((bid) => ({
      bid,
      profile: input.profile,
      filterResult: filterResults.find((r) => r.bidId === bid.id)!,
    }));

    const analysisResults = await this.analyzer.analyzeBatch(analysisInputs, {
      maxConcurrent: Math.min(options.maxConcurrent, 3), // Lower concurrency for Sonnet
    });

    // Stage 3: Translate summaries if needed
    if (options.translateToKorean) {
      for (const result of analysisResults) {
        if (result.koreanSummary && !this.isKorean(result.koreanSummary)) {
          const translated = await this.translator.translate({
            text: result.koreanSummary,
            targetLanguage: 'ko',
            context: 'bid',
          });
          result.koreanSummary = translated.translatedText;
        }
      }
    }

    // Build results
    const results: BidMatchResult[] = input.bids.map((bid) => {
      const filterResult = filterResults.find((r) => r.bidId === bid.id)!;
      const analysisResult = analysisResults.find((r) => r.bidId === bid.id);

      return {
        bid,
        filterResult,
        analysisResult,
      };
    });

    // Sort by match score
    results.sort((a, b) => {
      const scoreA = a.analysisResult?.matchScore ?? a.filterResult.score;
      const scoreB = b.analysisResult?.matchScore ?? b.filterResult.score;
      return scoreB - scoreA;
    });

    // Generate summary
    const summary = this.generateSummary(results);

    return {
      totalBids: input.bids.length,
      filteredBids: passedBids.length,
      analyzedBids: analysisResults.length,
      results,
      summary,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * 단일 입찰 빠른 분석
   */
  async quickAnalyze(bid: BidForAnalysis, profile?: CompanyProfile): Promise<BidMatchResult> {
    const companyProfile = profile ?? DEFAULT_COMPANY_PROFILE;

    // Filter
    const filterResult = await this.filter.filter({ bid, profile: companyProfile });

    // Analyze if passed
    let analysisResult;
    if (filterResult.passed) {
      analysisResult = await this.analyzer.analyze({
        bid,
        profile: companyProfile,
        filterResult,
      });
    }

    return {
      bid,
      filterResult,
      analysisResult,
    };
  }

  /**
   * 필터만 실행 (빠른 스크리닝)
   */
  async filterOnly(bids: BidForAnalysis[], profile?: CompanyProfile): Promise<BidMatchResult[]> {
    const companyProfile = profile ?? DEFAULT_COMPANY_PROFILE;

    const filterResults = await this.filter.smartFilter(bids, companyProfile);

    return bids.map((bid) => ({
      bid,
      filterResult: filterResults.find((r) => r.bidId === bid.id)!,
    }));
  }

  /**
   * 입찰 공고 번역
   */
  async translateBid(bid: BidForAnalysis): Promise<{
    title: string;
    description: string;
  }> {
    const [title, description] = await Promise.all([
      this.translator.translateBidTitle(bid.title),
      bid.description
        ? this.translator.translateBidDescription(bid.description)
        : Promise.resolve(''),
    ]);

    return { title, description };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private normalizeOptions(options?: PipelineOptions): Required<PipelineOptions> {
    return {
      filterThreshold: options?.filterThreshold ?? 50,
      analyzeTopN: options?.analyzeTopN ?? 20,
      translateToKorean: options?.translateToKorean ?? true,
      maxConcurrent: options?.maxConcurrent ?? 5,
    };
  }

  private generateSummary(results: BidMatchResult[]): PipelineSummary {
    const analyzed = results.filter((r) => r.analysisResult);

    const recommendedBids = analyzed.filter(
      (r) => r.analysisResult?.recommendation === 'bid'
    ).length;

    const reviewBids = analyzed.filter((r) => r.analysisResult?.recommendation === 'review').length;

    const skippedBids = results.length - recommendedBids - reviewBids;

    const topMatches = analyzed
      .filter((r) => r.analysisResult?.recommendation === 'bid')
      .slice(0, 5)
      .map((r) => r.bid.title);

    const scores = analyzed
      .filter((r) => r.analysisResult)
      .map((r) => r.analysisResult!.matchScore);

    const averageMatchScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      recommendedBids,
      reviewBids,
      skippedBids,
      topMatches,
      averageMatchScore,
    };
  }

  private isKorean(text: string): boolean {
    return /[\uac00-\ud7af]/.test(text);
  }
}

// ============================================================================
// Singleton Exports
// ============================================================================

export const bidMatchingPipeline = new BidMatchingPipeline();

export { bidFilter, bidAnalyzer, bidTranslator, DEFAULT_COMPANY_PROFILE };

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * 입찰 매칭 파이프라인 실행 (기본 프로필 사용)
 */
export async function matchBids(
  bids: BidForAnalysis[],
  options?: PipelineOptions
): Promise<PipelineResult> {
  return bidMatchingPipeline.run({
    bids,
    profile: DEFAULT_COMPANY_PROFILE,
    options,
  });
}

/**
 * 단일 입찰 빠른 분석
 */
export async function analyzeBid(bid: BidForAnalysis): Promise<BidMatchResult> {
  return bidMatchingPipeline.quickAnalyze(bid);
}

/**
 * 입찰 제목 한국어 번역
 */
export async function translateBidTitle(title: string): Promise<string> {
  return bidTranslator.translateBidTitle(title);
}
