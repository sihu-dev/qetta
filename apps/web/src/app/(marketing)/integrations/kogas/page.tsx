/**
 * KOGAS(한국가스공사) 연동 페이지
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'KOGAS 연동 | Qetta',
  description: '한국가스공사 입찰 공고 자동 수집 및 분석',
};

const features = [
  { title: '자동 공고 수집', desc: '매일 3회 자동 크롤링' },
  { title: '카테고리 분류', desc: '가스 설비, 배관, 계측 자동 분류' },
  { title: '마감 알림', desc: '입찰 마감 D-7, D-3, D-1 알림' },
  { title: '이력 관리', desc: '과거 낙찰 데이터 분석' },
];

const stats = [
  { value: '1,500+', label: '월간 공고 수' },
  { value: '15조', label: '연간 조달 규모' },
  { value: '98%', label: '수집 정확도' },
  { value: '3회/일', label: '업데이트 주기' },
];

const categories = [
  '가스 배관 공사',
  '계측 장비',
  '안전 설비',
  'LNG 저장시설',
  '압력 조정기',
  '가스 검지기',
  '유지보수 용역',
  'IT 시스템',
];

export default function KogasPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              한국가스공사
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-slate-900">KOGAS 입찰 자동화</h1>
            <p className="mb-8 text-lg text-slate-600">
              한국가스공사의 가스 설비, 배관, 계측 장비 입찰 공고를 자동으로 수집하고 분석합니다.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/integrations">다른 플랫폼 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 */}
      <section className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">연동 기능</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <div key={item.title} className="rounded-lg border p-6">
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">수집 카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="outline" className="px-3 py-1.5 text-sm">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* 데이터 흐름 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">데이터 수집 프로세스</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-lg font-semibold text-slate-900">1. 크롤링</div>
              <p className="text-sm text-slate-500">KOGAS 입찰 페이지</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-lg font-semibold text-slate-900">2. 정제</div>
              <p className="text-sm text-slate-500">데이터 표준화</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-lg font-semibold text-slate-900">3. 분석</div>
              <p className="text-sm text-slate-500">매칭 점수 계산</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-lg font-semibold text-slate-900">4. 알림</div>
              <p className="text-sm text-slate-500">적합 공고 통지</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">KOGAS 입찰 자동화 시작하기</h2>
          <p className="mb-6 text-slate-600">Pro 플랜 이상에서 KOGAS 연동을 이용할 수 있습니다.</p>
          <Button asChild size="lg">
            <Link href="/pricing">요금제 확인</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
