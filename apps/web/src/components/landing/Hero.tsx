'use client';

/**
 * 히어로 섹션 - 동적 화이트라벨 버전
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { useTenantHero, useTenantProducts } from '@/contexts/TenantContext';

export function Hero() {
  const hero = useTenantHero();
  const products = useTenantProducts();

  // 범용 vs 테넌트별 Trust Indicators
  const trustIndicators =
    products.length > 0
      ? [
          { text: `${products.length}개 제품 기본 등록` },
          { text: 'AI 자동 매칭' },
          { text: '14일 무료 체험' },
        ]
      : [{ text: '45+ 데이터 소스' }, { text: 'AI 자동 매칭' }, { text: '14일 무료 체험' }];

  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-36">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,white_70%)]" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {hero.badge}
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
            {hero.headline}
            {hero.headlineSub && (
              <>
                <br />
                <span className="text-neutral-400">{hero.headlineSub}</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-500 md:text-xl">
            {hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 bg-neutral-900 px-8 text-base text-white hover:bg-neutral-800"
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
              className="h-14 border-neutral-300 px-8 text-base hover:bg-neutral-50"
              asChild
            >
              <Link href="#spreadsheet" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                데모 보기
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500">
            {trustIndicators.map((indicator, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-neutral-900" />
                <span>{indicator.text}</span>
              </div>
            ))}
          </div>

          {/* Product Pills - 테넌트에 제품이 있을 때만 표시 */}
          {products.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {products.map((product) => (
                <span
                  key={product.model}
                  className="rounded-full bg-neutral-100 px-3 py-1.5 font-mono text-xs font-medium text-neutral-700"
                >
                  {product.model}
                </span>
              ))}
            </div>
          )}

          {/* 범용 테넌트: 데이터 소스 표시 */}
          {products.length === 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {['나라장터', 'TED (EU)', 'SAM.gov', 'KEPCO', 'LH공사'].map((source) => (
                <span
                  key={source}
                  className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
                >
                  {source}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
