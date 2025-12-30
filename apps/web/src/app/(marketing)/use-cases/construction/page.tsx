/**
 * 건설업 활용 사례 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Check, ArrowRight, Quote, TrendingUp } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.useCases.construction);

const challenges = [
  '수많은 공고 중 적합한 프로젝트를 찾기 어려움',
  '복잡한 입찰 자격 요건 검토에 많은 시간 소요',
  '실적 증명 서류 준비가 번거롭고 시간이 걸림',
  '협력업체와의 견적 조율 및 관리가 복잡함',
];

const solutions = [
  {
    title: '프로젝트 유형별 필터링',
    description: '토목, 건축, 설비, 전기 등 공종별로 공고를 자동 분류하여 관련 공고만 확인합니다.',
  },
  {
    title: '자격 요건 자동 검토',
    description: '귀사의 면허, 실적, 자본금 등을 분석하여 참여 가능한 공고만 추천합니다.',
  },
  {
    title: '실적 관리 시스템',
    description: '과거 실적을 체계적으로 관리하고 공고 요건에 맞는 실적을 자동으로 매칭합니다.',
  },
  {
    title: '견적 협업 도구',
    description: '협력업체와 견적을 공유하고 실시간으로 협업하여 입찰가를 산출합니다.',
  },
];

const results = [
  { metric: '65%', label: '입찰 분석 시간 절감' },
  { metric: '28%', label: '평균 낙찰률' },
  { metric: '2.5배', label: '입찰 참여 건수 증가' },
  { metric: '40%', label: '견적 작성 시간 단축' },
];

const caseStudy = {
  company: '한성건설',
  industry: '토목 건설',
  quote:
    '이전에는 공고 검토에만 하루 4시간을 썼는데, Qetta 덕분에 30분이면 충분합니다. 실적 관리 기능이 특히 유용해요.',
  person: '박진수 이사',
  results: [
    '공고 검토 시간 87% 단축',
    '자격 미달 입찰 참여 0건 달성',
    '입찰 성공률 18%에서 28%로 향상',
  ],
};

const projectTypes = [
  '토목 공사',
  '건축 공사',
  '설비 공사',
  '전기 공사',
  '통신 공사',
  '조경 공사',
  '도로 공사',
  '상하수도',
  '플랜트',
  '리모델링',
  '인테리어',
  '철거 공사',
];

export default function ConstructionPage() {
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
                <Building2 className="h-8 w-8 text-[#7C8AEA]" />
              </div>
              <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">건설업</Badge>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              건설업 입찰 자동화
            </h1>
            <p className="text-zinc-400 mb-8 max-w-2xl text-xl">
              토목, 건축, 플랜트 등 건설 분야를 위한 맞춤형 입찰 관리 솔루션. 자격 검토부터 견적
              협업까지 전 과정을 지원합니다.
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
            <h2 className="mb-8 text-center text-3xl font-bold text-white">건설업의 입찰 과제</h2>
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
              건설업 특화 기능으로 입찰 업무를 혁신합니다
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

      {/* Project Types */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-2xl font-bold text-white">지원 공종</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {projectTypes.map((type) => (
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
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">건설업 입찰 자동화를 시작하세요</h2>
          <p className="text-zinc-400 mb-8">
            14일 무료 체험으로 Qetta의 가치를 직접 확인해보세요.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:text-white">
              <Link href="/use-cases/it-services">
                다른 산업 보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
