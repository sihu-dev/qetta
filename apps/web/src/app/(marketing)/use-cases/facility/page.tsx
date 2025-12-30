/**
 * 시설관리 활용사례 페이지
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '시설관리 | 활용사례 | Qetta',
  description: '시설관리 및 FM 산업의 공공조달 입찰 자동화 사례',
};

const challenges = [
  { title: '다양한 시설 유형', desc: '건물, 인프라, 설비 등 복합 관리' },
  { title: '유지보수 주기', desc: '정기/수시 점검 입찰 관리' },
  { title: '자격 요건 확인', desc: '면허, 인증 등 자격 조건 검토' },
  { title: '지역 기반 서비스', desc: '출장 거리, 대응 시간 고려' },
];

const solutions = [
  { title: '시설 유형별 필터', desc: 'FM 공고 자동 분류' },
  { title: '유지보수 일정 추적', desc: '정기 입찰 알림' },
  { title: '자격 자동 매칭', desc: '보유 자격 기반 필터' },
  { title: '지역 범위 설정', desc: '서비스 가능 지역 설정' },
];

const metrics = [
  { value: '52%', label: '입찰 발굴 증가' },
  { value: '35%', label: '낙찰률 향상' },
  { value: '70%', label: '검토 시간 절감' },
  { value: '2.8억', label: '연간 수주 증가' },
];

export default function FacilityPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              시설관리
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-white">시설관리 입찰 효율화</h1>
            <p className="mb-8 text-lg text-zinc-400">
              건물 관리부터 인프라 유지보수까지, FM 전문 기업을 위한 입찰 자동화 솔루션입니다.
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
          <h2 className="mb-8 text-2xl font-bold text-white">시설관리 입찰의 도전과제</h2>
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
              &ldquo;보유 면허와 자격증을 등록해두니 적합한 공고만 자동으로 추천해줍니다. 입찰
              검토에 들이는 시간이 절반 이상 줄었습니다.&rdquo;
            </blockquote>
            <div className="text-sm text-zinc-500">— FM 전문 기업 영업 이사</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A0A0A]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">시설관리 입찰 자동화 시작하기</h2>
          <p className="mb-6 text-zinc-400">14일 무료 체험으로 Qetta를 경험해보세요.</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
