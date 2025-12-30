'use client';

/**
 * 스프레드시트 데모 섹션 - CMNTech 제품 매칭 버전
 * 11컬럼 + 사이드패널 + AI 함수 데모
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
import { CMNTECH_PRODUCTS, getProductById, getConfidenceLevel } from '@/lib/data/products';
import { AI_SMART_FUNCTIONS } from '@/lib/data/ai-functions';

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
    <section className="bg-neutral-50 py-24" id="spreadsheet">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white">
            <LayoutGrid className="h-4 w-4" />
            핵심 기능
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            CMNTech 5개 제품
            <br />
            <span className="text-neutral-500">AI 자동 매칭</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            나라장터, TED, 한전 공고를 실시간 수집하고 UR-1000PLUS, EnerRay 등 최적의 제품을 AI가
            자동으로 매칭합니다.
          </p>
        </div>

        {/* Main Demo Container */}
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-4">
            {/* Spreadsheet */}
            <div
              className={cn(
                'overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all',
                showSidePanel ? 'flex-1' : 'w-full'
              )}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-neutral-300" />
                    <div className="h-3 w-3 rounded-full bg-neutral-300" />
                    <div className="h-3 w-3 rounded-full bg-neutral-300" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Qetta Spreadsheet</span>
                  <span className="hidden items-center rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 sm:inline-flex">
                    Demo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                          aria-label="필터 열기"
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
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                          aria-label="분석 열기"
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
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                          aria-label="데이터 내보내기"
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
              <div className="flex items-center gap-3 border-b bg-white px-4 py-2">
                <div className="rounded bg-neutral-100 px-2.5 py-1 font-mono text-xs font-medium text-neutral-700">
                  {String.fromCharCode(65 + selectedRow)}1
                </div>
                <div className="h-5 w-px bg-neutral-200" />
                <div className="flex flex-1 items-center gap-2">
                  <Zap className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <span
                    className="font-mono text-sm text-neutral-500"
                    aria-label={`AI 매칭 결과: ${selectedBid?.matchedProduct || '없음'}`}
                  >
                    =AI_MATCH() →{' '}
                    <span className="text-neutral-900">{selectedBid?.matchedProduct || '-'}</span>
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFunctions(!showFunctions)}
                    className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
                    aria-label={showFunctions ? 'AI 함수 메뉴 닫기' : 'AI 함수 메뉴 열기'}
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
                    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-neutral-200 bg-white py-2 shadow-xl">
                      <div className="border-b px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          AI 스마트 함수
                        </p>
                      </div>
                      {AI_SMART_FUNCTIONS.map((fn) => (
                        <button
                          key={fn.name}
                          className="w-full px-3 py-2 text-left transition-colors hover:bg-neutral-50"
                          onClick={() => setShowFunctions(false)}
                          aria-label={`${fn.name} 함수: ${fn.description}`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <code className="font-mono text-xs font-medium text-neutral-900">
                              {fn.syntax}
                            </code>
                          </div>
                          <p className="text-xs text-neutral-500">{fn.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Spreadsheet Grid */}
              <div className="overflow-x-auto" role="region" aria-label="입찰 공고 목록">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-neutral-50">
                      <th
                        scope="col"
                        className="w-10 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="w-20 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        출처
                      </th>
                      <th
                        scope="col"
                        className="min-w-[150px] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:min-w-[200px]"
                      >
                        공고명
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 lg:table-cell"
                      >
                        발주기관
                      </th>
                      <th
                        scope="col"
                        className="w-20 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        추정가
                      </th>
                      <th
                        scope="col"
                        className="w-16 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        마감
                      </th>
                      <th
                        scope="col"
                        className="w-20 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        상태
                      </th>
                      <th
                        scope="col"
                        className="hidden w-12 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 md:table-cell"
                      >
                        우선
                      </th>
                      <th
                        scope="col"
                        className="w-24 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        매칭
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 xl:table-cell"
                      >
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
                          'cursor-pointer border-b transition-colors',
                          idx === selectedRow ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                        )}
                      >
                        <td className="px-3 py-3 font-mono text-xs text-neutral-400">{bid.id}</td>
                        <td className="px-3 py-3">
                          <SourceBadge source={bid.source} label={bid.sourceLabel} />
                        </td>
                        <td className="px-3 py-3">
                          <div
                            className="max-w-[200px] truncate font-medium text-neutral-900"
                            title={bid.title}
                          >
                            {bid.title}
                          </div>
                        </td>
                        <td className="hidden max-w-[150px] truncate px-3 py-3 text-neutral-600 lg:table-cell">
                          {bid.organization}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs font-medium text-neutral-900">
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
                            <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs font-medium text-neutral-700">
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
              <div className="flex items-center justify-between border-t bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{MOCK_BIDS.length}개 공고 표시</span>
                  <span className="hidden sm:inline">|</span>
                  <span className="hidden sm:inline">신규 {MOCK_STATS.new}</span>
                  <span className="hidden sm:inline">긴급 {MOCK_STATS.urgent}</span>
                  <span className="hidden sm:inline">높은매칭 {MOCK_STATS.highMatch}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="hidden sm:inline">동기화: 방금 전</span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-900" />
                </div>
              </div>
            </div>

            {/* Side Panel */}
            {showSidePanel && selectedBid && (
              <div className="hidden w-64 flex-shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl md:block lg:w-80">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <SourceBadge source={selectedBid.source} label={selectedBid.sourceLabel} />
                  </div>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="rounded p-1 transition-colors hover:bg-neutral-200"
                    aria-label="상세 패널 닫기"
                  >
                    <X className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="max-h-[500px] space-y-4 overflow-y-auto p-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-neutral-900">
                      {selectedBid.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">{selectedBid.organization}</p>
                  </div>

                  {/* D-Day & Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <p className="mb-1 text-xs text-neutral-500">마감일</p>
                      <p
                        className={cn(
                          'font-mono text-lg font-bold',
                          selectedBid.isUrgent ? 'text-neutral-900' : 'text-neutral-700'
                        )}
                      >
                        {selectedBid.dday}
                      </p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <p className="mb-1 text-xs text-neutral-500">추정가격</p>
                      <p className="font-mono text-lg font-bold text-neutral-900">
                        {formatAmount(selectedBid.estimatedAmount)}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="space-y-3 rounded-lg border border-neutral-200 p-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-neutral-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                        AI 분석 결과
                      </span>
                    </div>

                    {/* Match Score */}
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">매칭 점수</span>
                        <span className="text-xs font-medium text-neutral-700">
                          {confidence?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-neutral-900 transition-all"
                            style={{ width: `${selectedBid.matchScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm font-bold text-neutral-900">
                          {selectedBid.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* Matched Product */}
                    {matchedProduct && (
                      <div className="rounded-lg bg-neutral-50 p-2">
                        <p className="mb-1 text-xs text-neutral-500">추천 제품</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {matchedProduct.name}
                        </p>
                        <p className="text-xs text-neutral-500">{matchedProduct.fullName}</p>
                      </div>
                    )}

                    {/* AI Summary */}
                    {selectedBid.aiSummary && (
                      <div>
                        <p className="mb-1 text-xs text-neutral-500">AI 요약</p>
                        <p className="text-xs leading-relaxed text-neutral-700">
                          {selectedBid.aiSummary}
                        </p>
                      </div>
                    )}

                    {/* Keywords */}
                    <div>
                      <p className="mb-1.5 text-xs text-neutral-500">키워드</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedBid.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2" role="group" aria-label="공고 액션">
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                      aria-label="원본 공고 보기"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      원문
                    </button>
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                      aria-label="AI 분석 실행"
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      분석
                    </button>
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
                      aria-label="제안서 작성 시작"
                    >
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
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600"
            >
              <FunctionIcon name={fn.icon} />
              <code className="font-mono text-xs">{fn.syntax}</code>
            </span>
          ))}
        </div>

        {/* Product Pills */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CMNTECH_PRODUCTS.map((product) => (
            <span
              key={product.id}
              className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              {product.name}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center gap-4">
          <Button size="lg" className="bg-neutral-900 text-white hover:bg-neutral-800" asChild>
            <Link href="/signup">무료로 시작하기</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-neutral-300 hover:bg-neutral-50"
            asChild
          >
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

const SourceBadge = memo(function SourceBadge({
  source,
  label,
}: {
  source: string;
  label: string;
}) {
  const colors: Record<string, string> = {
    narajangto: 'bg-neutral-100 text-neutral-700',
    ted: 'bg-neutral-200 text-neutral-800',
    kwater: 'bg-neutral-100 text-neutral-700',
    kepco: 'bg-neutral-200 text-neutral-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        colors[source] || colors.narajangto
      )}
    >
      {label}
    </span>
  );
});

const StatusBadge = memo(function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const styles: Record<string, string> = {
    new: 'bg-neutral-100 text-neutral-900 border border-neutral-300',
    reviewing: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    preparing: 'bg-neutral-200 text-neutral-700',
    submitted: 'bg-neutral-900 text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        styles[status] || styles.new
      )}
    >
      {label}
    </span>
  );
});

const DdayBadge = memo(function DdayBadge({ dday, isUrgent }: { dday: string; isUrgent: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-bold',
        isUrgent ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
      )}
    >
      {dday}
    </span>
  );
});

const PriorityIndicator = memo(function PriorityIndicator({
  priority,
}: {
  priority: 'high' | 'medium' | 'low';
}) {
  const indicators: Record<string, string> = {
    high: '●●●',
    medium: '●●○',
    low: '●○○',
  };

  return <span className="font-mono text-xs text-neutral-500">{indicators[priority]}</span>;
});

const ScoreBar = memo(function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            score >= 80 ? 'bg-neutral-900' : score >= 60 ? 'bg-neutral-600' : 'bg-neutral-400'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-xs font-medium text-neutral-700">{score}%</span>
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

  return <span className="text-neutral-400">{icons[name] || <Zap className="h-3.5 w-3.5" />}</span>;
});
