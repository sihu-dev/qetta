/**
 * HowItWorks Section - HEPHAITOS Dark Theme
 */
import { Search, Cpu, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS } from '@/constants/design-tokens';

const steps = [
  {
    icon: Search,
    step: '01',
    title: '제품/서비스 등록',
    description:
      '귀사의 제품 또는 서비스 정보를 등록하세요. 사양, 키워드, 과거 수주 이력을 바탕으로 AI가 학습합니다.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI 자동 매칭',
    description:
      'AI가 45개 플랫폼의 공고를 실시간 분석하여 귀사에 적합한 입찰 기회를 자동으로 찾아 알려드립니다.',
  },
  {
    icon: FileCheck,
    step: '03',
    title: '입찰 준비 완료',
    description:
      '매칭 점수, AI 요약, 마감일 알림으로 빠르게 입찰 여부를 결정하고 제안서까지 자동 생성하세요.',
  },
];

export function HowItWorks() {
  return (
    <section className={cn('py-24', BG_COLORS.secondary)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
            How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            3단계로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-zinc-400">복잡한 설정 없이 바로 사용할 수 있습니다</p>
        </div>

        {/* Steps */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[60%] top-12 hidden h-px w-[80%] bg-white/[0.06] md:block" />
              )}

              {/* Step Number */}
              <div className={cn(
                'relative mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full',
                GLASS.cardRaised
              )}>
                <item.icon className="h-10 w-10 text-[#7C8AEA]" />
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] font-mono text-sm font-bold text-white">
                  {item.step}
                </span>
              </div>

              <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
