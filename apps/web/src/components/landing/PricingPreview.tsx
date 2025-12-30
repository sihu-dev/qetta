/**
 * Pricing Preview Section - HEPHAITOS Dark Theme
 */
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS, BUTTON_STYLES } from '@/constants/design-tokens';

const plans = [
  {
    name: 'Starter',
    price: '무료',
    period: '',
    description: '입찰 자동화 시작하기',
    features: [
      '제품/서비스 3개 등록',
      '월 50건 공고 분석',
      'AI 요약 기능',
      '나라장터 연동',
      '이메일 알림',
    ],
    cta: '무료로 시작',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₩99,000',
    period: '/월',
    description: '본격적인 입찰 자동화',
    features: [
      '무제한 제품 등록',
      '무제한 공고 분석',
      '모든 AI 함수 (5종)',
      'TED, SAM.gov 연동',
      '제안서 자동 생성',
      'Slack 연동',
    ],
    cta: '14일 무료 체험',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '문의',
    period: '',
    description: '맞춤형 솔루션',
    features: [
      'Pro 모든 기능',
      '전용 AI 모델 학습',
      'ERP/CRM 연동',
      '무제한 팀원',
      'SLA 보장',
      '온프레미스 옵션',
    ],
    cta: '영업팀 문의',
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section className={cn('py-24', BG_COLORS.primary)} id="pricing">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
            Pricing
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            심플한 요금제
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            비즈니스 규모에 맞는 플랜을 선택하세요
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl p-8 transition-all',
                plan.highlighted
                  ? 'scale-105 bg-gradient-to-b from-[#5E6AD2]/10 to-transparent border-2 border-[#5E6AD2]/50 shadow-xl shadow-[#5E6AD2]/10'
                  : GLASS.card
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] px-4 py-1.5 text-xs font-medium text-white">
                  추천
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className={cn(
                  'text-4xl font-bold',
                  plan.highlighted ? 'text-[#7C8AEA]' : 'text-white'
                )}>
                  {plan.price}
                </span>
                <span className="text-zinc-500">{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className={cn(
                      'h-4 w-4 flex-shrink-0',
                      plan.highlighted ? 'text-[#5E6AD2]' : 'text-emerald-400'
                    )} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'w-full rounded-xl',
                  plan.highlighted
                    ? BUTTON_STYLES.primary
                    : BUTTON_STYLES.secondary
                )}
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/signup'}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* More Info Link */}
        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            요금제 자세히 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
