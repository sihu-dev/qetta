/**
 * 제안서 자동 생성 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { FileText, Wand2, FileCheck, Edit, Download, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.proposal);

const templates = [
  { name: '기술 제안서', description: '기술적 요구사항 충족 제안', status: 'available' },
  { name: '가격 제안서', description: '가격 산출 및 견적 제안', status: 'available' },
  { name: '사업 수행 계획서', description: '프로젝트 수행 방안', status: 'available' },
  { name: '실적 증명서', description: '유사 실적 정리', status: 'available' },
  { name: '회사 소개서', description: '기업 역량 소개', status: 'beta' },
  { name: '커스텀 템플릿', description: '맞춤 양식 등록', status: 'enterprise' },
];

const generationProcess = [
  {
    icon: FileCheck,
    title: '공고 분석',
    description: '제안서 요구사항, 평가 기준, 배점표를 자동으로 분석합니다.',
  },
  {
    icon: Wand2,
    title: 'AI 초안 생성',
    description: '분석 결과와 회사 정보를 바탕으로 제안서 초안을 작성합니다.',
  },
  {
    icon: Edit,
    title: '사용자 편집',
    description: '생성된 초안을 검토하고 필요한 부분을 수정합니다.',
  },
  {
    icon: Download,
    title: '내보내기',
    description: 'Word, PDF 형식으로 내보내어 제출합니다.',
  },
];

const features = [
  '공고 맞춤 내용 자동 구성',
  '회사 정보 자동 삽입',
  '기술 사양 표 자동 생성',
  '경쟁력 어필 포인트 제안',
  '배점 항목별 최적화',
  '맞춤법/문법 자동 검수',
];

export default function ProposalPage() {
  return (
    <div className="bg-[#0D0D0F] min-h-screen">
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E6AD2]/10">
                <FileText className="h-8 w-8 text-[#7C8AEA]" />
              </div>
              <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">AI 기능</Badge>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              제안서 초안
              <br />
              자동 생성
            </h1>
            <p className="text-zinc-400 mb-8 max-w-2xl text-xl">
              공고 분석 결과를 바탕으로 제안서 초안을 AI가 자동으로 작성합니다. 며칠 걸리던 제안서
              작성을 몇 시간으로 단축하세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/[0.1] text-white hover:bg-white/[0.04]">
                <Link href="/features">모든 기능 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Generation Process */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">생성 프로세스</h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-4">
            {generationProcess.map((item, index) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E6AD2]/10">
                  <item.icon className="h-8 w-8 text-[#7C8AEA]" />
                </div>
                <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-zinc-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">제공 템플릿</h2>
            <p className="text-zinc-400 mb-12 text-center">
              다양한 제안서 템플릿을 제공합니다
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.name} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <Badge
                      className={
                        template.status === 'available'
                          ? 'bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]'
                          : template.status === 'beta'
                            ? 'bg-white/[0.04] border border-white/[0.06] text-zinc-400'
                            : 'bg-white/[0.02] border border-white/[0.04] text-zinc-500'
                      }
                    >
                      {template.status === 'available'
                        ? '제공'
                        : template.status === 'beta'
                          ? 'Beta'
                          : 'Enterprise'}
                    </Badge>
                  </div>
                  <p className="text-zinc-500 text-sm">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 flex aspect-video items-center justify-center rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] bg-gradient-to-br from-[#5E6AD2]/5 to-[#5E6AD2]/10 lg:order-1">
                <span className="text-zinc-500">에디터 스크린샷</span>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="mb-6 text-3xl font-bold text-white">주요 기능</h2>
                <ul className="space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C8AEA]" />
                      <span className="text-lg text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">제안서 작성 시간을 80% 단축하세요</h2>
          <p className="mb-8 text-white/90">AI가 초안을 작성하면 당신은 검토만 하면 됩니다.</p>
          <Button size="lg" variant="secondary" asChild className="bg-white text-[#5E6AD2] hover:bg-white/90">
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: 'AI 매칭 분석', href: '/features/ai-matching' }}
        next={{ label: '스마트 알림', href: '/features/alerts' }}
      />
    </div>
  );
}
