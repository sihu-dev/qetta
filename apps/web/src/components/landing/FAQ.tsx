/**
 * FAQ 섹션 - HEPHAITOS Dark Theme
 */
'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS } from '@/constants/design-tokens';

const faqs = [
  {
    question: 'Qetta는 어떤 입찰 플랫폼을 지원하나요?',
    answer:
      '나라장터(G2B), TED(EU), SAM.gov(미국), 한전, 조달청 등 국내외 45개 이상의 입찰 플랫폼을 지원합니다. 신규 플랫폼은 지속적으로 추가되고 있습니다.',
  },
  {
    question: 'AI 매칭 점수는 어떻게 계산되나요?',
    answer:
      '공고의 요구사양과 귀사 제품/서비스 스펙을 비교하여 0-100% 점수를 산출합니다. 키워드 일치도, 과거 수주 이력, 납품 조건 등을 종합 분석합니다.',
  },
  {
    question: '스프레드시트에서 AI 함수를 어떻게 사용하나요?',
    answer:
      '=AI_SCORE(공고ID)로 매칭 점수, =AI_SUMMARY(공고ID)로 공고 요약, =AI_KEYWORDS(공고ID)로 핵심 키워드 추출 등 5가지 AI 함수를 수식처럼 사용할 수 있습니다.',
  },
  {
    question: '우리 회사 제품/서비스도 등록할 수 있나요?',
    answer:
      'Pro 플랜부터 무제한 제품/서비스 등록이 가능합니다. 제품명, 사양, 키워드를 입력하면 AI가 관련 공고를 자동으로 매칭합니다.',
  },
  {
    question: '데이터 보안은 어떻게 보장되나요?',
    answer:
      '모든 데이터는 암호화되어 저장되며, SOC 2 Type II 인증을 받은 클라우드 인프라를 사용합니다. 필요 시 온프레미스 설치도 가능합니다.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={cn('py-24', BG_COLORS.secondary)} id="faq">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            자주 묻는 질문
          </h2>
          <p className="mt-4 text-lg text-zinc-400">궁금한 점이 있으신가요?</p>
        </div>

        {/* FAQ List */}
        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, index) => (
            <div key={index} className={cn(
              'mb-4 overflow-hidden rounded-xl transition-all',
              GLASS.card
            )}>
              <button
                className="group flex w-full items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="pr-8 font-medium text-white transition-colors group-hover:text-[#7C8AEA]">
                  {faq.question}
                </span>
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all',
                    openIndex === index
                      ? 'bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8]'
                      : 'bg-white/[0.06]'
                  )}
                >
                  {openIndex === index ? (
                    <Minus className="h-4 w-4 text-white" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  )}
                </div>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                )}
              >
                <p className="px-6 pb-6 leading-relaxed text-zinc-400">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
