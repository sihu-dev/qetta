/**
 * 고객 지원 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle, Mail, Phone, Clock, Book, HelpCircle } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.resources.support);

const contactMethods = [
  {
    icon: MessageCircle,
    title: '실시간 채팅',
    description: '평일 9시-18시 실시간 채팅 상담',
    action: '채팅 시작',
    availability: '평일 9:00-18:00',
  },
  {
    icon: Mail,
    title: '이메일',
    description: 'support@bidflow.io로 문의',
    action: '이메일 보내기',
    availability: '24시간 접수',
  },
  {
    icon: Phone,
    title: '전화 상담',
    description: '02-1234-5678 (Pro/Enterprise)',
    action: '전화하기',
    availability: '평일 9:00-18:00',
  },
];

const faqs = [
  {
    question: '무료 체험 기간에 신용카드가 필요한가요?',
    answer: '아니요, 신용카드 없이 14일 동안 Pro 플랜의 모든 기능을 무료로 사용할 수 있습니다.',
  },
  {
    question: '플랫폼별 공고 수집 주기는 어떻게 되나요?',
    answer: '나라장터, TED, SAM.gov 모두 매일 3회(9시, 15시, 21시) 자동으로 수집됩니다.',
  },
  {
    question: 'API 요청 한도를 초과하면 어떻게 되나요?',
    answer:
      'API 한도 초과 시 429 에러가 반환됩니다. Enterprise 플랜으로 업그레이드하시면 무제한 API 접근이 가능합니다.',
  },
  {
    question: '팀원 추가 비용이 있나요?',
    answer:
      'Pro 플랜에서는 5명까지 무료, Enterprise 플랜은 무제한입니다. 추가 팀원이 필요하시면 Enterprise 플랜을 추천드립니다.',
  },
  {
    question: '데이터 내보내기 형식은 무엇인가요?',
    answer:
      'CSV, Excel(xlsx), JSON 형식을 지원합니다. PDF 내보내기는 Enterprise 플랜에서 제공됩니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer:
      '유료 결제 후 7일 이내 요청 시 전액 환불됩니다. 7일 이후에는 잔여 기간에 대해 비례 환불됩니다.',
  },
];

const supportPlans = [
  {
    plan: 'Starter',
    features: ['이메일 지원', '문서 접근', '커뮤니티 포럼'],
    responseTime: '48시간 이내',
  },
  {
    plan: 'Pro',
    features: ['이메일 + 채팅 지원', '우선 처리', '화면 공유 지원'],
    responseTime: '24시간 이내',
  },
  {
    plan: 'Enterprise',
    features: ['전용 지원팀', '전화 지원', 'SLA 보장', '온사이트 교육'],
    responseTime: '4시간 이내',
  },
];

export default function SupportPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              고객 지원
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">무엇을 도와드릴까요?</h1>
            <p className="text-muted-foreground mt-6 text-lg">
              BIDFLOW 팀이 항상 도움을 드릴 준비가 되어 있습니다.
              <br />
              궁금한 점이 있으시면 언제든 문의해주세요.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {contactMethods.map((method) => (
              <div key={method.title} className="bg-card rounded-xl border p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <method.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{method.title}</h3>
                <p className="text-muted-foreground mb-2 text-sm">{method.description}</p>
                <div className="text-muted-foreground mb-4 flex items-center justify-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{method.availability}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {method.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">자주 묻는 질문</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-card rounded-xl border p-6">
                  <h3 className="mb-2 font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Plans */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">플랜별 지원</h2>
            <p className="text-muted-foreground mb-12 text-center">
              플랜에 따라 다양한 수준의 지원을 제공합니다
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {supportPlans.map((plan) => (
                <div key={plan.plan} className="bg-card rounded-xl border p-6">
                  <h3 className="mb-2 text-xl font-bold">{plan.plan}</h3>
                  <p className="mb-4 text-sm text-primary">응답 시간: {plan.responseTime}</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Book className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-4 text-2xl font-bold">셀프 서비스 리소스</h2>
            <p className="text-muted-foreground mb-8">문서와 가이드에서 답을 찾아보세요.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/docs">문서 보기</Link>
              </Button>
              <Button asChild>
                <Link href="/docs">API 레퍼런스</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
