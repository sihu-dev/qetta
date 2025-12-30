/**
 * Qetta AI Translation Module
 *
 * Claude Haiku 기반 다국어 번역
 * - 입찰 공고 한국어 번역
 * - 기술 용어 정확한 번역
 */

import Anthropic from '@anthropic-ai/sdk';
import { type TranslationInput, type TranslationResult, AIError } from './types';
import { AI_CONFIG, PIPELINE_CONFIG, PROMPTS } from './config';

// ============================================================================
// Language Detection
// ============================================================================

const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  ko: /[\uac00-\ud7af]/, // Korean
  en: /^[\u0020-\u007E\s]+$/, // ASCII printable (English)
  de: /[äöüßÄÖÜ]/, // German
  fr: /[àâçéèêëïîôùûü]/i, // French
  es: /[áéíóúñü¡¿]/i, // Spanish
  it: /[àèéìòù]/, // Italian
  nl: /\b(de|het|een|van|en)\b/i, // Dutch
  pl: /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/, // Polish
  ro: /[ăâîșțĂÂÎȘȚ]/, // Romanian
  pt: /[àáâãéêíóôõú]/i, // Portuguese
};

function detectLanguage(text: string): string {
  // Check for Korean first (most common target)
  if (LANGUAGE_PATTERNS.ko.test(text)) {
    return 'ko';
  }

  // Check for other languages
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (lang !== 'en' && pattern.test(text)) {
      return lang;
    }
  }

  // Default to English
  return 'en';
}

// ============================================================================
// Translation Service
// ============================================================================

export class BidTranslator {
  private client: Anthropic;
  private cache: Map<string, TranslationResult>;

  constructor(apiKey?: string) {
    const key = apiKey ?? AI_CONFIG.anthropicApiKey;

    if (!key) {
      console.warn('[BidTranslator] API key not configured. Set ANTHROPIC_API_KEY.');
    }

    this.client = new Anthropic({ apiKey: key });
    this.cache = new Map();
  }

  /**
   * 텍스트 번역
   */
  async translate(input: TranslationInput): Promise<TranslationResult> {
    const startTime = Date.now();
    const sourceLanguage = input.sourceLanguage ?? detectLanguage(input.text);

    // Skip if already in target language
    if (sourceLanguage === input.targetLanguage) {
      return {
        originalText: input.text,
        translatedText: input.text,
        sourceLanguage,
        targetLanguage: input.targetLanguage,
        confidence: 1.0,
        processingTime: 0,
      };
    }

    // Check cache
    const cacheKey = this.getCacheKey(input);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, processingTime: 0 };
    }

    try {
      const contextStr = this.getContextDescription(input.context);

      const message = await this.client.messages.create({
        model: PIPELINE_CONFIG.translate.model,
        max_tokens: PIPELINE_CONFIG.translate.maxTokens,
        temperature: PIPELINE_CONFIG.translate.temperature,
        messages: [
          {
            role: 'user',
            content: PROMPTS.translate(input.text, contextStr),
          },
        ],
      });

      const translatedText = this.extractTextContent(message.content);

      const result: TranslationResult = {
        originalText: input.text,
        translatedText,
        sourceLanguage,
        targetLanguage: input.targetLanguage,
        confidence: 0.95, // Haiku is generally accurate
        processingTime: Date.now() - startTime,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('[BidTranslator] Translation error:', error);
      throw new AIError('Translation failed', 'API_ERROR', error);
    }
  }

  /**
   * 배치 번역
   */
  async translateBatch(
    inputs: TranslationInput[],
    options: { maxConcurrent?: number } = {}
  ): Promise<TranslationResult[]> {
    const maxConcurrent = options.maxConcurrent ?? PIPELINE_CONFIG.batch.maxConcurrent;
    const results: TranslationResult[] = [];

    console.log(`[BidTranslator] Starting batch translation: ${inputs.length} texts`);

    for (let i = 0; i < inputs.length; i += maxConcurrent) {
      const batch = inputs.slice(i, i + maxConcurrent);

      const batchResults = await Promise.allSettled(batch.map((input) => this.translate(input)));

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('[BidTranslator] Translation failed:', result.reason);
          // Add placeholder for failed translation
          const failedInput = batch[batchResults.indexOf(result)];
          results.push({
            originalText: failedInput.text,
            translatedText: failedInput.text, // Keep original
            sourceLanguage: 'unknown',
            targetLanguage: failedInput.targetLanguage,
            confidence: 0,
            processingTime: 0,
          });
        }
      }

      // Progress log
      const processed = Math.min(i + maxConcurrent, inputs.length);
      console.log(`[BidTranslator] Processed ${processed}/${inputs.length} texts`);

      // Rate limiting delay
      if (i + maxConcurrent < inputs.length) {
        await this.delay(PIPELINE_CONFIG.batch.delayBetweenBatches);
      }
    }

    return results;
  }

  /**
   * 입찰 공고 제목 번역
   */
  async translateBidTitle(title: string): Promise<string> {
    const result = await this.translate({
      text: title,
      targetLanguage: 'ko',
      context: 'bid',
    });
    return result.translatedText;
  }

  /**
   * 입찰 공고 설명 번역
   */
  async translateBidDescription(description: string): Promise<string> {
    if (!description || description.trim() === '') {
      return '';
    }

    // Split long descriptions into chunks
    const chunks = this.splitText(description, 2000);

    if (chunks.length === 1) {
      const result = await this.translate({
        text: description,
        targetLanguage: 'ko',
        context: 'technical',
      });
      return result.translatedText;
    }

    // Translate chunks and join
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const result = await this.translate({
        text: chunk,
        targetLanguage: 'ko',
        context: 'technical',
      });
      translatedChunks.push(result.translatedText);
    }

    return translatedChunks.join('\n\n');
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[BidTranslator] Cache cleared');
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): { size: number; hits: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to track separately
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private getCacheKey(input: TranslationInput): string {
    return `${input.targetLanguage}:${input.context ?? 'general'}:${input.text.slice(0, 100)}`;
  }

  private getContextDescription(context?: 'bid' | 'technical' | 'legal'): string {
    switch (context) {
      case 'bid':
        return '입찰 공고 (공공조달, 정부 입찰)';
      case 'technical':
        return '기술 문서 (제조업, 계측기, 산업장비)';
      case 'legal':
        return '법률/계약 문서 (약관, 조건)';
      default:
        return '일반 비즈니스 문서';
    }
  }

  private extractTextContent(content: Anthropic.ContentBlock[]): string {
    for (const block of content) {
      if (block.type === 'text') {
        return block.text;
      }
    }
    throw new AIError('No text content in response', 'PARSE_ERROR');
  }

  private splitText(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);

    let currentChunk = '';
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const bidTranslator = new BidTranslator();

// ============================================================================
// Utility Functions
// ============================================================================

export { detectLanguage };
