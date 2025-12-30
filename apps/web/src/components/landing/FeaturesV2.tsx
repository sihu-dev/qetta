'use client';

/**
 * Features Section V2 - HEPHAITOS Dark Theme
 */
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS } from '@/constants/design-tokens';

const coreFeatures = [
  {
    number: '01',
    title: '실시간 공고 수집',
    subtitle: '45개 플랫폼 · 24/7 모니터링',
    description:
      '나라장터, TED, SAM.gov 등 국내외 45개 입찰 플랫폼을 실시간 모니터링. 키워드 의존 없이 AI가 관련 공고를 100% 포착합니다.',
    metric: '47건/주',
    metricLabel: '평균 수집',
    highlight: true,
  },
  {
    number: '02',
    title: 'AI 자동 매칭',
    subtitle: '제품-공고 적합도 분석',
    description:
      '귀사 제품/서비스와 공고 요구사항을 AI가 자동 분석. 매칭 점수와 분석 근거를 스프레드시트에서 바로 확인.',
    metric: '92%',
    metricLabel: '매칭 정확도',
    highlight: false,
  },
  {
    number: '03',
    title: '제안서 자동 생성',
    subtitle: '템플릿 기반 AI 작성',
    description:
      '공고 분석 결과를 바탕으로 제안서 초안을 자동 생성. 브랜드 톤과 일관된 품질 유지.',
    metric: '95%↓',
    metricLabel: '작성 시간',
    highlight: false,
  },
];

export function FeaturesV2() {
  return (
    <section className={cn('py-24', BG_COLORS.primary)} id="features">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
            Core Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            End-to-End 입찰 자동화
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            발견 → 분석 → 작성, 전 과정을 AI가 처리합니다
          </p>
        </div>

        {/* Features List */}
        <div className="mx-auto max-w-4xl space-y-6">
          {coreFeatures.map((feature) => (
            <div
              key={feature.number}
              className={cn(
                'group relative rounded-2xl p-6 sm:p-8 transition-all',
                feature.highlight ? GLASS.cardRaised : GLASS.card,
                'hover:border-white/[0.12]'
              )}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* Number */}
                <div
                  className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold',
                    feature.highlight
                      ? 'bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white'
                      : 'bg-white/[0.06] text-zinc-400'
                  )}
                >
                  {feature.number}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{feature.subtitle}</p>
                    </div>

                    {/* Metric Badge */}
                    <div className="flex-shrink-0 text-right">
                      <div className={cn(
                        'text-2xl font-bold',
                        feature.highlight ? 'text-[#7C8AEA]' : 'text-white'
                      )}>
                        {feature.metric}
                      </div>
                      <div className="text-xs text-zinc-500">{feature.metricLabel}</div>
                    </div>
                  </div>

                  <p className="mt-4 leading-relaxed text-zinc-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Functions Preview */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className={cn('rounded-2xl p-6', GLASS.cardRaised)}>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28CA41]" />
              <span className="ml-2 font-mono text-xs text-zinc-500">Qetta Spreadsheet</span>
            </div>
            <div className="font-mono text-sm">
              <div className="flex">
                <span className="w-12 text-zinc-500">A1</span>
                <span className="text-zinc-400">=AI_SCORE(</span>
                <span className="text-white">&quot;공고-2024-12345&quot;</span>
                <span className="text-zinc-400">)</span>
              </div>
              <div className="mt-2 flex">
                <span className="w-12 text-zinc-500">→</span>
                <span className="font-bold text-[#7C8AEA]">92%</span>
                <span className="ml-4 text-zinc-500">{/* 매칭 점수 */}</span>
              </div>
              <div className="mt-4 flex">
                <span className="w-12 text-zinc-500">B1</span>
                <span className="text-zinc-400">=AI_SUMMARY(</span>
                <span className="text-white">&quot;공고-2024-12345&quot;</span>
                <span className="text-zinc-400">)</span>
              </div>
              <div className="mt-2 flex">
                <span className="w-12 text-zinc-500">→</span>
                <span className="font-bold text-emerald-400">&quot;수처리 설비 교체 공고...&quot;</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-zinc-500">
            스프레드시트에서 AI 함수를 수식처럼 사용하세요
          </p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesV2;
