/**
 * Lead Filters Component
 * 리드 필터링 UI
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams?.get('status') || 'all';
  const currentMinScore = searchParams?.get('minScore') || '0';
  const currentSearch = searchParams?.get('search') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (value && value !== 'all' && value !== '0') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/dashboard/leads?${params.toString()}`);
  };

  const statuses = [
    { value: 'all', label: '전체' },
    { value: 'new', label: '신규' },
    { value: 'contacted', label: '접촉' },
    { value: 'qualified', label: '적격' },
    { value: 'converted', label: '전환' },
    { value: 'lost', label: '손실' },
  ];

  const scoreRanges = [
    { value: '0', label: '전체 스코어' },
    { value: '40', label: '40점 이상' },
    { value: '60', label: '60점 이상' },
    { value: '80', label: '80점 이상' },
  ];

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-4">
      <div className="flex items-center gap-4">
        {/* 검색 */}
        <div className="max-w-md flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="이름, 이메일, 조직명 검색..."
              defaultValue={currentSearch}
              onChange={(e) => {
                const value = e.target.value;
                const timer = setTimeout(() => {
                  updateFilter('search', value);
                }, 500);
                return () => clearTimeout(timer);
              }}
              className="h-10 w-full rounded border border-white/[0.06] bg-white/[0.04] pl-10 pr-4 text-sm text-white transition-colors placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none"
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="h-4 w-4 text-zinc-500" />
          <select
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="h-10 rounded border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white transition-colors focus:border-white/[0.12] focus:outline-none"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* 스코어 필터 */}
        <div className="flex items-center gap-2">
          <select
            value={currentMinScore}
            onChange={(e) => updateFilter('minScore', e.target.value)}
            className="h-10 rounded border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white transition-colors focus:border-white/[0.12] focus:outline-none"
          >
            {scoreRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* 초기화 */}
        {(currentStatus !== 'all' || currentMinScore !== '0' || currentSearch) && (
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="h-10 rounded border border-white/[0.06] px-4 text-sm text-zinc-300 transition-colors hover:bg-white/[0.04]"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
