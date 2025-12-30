/**
 * Auth 폼 로딩 Skeleton
 */
import { Skeleton } from '@/components/ui/skeleton';

export function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-2 h-8 w-32" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>

      {/* Demo Button Skeleton */}
      <Skeleton className="mb-4 h-10 w-full" />

      {/* Separator */}
      <div className="my-4">
        <Skeleton className="h-px w-full" />
      </div>

      {/* Social Buttons Skeleton */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Separator */}
      <div className="my-6">
        <Skeleton className="h-px w-full" />
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-4">
        <div>
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="mx-auto mt-6 h-4 w-48" />
    </div>
  );
}
