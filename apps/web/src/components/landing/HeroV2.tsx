'use client';

/**
 * Qetta Hero Section V2
 * HEPHAITOS Design System - Dark Mode + Glass Morphism
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { GLASS, BG_COLORS, GRID_PATTERN, BUTTON_STYLES } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

// Animated AI functions for demo
const AI_FUNCTIONS = [
  { cmd: '=AI_SCORE(A2)', result: '94%', desc: '매칭 점수' },
  { cmd: '=AI_SUMMARY(B2)', result: '"수처리 설비 교체..."', desc: '공고 요약' },
  { cmd: '=AI_KEYWORDS(C2)', result: '["IoT", "센서"]', desc: '핵심 키워드' },
  { cmd: '=AI_DEADLINE(D2)', result: 'D-3 긴급', desc: '마감 알림' },
];

export function HeroV2() {
  const [currentFunction, setCurrentFunction] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFunction((prev) => (prev + 1) % AI_FUNCTIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const current = AI_FUNCTIONS[currentFunction];

  return (
    <section className={cn('relative min-h-screen flex items-center justify-center overflow-hidden', BG_COLORS.primary)}>
      {/* Background Grid Pattern */}
      <div className={cn('absolute inset-0', GRID_PATTERN)} />

      {/* Gradient Orbs */}
      <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[#5E6AD2]/10 blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#7C8AEA]/8 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#7C8AEA]" />
            <span className="text-sm font-medium text-[#7C8AEA]">AI-Powered Bid Automation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-white">입찰 공고,</span>
            <br />
            <span className="bg-gradient-to-r from-[#5E6AD2] to-[#7C8AEA] bg-clip-text text-transparent">
              AI가 찾고 매칭합니다
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            45개 입찰 플랫폼 실시간 수집 → AI 자동 분석 → 맞춤 공고 추천
            <br className="hidden sm:block" />
            <span className="text-white font-medium">하루 2시간 → 0분</span>으로 단축하세요
          </p>

          {/* AI Function Demo */}
          <div className={cn('mx-auto mt-10 max-w-lg', GLASS.card, 'rounded-2xl p-5')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
              </div>
              <span className="text-xs text-zinc-500 font-mono">Qetta Spreadsheet</span>
            </div>
            <div className={cn('p-4 rounded-xl', GLASS.input)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-[#5E6AD2]" />
                  <code className="text-sm font-mono text-zinc-300">
                    {current.cmd}
                  </code>
                </div>
                <span className="text-xs text-zinc-500">{current.desc}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-zinc-500">→</span>
                <span className="font-mono font-bold text-[#7C8AEA]">{current.result}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {AI_FUNCTIONS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 rounded-full transition-all',
                    i === currentFunction ? 'w-6 bg-[#5E6AD2]' : 'w-1 bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className={cn(BUTTON_STYLES.primary, 'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base')}
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#demo"
              className={cn(BUTTON_STYLES.secondary, 'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base')}
            >
              데모 보기
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">90%</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500 sm:text-sm">시간 절약</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">3.2×</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500 sm:text-sm">수주율 향상</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#5E6AD2] sm:text-3xl md:text-4xl">45+</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500 sm:text-sm">연동 플랫폼</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </section>
  );
}

export default HeroV2;
