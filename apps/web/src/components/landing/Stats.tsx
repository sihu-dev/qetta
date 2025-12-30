/**
 * 통계/성과 섹션 - HEPHAITOS Dark Theme
 */
import { cn } from '@/lib/utils';
import { BG_COLORS, GLASS } from '@/constants/design-tokens';

const stats = [
  { value: '92%', label: 'AI 매칭 정확도' },
  { value: '45+', label: '연동 플랫폼' },
  { value: '127', label: '도입 기업' },
  { value: '3.2×', label: '수주율 향상' },
];

export function Stats() {
  return (
    <section className={cn('py-20', BG_COLORS.secondary)}>
      <div className="container mx-auto px-4">
        <div className={cn(
          'mx-auto max-w-5xl rounded-2xl p-8 md:p-12',
          GLASS.cardRaised
        )}>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {stats.map((stat, idx) => (
              <div key={stat.label} className="relative text-center">
                {idx > 0 && (
                  <div className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/[0.06] md:block" />
                )}
                <div className="font-mono text-3xl font-bold tracking-tight text-[#7C8AEA] sm:text-4xl md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-3 text-xs font-medium text-zinc-400 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
