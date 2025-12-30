import Link from 'next/link';

// 정적 생성 비활성화
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <p className="mb-8 text-xl text-gray-600">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
