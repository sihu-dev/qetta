/**
 * Qetta 랜딩 페이지
 * HEPHAITOS Dark Theme + Glass Morphism
 */
import dynamic from 'next/dynamic';
import { HeroV2 } from '@/components/landing/HeroV2';
import { PainPoints } from '@/components/landing/PainPoints';
import { FeaturesV2 } from '@/components/landing/FeaturesV2';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

// Code Splitting: SpreadsheetDemo를 별도 청크로 분리하여 초기 로드 최적화
const SpreadsheetDemo = dynamic(
  () =>
    import('@/components/landing/SpreadsheetDemo').then((mod) => ({
      default: mod.SpreadsheetDemo,
    })),
  {
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center bg-[#0D0D0F] py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#5E6AD2]" />
          <p className="text-sm text-zinc-500">AI 스프레드시트 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <HeroV2 />

      {/* Stats */}
      <Stats />

      {/* Problem Definition */}
      <PainPoints />

      {/* Core Features */}
      <FeaturesV2 />

      {/* Interactive Demo */}
      <SpreadsheetDemo />

      {/* How It Works */}
      <HowItWorks />

      {/* Social Proof */}
      <Testimonials />

      {/* Pricing */}
      <PricingPreview />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <CTA />
    </>
  );
}
