'use client';

/**
 * 핵심 기능 섹션 - 동적 화이트라벨 버전
 */
import { Search, Target, Sparkles, FileText, Bell, Cpu, type LucideIcon } from 'lucide-react';

// 아이콘 매핑
const iconMap: Record<string, LucideIcon> = {
  Search,
  Target,
  Sparkles,
  FileText,
  Bell,
  Cpu,
};

// 범용 Features
const DEFAULT_FEATURES = [
  {
    icon: 'Search',
    title: '공고 자동 수집',
    description:
      '나라장터, TED, SAM.gov 등 45개 이상의 데이터 소스에서 입찰 공고를 AI가 자동으로 수집합니다.',
  },
  {
    icon: 'Cpu',
    title: 'AI 제품 매칭',
    description: '귀사 제품과 공고 요구사항을 자동 분석하여 적합도 점수를 산출합니다.',
  },
  {
    icon: 'Sparkles',
    title: 'AI 스마트 함수',
    description: '=AI_SCORE(), =AI_MATCH() 등 스프레드시트에서 AI 분석을 수식처럼 바로 실행합니다.',
  },
  {
    icon: 'FileText',
    title: '맞춤 제안서 생성',
    description: '매칭된 제품 정보와 공고 분석 결과를 바탕으로 제안서 초안을 자동 생성합니다.',
  },
];


export function Features() {
  const features = DEFAULT_FEATURES;
  const sectionTitle = '입찰 자동화의 핵심 기능';

  return (
    <section className="bg-white py-24" id="features">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            복잡한 입찰 프로세스를 AI가 대신 처리합니다. 핵심 업무에만 집중하세요.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = iconMap[feature.icon] || Search;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:border-neutral-400 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 transition-colors group-hover:bg-neutral-900">
                  <Icon className="h-6 w-6 text-neutral-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{feature.description}</p>
                <div className="absolute right-4 top-4 font-mono text-xs text-neutral-300">
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
