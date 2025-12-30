/**
 * 연구팀 포트폴리오 페이지
 * HEPHAITOS Dark Theme
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '연구팀 | Qetta',
  description: 'KAIST 연계 데이터 분석 및 예측 전문 연구팀',
};

// 연구 분야
const researchAreas = [
  {
    title: '확률적 미래 예측',
    description: 'Probabilistic Forecasting Methods',
    applications: ['입찰 낙찰률 예측', '시장 수요 예측', '가격 변동 분석'],
  },
  {
    title: '통계적 리스크 추정',
    description: 'Statistical Risk Estimation',
    applications: ['입찰 리스크 평가', '경쟁사 분석', '의사결정 지원'],
  },
  {
    title: '데이터 기반 의사결정',
    description: 'Data-Driven Decision Making',
    applications: ['공고 매칭', '우선순위 도출', '자동화 시스템'],
  },
  {
    title: '시계열 분석 & 예측',
    description: 'Time Series & Forecasting',
    applications: ['공고 트렌드 분석', '예산 사이클 예측', '시장 동향 파악'],
  },
];

// 연구 프로젝트
const projects = [
  {
    title: '2차시장 가치평가모형 개발',
    partner: '차란-마인이즈',
    type: '산학협력',
    status: 'active',
  },
  {
    title: '풍력발전량 예측 기반 VPP 플랫폼',
    partner: '중소벤처기업부, 브이피피랩',
    type: '정부과제',
    status: 'active',
  },
  {
    title: '생명보험 시장 예측',
    partner: '교보생명, 디플래닉스',
    type: '산학협력',
    status: 'active',
  },
  {
    title: '관세청 조기경보시스템 고도화',
    partner: '관세청',
    type: '정부과제',
    status: 'active',
  },
  {
    title: '안구건조증 진단 시스템',
    partner: '삼성의료원',
    type: '의료AI',
    status: 'active',
  },
];

// 교육 프로그램
const courses = [
  {
    code: 'GFS701',
    title: 'Quantitative Research Methodology',
    description: '정량적 연구 방법론',
  },
  {
    code: 'FS693',
    title: 'Time Series & AI Forecasting',
    description: '시계열 분석 및 예측',
  },
];

// 연구팀 현황
const teamStats = [
  { label: 'PhD 졸업', value: 3 },
  { label: 'PhD 재학', value: 9 },
  { label: 'MSc 졸업', value: 12 },
  { label: 'MSc 재학', value: 13 },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              Research Team
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-white">
              데이터 분석 & 예측 전문 연구팀
            </h1>
            <p className="mb-6 text-lg text-zinc-400">
              KAIST 문술대학원 연계 연구팀으로, 확률적 예측 모형과 데이터 기반 의사결정 시스템을
              개발합니다.
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>Seoul National University</span>
              <span className="text-zinc-600">|</span>
              <span>London Business School</span>
              <span className="text-zinc-600">|</span>
              <span>University of Oxford</span>
            </div>
          </div>
        </div>
      </section>

      {/* 팀 현황 */}
      <section className="border-b border-white/[0.06] bg-[#0A0A0A]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {teamStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 연구 분야 */}
      <section className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">연구 분야</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {researchAreas.map((area) => (
              <div
                key={area.title}
                className="rounded-lg border border-white/[0.06] bg-white/[0.04] p-6 transition-colors hover:border-[#5E6AD2]/50"
              >
                <h3 className="mb-1 text-lg font-semibold text-white">{area.title}</h3>
                <p className="mb-4 text-sm text-zinc-500">{area.description}</p>
                <div className="flex flex-wrap gap-2">
                  {area.applications.map((app) => (
                    <Badge key={app} variant="outline" className="text-xs border-white/[0.06] text-zinc-400">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 연구 프로젝트 */}
      <section className="border-b border-white/[0.06] bg-[#0A0A0A]">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">연구 프로젝트</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.title}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.04] p-4"
              >
                <div>
                  <h3 className="font-medium text-white">{project.title}</h3>
                  <p className="text-sm text-zinc-500">{project.partner}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">{project.type}</Badge>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 교육 과정 */}
      <section className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">교육 과정</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.code} className="rounded-lg border border-white/[0.06] bg-white/[0.04] p-6">
                <div className="mb-2 flex items-center gap-2">
                  <code className="font-mono text-sm text-zinc-500">{course.code}</code>
                </div>
                <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                <p className="text-sm text-zinc-500">{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qetta 적용 */}
      <section className="border-b border-white/[0.06] bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Qetta에 적용된 연구 역량</h2>
            <p className="mb-8 text-white/80">
              입찰 시장 예측, 경쟁 분석, 낙찰률 예측 등 핵심 기능에 연구팀의 통계적 모형과 데이터
              분석 역량이 적용되었습니다.
            </p>
            <div className="mb-8 grid grid-cols-3 gap-4 text-left">
              <div className="rounded-lg bg-white/10 p-4">
                <div className="font-mono text-2xl font-bold text-white">87%</div>
                <div className="text-sm text-white/70">예측 정확도</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <div className="font-mono text-2xl font-bold text-white">32%</div>
                <div className="text-sm text-white/70">낙찰률 향상</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <div className="font-mono text-2xl font-bold text-white">5x</div>
                <div className="text-sm text-white/70">분석 속도</div>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-[#5E6AD2] hover:bg-white/90">
              <Link href="/features/ai-matching">분석 기능 살펴보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">연구 협력 문의</h2>
            <p className="mb-6 text-zinc-400">
              산학협력, 공동연구, 기술이전 등 다양한 형태의 협력을 환영합니다.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:from-[#4B56C8] hover:to-[#3D48B0]">
                <Link href="/contact">연구 협력 문의</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/[0.06] text-white hover:bg-white/[0.06]">
                <a href="http://forecasting.kaist.ac.kr" target="_blank" rel="noopener noreferrer">
                  연구 포털
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
