/**
 * TED 연동 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Check, Globe, Languages, FileSearch, Sparkles } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.integrations.ted);

const features = [
  {
    icon: Globe,
    title: 'EU 전역 커버리지',
    description: 'EU 27개 회원국 및 EEA 국가의 모든 공공조달 공고를 수집합니다.',
  },
  {
    icon: Languages,
    title: '자동 번역',
    description: '원문 공고를 한국어로 자동 번역하여 제공합니다.',
  },
  {
    icon: FileSearch,
    title: 'CPV 코드 매칭',
    description: 'CPV(공통조달용어) 코드로 제품과 공고를 자동 매칭합니다.',
  },
  {
    icon: Sparkles,
    title: 'AI 요약',
    description: '긴 공고 내용을 AI가 핵심 요약하여 제공합니다.',
  },
];

const countries = [
  '독일',
  '프랑스',
  '이탈리아',
  '스페인',
  '폴란드',
  '네덜란드',
  '벨기에',
  '스웨덴',
  '오스트리아',
  '덴마크',
  '핀란드',
  '아일랜드',
  '포르투갈',
  '그리스',
  '체코',
  '루마니아',
  '헝가리',
  '슬로바키아',
  '크로아티아',
  '슬로베니아',
  '리투아니아',
  '라트비아',
  '에스토니아',
  '불가리아',
  '룩셈부르크',
  '키프로스',
  '몰타',
];

const procedureTypes = [
  { type: '공개 입찰', description: 'Open procedure' },
  { type: '제한 입찰', description: 'Restricted procedure' },
  { type: '협상 절차', description: 'Negotiated procedure' },
  { type: '경쟁적 대화', description: 'Competitive dialogue' },
  { type: '혁신 파트너십', description: 'Innovation partnership' },
  { type: '설계 경쟁', description: 'Design contest' },
];

const stats = [
  { label: '월 평균 공고 수', value: '80,000+' },
  { label: '커버리지', value: '27개국' },
  { label: '언어 지원', value: '24개 언어' },
  { label: 'CPV 코드', value: '9,000+' },
];

export default function TedPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/integrations"
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> 연동 플랫폼으로 돌아가기
            </Link>
            <div className="mb-6 flex items-center gap-4">
              <span className="text-5xl">🇪🇺</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white md:text-4xl">TED</h1>
                  <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
                    지원
                  </Badge>
                </div>
                <p className="text-zinc-400">Tenders Electronic Daily</p>
              </div>
            </div>
            <p className="mb-8 max-w-2xl text-xl text-zinc-400">
              유럽연합 공식 공공조달 플랫폼인 TED의 모든 공고를 한국어로 번역하여 제공합니다. EU
              시장 진출의 첫 걸음을 Qetta와 함께하세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90"
              >
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/[0.06] bg-white/[0.04] text-white hover:bg-white/[0.08]"
              >
                <Link href="https://ted.europa.eu" target="_blank">
                  TED 방문 →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0A0A0A] py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[#7C8AEA]">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">연동 기능</h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                  <feature.icon className="h-6 w-6 text-[#7C8AEA]" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">지원 국가</h2>
            <p className="mb-12 text-center text-zinc-400">
              EU 27개 회원국의 공고를 모두 수집합니다
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {countries.map((country) => (
                <Badge
                  key={country}
                  variant="outline"
                  className="px-3 py-1.5 text-sm border-white/[0.06] bg-white/[0.04] text-zinc-300"
                >
                  {country}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Procedure Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">지원 절차 유형</h2>
            <p className="mb-12 text-center text-zinc-400">
              EU 공공조달의 모든 절차 유형을 지원합니다
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {procedureTypes.map((item) => (
                <div
                  key={item.type}
                  className="rounded-lg bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[#7C8AEA]" />
                    <div>
                      <h4 className="font-medium text-white">{item.type}</h4>
                      <p className="text-sm text-zinc-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">EU 시장 진출을 시작하세요</h2>
          <p className="mb-8 text-white/80">14일 무료 체험으로 TED 공고를 한국어로 확인하세요.</p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white text-[#5E6AD2] hover:bg-white/90"
          >
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
