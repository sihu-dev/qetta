/**
 * 물류/유통 활용사례 페이지
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '물류/유통 | 활용사례 | Qetta',
  description: '물류 및 유통 산업의 공공조달 입찰 자동화 사례',
};

const challenges = [
  { title: '대량 운송 입찰', desc: '수천 건의 운송 계약 관리' },
  { title: '실시간 가격 변동', desc: '유류비, 인건비 반영 필요' },
  { title: '지역별 분산 관리', desc: '전국 물류센터 조율' },
  { title: '규격 다양성', desc: '품목별 상이한 요구사항' },
];

const solutions = [
  { title: '운송 입찰 자동 수집', desc: '물류 관련 공고 필터링' },
  { title: '원가 기반 분석', desc: '수익성 자동 계산' },
  { title: '지역 매칭', desc: '물류센터 기반 공고 배정' },
  { title: '카테고리 분류', desc: '자동 품목 분류' },
];

const metrics = [
  { value: '45%', label: '입찰 참여 증가' },
  { value: '28%', label: '낙찰률 향상' },
  { value: '60%', label: '관리 시간 절감' },
  { value: '3.2억', label: '연간 수주 증가' },
];

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              물류/유통
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-white">물류 운송 입찰의 새로운 기준</h1>
            <p className="mb-8 text-lg text-zinc-400">
              전국 단위 운송 계약부터 지역 배송까지, Qetta로 물류 입찰을 체계적으로 관리하세요.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button variant="outline" asChild className="border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:text-white">
                <Link href="/contact">상담 문의</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 도전과제 */}
      <section className="border-b border-white/[0.06] bg-[#0A0A0A]">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">물류 입찰의 도전과제</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {challenges.map((item) => (
              <div key={item.title} className="rounded-lg border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl p-6">
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 솔루션 */}
      <section className="border-b border-white/[0.06] bg-[#0D0D0F]">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">Qetta 솔루션</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {solutions.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl p-6 transition-colors hover:border-[#5E6AD2]/30"
              >
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 성과 지표 */}
      <section className="border-b border-white/[0.06] bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">도입 효과</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.label} className="text-center">
                <div className="font-mono text-3xl font-bold text-white">{item.value}</div>
                <div className="text-sm text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 고객 사례 */}
      <section className="border-b border-white/[0.06] bg-[#0D0D0F]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <blockquote className="mb-6 text-xl text-zinc-300">
              &ldquo;전국 20개 물류센터의 입찰을 한 곳에서 관리할 수 있게 되었습니다. 지역별 공고를
              자동으로 분류해주니 담당자 업무가 크게 줄었습니다.&rdquo;
            </blockquote>
            <div className="text-sm text-zinc-500">— 물류 기업 입찰 담당 팀장</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A0A0A]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">물류 입찰 자동화 시작하기</h2>
          <p className="mb-6 text-zinc-400">14일 무료 체험으로 Qetta를 경험해보세요.</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
