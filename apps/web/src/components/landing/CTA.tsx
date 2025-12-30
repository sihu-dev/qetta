/**
 * Call to Action 섹션 - 모노크롬
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-neutral-900 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            CMNTech 5개 제품 입찰 자동화를 시작하세요
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            UR-1000PLUS부터 EnerRay까지, 14일 무료 체험 후 결정하세요.
          </p>
          {/* Product Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['UR-1000PLUS', 'MF-1000C', 'UR-1010PLUS', 'SL-3000PLUS', 'EnerRay'].map((product) => (
              <span
                key={product}
                className="rounded-full bg-neutral-800 px-3 py-1.5 font-mono text-xs text-neutral-300"
              >
                {product}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-white px-8 text-neutral-900 hover:bg-neutral-100"
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
              className="h-12 border-neutral-600 px-8 text-white hover:bg-neutral-800"
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
