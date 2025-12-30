/**
 * 나라장터 연동 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Database, Bell, Search } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.integrations.narajangto);

const features = [
  {
    icon: Search,
    title: '전체 공고 수집',
    description: '물품, 공사, 용역, 외자 등 모든 유형의 공고를 자동으로 수집합니다.',
  },
  {
    icon: Clock,
    title: '실시간 업데이트',
    description: '매일 3회(9시, 15시, 21시) 새 공고를 자동으로 수집합니다.',
  },
  {
    icon: Database,
    title: '상세 정보 제공',
    description: '공고 상세, 첨부파일, 입찰 결과까지 모든 정보를 제공합니다.',
  },
  {
    icon: Bell,
    title: '맞춤 알림',
    description: '키워드, 금액, 지역 등 조건에 맞는 공고만 알림을 받습니다.',
  },
];

const bidTypes = [
  { type: '물품', description: '일반 물품 및 장비 구매' },
  { type: '공사', description: '건설, 토목, 설비 공사' },
  { type: '용역', description: 'IT, 컨설팅, 유지보수 서비스' },
  { type: '외자', description: '해외 물품 구매' },
  { type: '민간', description: '민간 위탁 사업' },
  { type: 'PQ', description: '사전자격심사 공고' },
];

const dataFields = [
  '공고명',
  '공고번호',
  '공고기관',
  '수요기관',
  '입찰방식',
  '계약방법',
  '추정가격',
  '사업금액',
  '입찰마감일',
  '개찰일시',
  '납품기한',
  '납품장소',
  '첨부파일',
  '규격서',
  '설계서',
  '물량내역서',
];

const stats = [
  { label: '월 평균 공고 수', value: '50,000+' },
  { label: '커버리지', value: '100%' },
  { label: '업데이트 주기', value: '1일 3회' },
  { label: '데이터 정확도', value: '99.9%' },
];

export default function NarajangtoPage() {
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
              <span className="text-5xl">🇰🇷</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white md:text-4xl">나라장터 (G2B)</h1>
                  <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
                    지원
                  </Badge>
                </div>
                <p className="text-zinc-400">대한민국 공공조달 통합 플랫폼</p>
              </div>
            </div>
            <p className="mb-8 max-w-2xl text-xl text-zinc-400">
              대한민국 최대 공공조달 플랫폼인 나라장터의 모든 공고를 Qetta에서 자동으로 수집하고
              관리할 수 있습니다.
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
                <Link href="https://www.g2b.go.kr" target="_blank">
                  나라장터 방문 →
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

      {/* Bid Types */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">지원 입찰 유형</h2>
            <p className="mb-12 text-center text-zinc-400">
              나라장터의 모든 입찰 유형을 지원합니다
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {bidTypes.map((item) => (
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

      {/* Data Fields */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">수집 데이터</h2>
            <p className="mb-12 text-center text-zinc-400">
              공고의 모든 상세 정보를 수집합니다
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {dataFields.map((field) => (
                <Badge
                  key={field}
                  variant="outline"
                  className="px-3 py-1.5 text-sm border-white/[0.06] bg-white/[0.04] text-zinc-300"
                >
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            나라장터 공고를 자동으로 관리하세요
          </h2>
          <p className="mb-8 text-white/80">14일 무료 체험으로 시작하세요. 신용카드 필요 없음.</p>
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
