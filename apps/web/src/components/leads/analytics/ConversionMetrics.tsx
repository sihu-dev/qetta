/**
 * Conversion Metrics
 * 전환율 지표 카드
 */

'use client';

import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface ConversionMetricsProps {
  data: {
    leadToContacted: number;
    contactedToQualified: number;
    qualifiedToConverted: number;
    overall: number;
  } | null;
}

export function ConversionMetrics({ data }: ConversionMetricsProps) {
  if (!data) {
    return null;
  }

  const metrics = [
    {
      label: '리드 → 접촉',
      value: data.leadToContacted,
      icon: ArrowRightIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
    },
    {
      label: '접촉 → 적격',
      value: data.contactedToQualified,
      icon: SparklesIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
    },
    {
      label: '적격 → 전환',
      value: data.qualifiedToConverted,
      icon: CheckCircleIcon,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-emerald-600',
    },
    {
      label: '전체 전환율',
      value: data.overall,
      icon: ChartBarIcon,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className={`border bg-[#111113] ${metric.borderColor} rounded-lg p-6 transition-all hover:border-opacity-40`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`h-12 w-12 ${metric.bgColor} flex items-center justify-center rounded-lg border ${metric.borderColor}`}
              >
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>

              {/* 전환율 배지 */}
              <div
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${metric.borderColor} ${metric.bgColor} ${metric.color}`}
              >
                {metric.value}%
              </div>
            </div>

            {/* 라벨 */}
            <h3 className="mb-3 text-sm font-medium text-zinc-400">{metric.label}</h3>

            {/* 진행률 바 */}
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full bg-gradient-to-r ${metric.gradientFrom} ${metric.gradientTo} rounded-full transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
