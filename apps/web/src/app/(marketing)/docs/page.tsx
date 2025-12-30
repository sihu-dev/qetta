/**
 * 문서 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Book, Rocket, Code, Lightbulb, FileText, Video, ArrowRight } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.resources.docs);

const quickStart = [
  { title: '계정 만들기', description: '무료로 Qetta 계정을 생성하세요.', time: '2분' },
  { title: '제품 등록', description: '귀사의 제품/서비스 정보를 등록하세요.', time: '5분' },
  { title: '플랫폼 연동', description: '수집할 입찰 플랫폼을 선택하세요.', time: '3분' },
  { title: '알림 설정', description: '키워드 및 알림 조건을 설정하세요.', time: '5분' },
];

const guides = [
  {
    icon: Rocket,
    title: '시작하기',
    description: 'Qetta 첫 사용자를 위한 가이드',
    articles: ['계정 생성', '초기 설정', '첫 공고 확인하기'],
  },
  {
    icon: FileText,
    title: '공고 관리',
    description: '공고 수집 및 관리 방법',
    articles: ['공고 필터링', '상태 관리', '메모 및 태그'],
  },
  {
    icon: Lightbulb,
    title: 'AI 기능',
    description: 'AI 기반 분석 및 자동화 기능',
    articles: ['매칭 분석', '제안서 생성', 'AI 설정'],
  },
  {
    icon: Code,
    title: 'API 가이드',
    description: 'REST API 사용법',
    articles: ['인증', '엔드포인트', '웹훅'],
  },
];

const resources = [
  {
    icon: Book,
    title: 'API 레퍼런스',
    description: 'REST API 전체 문서',
    link: '/docs/api',
  },
  {
    icon: Video,
    title: '튜토리얼 영상',
    description: '단계별 사용법 영상 가이드',
    link: '/docs/tutorials',
  },
  {
    icon: FileText,
    title: 'FAQ',
    description: '자주 묻는 질문과 답변',
    link: '/support',
  },
];

export default function DocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              문서
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Qetta 문서</h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Qetta를 시작하고 활용하는 데 필요한
              <br />
              모든 정보를 찾아보세요.
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <div className="relative">
                <input
                  type="search"
                  placeholder="문서 검색..."
                  className="bg-background w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">빠른 시작 (~15분)</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {quickStart.map((step, index) => (
                <div key={step.title} className="bg-card rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground text-xs">{step.time}</span>
                  </div>
                  <h3 className="mb-1 font-medium">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">가이드</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {guides.map((guide) => (
                <div key={guide.title} className="bg-card rounded-xl border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <guide.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold">{guide.title}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">{guide.description}</p>
                      <ul className="space-y-2">
                        {guide.articles.map((article) => (
                          <li key={article}>
                            <Link
                              href="#"
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <ArrowRight className="h-3 w-3" />
                              {article}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">추가 리소스</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.link}
                  className="bg-card rounded-xl border p-6 text-center transition-shadow hover:shadow-md"
                >
                  <resource.icon className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="mb-1 font-semibold">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">찾으시는 내용이 없나요?</h2>
          <p className="text-muted-foreground mb-8">
            고객 지원팀에 문의하시면 도움을 드리겠습니다.
          </p>
          <Button asChild>
            <Link href="/support">고객 지원 문의</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
