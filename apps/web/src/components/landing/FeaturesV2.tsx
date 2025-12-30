'use client';

/**
 * Features Section V2
 * Minimal icons, quantified results
 * Google DeepMind-inspired clean design
 */
import { useTenant, useTenantProducts } from '@/contexts/TenantContext';

// Core features with quantified benefits - DeepMind style
const coreFeatures = [
  {
    number: '01',
    title: 'Intelligent Discovery',
    subtitle: '45 Sources · Real-time Sync',
    description:
      '나라장터, TED, SAM.gov 등 45개 소스를 24/7 모니터링. Semantic Analysis로 키워드 의존 없이 관련 공고를 100% 포착합니다.',
    metric: '47/week',
    metricLabel: 'Avg. Captured',
    highlight: true,
  },
  {
    number: '02',
    title: 'Precision Matching',
    subtitle: 'Product-to-Bid Alignment',
    description:
      '제품 스펙과 공고 요구사항을 AI가 자동 분석. =AI_SCORE() 함수로 적합도 점수와 매칭 근거를 즉시 확인.',
    metric: '92%',
    metricLabel: 'Accuracy',
    highlight: false,
  },
  {
    number: '03',
    title: 'Auto Proposal',
    subtitle: 'Template-based Generation',
    description:
      '매칭 결과와 공고 분석을 바탕으로 제안서 초안을 자동 생성. 일관된 품질과 브랜드 톤 유지.',
    metric: '95%↓',
    metricLabel: 'Time Reduction',
    highlight: false,
  },
];

export function FeaturesV2() {
  const tenant = useTenant();
  const products = useTenantProducts();

  const sectionTitle = products.length > 0 ? `${tenant.branding.name} 맞춤 기능` : '핵심 기능';

  return (
    <section className="bg-white py-24" id="features">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-neutral-700">
            {sectionTitle}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            AI-Native Workflow
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            Three-step automation for the entire bidding lifecycle
          </p>
        </div>

        {/* Features List - Vertical Layout */}
        <div className="mx-auto max-w-4xl space-y-6">
          {coreFeatures.map((feature) => (
            <div
              key={feature.number}
              className={`group relative rounded-2xl border p-8 transition-all ${
                feature.highlight
                  ? 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* Number */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                    feature.highlight
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {feature.number}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{feature.subtitle}</p>
                    </div>

                    {/* Metric Badge */}
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`text-2xl font-bold ${
                          feature.highlight ? 'text-neutral-900' : 'text-neutral-900'
                        }`}
                      >
                        {feature.metric}
                      </div>
                      <div className="text-xs text-neutral-500">{feature.metricLabel}</div>
                    </div>
                  </div>

                  <p className="mt-4 leading-relaxed text-neutral-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Functions Preview */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-neutral-600" />
              <div className="h-3 w-3 rounded-full bg-neutral-500" />
              <div className="h-3 w-3 rounded-full bg-neutral-400" />
              <span className="ml-2 font-mono text-xs text-neutral-500">Qetta Spreadsheet</span>
            </div>
            <div className="font-mono text-sm">
              <div className="flex">
                <span className="w-12 text-neutral-500">A1</span>
                <span className="text-neutral-300">=AI_SCORE(</span>
                <span className="text-white">&quot;나라장터 공고 2024-12345&quot;</span>
                <span className="text-neutral-300">)</span>
              </div>
              <div className="mt-2 flex">
                <span className="w-12 text-neutral-500">→</span>
                <span className="font-bold text-white">92</span>
                <span className="ml-4 text-neutral-500">{/* 적합도 점수 */}</span>
              </div>
              <div className="mt-4 flex">
                <span className="w-12 text-neutral-500">B1</span>
                <span className="text-neutral-300">=AI_MATCH(</span>
                <span className="text-white">&quot;UR-1000PLUS&quot;</span>
                <span className="text-neutral-300">)</span>
              </div>
              <div className="mt-2 flex">
                <span className="w-12 text-neutral-500">→</span>
                <span className="font-bold text-white">&quot;유량측정 정밀도 0.5% 충족&quot;</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-neutral-500">
            스프레드시트에서 AI 함수를 수식처럼 사용하세요
          </p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesV2;
