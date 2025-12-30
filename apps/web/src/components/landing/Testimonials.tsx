/**
 * 고객 후기 섹션 - HEPHAITOS Dark Theme
 */
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS } from '@/constants/design-tokens';

const testimonials = [
  {
    quote:
      '입찰 공고 찾느라 하루 2시간씩 쓰던 게 이제 0분입니다. AI가 알아서 매칭해주니 제안서 작성에만 집중할 수 있어요.',
    author: '김대표',
    title: '대표이사',
    company: '중소 제조업체 A',
    industry: '제조업',
  },
  {
    quote:
      'TED에서 EU 공고를 놓치지 않고 확인할 수 있어서 해외 입찰 성공률이 크게 올랐습니다. 한국어 요약이 특히 유용해요.',
    author: '이팀장',
    title: '해외사업팀장',
    company: 'IT 서비스 기업 B',
    industry: 'IT 서비스',
  },
  {
    quote:
      '매칭 점수 92점 이상인 공고만 골라서 보니 시간 낭비 없이 정확한 입찰에 집중할 수 있습니다.',
    author: '박과장',
    title: '영업기획',
    company: '건설 장비업체 C',
    industry: '건설',
  },
];

export function Testimonials() {
  return (
    <section className={cn('py-24', BG_COLORS.primary)} id="testimonials">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#7C8AEA]">
            Testimonials
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            고객들의 이야기
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Qetta로 입찰 업무를 혁신한 기업들의 후기
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className={cn(
                'relative rounded-2xl p-8 transition-all hover:border-white/[0.12]',
                GLASS.card
              )}
            >
              {/* Quote Icon */}
              <Quote className="mb-4 h-8 w-8 text-[#5E6AD2]/40" />

              {/* Quote */}
              <blockquote className="mb-8 leading-relaxed text-zinc-300">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8]">
                    <span className="text-sm font-semibold text-white">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {testimonial.title} · {testimonial.company}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-xs text-zinc-400">
                  {testimonial.industry}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
