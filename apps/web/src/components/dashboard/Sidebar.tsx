'use client';

import { useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  WalletIcon,
  ClockIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  UsersIcon,
  SparklesIcon,
  VideoCameraIcon,
  ArrowsRightLeftIcon,
  AcademicCapIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useI18n } from '@/hooks/useI18n';

// ============================================
// Pain Point 기반 네비게이션
// COPY → LEARN → BUILD 여정 중심
// ============================================

// 메인 네비게이션 - Pain Point 해결 순서대로 (labelKey 사용)
const mainNavItemsConfig = [
  {
    icon: Squares2X2Icon,
    labelKey: 'dashboard',
    href: '/dashboard',
    stage: null,
  },
  // COPY Stage
  {
    icon: UsersIcon,
    labelKey: 'celebMirroring',
    href: '/dashboard/mirroring',
    stage: 'COPY',
    stageColor: 'emerald',
  },
  {
    icon: ArrowsRightLeftIcon,
    labelKey: 'portCompare',
    href: '/dashboard/compare',
    stage: 'COPY',
    stageColor: 'emerald',
  },
  // LEARN Stage
  {
    icon: VideoCameraIcon,
    labelKey: 'liveCoaching',
    href: '/dashboard/coaching',
    stage: 'LEARN',
    stageColor: 'blue',
  },
  {
    icon: AcademicCapIcon,
    labelKey: 'aiTutor',
    href: '/dashboard/ai-strategy',
    stage: 'LEARN',
    stageColor: 'blue',
  },
  // BUILD Stage
  {
    icon: SparklesIcon,
    labelKey: 'strategyBuilder',
    href: '/dashboard/strategy-builder',
    stage: 'BUILD',
    stageColor: 'amber',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    labelKey: 'aiAgent',
    href: '/dashboard/agent',
    stage: 'BUILD',
    stageColor: 'violet',
    badge: 'NEW',
  },
  {
    icon: BeakerIcon,
    labelKey: 'backtest',
    href: '/dashboard/backtest',
    stage: 'BUILD',
    stageColor: 'amber',
  },
  // 기타 유틸리티
  {
    icon: WalletIcon,
    labelKey: 'portfolio',
    href: '/dashboard/portfolio',
    stage: null,
  },
  {
    icon: ClockIcon,
    labelKey: 'tradeHistory',
    href: '/dashboard/history',
    stage: null,
  },
];

const bottomNavItemsConfig = [
  { icon: Cog6ToothIcon, labelKey: 'settings', href: '/dashboard/settings' },
  { icon: QuestionMarkCircleIcon, labelKey: 'help', href: '/docs' },
];

