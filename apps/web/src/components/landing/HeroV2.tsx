'use client';

/**
 * Qetta Hero Section V2
 * Google DeepMind-inspired Light Theme
 * Clean, minimal, professional design
 */
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTenant, useTenantHero, useTenantProducts } from '@/contexts/TenantContext';

export function HeroV2() {
  const tenant = useTenant();
  const hero = useTenantHero();
  const products = useTenantProducts();

  // Dynamic content based on tenant
  const isWhiteLabel = products.length > 0;

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50" />

      {/* Decorative elements - Monochrome style */}
      <div className="absolute right-20 top-20 h-96 w-96 rounded-full bg-neutral-200/30 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-neutral-100/40 blur-3xl" />

      <div className="container relative z-10 mx-auto px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-4 py-2">
            <Sparkles className="h-4 w-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">{hero.badge}</span>
          </div>

          {/* Main Headline - Monochrome Style */}
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
            {isWhiteLabel ? (
              <>
                <span className="text-neutral-900">{tenant.branding.name}</span>
                <br />
                Precision Matching
              </>
            ) : (
              <>
                주간 <span className="text-neutral-600">47건</span> 자동 포착
                <br />
                <span className="text-neutral-400">Zero Missing</span>
              </>
            )}
          </h1>

          {/* Sub-headline - Quantified & Technical */}
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-neutral-500 md:text-2xl">
            {isWhiteLabel ? (
              hero.description
            ) : (
              <>
                <span className="font-medium text-neutral-700">45개 소스</span> · 실시간 분석 · 자동
                매칭
                <br className="hidden md:block" />
                입찰 발견부터 제안서까지, End-to-End Automation
              </>
            )}
          </p>

          {/* CTA Buttons - Monochrome */}
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-4 text-base font-medium text-white shadow-lg shadow-neutral-900/20 transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/30"
            >
              14일 무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-8 py-4 text-base font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50"
            >
              실시간 데모 보기
            </Link>
          </div>

          {/* Stats - Quantified Results */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 md:text-4xl">90%</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-neutral-500">
                Time Saved
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 md:text-4xl">3.2×</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-neutral-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-600 md:text-4xl">45+</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-neutral-500">
                Data Sources
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          {isWhiteLabel && products.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-2">
              {products.slice(0, 5).map((product) => (
                <span
                  key={product.model}
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600"
                >
                  {product.model}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50 to-transparent" />
    </section>
  );
}

export default HeroV2;
