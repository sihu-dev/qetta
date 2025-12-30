/**
 * API 문서 페이지
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Terminal, Key, Shield, Zap } from 'lucide-react';

export const metadata = {
  title: 'API 문서 | Qetta',
  description: 'Qetta REST API 문서 및 사용 가이드',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/bids',
    description: '입찰 목록 조회',
    params: 'status, source, limit, offset',
  },
  {
    method: 'POST',
    path: '/api/v1/bids',
    description: '새 입찰 생성',
    params: 'title, organization, deadline, ...',
  },
  {
    method: 'GET',
    path: '/api/v1/bids/:id',
    description: '입찰 상세 조회',
    params: 'id (path)',
  },
  {
    method: 'PATCH',
    path: '/api/v1/bids/:id',
    description: '입찰 정보 수정',
    params: 'status, priority, notes, ...',
  },
  {
    method: 'DELETE',
    path: '/api/v1/bids/:id',
    description: '입찰 삭제',
    params: 'id (path)',
  },
];

export default function ApiDocsPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-6 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
            개발자
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-white">API 문서</h1>
          <p className="text-zinc-400 mb-12 text-xl">
            Qetta REST API를 사용하여 입찰 데이터를 프로그래밍 방식으로 관리하세요.
          </p>

          {/* 빠른 시작 */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] mb-12 rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Terminal className="h-5 w-5 text-[#7C8AEA]" />
              빠른 시작
            </h2>
            <div className="overflow-x-auto rounded-md bg-[#0A0A0A] p-4 font-mono text-sm text-zinc-300">
              <pre>{`curl -X GET "https://api.qetta.io/v1/bids" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
            </div>
          </div>

          {/* 인증 */}
          <div className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
              <Key className="h-5 w-5 text-[#7C8AEA]" />
              인증
            </h2>
            <p className="text-zinc-400 mb-4">
              모든 API 요청에는 Bearer 토큰 인증이 필요합니다. 대시보드의 설정 &gt; API 키에서 키를
              발급받으세요.
            </p>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-200">
                <strong>보안 주의:</strong> API 키를 클라이언트 코드에 노출하지 마세요. 서버
                사이드에서만 사용하세요.
              </p>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
              <Shield className="h-5 w-5 text-[#7C8AEA]" />
              Rate Limiting
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.04] p-4">
                <p className="text-2xl font-bold text-white">100</p>
                <p className="text-zinc-400 text-sm">요청/분 (Starter)</p>
              </div>
              <div className="rounded-lg border border-[#5E6AD2]/50 bg-[#5E6AD2]/10 p-4">
                <p className="text-2xl font-bold text-white">1,000</p>
                <p className="text-zinc-400 text-sm">요청/분 (Pro)</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.04] p-4">
                <p className="text-2xl font-bold text-white">무제한</p>
                <p className="text-zinc-400 text-sm">요청/분 (Enterprise)</p>
              </div>
            </div>
          </div>

          {/* 엔드포인트 */}
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white">
              <Zap className="h-5 w-5 text-[#7C8AEA]" />
              엔드포인트
            </h2>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="rounded-lg border border-white/[0.06] bg-white/[0.04] p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Badge
                      className={
                        endpoint.method === 'GET'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : endpoint.method === 'POST'
                            ? 'bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]'
                            : 'bg-white/[0.06] border border-white/[0.06] text-zinc-400'
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="font-mono text-sm text-zinc-300">{endpoint.path}</code>
                  </div>
                  <p className="text-zinc-400 mb-2 text-sm">{endpoint.description}</p>
                  <p className="text-xs text-zinc-500">파라미터: {endpoint.params}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 p-8 text-center">
            <h3 className="mb-4 text-xl font-semibold text-white">API 키 발급받기</h3>
            <p className="text-zinc-400 mb-6">Pro 요금제 이상에서 API 접근이 가능합니다.</p>
            <div className="flex justify-center gap-4">
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:from-[#4B56C8] hover:to-[#3D48B0]">요금제 보기</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/[0.06] text-white hover:bg-white/[0.06]">문의하기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
