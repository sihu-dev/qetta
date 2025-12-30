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
            <Badge className="mb-6 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              문서
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Qetta 문서</h1>
            <p className="text-zinc-400 mt-6 text-lg">
              Qetta를 시작하고 활용하는 데 필요한
              <br />
              모든 정보를 찾아보세요.
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <div className="relative">
                <input
                  type="search"
                  placeholder="문서 검색..."
                  className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-white">빠른 시작 (~15분)</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {quickStart.map((step, index) => (
                <div key={step.title} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-sm font-medium text-white">
                      {index + 1}
                    </span>
                    <span className="text-zinc-500 text-xs">{step.time}</span>
                  </div>
                  <h3 className="mb-1 font-medium text-white">{step.title}</h3>
                  <p className="text-zinc-400 text-sm">{step.description}</p>
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
            <h2 className="mb-12 text-center text-3xl font-bold text-white">가이드</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {guides.map((guide) => (
                <div key={guide.title} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                      <guide.icon className="h-6 w-6 text-[#7C8AEA]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-white">{guide.title}</h3>
                      <p className="text-zinc-400 mb-4 text-sm">{guide.description}</p>
                      <ul className="space-y-2">
                        {guide.articles.map((article) => (
                          <li key={article}>
                            <Link
                              href="#"
                              className="flex items-center gap-1 text-sm text-[#7C8AEA] hover:underline"
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
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-white">추가 리소스</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.link}
                  className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 text-center transition-all hover:border-[#5E6AD2]/50 hover:shadow-lg"
                >
                  <resource.icon className="mx-auto mb-4 h-8 w-8 text-[#7C8AEA]" />
                  <h3 className="mb-1 font-semibold text-white">{resource.title}</h3>
                  <p className="text-zinc-400 text-sm">{resource.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">찾으시는 내용이 없나요?</h2>
          <p className="text-zinc-400 mb-8">
            고객 지원팀에 문의하시면 도움을 드리겠습니다.
          </p>
          <Button className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:from-[#4B56C8] hover:to-[#3D48B0]" asChild>
            <Link href="/support">고객 지원 문의</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
