'use client';

/**
 * PainPoints Section - HEPHAITOS Dark Theme
 */
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS } from '@/constants/design-tokens';

const painPoints = [
  {
    before: {
      title: '2시간/일',
      description: '수동 공고 검색',
    },
    after: {
      title: '0분',
      description: '자동 수집 & 알림',
    },
    improvement: '100%',
  },
  {
    before: {
      title: '15건/주',
      description: '키워드 누락으로 놓침',
    },
    after: {
      title: '0건',
      description: 'AI 시맨틱 분석',
    },
    improvement: '100%',
  },
  {
    before: {
      title: '3일',
      description: '제안서 초안 작성',
    },
    after: {
      title: '30분',
      description: 'AI 자동 생성',
    },
    improvement: '95%',
  },
];

export function PainPoints() {
  return (
    <section className={cn('py-24', BG_COLORS.primary)} id="painpoints">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
            Before → After
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            입찰 업무, 이렇게 바뀝니다
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            반복 업무는 AI에게, 핵심 업무에 집중하세요
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {painPoints.map((point, idx) => (
            <div
              key={idx}
              className={cn(
                'group relative overflow-hidden rounded-2xl transition-all hover:border-white/[0.12]',
                GLASS.card
              )}
            >
              {/* Before (Problem) */}
              <div className="border-b border-white/[0.06] bg-white/[0.02] p-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Before
                </div>
                <div className="text-2xl font-bold text-zinc-400">{point.before.title}</div>
                <div className="mt-1 text-sm text-zinc-500">{point.before.description}</div>
              </div>

              {/* Arrow */}
              <div className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-[#0D0D0F]">
                <svg
                  className="h-4 w-4 text-[#5E6AD2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {/* After (Solution) */}
              <div className="bg-transparent p-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
                  With Qetta
                </div>
                <div className="text-2xl font-bold text-white">{point.after.title}</div>
                <div className="mt-1 text-sm text-zinc-400">{point.after.description}</div>
              </div>

              {/* Improvement Badge */}
              <div className="absolute right-4 top-4 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 text-xs font-bold text-emerald-400">
                -{point.improvement}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-zinc-400">
            <span className="font-semibold text-white">127개 기업</span>이 Qetta로 입찰 업무를 자동화했습니다
          </p>
        </div>
      </div>
    </section>
  );
}

export default PainPoints;
