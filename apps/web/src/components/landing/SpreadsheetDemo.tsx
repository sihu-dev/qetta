'use client';

/**
 * Spreadsheet Demo Section - HEPHAITOS Dark Theme
 * AI-Powered Bid Matching Demo
 */

import { useState, memo } from 'react';
import {
  LayoutGrid,
  Zap,
  Filter,
  BarChart3,
  Download,
  Play,
  X,
  ExternalLink,
  Sparkles,
  FileText,
  ChevronDown,
  Target,
  Clock,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MOCK_BIDS, MOCK_STATS, formatAmount } from '@/lib/data/mock-bids';
import { getProductById, getConfidenceLevel } from '@/lib/data/products';
import { AI_SMART_FUNCTIONS } from '@/lib/data/ai-functions';
import { GLASS, BG_COLORS, BUTTON_STYLES, getScoreColor } from '@/constants/design-tokens';

export function SpreadsheetDemo() {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showFunctions, setShowFunctions] = useState(false);

  const selectedBid = MOCK_BIDS[selectedRow];
  const matchedProduct = selectedBid?.matchedProduct
    ? getProductById(selectedBid.matchedProduct)
    : null;
  const confidence = selectedBid ? getConfidenceLevel(selectedBid.matchScore) : null;

  return (
    <section className={cn('py-24', BG_COLORS.secondary)} id="spreadsheet">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1.5 text-sm font-medium text-[#7C8AEA]">
            <LayoutGrid className="h-4 w-4" />
            Interactive Demo
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            스프레드시트에서
            <br />
            <span className="text-zinc-400">AI 함수로 분석</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            =AI_SCORE(), =AI_SUMMARY() 등 5가지 AI 함수로 공고를 분석하고
            최적의 입찰 기회를 찾아보세요.
          </p>
        </div>

        {/* Main Demo Container */}
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-4">
            {/* Spreadsheet */}
            <div
              className={cn(
                'overflow-hidden rounded-2xl shadow-2xl transition-all',
                GLASS.card,
                showSidePanel ? 'flex-1' : 'w-full'
              )}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-sm font-medium text-white">Qetta Spreadsheet</span>
                  <span className="hidden items-center rounded bg-[#5E6AD2]/10 px-2 py-0.5 text-xs font-medium text-[#7C8AEA] sm:inline-flex">
                    Demo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                          aria-label="Filter"
                        >
                          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">필터</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden">
                        <p>필터</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                          aria-label="Analysis"
                        >
                          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">분석</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden">
                        <p>분석</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                          aria-label="Export"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">내보내기</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden">
                        <p>내보내기</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Formula Bar */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
                <div className="rounded bg-[#5E6AD2]/10 px-2.5 py-1 font-mono text-xs font-medium text-[#7C8AEA]">
                  {String.fromCharCode(65 + selectedRow)}1
                </div>
                <div className="h-5 w-px bg-white/[0.06]" />
                <div className="flex flex-1 items-center gap-2">
                  <Zap className="h-4 w-4 text-[#5E6AD2]" aria-hidden="true" />
                  <span className="font-mono text-sm text-zinc-400">
                    =AI_MATCH() →{' '}
                    <span className="text-white">{selectedBid?.matchedProduct || '-'}</span>
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFunctions(!showFunctions)}
                    className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:from-[#4B56C8] hover:to-[#3A44A8]"
                    aria-label={showFunctions ? 'Close AI functions menu' : 'Open AI functions menu'}
                    aria-expanded={showFunctions}
                    aria-haspopup="true"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    AI 함수
                    <ChevronDown
                      className={cn('h-3 w-3 transition-transform', showFunctions && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>

                  {/* AI Functions Dropdown */}
                  {showFunctions && (
                    <div className={cn('absolute right-0 top-full z-50 mt-2 w-72 rounded-lg py-2 shadow-xl', GLASS.cardRaised)}>
                      <div className="border-b border-white/[0.06] px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          AI Smart Functions
                        </p>
                      </div>
                      {AI_SMART_FUNCTIONS.map((fn) => (
                        <button
                          key={fn.name}
                          className="w-full px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                          onClick={() => setShowFunctions(false)}
                          aria-label={`${fn.name} function: ${fn.description}`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <code className="font-mono text-xs font-medium text-[#7C8AEA]">
                              {fn.syntax}
                            </code>
                          </div>
                          <p className="text-xs text-zinc-500">{fn.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Spreadsheet Grid */}
              <div className="overflow-x-auto" role="region" aria-label="Bid list">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th scope="col" className="w-10 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        No
                      </th>
                      <th scope="col" className="w-20 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        출처
                      </th>
                      <th scope="col" className="min-w-[150px] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:min-w-[200px]">
                        공고명
                      </th>
                      <th scope="col" className="hidden px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:table-cell">
                        발주기관
                      </th>
                      <th scope="col" className="w-20 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        추정가
                      </th>
                      <th scope="col" className="w-16 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        마감
                      </th>
                      <th scope="col" className="w-20 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        상태
                      </th>
                      <th scope="col" className="hidden w-12 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 md:table-cell">
                        우선
                      </th>
                      <th scope="col" className="w-24 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        매칭
                      </th>
                      <th scope="col" className="hidden px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 xl:table-cell">
                        제품
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_BIDS.map((bid, idx) => (
                      <tr
                        key={bid.id}
                        onClick={() => {
                          setSelectedRow(idx);
                          setShowSidePanel(true);
                        }}
                        className={cn(
                          'cursor-pointer border-b border-white/[0.04] transition-colors',
                          idx === selectedRow ? 'bg-[#5E6AD2]/10' : 'hover:bg-white/[0.02]'
                        )}
                      >
                        <td className="px-3 py-3 font-mono text-xs text-zinc-500">{bid.id}</td>
                        <td className="px-3 py-3">
                          <SourceBadge source={bid.source} label={bid.sourceLabel} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-[200px] truncate font-medium text-white" title={bid.title}>
                            {bid.title}
                          </div>
                        </td>
                        <td className="hidden max-w-[150px] truncate px-3 py-3 text-zinc-400 lg:table-cell">
                          {bid.organization}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs font-medium text-white">
                          {formatAmount(bid.estimatedAmount)}
                        </td>
                        <td className="px-3 py-3">
                          <DdayBadge dday={bid.dday} isUrgent={bid.isUrgent} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={bid.status} label={bid.statusLabel} />
                        </td>
                        <td className="hidden px-3 py-3 md:table-cell">
                          <PriorityIndicator priority={bid.priority} />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar score={bid.matchScore} />
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell">
                          {bid.matchedProduct && (
                            <span className="inline-flex items-center rounded bg-[#5E6AD2]/10 px-2 py-0.5 font-mono text-xs font-medium text-[#7C8AEA]">
                              {bid.matchedProduct}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{MOCK_BIDS.length}개 공고 표시</span>
                  <span className="hidden sm:inline">|</span>
                  <span className="hidden sm:inline">신규 {MOCK_STATS.new}</span>
                  <span className="hidden sm:inline">긴급 {MOCK_STATS.urgent}</span>
                  <span className="hidden sm:inline">높은매칭 {MOCK_STATS.highMatch}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="hidden sm:inline">동기화: 방금 전</span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Side Panel */}
            {showSidePanel && selectedBid && (
              <div className={cn('hidden w-64 flex-shrink-0 overflow-hidden rounded-2xl shadow-xl md:block lg:w-80', GLASS.card)}>
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <SourceBadge source={selectedBid.source} label={selectedBid.sourceLabel} />
                  </div>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="rounded p-1 transition-colors hover:bg-white/[0.05]"
                    aria-label="Close detail panel"
                  >
                    <X className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="max-h-[500px] space-y-4 overflow-y-auto p-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-white">
                      {selectedBid.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">{selectedBid.organization}</p>
                  </div>

                  {/* D-Day & Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn('rounded-lg p-3', GLASS.input)}>
                      <p className="mb-1 text-xs text-zinc-500">마감일</p>
                      <p className={cn('font-mono text-lg font-bold', selectedBid.isUrgent ? 'text-amber-400' : 'text-white')}>
                        {selectedBid.dday}
                      </p>
                    </div>
                    <div className={cn('rounded-lg p-3', GLASS.input)}>
                      <p className="mb-1 text-xs text-zinc-500">추정가격</p>
                      <p className="font-mono text-lg font-bold text-white">
                        {formatAmount(selectedBid.estimatedAmount)}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className={cn('space-y-3 rounded-lg p-3', GLASS.cardRaised)}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#5E6AD2]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        AI Analysis
                      </span>
                    </div>

                    {/* Match Score */}
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">매칭 점수</span>
                        <span className="text-xs font-medium text-zinc-400">{confidence?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={cn('h-full rounded-full transition-all', getScoreColor(selectedBid.matchScore).bg)}
                            style={{ width: `${selectedBid.matchScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm font-bold text-white">
                          {selectedBid.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* Matched Product */}
                    {matchedProduct && (
                      <div className={cn('rounded-lg p-2', GLASS.input)}>
                        <p className="mb-1 text-xs text-zinc-500">추천 제품</p>
                        <p className="text-sm font-semibold text-white">{matchedProduct.name}</p>
                        <p className="text-xs text-zinc-500">{matchedProduct.fullName}</p>
                      </div>
                    )}

                    {/* AI Summary */}
                    {selectedBid.aiSummary && (
                      <div>
                        <p className="mb-1 text-xs text-zinc-500">AI 요약</p>
                        <p className="text-xs leading-relaxed text-zinc-300">{selectedBid.aiSummary}</p>
                      </div>
                    )}

                    {/* Keywords */}
                    <div>
                      <p className="mb-1.5 text-xs text-zinc-500">키워드</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedBid.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center rounded bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-zinc-400"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2" role="group" aria-label="Bid actions">
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      원문
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      분석
                    </button>
                    <button className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white', BUTTON_STYLES.primary)}>
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      제안서
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Function Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {AI_SMART_FUNCTIONS.slice(0, 5).map((fn) => (
            <span
              key={fn.name}
              className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-400', GLASS.card)}
            >
              <FunctionIcon name={fn.icon} />
              <code className="font-mono text-xs text-[#7C8AEA]">{fn.syntax}</code>
            </span>
          ))}
        </div>

        {/* Data Source Pills */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['나라장터', 'TED (EU)', 'SAM.gov', '한전', '조달청'].map((source) => (
            <span
              key={source}
              className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-400"
            >
              {source}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center gap-4">
          <Button size="lg" className={cn(BUTTON_STYLES.primary, 'rounded-xl')} asChild>
            <Link href="/signup">무료로 시작하기</Link>
          </Button>
          <Button size="lg" variant="outline" className={cn(BUTTON_STYLES.secondary, 'rounded-xl')} asChild>
            <Link href="/features/spreadsheet" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              자세히 보기
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Sub-components (memoized for performance)

const SourceBadge = memo(function SourceBadge({ source, label }: { source: string; label: string }) {
  return (
    <span className="inline-flex items-center rounded bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-zinc-400">
      {label}
    </span>
  );
});

const StatusBadge = memo(function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    new: 'bg-[#5E6AD2]/10 text-[#7C8AEA] border border-[#5E6AD2]/30',
    reviewing: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    preparing: 'bg-white/[0.06] text-zinc-400',
    submitted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };

  return (
    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', styles[status] || styles.new)}>
      {label}
    </span>
  );
});

const DdayBadge = memo(function DdayBadge({ dday, isUrgent }: { dday: string; isUrgent: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-bold',
        isUrgent ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.04] text-zinc-400'
      )}
    >
      {dday}
    </span>
  );
});

const PriorityIndicator = memo(function PriorityIndicator({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const indicators: Record<string, { text: string; color: string }> = {
    high: { text: '●●●', color: 'text-emerald-400' },
    medium: { text: '●●○', color: 'text-amber-400' },
    low: { text: '●○○', color: 'text-zinc-500' },
  };
  const indicator = indicators[priority];

  return <span className={cn('font-mono text-xs', indicator.color)}>{indicator.text}</span>;
});

const ScoreBar = memo(function ScoreBar({ score }: { score: number }) {
  const scoreColor = getScoreColor(score);

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn('h-full rounded-full transition-all', scoreColor.bg)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn('font-mono text-xs font-medium', scoreColor.text)}>{score}%</span>
    </div>
  );
});

const FunctionIcon = memo(function FunctionIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className="h-3.5 w-3.5" />,
    TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
    Target: <Target className="h-3.5 w-3.5" />,
    Tag: <Tag className="h-3.5 w-3.5" />,
    Clock: <Clock className="h-3.5 w-3.5" />,
  };

  return <span className="text-[#5E6AD2]">{icons[name] || <Zap className="h-3.5 w-3.5" />}</span>;
});
