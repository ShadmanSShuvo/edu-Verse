import { SkeletonBox } from "./skeleton-primitives";

/**
 * Skeleton for a single course card.
 */
export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
      {/* Accent strip */}
      <div className="h-1.5 w-full animate-pulse bg-gray-200 dark:bg-slate-700/60" />

      <div className="flex flex-1 flex-col p-6">
        {/* Subject tags */}
        <div className="mb-3 flex gap-1.5">
          <SkeletonBox className="h-5 w-16 rounded-full" />
          <SkeletonBox className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <SkeletonBox className="mb-1.5 h-5 w-3/4 rounded" />

        {/* Instructor */}
        <SkeletonBox className="mb-3 h-3 w-32 rounded" />

        {/* Description */}
        <SkeletonBox className="mb-2 h-3 w-full rounded" />
        <SkeletonBox className="mb-4 h-3 w-5/6 rounded" />

        {/* Rating */}
        <div className="mb-4 flex items-center gap-2">
          <SkeletonBox className="h-4 w-8 rounded" />
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-3.5 w-3.5 rounded" />
            ))}
          </div>
          <SkeletonBox className="h-3 w-10 rounded" />
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-3 w-20 rounded" />
            <SkeletonBox className="h-3 w-24 rounded" />
          </div>
          <SkeletonBox className="h-6 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the full courses page.
 */
export function CoursesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      {/* Hero band */}
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <SkeletonBox className="mx-auto mb-3 h-7 w-36 rounded-full bg-white/20" />
          <SkeletonBox className="mx-auto mb-3 h-10 w-96 max-w-full rounded bg-white/15" />
          <SkeletonBox className="mx-auto h-4 w-80 max-w-full rounded bg-white/10" />
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="sticky top-[57px] z-30 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4">
          <SkeletonBox className="h-10 w-full sm:w-72 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-7 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Course grid */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <SkeletonBox className="mb-6 h-4 w-36 rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
