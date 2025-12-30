/**
 * 한전 (KEPCO) 연동 페이지
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, Building2, FileText, Bell, Shield } from 'lucide-react';

export const metadata = {
  title: '한전 (KEPCO) 연동 | BIDFLOW',
  description: 'BIDFLOW와 한국전력공사 조달시스템 연동',
};

const features = [
  {
    icon: Zap,
    title: '전력 관련 입찰 전문',
    description: '발전, 송배전, 전력 설비 관련 입찰 공고 특화 수집',
  },
  {
    icon: Building2,
    title: '한전 계열사 통합',
    description: '한전KDN, 한전KPS, 한전원자력연료 등 계열사 공고 포함',
  },
  {
    icon: FileText,
    title: '입찰 서류 분석',
    description: '한전 표준 입찰 양식에 맞춘 자동 서류 분석',
  },
  {
    icon: Bell,
    title: '실시간 공고 알림',
    description: '관심 분야 공고 등록 시 즉시 알림',
  },
];

const bidTypes = [
  '전력 계측 장비',
  '변압기 및 차단기',
  '배전반/분전반',
  '전력 케이블',
  '발전 설비',
  '신재생 에너지',
  '전력 IT 시스템',
  '유지보수 서비스',
];

export default function KepcoIntegrationPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* 헤더 */}
          <Badge variant="secondary" className="mb-6">
            연동
          </Badge>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100">
              <Zap className="h-8 w-8 text-neutral-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">한전 (KEPCO)</h1>
              <p className="text-muted-foreground">한국전력공사 조달시스템</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-12 text-xl">
            한국전력공사 및 계열사의 입찰 공고를 자동으로 수집하고 분석합니다. 전력 산업 특화 키워드
            매칭으로 관련 공고를 놓치지 마세요.
          </p>

          {/* 연동 상태 */}
          <div className="mb-12 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-neutral-600" />
              <div>
                <h3 className="font-semibold text-neutral-900">베타 연동</h3>
                <p className="text-sm text-neutral-700">
                  한전 연동은 현재 베타 버전입니다. 일부 기능이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 주요 기능 */}
          <h2 className="mb-6 text-2xl font-semibold">주요 기능</h2>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border p-6">
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* 지원 입찰 유형 */}
          <h2 className="mb-6 text-2xl font-semibold">지원 입찰 유형</h2>
          <div className="mb-12 flex flex-wrap gap-2">
            {bidTypes.map((type, index) => (
              <Badge key={index} variant="outline" className="px-4 py-2">
                {type}
              </Badge>
            ))}
          </div>

          {/* 연동 방법 */}
          <h2 className="mb-6 text-2xl font-semibold">연동 방법</h2>
          <div className="mb-12 space-y-4">
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                1
              </div>
              <div>
                <h3 className="font-semibold">계정 생성</h3>
                <p className="text-muted-foreground text-sm">
                  BIDFLOW 계정을 생성하고 로그인합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                2
              </div>
              <div>
                <h3 className="font-semibold">연동 설정</h3>
                <p className="text-muted-foreground text-sm">
                  설정 &gt; 연동에서 한전을 선택하고 활성화합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                3
              </div>
              <div>
                <h3 className="font-semibold">키워드 설정</h3>
                <p className="text-muted-foreground text-sm">
                  관심 분야 키워드를 설정하여 맞춤 공고를 수신합니다.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-lg bg-primary/5 p-8 text-center">
            <h3 className="mb-4 text-xl font-semibold">한전 입찰 공고 모니터링 시작하기</h3>
            <p className="text-muted-foreground mb-6">
              무료로 시작하고 14일간 모든 기능을 체험하세요.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">무료로 시작하기</Button>
              </Link>
              <Link href="/integrations">
                <Button variant="outline" size="lg">
                  다른 연동 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
