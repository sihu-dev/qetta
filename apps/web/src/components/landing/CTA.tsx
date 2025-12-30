/**
 * Call to Action Section - HEPHAITOS Dark Theme
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BG_COLORS, BUTTON_STYLES, GRID_PATTERN } from '@/constants/design-tokens';

export function CTA() {
  return (
    <section className={cn('relative py-24 overflow-hidden', BG_COLORS.primary)}>
      {/* Background Grid Pattern */}
      <div className={cn('absolute inset-0', GRID_PATTERN)} />

      {/* Gradient Orbs */}
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5E6AD2]/20 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            입찰 자동화, 지금 시작하세요
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            45개 데이터 소스, AI 매칭, 제안서 생성까지. 14일 무료 체험.
          </p>

          {/* Data Source Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['나라장터', 'TED (EU)', 'SAM.gov (US)', '한전', '조달청'].map((source) => (
              <span
                key={source}
                className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-400"
              >
                {source}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className={cn(BUTTON_STYLES.primary, 'h-12 px-8 rounded-xl')}
              asChild
            >
              <Link href="/signup" className="flex items-center gap-2">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(BUTTON_STYLES.secondary, 'h-12 px-8 rounded-xl')}
              asChild
            >
              <Link href="/contact">영업팀 문의</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
