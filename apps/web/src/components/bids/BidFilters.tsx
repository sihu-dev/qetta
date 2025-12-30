/**
 * Bid Filters Component
 * 입찰 공고 필터
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BidFiltersProps {
  currentStatus?: string;
  currentMatched?: string;
  currentSource?: string;
  currentSearch?: string;
  currentMinScore?: string;
}

export function BidFilters({
  currentStatus = 'all',
  currentMatched,
  currentSource = 'all',
  currentSearch = '',
  currentMinScore = '',
}: BidFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch);
  const [status, setStatus] = useState(currentStatus);
  const [matched, setMatched] = useState(currentMatched === 'true');
  const [source, setSource] = useState(currentSource);
  const [minScore, setMinScore] = useState(currentMinScore);

  const hasActiveFilters =
    status !== 'all' || matched || source !== 'all' || search !== '' || minScore !== '';

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (matched) params.set('matched', 'true');
    if (source !== 'all') params.set('source', source);
    if (minScore) params.set('minScore', minScore);

    router.push(`/dashboard/bids?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setMatched(false);
    setSource('all');
    setMinScore('');
    router.push('/dashboard/bids');
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search !== currentSearch) {
        applyFilters();
      }
    }, 500);

    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, currentSearch]);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* 검색 */}
        <div className="lg:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="공고 제목, 기관명 검색..."
              className="h-10 w-full rounded border border-white/[0.06] bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-white/[0.12] focus:outline-none"
            />
          </div>
        </div>

        {/* 상태 */}
        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              const params = new URLSearchParams(searchParams?.toString() ?? '');
              if (e.target.value !== 'all') {
                params.set('status', e.target.value);
              } else {
                params.delete('status');
              }
              if (search) params.set('search', search);
              if (matched) params.set('matched', 'true');
              if (source !== 'all') params.set('source', source);
              if (minScore) params.set('minScore', minScore);
              router.push(`/dashboard/bids?${params.toString()}`);
            }}
            className="h-10 w-full rounded border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white transition-colors focus:border-white/[0.12] focus:outline-none"
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="expired">마감</option>
            <option value="awarded">낙찰</option>
            <option value="cancelled">취소</option>
          </select>
        </div>

        {/* 출처 */}
        <div>
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              const params = new URLSearchParams(searchParams?.toString() ?? '');
              if (e.target.value !== 'all') {
                params.set('source', e.target.value);
              } else {
                params.delete('source');
              }
              if (search) params.set('search', search);
              if (status !== 'all') params.set('status', status);
              if (matched) params.set('matched', 'true');
              if (minScore) params.set('minScore', minScore);
              router.push(`/dashboard/bids?${params.toString()}`);
            }}
            className="h-10 w-full rounded border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white transition-colors focus:border-white/[0.12] focus:outline-none"
          >
            <option value="all">모든 출처</option>
            <option value="g2b">나라장터</option>
            <option value="ungm">UNGM</option>
            <option value="dgmarket">DG Market</option>
            <option value="manual">수동 추가</option>
          </select>
        </div>

        {/* 매칭 스코어 */}
        <div>
          <select
            value={minScore}
            onChange={(e) => {
              setMinScore(e.target.value);
              const params = new URLSearchParams(searchParams?.toString() ?? '');
              if (e.target.value) {
                params.set('minScore', e.target.value);
              } else {
                params.delete('minScore');
              }
              if (search) params.set('search', search);
              if (status !== 'all') params.set('status', status);
              if (matched) params.set('matched', 'true');
              if (source !== 'all') params.set('source', source);
              router.push(`/dashboard/bids?${params.toString()}`);
            }}
            className="h-10 w-full rounded border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white transition-colors focus:border-white/[0.12] focus:outline-none"
          >
            <option value="">모든 스코어</option>
            <option value="40">40+ (중간 이상)</option>
            <option value="60">60+ (높음)</option>
            <option value="80">80+ (매우 높음)</option>
          </select>
        </div>
      </div>

      {/* 빠른 필터 */}
      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
        <span className="text-xs text-zinc-400">빠른 필터:</span>

        <button
          onClick={() => {
            setMatched(true);
            const params = new URLSearchParams(searchParams?.toString() ?? '');
            params.set('matched', 'true');
            if (search) params.set('search', search);
            if (status !== 'all') params.set('status', status);
            if (source !== 'all') params.set('source', source);
            if (minScore) params.set('minScore', minScore);
            router.push(`/dashboard/bids?${params.toString()}`);
          }}
          className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
            matched
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border border-white/[0.06] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
          }`}
        >
          매칭됨만
        </button>

        <button
          onClick={() => {
            setStatus('active');
            const params = new URLSearchParams(searchParams?.toString() ?? '');
            params.set('status', 'active');
            if (search) params.set('search', search);
            if (matched) params.set('matched', 'true');
            if (source !== 'all') params.set('source', source);
            if (minScore) params.set('minScore', minScore);
            router.push(`/dashboard/bids?${params.toString()}`);
          }}
          className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
            status === 'active'
              ? 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
              : 'border border-white/[0.06] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
          }`}
        >
          활성만
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex h-7 items-center gap-1 rounded border border-white/[0.06] bg-white/[0.04] px-3 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.08]"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