// 스테이지 색상 - 모노크롬 디자인
const stageColors = {
  emerald: {
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    border: 'border-neutral-500/20',
  },
  blue: {
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    border: 'border-neutral-500/20',
  },
  amber: {
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    border: 'border-neutral-500/20',
  },
};

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // 그룹별로 아이템 분리
  const dashboardItem = mainNavItemsConfig.find(
    (item) => item.stage === null && item.href === '/dashboard'
  );
  const copyItems = mainNavItemsConfig.filter((item) => item.stage === 'COPY');
  const learnItems = mainNavItemsConfig.filter((item) => item.stage === 'LEARN');
  const buildItems = mainNavItemsConfig.filter((item) => item.stage === 'BUILD');
  const utilityItems = mainNavItemsConfig.filter(
    (item) => item.stage === null && item.href !== '/dashboard'
  );

  const renderNavItem = (item: (typeof mainNavItemsConfig)[0]) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
    const label = t(`dashboard.sidebar.${item.labelKey}`) as string;

    return (
      <Link
        key={item.href}
        href={item.href}
        title={label}
        className={`mb-px flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
          isActive
            ? 'bg-white/[0.08] text-white'
            : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );
  };

  const renderStageHeader = (stageKey: string, color: keyof typeof stageColors) => {
    if (isCollapsed) return null;
    const colors = stageColors[color];
    const stageLabel = t(`dashboard.sidebar.${stageKey}`) as string;
    return (
      <div className="px-2 pb-1 pt-3">
        <span className={`text-[10px] font-medium ${colors.text} uppercase tracking-wider`}>
          {stageLabel}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/[0.06] bg-[#0D0D0F] transition-all duration-200 lg:flex ${
          isCollapsed ? 'w-14' : 'w-52'
        }`}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.08]">
              <span className="text-xs font-medium text-white">H</span>
            </div>
            {!isCollapsed && <span className="text-sm font-medium text-white">HEPHAITOS</span>}
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-400"
            aria-label={
              isCollapsed
                ? (t('dashboard.sidebar.expandSidebar') as string)
                : (t('dashboard.sidebar.collapseSidebar') as string)
            }
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Quick Action - 새 전략 (Pain 직접 해결) */}
        <div className="px-2 py-2">
          <Link
            href="/dashboard/strategy-builder"
            className={`flex items-center gap-2 rounded border border-neutral-500/20 bg-neutral-500/10 px-2 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-500/20 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <PlusIcon className="h-4 w-4" />
            {!isCollapsed && <span>{t('dashboard.sidebar.buildMyStrategy')}</span>}
          </Link>
        </div>

        {/* Main Navigation - 스테이지별 그룹 */}
        <nav
          className="flex-1 overflow-y-auto px-2"
          aria-label={t('dashboard.sidebar.mainNavigation') as string}
        >
          {/* 대시보드 */}
          {dashboardItem && renderNavItem(dashboardItem)}

          {/* COPY Stage */}
          {copyItems.length > 0 && (
            <>
              {renderStageHeader('copyStage', 'emerald')}
              {copyItems.map(renderNavItem)}
            </>
          )}

          {/* LEARN Stage */}
          {learnItems.length > 0 && (
            <>
              {renderStageHeader('learnStage', 'blue')}
              {learnItems.map(renderNavItem)}
            </>
          )}

          {/* BUILD Stage */}
          {buildItems.length > 0 && (
            <>
              {renderStageHeader('buildStage', 'amber')}
              {buildItems.map(renderNavItem)}
            </>
          )}

          {/* Utility Items */}
          {utilityItems.length > 0 && (
            <>
              <div className="my-2 h-px bg-white/[0.04]" />
              {utilityItems.map(renderNavItem)}
            </>
          )}
        </nav>

        {/* Progress Indicator (접히지 않았을 때만) */}
        {!isCollapsed && (
          <div className="border-t border-white/[0.06] px-3 py-3">
            <div className="mb-2 text-[10px] text-zinc-400">{t('dashboard.myJourney')}</div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 rounded-full bg-neutral-500/30" title="COPY" />
              <div className="h-1 flex-1 rounded-full bg-neutral-400/30" title="LEARN" />
              <div className="h-1 flex-1 rounded-full bg-neutral-300/30" title="BUILD" />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-zinc-400">
              <span>COPY</span>
              <span>LEARN</span>
              <span>BUILD</span>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-white/[0.06] px-2 py-2">
          {bottomNavItemsConfig.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-px flex items-center gap-2 rounded px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{t(`dashboard.sidebar.${item.labelKey}`)}</span>}
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Navigation - COPY/LEARN/BUILD 핵심만 */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0D0D0F] lg:hidden"
        aria-label={t('dashboard.sidebar.mobileNavigation') as string}
      >
        <div className="flex h-14 items-center justify-around">
          {/* 대시보드 */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
              pathname === '/dashboard' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
            <span className="text-[10px]">{t('dashboard.sidebar.home')}</span>
          </Link>

          {/* COPY */}
          <Link
            href="/dashboard/mirroring"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
              pathname?.includes('mirroring') || pathname?.includes('compare')
                ? 'text-white'
                : 'text-zinc-400'
            }`}
          >
            <UsersIcon className="h-5 w-5" />
            <span className="text-[10px]">COPY</span>
          </Link>

          {/* LEARN */}
          <Link
            href="/dashboard/coaching"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
              pathname?.includes('coaching') || pathname?.includes('ai-strategy')
                ? 'text-white'
                : 'text-zinc-400'
            }`}
          >
            <AcademicCapIcon className="h-5 w-5" />
            <span className="text-[10px]">LEARN</span>
          </Link>

          {/* BUILD */}
          <Link
            href="/dashboard/strategy-builder"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
              pathname?.includes('strategy-builder') || pathname?.includes('backtest')
                ? 'text-white'
                : 'text-zinc-400'
            }`}
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="text-[10px]">BUILD</span>
          </Link>

          {/* 설정 */}
          <Link
            href="/dashboard/settings"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
              pathname?.includes('settings') ? 'text-white' : 'text-zinc-400'
            }`}
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="text-[10px]">{t('dashboard.sidebar.settings')}</span>
          </Link>
        </div>
      </nav>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
