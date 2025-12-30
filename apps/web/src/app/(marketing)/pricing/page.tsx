/**
 * 요금제 페이지
 */
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlanFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  annualPrice?: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    price: '무료',
    period: '',
    description: '입찰 자동화를 시작하는 개인 사업자와 소규모 기업',
    features: [
      { text: '월 50건 공고 분석', included: true },
      { text: '1개 플랫폼 연동 (나라장터)', included: true },
      { text: '기본 AI 분석', included: true },
      { text: '이메일 알림', included: true },
      { text: '기본 스프레드시트 뷰', included: true },
      { text: 'CSV 내보내기', included: true },
      { text: '고급 AI 분석', included: false },
      { text: '제안서 초안 생성', included: false },
      { text: 'Slack 연동', included: false },
      { text: '팀 협업', included: false },
      { text: 'API 접근', included: false },
    ],
    cta: '무료로 시작',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₩99,000',
    period: '/월',
    annualPrice: '₩79,000',
    description: '성장하는 중소기업을 위한 완전한 솔루션',
    features: [
      { text: '무제한 공고 분석', included: true },
      { text: '모든 플랫폼 연동', included: true, tooltip: '나라장터, TED, SAM.gov, KEPCO 등' },
      { text: '고급 AI 분석', included: true },
      { text: '제안서 초안 생성', included: true },
      { text: '이메일 + Slack 알림', included: true },
      { text: '팀 협업 (5명)', included: true },
      { text: 'Excel 내보내기', included: true },
      { text: 'API 접근 (1,000 req/일)', included: true },
      { text: '우선 지원', included: true },
      { text: '전용 계정 매니저', included: false },
      { text: 'SLA 보장', included: false },
    ],
    cta: '14일 무료 체험',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '문의',
    period: '',
    description: '대규모 조직을 위한 맞춤형 솔루션',
    features: [
      { text: 'Pro 모든 기능', included: true },
      { text: '무제한 팀원', included: true },
      { text: '전용 계정 매니저', included: true },
      { text: 'SLA 99.9% 보장', included: true },
      { text: '온프레미스 배포 옵션', included: true },
      { text: 'API 무제한', included: true },
      { text: 'SSO/SAML 인증', included: true },
      { text: '맞춤 교육', included: true },
      { text: '연간 계약 할인', included: true },
      { text: '커스텀 플랫폼 연동', included: true },
      { text: '감사 로그', included: true },
    ],
    cta: '영업팀 문의',
    highlighted: false,
  },
];

const faqs = [
  {
    question: '무료 체험 기간에 신용카드가 필요한가요?',
    answer: '아니요, 신용카드 없이 14일 동안 Pro 플랜의 모든 기능을 무료로 사용할 수 있습니다.',
  },
  {
    question: '언제든 플랜을 변경할 수 있나요?',
    answer:
      '네, 언제든지 업그레이드 또는 다운그레이드할 수 있습니다. 변경 사항은 다음 결제 주기부터 적용됩니다.',
  },
  {
    question: '연간 결제 시 할인이 있나요?',
    answer: '네, 연간 결제 시 20% 할인됩니다. Pro 플랜 기준 월 ₩79,000으로 이용하실 수 있습니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer:
      '유료 결제 후 7일 이내 요청 시 전액 환불됩니다. 7일 이후에는 잔여 기간에 대해 비례 환불됩니다.',
  },
];

export default function PricingPage() {
  return (
    <TooltipProvider>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
              요금제
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              심플하고 투명한 요금제
            </h1>
            <p className="text-zinc-400 mt-6 text-lg">
              숨겨진 비용 없이 필요한 만큼만 사용하세요.
              <br />
              언제든지 업그레이드하거나 다운그레이드할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-2xl p-8 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]',
                  plan.highlighted && 'border-[#5E6AD2]/50 shadow-xl lg:scale-105'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] px-4 py-1.5 text-sm font-medium text-white">
                    가장 인기
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-zinc-400 mt-2 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-400">{plan.period}</span>
                  {plan.annualPrice && (
                    <p className="text-zinc-500 mt-1 text-sm">
                      연간 결제 시 {plan.annualPrice}/월
                    </p>
                  )}
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C8AEA]" />
                      ) : (
                        <X className="text-zinc-600 mt-0.5 h-5 w-5 flex-shrink-0" />
                      )}
                      <span className={cn(feature.included ? 'text-zinc-300' : 'text-zinc-600')}>
                        {feature.text}
                      </span>
                      {feature.tooltip && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="text-zinc-500 h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    'w-full',
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:from-[#4B56C8] hover:to-[#3D48B0]'
                      : 'bg-white/[0.06] border border-white/[0.06] text-white hover:bg-white/[0.1]'
                  )}
                  size="lg"
                  asChild
                >
                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/signup'}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">자주 묻는 질문</h2>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
                <h3 className="mb-2 font-semibold text-white">{faq.question}</h3>
                <p className="text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">아직 결정이 어려우신가요?</h2>
          <p className="text-zinc-400 mb-8">
            영업팀에서 귀사에 맞는 플랜을 추천해 드립니다.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="outline" className="border-white/[0.06] text-white hover:bg-white/[0.06]" asChild>
              <Link href="/contact">영업팀 상담</Link>
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:from-[#4B56C8] hover:to-[#3D48B0]" asChild>
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
