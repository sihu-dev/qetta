'use client';

import { useState } from 'react';
import { ArrowPathIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

type SyncSource = 'all' | 'g2b' | 'ted' | 'sam';

interface SyncTriggerButtonProps {
  className?: string;
  source?: SyncSource;
  variant?: 'default' | 'compact';
}

/**
 * API 데이터 동기화 트리거 버튼
 * - G2B (나라장터), TED (EU), SAM.gov (US) API 연동
 * - Google Sheets 연동을 위한 데이터 수집
 */
export function SyncTriggerButton({
  className,
  source = 'all',
  variant = 'default',
}: SyncTriggerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    stats?: { g2b: number; ted: number; sam: number };
  } | null>(null);

  const sourceLabels: Record<SyncSource, string> = {
    all: '전체',
    g2b: '나라장터',
    ted: 'TED (EU)',
    sam: 'SAM.gov',
  };

  const handleSync = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // API 데이터 동기화 요청
      const response = await fetch('/api/v1/bids/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          // Google Sheets 연동을 위한 옵션
          options: {
            exportToSheets: false, // 추후 Google Sheets 연동 시 활성화
            notifyOnComplete: true,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const stats = data.stats || {};
        const total = (stats.g2b || 0) + (stats.ted || 0) + (stats.sam || 0);
        setResult({
          success: true,
          message: `${total}건 동기화 완료`,
          stats,
        });
      } else {
        setResult({
          success: false,
          message: data.error || '동기화 실패',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '네트워크 오류',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`rounded p-2 transition-colors hover:bg-neutral-100 disabled:opacity-50 ${className}`}
        title={`${sourceLabels[source]} 동기화`}
      >
        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`flex h-10 items-center gap-2 rounded bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <CloudArrowDownIcon className={`h-4 w-4 ${isLoading ? 'hidden' : ''}`} />
        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'hidden'}`} />
        {isLoading ? '동기화 중...' : `${sourceLabels[source]} 동기화`}
      </button>

      {/* 결과 표시 */}
      {result && (
        <div
          className={`absolute left-0 top-full z-10 mt-2 whitespace-nowrap rounded border px-3 py-2 text-xs ${
            result.success
              ? 'border-neutral-200 bg-neutral-50 text-neutral-900'
              : 'border-neutral-300 bg-neutral-100 text-neutral-600'
          }`}
        >
          <span>{result.message}</span>
          {result.stats && (
            <span className="ml-2 text-neutral-500">
              (G2B: {result.stats.g2b}, TED: {result.stats.ted}, SAM: {result.stats.sam})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// 기존 이름도 export (호환성)
export { SyncTriggerButton as CrawlTriggerButton };
