'use client';

/**
 * 크롤링 실행 버튼 컴포넌트
 */

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface CrawlButtonProps {
  className?: string;
}

export function CrawlButton({ className }: CrawlButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleCrawl = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/bids/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'all',
          options: {
            notifyOnComplete: true,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || '동기화 완료',
        });
      } else {
        setResult({
          success: false,
          error: data.error || '동기화 실패',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '네트워크 오류',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleCrawl}
        disabled={isLoading}
        className={`flex h-10 items-center gap-2 rounded border border-white/[0.06] bg-white/[0.04] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      >
        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? '크롤링 중...' : '크롤링 실행'}
      </button>

      {/* 결과 토스트 */}
      {result && (
        <div
          className={`absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded px-4 py-2 text-sm shadow-lg ${
            result.success
              ? 'border border-green-700 bg-green-900 text-green-100'
              : 'border border-red-700 bg-red-900 text-red-100'
          }`}
        >
          {result.success ? result.message : result.error}
          <button onClick={() => setResult(null)} className="ml-2 opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
