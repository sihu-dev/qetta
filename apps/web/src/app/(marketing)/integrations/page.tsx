/**
 * 연동 플랫폼 메인 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Globe, Check, ArrowRight } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.integrations.main);

const platforms = [
  {
    name: '나라장터 (G2B)',
    slug: 'narajangto',
    country: '한국',
    flag: '🇰🇷',
    description:
      '대한민국 최대 공공조달 플랫폼. 중앙정부, 지방자치단체, 공공기관의 조달 공고를 통합 제공합니다.',
    features: ['실시간 공고 수집', '입찰 결과 조회', '업체 정보 연동'],
    status: 'available',
    stats: { bids: '월 50,000+', coverage: '100%' },
  },
  {
    name: 'TED (Tenders Electronic Daily)',
    slug: 'ted',
    country: 'EU',
    flag: '🇪🇺',
    description:
      '유럽연합 공식 공공조달 플랫폼. EU 회원국 및 EEA 국가의 공공 입찰 공고를 제공합니다.',
    features: ['EU 전역 공고 수집', '다국어 번역', 'CPV 코드 매칭'],
    status: 'available',
    stats: { bids: '월 80,000+', coverage: '27개국' },
  },
  {
    name: 'SAM.gov',
    slug: 'samgov',
    country: '미국',
    flag: '🇺🇸',
    description: '미국 연방정부 공공조달 포털. 연방 기관의 계약 기회를 통합 제공합니다.',
    features: ['연방 공고 수집', 'NAICS 코드 매칭', '계약 이력 조회'],
    status: 'available',
    stats: { bids: '월 30,000+', coverage: '연방정부' },
  },
  {
    name: 'KEPCO (한국전력)',
    slug: 'kepco',
    country: '한국',
    flag: '⚡',
    description: '한국전력공사 전자조달 시스템. 전력 관련 자재 및 서비스 조달 공고를 제공합니다.',
    features: ['전력 분야 특화', '자재 코드 매칭', '납품 이력 관리'],
    status: 'available',
    stats: { bids: '월 3,000+', coverage: 'KEPCO' },
  },
  {
    name: 'KOGAS (한국가스공사)',
    slug: 'kogas',
    country: '한국',
    flag: '🔥',
    description: '한국가스공사 전자조달 시스템. 가스 관련 자재 및 서비스 조달 공고를 제공합니다.',
    features: ['가스 분야 특화', '안전 인증 연동', '설비 매칭'],
    status: 'available',
    stats: { bids: '월 1,500+', coverage: 'KOGAS' },
  },
  {
    name: 'UN Procurement',
    slug: 'un',
    country: '국제',
    flag: '🌐',
    description: '유엔 조달 포털. UN 기관들의 조달 기회를 통합 제공합니다.',
    features: ['UN 전 기관', '국제 표준', '다국어 지원'],
    status: 'available',
    stats: { bids: '월 5,000+', coverage: 'UN 전체' },
  },
];

const benefits = [
  { title: '통합 관리', description: '여러 플랫폼의 공고를 한 곳에서 관리' },
  { title: '자동 수집', description: '새 공고 자동 수집 및 알림' },
  { title: '표준화', description: '다양한 형식의 공고를 통일된 형식으로 제공' },
  { title: '실시간 동기화', description: '원본 플랫폼과 실시간 동기화' },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              연동 플랫폼
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              주요 공공입찰
              <br />
              플랫폼 연동
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              국내외 주요 공공입찰 플랫폼과 연동하여
              <br />
              모든 공고를 한 곳에서 관리하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0A0A0A] py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <h3 className="mb-1 font-semibold text-white">{benefit.title}</h3>
                <p className="text-sm text-zinc-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl space-y-6">
            {platforms.map((platform) => (
              <div
                key={platform.slug}
                className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6 transition-all hover:bg-white/[0.06]"
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Left */}
                  <div className="lg:w-2/3">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-3xl">{platform.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white">{platform.name}</h2>
                          <Badge
                            className={
                              platform.status === 'available'
                                ? 'bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]'
                                : 'bg-white/[0.04] border border-white/[0.06] text-zinc-400'
                            }
                          >
                            {platform.status === 'available' ? '지원' : '예정'}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-500">{platform.country}</p>
                      </div>
                    </div>
                    <p className="mb-4 text-zinc-400">{platform.description}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {platform.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-1 text-sm text-zinc-300">
                          <Check className="h-4 w-4 text-[#7C8AEA]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    {platform.status === 'available' && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-white/[0.06] bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      >
                        <Link href={`/integrations/${platform.slug}`}>
                          자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Right - Stats */}
                  <div className="flex gap-4 lg:w-1/3 lg:flex-col">
                    <div className="flex-1 rounded-lg bg-white/[0.04] p-3 text-center">
                      <p className="text-xl font-bold text-white">{platform.stats.bids}</p>
                      <p className="text-xs text-zinc-500">공고 수</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/[0.04] p-3 text-center">
                      <p className="text-xl font-bold text-white">{platform.stats.coverage}</p>
                      <p className="text-xs text-zinc-500">커버리지</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Integration */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Globe className="mx-auto mb-6 h-12 w-12 text-[#7C8AEA]" />
            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">커스텀 플랫폼 연동</h2>
            <p className="mb-8 text-zinc-400">
              사용하시는 플랫폼이 목록에 없나요?
              <br />
              Enterprise 플랜에서 커스텀 플랫폼 연동을 지원합니다.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90"
            >
              <Link href="/contact">Enterprise 문의</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">지금 바로 시작하세요</h2>
          <p className="mb-8 text-zinc-400">
            14일 무료 체험으로 모든 플랫폼 연동을 경험해보세요.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90"
          >
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
