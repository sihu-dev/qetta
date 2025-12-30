/**
 * 인증 페이지 레이아웃
 */
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { TenantProvider } from '@/contexts/TenantContext';
import { DEFAULT_TENANT } from '@/config/tenants';

// 정적 생성 비활성화 (Logo에서 context 사용)
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider tenant={DEFAULT_TENANT}>
      <div className="flex min-h-screen flex-col">
        {/* Simple Header */}
        <header className="px-4 py-6">
          <div className="container mx-auto">
            <Logo showBeta={false} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>

        {/* Simple Footer */}
        <footer className="text-muted-foreground px-4 py-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Qetta.{' '}
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            {' · '}
            <Link href="/terms" className="hover:underline">
              이용약관
            </Link>
          </p>
        </footer>
      </div>
    </TenantProvider>
  );
}
