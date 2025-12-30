/**
 * 공고 수집 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { PageHero, FeatureGrid, CheckList, PageNavigation } from '@/components/marketing';
import { Search, Clock, Filter, Globe } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.collection);

interface Platform {
  name: string;
  country: string;
  status: '지원' | '예정';
  logo: string;
}

const platforms: Platform[] = [
  { name: '나라장터 (G2B)', country: '한국', status: '지원', logo: '🇰🇷' },
  { name: 'TED', country: 'EU', status: '지원', logo: '🇪🇺' },
  { name: 'SAM.gov', country: '미국', status: '지원', logo: '🇺🇸' },
  { name: 'KEPCO', country: '한국', status: '지원', logo: '⚡' },
  { name: 'KOGAS', country: '한국', status: '예정', logo: '🔥' },
  { name: 'UN Procurement', country: '국제', status: '예정', logo: '🌐' },
];

const features = [
  {
    icon: Clock,
    title: '실시간 수집',
    description: '매일 3회(9시, 15시, 21시) 자동으로 새 공고를 수집합니다.',
  },
  {
    icon: Filter,
    title: '스마트 필터링',
    description: '키워드, 금액, 지역, 업종별로 맞춤 필터링이 가능합니다.',
  },
  {
    icon: Globe,
    title: '멀티 플랫폼',
    description: '국내외 주요 공공입찰 플랫폼을 한 곳에서 관리합니다.',
  },
];

const benefits = [
  '수작업 공고 검색 시간 80% 절감',
  '놓치는 공고 없이 모든 기회 포착',
  '중복 확인 없이 새 공고만 알림',
  '키워드 매칭으로 관련 공고만 수집',
];

export default function CollectionPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        icon={Search}
        badge="핵심 기능"
        title="멀티 플랫폼"
        titleBreak
        description="나라장터, TED, SAM.gov 등 주요 공공입찰 플랫폼에서 실시간으로 공고를 자동 수집합니다. 더 이상 매일 각 사이트를 일일이 확인할 필요가 없습니다."
        primaryCta={{ label: '무료로 시작하기', href: '/signup' }}
        secondaryCta={{ label: '모든 기능 보기', href: '/features' }}
      />

      {/* Features Grid */}
      <FeatureGrid features={features} />

      {/* Supported Platforms */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">지원 플랫폼</h2>
            <p className="text-muted-foreground mb-12 text-center">
              국내외 주요 공공입찰 플랫폼을 지원합니다
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="bg-card flex items-center gap-4 rounded-lg border p-4"
                >
                  <span className="text-3xl">{platform.logo}</span>
                  <div className="flex-1">
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-muted-foreground text-sm">{platform.country}</p>
                  </div>
                  <Badge variant={platform.status === '지원' ? 'default' : 'secondary'}>
                    {platform.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold">기대 효과</h2>
                <CheckList items={benefits} className="text-lg" />
              </div>
              <div className="flex aspect-video items-center justify-center rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10">
                <span className="text-muted-foreground">스크린샷 영역</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Feature */}
      <PageNavigation next={{ label: 'AI 기반 매칭 분석', href: '/features/ai-matching' }} />
    </>
  );
}
