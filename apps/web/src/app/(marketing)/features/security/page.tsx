/**
 * 보안 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Shield, Lock, Key, Eye, Server, FileCheck, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.security);

const securityFeatures = [
  {
    icon: Lock,
    title: '데이터 암호화',
    description: '전송 중(TLS 1.3) 및 저장 중(AES-256) 모든 데이터 암호화',
  },
  {
    icon: Key,
    title: '안전한 인증',
    description: 'OAuth 2.0, API Key, SSO/SAML 지원',
  },
  {
    icon: Eye,
    title: '감사 로그',
    description: '모든 활동에 대한 상세 로그 기록 및 추적',
  },
  {
    icon: Server,
    title: '인프라 보안',
    description: 'AWS/GCP 기반 엔터프라이즈급 인프라',
  },
];

const compliance = [
  { name: 'SOC 2 Type II', status: 'certified', description: '보안 운영 인증' },
  { name: 'ISO 27001', status: 'certified', description: '정보보안 관리체계' },
  { name: 'GDPR', status: 'compliant', description: 'EU 개인정보보호규정 준수' },
  { name: 'KISA ISMS', status: 'in-progress', description: '한국 정보보호관리체계' },
];

const securityPractices = [
  { title: 'Rate Limiting', description: 'API 남용 방지를 위한 요청 제한' },
  { title: 'CSRF 보호', description: '크로스 사이트 요청 위조 방지' },
  { title: 'SQL Injection 방지', description: '파라미터화된 쿼리 사용' },
  { title: 'XSS 방지', description: '입출력 데이터 이스케이프 처리' },
  { title: 'Prompt Injection 방지', description: 'AI 입력값 검증 및 필터링' },
  { title: '정기 보안 감사', description: '외부 전문 기관 취약점 점검' },
];

const enterpriseFeatures = [
  'SSO/SAML 통합 인증',
  'IP 화이트리스팅',
  '역할 기반 접근 제어 (RBAC)',
  '데이터 보존 정책 설정',
  '전용 인프라 옵션',
  '24/7 보안 모니터링',
];

export default function SecurityPage() {
  return (
    <div className="bg-[#0D0D0F] min-h-screen">
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E6AD2]/10">
                <Shield className="h-8 w-8 text-[#7C8AEA]" />
              </div>
              <Badge className="bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">엔터프라이즈</Badge>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">보안 & 규정 준수</h1>
            <p className="text-zinc-400 mb-8 max-w-2xl text-xl">
              엔터프라이즈급 보안으로 귀사의 데이터를 안전하게 보호합니다. 글로벌 보안 표준을
              준수하며 정기적인 보안 감사를 수행합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90">
                <Link href="/contact">영업팀 문의</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/[0.1] text-white hover:bg-white/[0.04]">
                <Link href="/docs">보안 문서</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">보안 기능</h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                  <feature.icon className="h-6 w-6 text-[#7C8AEA]" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">규정 준수</h2>
            <p className="text-zinc-400 mb-12 text-center">글로벌 보안 표준을 준수합니다</p>
            <div className="grid gap-6 md:grid-cols-2">
              {compliance.map((item) => (
                <div
                  key={item.name}
                  className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] flex items-start gap-4 rounded-xl p-6"
                >
                  <FileCheck className="h-8 w-8 flex-shrink-0 text-[#7C8AEA]" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <Badge
                        className={
                          item.status === 'certified'
                            ? 'bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]'
                            : item.status === 'compliant'
                              ? 'bg-white/[0.04] border border-white/[0.06] text-zinc-400'
                              : 'bg-white/[0.02] border border-white/[0.04] text-zinc-500'
                        }
                      >
                        {item.status === 'certified'
                          ? '인증'
                          : item.status === 'compliant'
                            ? '준수'
                            : '진행 중'}
                      </Badge>
                    </div>
                    <p className="text-zinc-500 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">보안 실천 사항</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {securityPractices.map((practice) => (
                <div key={practice.title} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C8AEA]" />
                    <div>
                      <h4 className="font-medium text-white">{practice.title}</h4>
                      <p className="text-zinc-500 text-sm">{practice.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge className="mb-4 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">Enterprise</Badge>
                <h2 className="mb-4 text-3xl font-bold text-white">엔터프라이즈 보안</h2>
                <p className="text-zinc-400 mb-6">
                  대규모 조직을 위한 고급 보안 기능을 제공합니다. 전담 보안팀과 함께 귀사의 보안
                  요구사항을 충족시킵니다.
                </p>
                <ul className="space-y-3">
                  {enterpriseFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-[#7C8AEA]" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:opacity-90" asChild>
                  <Link href="/contact">Enterprise 문의</Link>
                </Button>
              </div>
              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-8 bg-gradient-to-br from-[#5E6AD2]/5 to-[#5E6AD2]/10">
                <div className="text-center">
                  <Shield className="mx-auto mb-4 h-16 w-16 text-[#7C8AEA]" />
                  <h3 className="mb-2 text-2xl font-bold text-white">99.9%</h3>
                  <p className="text-zinc-500">SLA 가용성 보장</p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-[#0D0D0F] rounded-lg p-3">
                    <p className="text-xl font-bold text-white">24/7</p>
                    <p className="text-zinc-500 text-xs">모니터링</p>
                  </div>
                  <div className="bg-[#0D0D0F] rounded-lg p-3">
                    <p className="text-xl font-bold text-white">&lt;1h</p>
                    <p className="text-zinc-500 text-xs">응답 시간</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: 'REST API', href: '/features/api' }}
        next={{ label: '모든 기능 보기', href: '/features' }}
      />
    </div>
  );
}
