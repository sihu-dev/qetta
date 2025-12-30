/**
 * 작동 방식 섹션 - CMNTech 제품 매칭 버전
 */
import { Package, Sparkles, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Package,
    step: '01',
    title: 'CMNTech 제품 등록',
    description:
      'UR-1000PLUS, MF-1000C 등 5개 유량계/열량계 제품이 기본 등록되어 있습니다. 추가 제품도 등록 가능합니다.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'AI 공고 매칭',
    description:
      'AI가 매일 수백 개의 공고를 분석하여 초음파유량계, 비만관형 등 적합한 제품을 자동 매칭합니다.',
  },
  {
    icon: Trophy,
    step: '03',
    title: '입찰 준비 완료',
    description:
      '매칭 점수, AI 요약, 갭 분석 결과로 빠르게 입찰 여부를 결정하고 제안서를 작성하세요.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-neutral-50 py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            간단한 3단계로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-neutral-500">복잡한 설정 없이 바로 사용할 수 있습니다.</p>
        </div>

        {/* Steps */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[60%] top-12 hidden h-px w-[80%] bg-neutral-300 md:block" />
              )}

              {/* Step Number */}
              <div className="relative mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-neutral-200 bg-white shadow-sm">
                <item.icon className="h-10 w-10 text-neutral-700" />
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 font-mono text-sm font-bold text-white">
                  {item.step}
                </span>
              </div>

              <h3 className="mb-2 text-xl font-semibold text-neutral-900">{item.title}</h3>
              <p className="text-neutral-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
