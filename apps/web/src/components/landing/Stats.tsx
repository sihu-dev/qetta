/**
 * 통계/성과 섹션 - CMNTech 제품 매칭 버전
 */

const stats = [
  { value: '92%', label: '평균 제품 매칭 정확도' },
  { value: '5+', label: 'CMNTech 연동 제품' },
  { value: '150+', label: '월간 분석 공고수' },
  { value: '3.2x', label: '입찰 참여율 증가' },
];

export function Stats() {
  return (
    <section className="bg-neutral-900 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="relative text-center">
              {idx > 0 && (
                <div className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-neutral-700 md:block" />
              )}
              <div className="font-mono text-4xl font-bold tracking-tight text-white md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-3 text-sm font-medium text-neutral-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
