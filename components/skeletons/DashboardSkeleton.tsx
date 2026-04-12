import { SkeletonBox } from "./skeleton-primitives";

/**
 * Skeleton for a single stat card on the dashboard.
 * Mirrors the gradient StatCard layout.
 */
export function DashboardStatSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-200 dark:bg-slate-700/40 p-5 shadow-lg animate-pulse">
      <div className="relative">
        <SkeletonBox className="mb-3 h-10 w-10 rounded-xl bg-white/20" />
        <SkeletonBox className="h-8 w-16 rounded bg-white/20" />
        <SkeletonBox className="mt-2 h-3 w-24 rounded bg-white/20" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the course progress section.
 */
export function CourseProgressSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
      <SkeletonBox className="mb-4 h-4 w-36 rounded" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/40 p-4">
            <div className="flex items-center gap-3 mb-3">
              <SkeletonBox className="h-8 w-8 rounded-lg" />
              <div className="flex-1">
                <SkeletonBox className="h-3.5 w-40 rounded mb-1" />
                <SkeletonBox className="h-2.5 w-28 rounded" />
              </div>
            </div>
            <SkeletonBox className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for the recent attempts section.
 */
export function RecentAttemptsSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
      <SkeletonBox className="mb-4 h-4 w-44 rounded" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/40 p-3">
            <SkeletonBox className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <SkeletonBox className="h-3.5 w-36 rounded mb-1" />
              <SkeletonBox className="h-2.5 w-24 rounded" />
            </div>
            <SkeletonBox className="h-6 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for the quick stats panel.
 */
export function QuickStatsSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
      <SkeletonBox className="mb-4 h-4 w-24 rounded" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for the upcoming exams list.
 */
export function UnattemptedExamsSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
      <SkeletonBox className="mb-4 h-4 w-36 rounded" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-800/40 p-3">
            <SkeletonCircle className="h-8 w-8" />
            <div className="flex-1">
              <SkeletonBox className="h-3 w-32 rounded mb-1" />
              <SkeletonBox className="h-2 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for the hero section stats/progress.
 */
export function HeroProgressSkeleton() {
  return (
    <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <SkeletonBox className="h-3 w-36 rounded bg-white/20" />
        <SkeletonBox className="h-3 w-10 rounded bg-white/20" />
      </div>
      <SkeletonBox className="h-2.5 w-full rounded-full bg-white/10" />
      <SkeletonBox className="mt-2 h-3 w-48 rounded bg-white/5" />
    </div>
  );
}

/**
 * Skeleton for the full dashboard page.
 * Mirrors: hero banner ➜ stat cards ➜ two-column layout.
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      {/* Hero banner skeleton */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-blue-900 pb-20 pt-12">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-6 h-3 w-32 rounded bg-white/10" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <SkeletonBox className="h-14 w-14 rounded-2xl bg-white/20" />
              <div>
                <SkeletonBox className="h-3 w-24 rounded bg-white/10 mb-2" />
                <SkeletonBox className="h-7 w-48 rounded bg-white/15" />
              </div>
            </div>
            <div className="flex gap-3">
              <SkeletonBox className="h-9 w-32 rounded-xl bg-white/10" />
              <SkeletonBox className="h-9 w-24 rounded-xl bg-white/20" />
            </div>
          </div>
          <HeroProgressSkeleton />
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl -mt-8 px-6 pb-16 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <DashboardStatSkeleton key={i} />
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <CourseProgressSkeleton />
            <RecentAttemptsSkeleton />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <QuickStatsSkeleton />
            <UnattemptedExamsSkeleton />
            {/* Quick links placeholder */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
              <SkeletonBox className="mb-4 h-4 w-28 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBox key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCircle({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-gray-200 dark:bg-slate-700/40 ${className}`} />;
}
