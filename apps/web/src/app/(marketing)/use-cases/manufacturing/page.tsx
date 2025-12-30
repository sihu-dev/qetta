/**
 * 제조업 활용 사례 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Factory, Check, ArrowRight, Quote, TrendingUp } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.useCases.manufacturing);

const challenges = [
  '여러 플랫폼의 공고를 일일이 확인하는데 많은 시간 소요',
  '제품 사양과 공고 요구사항 비교가 복잡하고 어려움',
  '마감일 관리가 어렵고 기회를 놓치는 경우 발생',
  '제안서 작성에 과도한 시간과 리소스 투입',
];

const solutions = [
  {
    title: '자동 공고 수집',
    description:
      '산업용 장비, 계측기기, 제어장치 관련 공고를 자동으로 수집하여 한곳에서 관리합니다.',
  },
  {
    title: 'AI 제품 매칭',
    description: '제품 카탈로그와 공고 요구사항을 AI가 자동으로 비교하여 적합도를 분석합니다.',
  },
  {
    title: '기술 제안서 자동 생성',
    description: '제품 사양서를 기반으로 기술 제안서 초안을 자동으로 작성합니다.',
  },
  {
    title: '실시간 마감 알림',
    description: '중요 공고의 마감일을 실시간으로 알려 기회를 놓치지 않습니다.',
  },
];

const results = [
  { metric: '78%', label: '입찰 분석 시간 절감' },
  { metric: '32%', label: '평균 낙찰률' },
  { metric: '3배', label: '입찰 참여 건수 증가' },
  { metric: '50%', label: '제안서 작성 시간 단축' },
];

const caseStudy = {
  company: 'A사',
  industry: '산업용 장비 제조',
  quote:
    'Qetta 도입 후 입찰 관련 업무 시간이 80% 이상 줄었습니다. 이전에는 3명이 하루 종일 공고를 확인했는데, 지금은 1명이 1시간이면 충분합니다.',
  person: '도입 기업 담당자',
  results: ['월 50건 이상 공고 자동 수집', '입찰 참여율 3배 증가', '낙찰률 15%에서 32%로 향상'],
};

const productTypes = [
  '유량계',
  '압력계',
  '온도계',
  '레벨계',
  'PLC',
  'HMI',
  '인버터',
  '모터',
  '밸브',
  '펌프',
  '센서',
  '변환기',
];

export default function ManufacturingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/use-cases"
              className="text-zinc-500 hover:text-zinc-300 mb-6 inline-flex items-center gap-2 text-sm transition-colors"
            >
              ← 활용 사례로 돌아가기
            </Link>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E6AD2]/10">
                <Factory className="h-8 w-8 text-[#7C8AEA]" />
              </div>
              <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">제조업</Badge>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              제조업 입찰 자동화
            </h1>
            <p className="text-zinc-400 mb-8 max-w-2xl text-xl">
              산업용 장비, 계측기기, 부품 제조업체를 위한 맞춤형 입찰 자동화 솔루션. 공고 수집부터
              제안서 작성까지 전 과정을 자동화합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:text-white">
                <Link href="/contact">상담 요청</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">제조업의 입찰 과제</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {challenges.map((challenge, index) => (
                <div key={index} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] flex items-start gap-3 rounded-lg p-4">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#5E6AD2]/10 text-sm font-medium text-[#7C8AEA]">
                    {index + 1}
                  </div>
                  <span className="text-zinc-300">{challenge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 bg-[#0D0D0F]">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">Qetta 솔루션</h2>
            <p className="text-zinc-400 mb-12 text-center">
              제조업 특화 기능으로 입찰 업무를 혁신합니다
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {solutions.map((solution) => (
                <div key={solution.title} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C8AEA]" />
                    <div>
                      <h3 className="mb-2 font-semibold text-white">{solution.title}</h3>
                      <p className="text-zinc-400 text-sm">{solution.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">도입 효과</h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-4">
            {results.map((result) => (
              <div key={result.label} className="text-center">
                <p className="mb-2 text-4xl font-bold text-white">{result.metric}</p>
                <p className="text-sm text-white/80">{result.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 bg-[#0D0D0F]">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">고객 사례</h2>
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
              <div className="mb-6 flex items-start gap-4">
                <Quote className="h-8 w-8 flex-shrink-0 text-[#7C8AEA]" />
                <div>
                  <p className="mb-4 text-lg italic text-zinc-300">{caseStudy.quote}</p>
                  <p className="font-medium text-white">{caseStudy.person}</p>
                  <p className="text-zinc-500 text-sm">
                    {caseStudy.company} · {caseStudy.industry}
                  </p>
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-6">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <TrendingUp className="h-5 w-5 text-[#7C8AEA]" />
                  도입 성과
                </h4>
                <ul className="space-y-2">
                  {caseStudy.results.map((result) => (
                    <li key={result} className="flex items-center gap-2 text-zinc-300">
                      <Check className="h-4 w-4 text-[#7C8AEA]" />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Types */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-2xl font-bold text-white">지원 제품 분야</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {productTypes.map((type) => (
                <Badge key={type} variant="outline" className="px-3 py-1.5 text-sm border-white/[0.06] text-zinc-400">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0D0D0F]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">제조업 입찰 자동화를 시작하세요</h2>
          <p className="text-zinc-400 mb-8">
            14일 무료 체험으로 Qetta의 가치를 직접 확인해보세요.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:text-white">
              <Link href="/use-cases/construction">
                다른 산업 보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
