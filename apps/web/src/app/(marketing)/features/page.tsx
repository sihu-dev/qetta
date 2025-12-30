/**
 * 기능 소개 페이지
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  FileText,
  Bell,
  LayoutGrid,
  Users,
  Download,
  Code,
  Shield,
  Zap,
} from 'lucide-react';

const mainFeatures = [
  {
    icon: Search,
    title: '멀티 플랫폼 공고 수집',
    description:
      '나라장터(G2B), TED(EU), SAM.gov(미국), KEPCO 등 주요 공공입찰 플랫폼에서 실시간으로 공고를 자동 수집합니다.',
    details: [
      '매일 3회 자동 크롤링 (9시, 15시, 21시)',
      '키워드 기반 필터링',
      '새 공고 즉시 알림',
      '커스텀 플랫폼 추가 가능',
    ],
  },
  {
    icon: Sparkles,
    title: 'AI 기반 매칭 분석',
    description:
      'Claude AI가 귀사 제품과 공고 요구사항을 분석하여 적합도를 자동으로 평가하고 점수를 매깁니다.',
    details: [
      '제품 사양 자동 매칭',
      '요구사항 충족도 분석',
      '경쟁력 평가',
      '매칭 점수 및 근거 제공',
    ],
  },
  {
    icon: FileText,
    title: '제안서 초안 자동 생성',
    description:
      '공고 분석 결과를 바탕으로 제안서 초안을 AI가 자동으로 작성합니다. 수정만 하면 완성됩니다.',
    details: ['템플릿 기반 생성', '공고 맞춤 내용 구성', '기술 제안서 초안', '가격 전략 제안'],
  },
  {
    icon: Bell,
    title: '스마트 알림 시스템',
    description:
      '중요 공고의 마감일, 새 공고 발견, 상태 변경 등을 이메일과 Slack으로 알려드립니다.',
    details: [
      '마감 D-7, D-3, D-1 자동 알림',
      '새 공고 실시간 알림',
      'Slack 채널 연동',
      '알림 조건 커스터마이징',
    ],
  },
];

const additionalFeatures = [
  {
    icon: LayoutGrid,
    title: '스프레드시트 뷰',
    description: 'Google Sheets 스타일의 직관적인 UI로 수백 개의 공고를 한눈에 관리하세요.',
  },
  {
    icon: Users,
    title: '팀 협업',
    description: '팀원과 공고를 공유하고 코멘트를 남겨 효율적으로 협업하세요.',
  },
  {
    icon: Download,
    title: '내보내기',
    description: 'CSV, Excel, JSON 형식으로 데이터를 내보내어 다른 시스템과 연동하세요.',
  },
  {
    icon: Code,
    title: 'REST API',
    description: '강력한 API를 통해 기존 시스템과 통합하거나 자동화 워크플로우를 구축하세요.',
  },
  {
    icon: Shield,
    title: '보안 & 규정 준수',
    description: '엔터프라이즈급 보안으로 데이터를 안전하게 보호합니다.',
  },
  {
    icon: Zap,
    title: '빠른 성능',
    description: '최적화된 인프라로 수천 건의 공고도 빠르게 처리합니다.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-[#0D0D0F] min-h-screen">
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              기능 소개
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              입찰 업무의 모든 것을
              <br />
              자동화합니다
            </h1>
            <p className="text-zinc-400 mt-6 text-lg">
              공고 수집부터 제안서 작성까지, Qetta가 입찰 프로세스 전체를 혁신합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-12 lg:flex-row ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Icon & Title */}
                <div className="lg:w-1/2">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E6AD2]/10">
                    <feature.icon className="h-8 w-8 text-[#7C8AEA]" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">{feature.title}</h2>
                  <p className="text-zinc-400 mb-6 text-lg">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#5E6AD2]" />
                        <span className="text-zinc-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Placeholder for Screenshot */}
                <div className="lg:w-1/2">
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] bg-gradient-to-br from-[#5E6AD2]/5 to-[#5E6AD2]/10">
                    <span className="text-zinc-500">스크린샷 영역</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">그 외 다양한 기능</h2>
            <p className="text-zinc-400 mt-4 text-lg">업무 효율을 높이는 부가 기능들</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 transition-all hover:bg-white/[0.06] hover:border-white/[0.1]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                  <feature.icon className="h-5 w-5 text-[#7C8AEA]" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">지금 바로 시작하세요</h2>
          <p className="mb-8 text-lg text-white/90">14일 무료 체험으로 모든 기능을 경험해보세요.</p>
          <Button size="lg" variant="secondary" asChild className="bg-white text-[#5E6AD2] hover:bg-white/90">
            <Link href="/signup">무료로 시작하기</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
