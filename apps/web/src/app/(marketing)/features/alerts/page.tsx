/**
 * 스마트 알림 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Bell, Mail, MessageSquare, Calendar, Settings, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.alerts);

const alertTypes = [
  {
    icon: Calendar,
    title: '마감 임박 알림',
    description: 'D-7, D-3, D-1 등 설정한 시점에 마감 알림을 받습니다.',
    timing: 'D-7, D-3, D-1',
  },
  {
    icon: Bell,
    title: '새 공고 알림',
    description: '매칭 조건에 맞는 새 공고가 등록되면 즉시 알려드립니다.',
    timing: '실시간',
  },
  {
    icon: Settings,
    title: '상태 변경 알림',
    description: '추적 중인 공고의 상태가 변경되면 알림을 받습니다.',
    timing: '실시간',
  },
];

const channels = [
  {
    icon: Mail,
    name: '이메일',
    description: '중요 알림을 이메일로 받습니다.',
    status: 'all',
  },
  {
    icon: MessageSquare,
    name: 'Slack',
    description: '팀 채널에 알림을 전송합니다.',
    status: 'pro',
  },
  {
    icon: Bell,
    name: '웹 푸시',
    description: '브라우저 푸시 알림을 받습니다.',
    status: 'all',
  },
];

const customOptions = [
  { label: '알림 시간대 설정', description: '업무 시간에만 알림 수신' },
  { label: '알림 빈도 조절', description: '즉시, 일별, 주간 요약' },
  { label: '우선순위 필터', description: '중요 공고만 알림' },
  { label: '금액 기준 설정', description: '특정 금액 이상만 알림' },
  { label: '지역 필터', description: '특정 지역 공고만 알림' },
  { label: '키워드 알림', description: '특정 키워드 포함 시 알림' },
];

export default function AlertsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <Badge variant="secondary">핵심 기능</Badge>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              스마트
              <br />
              알림 시스템
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl text-xl">
              중요 공고의 마감일, 새 공고 발견, 상태 변경 등을 이메일과 Slack으로 알려드립니다. 더
              이상 중요한 기회를 놓치지 마세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">모든 기능 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Types */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">알림 종류</h2>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {alertTypes.map((alert) => (
              <div key={alert.title} className="bg-card rounded-xl border p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <alert.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{alert.title}</h3>
                <p className="text-muted-foreground mb-4">{alert.description}</p>
                <Badge variant="outline">{alert.timing}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">알림 채널</h2>
            <p className="text-muted-foreground mb-12 text-center">원하는 채널로 알림을 받으세요</p>
            <div className="grid gap-6 md:grid-cols-3">
              {channels.map((channel) => (
                <div key={channel.name} className="bg-card rounded-xl border p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <channel.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{channel.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">{channel.description}</p>
                  <Badge variant={channel.status === 'all' ? 'default' : 'secondary'}>
                    {channel.status === 'all' ? '전 플랜' : 'Pro 이상'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customization */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">맞춤 설정</h2>
            <p className="text-muted-foreground mb-12 text-center">
              세부적인 알림 조건을 설정하세요
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customOptions.map((option) => (
                <div key={option.label} className="bg-card rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-700" />
                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-muted-foreground text-sm">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slack Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge className="mb-4">Slack 연동</Badge>
                <h2 className="mb-4 text-3xl font-bold">팀과 함께 알림 받기</h2>
                <p className="text-muted-foreground mb-6">
                  Slack 채널에 알림을 연동하여 팀 전체가 중요 공고를 실시간으로 확인할 수 있습니다.
                  우선순위에 따라 다른 채널로 분기도 가능합니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-neutral-700" />
                    <span>#qetta-urgent: 긴급 공고</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-neutral-700" />
                    <span>#qetta-alerts: 중요 공고</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-neutral-700" />
                    <span>#qetta-updates: 일반 업데이트</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-[#1a1d21] p-6 text-white">
                <div className="mb-4 flex items-center gap-3 border-b border-gray-700 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary font-bold">
                    B
                  </div>
                  <div>
                    <p className="font-medium">Qetta</p>
                    <p className="text-xs text-gray-400">오늘 오전 9:00</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">🔔 새로운 입찰 공고</p>
                  <p className="text-gray-300">서울시 초음파유량계 구매 입찰</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>마감: 2025-01-15</span>
                    <span>추정가: 4.5억원</span>
                  </div>
                  <div className="mt-3 inline-block rounded bg-primary/20 px-3 py-1 text-xs text-primary">
                    상세보기
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: '제안서 생성', href: '/features/proposal' }}
        next={{ label: '스프레드시트', href: '/features/spreadsheet' }}
      />
    </>
  );
}
