/**
 * 고객 후기 섹션 - 모노크롬
 */
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      'UR-1000PLUS 관련 공고를 자동으로 찾아주니 입찰 준비 시간이 80% 이상 줄었습니다. 이제 제안서 작성에만 집중할 수 있어요.',
    author: '김영훈',
    title: '영업부장',
    company: '씨엠엔텍',
    product: 'UR-1000PLUS',
  },
  {
    quote:
      'TED에서 EnerRay 열량계 관련 EU 공고를 놓치지 않고 확인할 수 있어서 해외 입찰 성공률이 크게 올랐습니다.',
    author: '이수진',
    title: '해외사업팀장',
    company: '씨엠엔텍',
    product: 'EnerRay',
  },
  {
    quote:
      'UR-1010PLUS 비만관 유량계에 딱 맞는 하수처리장 공고만 AI가 골라주니 정확도가 정말 높습니다.',
    author: '박준호',
    title: '기술영업',
    company: '씨엠엔텍',
    product: 'UR-1010PLUS',
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            고객들의 이야기
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            CMNTech 제품 입찰에 BIDFLOW를 활용하는 분들의 후기
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-8"
            >
              {/* Quote Icon */}
              <Quote className="mb-4 h-8 w-8 text-neutral-200" />

              {/* Quote */}
              <blockquote className="mb-8 leading-relaxed text-neutral-700">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900">
                    <span className="text-sm font-semibold text-white">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {testimonial.title} · {testimonial.company}
                    </div>
                  </div>
                </div>
                <span className="rounded bg-neutral-200 px-2 py-1 font-mono text-xs text-neutral-700">
                  {testimonial.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
