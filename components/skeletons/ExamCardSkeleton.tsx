import { SkeletonBox } from "./skeleton-primitives";

/**
 * Skeleton for the exams listing page.
 * Mirrors: hero ➜ grouped course/module sections with exam cards.
 */
export function ExamsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      {/* Hero band */}
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-3 h-7 w-28 rounded-full bg-white/20" />
          <SkeletonBox className="mb-2 h-9 w-64 rounded bg-white/15" />
          <SkeletonBox className="h-4 w-96 max-w-full rounded bg-white/10" />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        {/* Two course groups */}
        {Array.from({ length: 2 }).map((_, ci) => (
          <div key={ci}>
            {/* Course heading */}
            <div className="mb-5 flex items-center gap-3">
              <SkeletonBox className="h-10 w-10 rounded-xl" />
              <SkeletonBox className="h-5 w-48 rounded" />
            </div>

            {/* Module section */}
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, mi) => (
                <div key={mi} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm overflow-hidden">
                  {/* Module header */}
                  <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-white/10">
                    <SkeletonBox className="h-7 w-7 rounded-full" />
                    <SkeletonBox className="h-4 w-36 rounded" />
                  </div>
                  {/* Exam cards */}
                  <div className="p-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, ei) => (
                      <div key={ei} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/40 p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <SkeletonBox className="h-9 w-9 rounded-lg" />
                          <div className="flex-1">
                            <SkeletonBox className="h-3.5 w-40 rounded mb-1" />
                            <SkeletonBox className="h-2.5 w-28 rounded" />
                          </div>
                        </div>
                        <SkeletonBox className="h-6 w-14 rounded-lg" />
                      </div>
                    ))}
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

/**
 * Skeleton for a single exam detail page (with questions).
 */
export function ExamDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-6 h-4 w-24 rounded bg-white/10" />
          <SkeletonBox className="mb-3 h-8 w-80 rounded bg-white/15" />
          <div className="flex gap-4">
            <SkeletonBox className="h-4 w-20 rounded bg-white/10" />
            <SkeletonBox className="h-4 w-24 rounded bg-white/10" />
            <SkeletonBox className="h-4 w-16 rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-5">
        {/* Timer bar skeleton */}
        <SkeletonBox className="h-14 w-full rounded-2xl" />

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
            {/* Question header */}
            <div className="flex items-start gap-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/40 px-6 py-4">
              <SkeletonBox className="h-7 w-7 rounded-full" />
              <SkeletonBox className="h-4 w-3/4 rounded" />
            </div>
            {/* Options */}
            <div className="grid gap-2 p-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, oi) => (
                <div key={oi} className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3">
                  <SkeletonBox className="h-4 w-4 rounded-full" />
                  <SkeletonBox className="h-3.5 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit button */}
        <div className="mt-8 flex items-center justify-between">
          <SkeletonBox className="h-4 w-28 rounded" />
          <SkeletonBox className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
