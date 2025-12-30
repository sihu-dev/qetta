'use client';

import { useState } from 'react';
import { PresentationChartLineIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';

const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

// Mock chart data
const generateChartData = (days: number) => {
  const data = [];
  let value = 100;
  for (let i = 0; i < days; i++) {
    value = value + (Math.random() - 0.45) * 5;
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      value: Math.max(80, Math.min(150, value)),
    });
  }
  return data;
};

const chartData = generateChartData(30);
const maxValue = Math.max(...chartData.map((d) => d.value));
const minValue = Math.min(...chartData.map((d) => d.value));

export function PerformanceChart() {
  const { t, locale } = useI18n();
  const [selectedRange, setSelectedRange] = useState('1M');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <PresentationChartLineIcon className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-white">
            {t('dashboard.performanceChart.title') as string}
          </span>
        </div>
        <div className="flex items-center gap-0.5 rounded border border-white/[0.06] bg-white/[0.02] p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium transition-colors',
                selectedRange === range
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Current Stats */}
        <div className="mb-5 flex items-center gap-6">
          <div>
            <p className="mb-1 text-xs text-zinc-400">
              {t('dashboard.performanceChart.currentValue') as string}
            </p>
            <p className="text-xl font-medium text-white">
              {locale === 'ko' ? '₩128,470,000' : '$128,470'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-zinc-400">
              {t('dashboard.performanceChart.returnRate') as string}
            </p>
            <div className="flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-base font-medium text-emerald-400">+28.47%</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-40">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-white/[0.04]" />
            ))}
          </div>

          {/* SVG Chart */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 160"
            preserveAspectRatio="none"
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path
              d={`
                M 0 ${160 - ((chartData[0].value - minValue) / (maxValue - minValue)) * 160}
                ${chartData
                  .map((d, i) => {
                    const x = (i / (chartData.length - 1)) * 100;
                    const y = 160 - ((d.value - minValue) / (maxValue - minValue)) * 160;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}
                L 100 160
                L 0 160
                Z
              `}
              fill="url(#chartGradient)"
            />

            {/* Line */}
            <path
              d={`
                M 0 ${160 - ((chartData[0].value - minValue) / (maxValue - minValue)) * 160}
                ${chartData
                  .map((d, i) => {
                    const x = (i / (chartData.length - 1)) * 100;
                    const y = 160 - ((d.value - minValue) / (maxValue - minValue)) * 160;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}
              `}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Interactive Points */}
          <div className="absolute inset-0 flex items-stretch">
            {chartData.map((d, i) => (
              <div
                key={i}
                className="relative flex-1 cursor-crosshair"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {hoveredPoint === i && (
                  <div
                    className="absolute left-1/2 z-10 -translate-x-1/2 rounded border border-white/[0.1] bg-[#111113] px-2.5 py-1.5"
                    style={{
                      bottom: `${((d.value - minValue) / (maxValue - minValue)) * 100}%`,
                      marginBottom: '8px',
                    }}
                  >
                    <p className="text-[10px] text-zinc-400">
                      {d.date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs font-medium text-white">{d.value.toFixed(2)}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
          {locale === 'ko' ? (
            <>
              <span>11월 12일</span>
              <span>11월 22일</span>
              <span>12월 2일</span>
              <span>12월 12일</span>
            </>
          ) : (
            <>
              <span>Nov 12</span>
              <span>Nov 22</span>
              <span>Dec 2</span>
              <span>Dec 12</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
