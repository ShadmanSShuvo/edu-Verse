import { SkeletonBox } from "./skeleton-primitives";

/**
 * Skeleton for the modules page.
 * Mirrors: hero ➜ course sections with module cards containing materials and exams.
 */
export function ModulesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      {/* Hero band */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-3 h-7 w-28 rounded-full bg-white/20" />
          <SkeletonBox className="mb-2 h-9 w-56 rounded bg-white/15" />
          <SkeletonBox className="h-4 w-80 max-w-full rounded bg-white/10" />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        {Array.from({ length: 2 }).map((_, ci) => (
          <div key={ci}>
            {/* Course heading */}
            <div className="mb-5 flex items-center gap-3">
              <SkeletonBox className="h-10 w-10 rounded-xl" />
              <div>
                <SkeletonBox className="h-5 w-48 rounded mb-1" />
                <SkeletonBox className="h-3 w-64 rounded" />
              </div>
              <SkeletonBox className="ml-auto h-6 w-20 rounded-full" />
            </div>

            {/* Module cards */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, mi) => (
                <div key={mi} className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
                  {/* Module header */}
                  <div className="flex items-center gap-4 p-5">
                    <SkeletonBox className="h-7 w-7 rounded-full" />
                    <div className="flex-1">
                      <SkeletonBox className="h-4 w-40 rounded mb-1" />
                      <SkeletonBox className="h-3 w-64 rounded" />
                    </div>
                    <div className="flex gap-3">
                      <SkeletonBox className="h-3.5 w-8 rounded" />
                      <SkeletonBox className="h-3.5 w-8 rounded" />
                      <SkeletonBox className="h-4 w-4 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
