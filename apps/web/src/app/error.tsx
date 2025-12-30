'use client';

/**
 * 에러 페이지 - App Router
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-neutral-700">오류</h1>
        <p className="mb-4 text-xl text-gray-600">문제가 발생했습니다</p>
        <p className="mb-8 text-sm text-gray-500">{error.message}</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
