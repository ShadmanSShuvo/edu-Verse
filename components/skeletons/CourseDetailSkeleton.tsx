import { SkeletonBox } from "./skeleton-primitives";

/**
 * Skeleton for the course detail page.
 * Mirrors: dark hero with enroll card ➜ curriculum ➜ instructors ➜ reviews.
 */
export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-6 h-4 w-32 rounded bg-white/10" />
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Left: course info */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex gap-2">
                <SkeletonBox className="h-6 w-20 rounded-full bg-white/10" />
                <SkeletonBox className="h-6 w-24 rounded-full bg-white/10" />
              </div>
              <SkeletonBox className="mb-4 h-10 w-4/5 rounded bg-white/15" />
              <SkeletonBox className="mb-2 h-4 w-full rounded bg-white/10" />
              <SkeletonBox className="mb-6 h-4 w-3/4 rounded bg-white/10" />
              <SkeletonBox className="mb-4 h-4 w-48 rounded bg-white/10" />
              <div className="flex gap-5">
                <SkeletonBox className="h-4 w-20 rounded bg-white/10" />
                <SkeletonBox className="h-4 w-28 rounded bg-white/10" />
                <SkeletonBox className="h-4 w-24 rounded bg-white/10" />
              </div>
            </div>
            {/* Right: enroll card */}
            <div className="flex items-start justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-6">
                <SkeletonBox className="mb-4 h-8 w-20 rounded bg-white/15" />
                <SkeletonBox className="mb-3 h-12 w-full rounded-xl bg-white/15" />
                <SkeletonBox className="h-12 w-full rounded-xl bg-white/10" />
                <div className="mt-5 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBox key={i} className="h-4 w-full rounded bg-white/10" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Curriculum */}
            <div>
              <SkeletonBox className="mb-5 h-6 w-40 rounded" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-4 flex items-center gap-3">
                    <SkeletonBox className="h-7 w-7 rounded-full" />
                    <SkeletonBox className="h-4 w-48 rounded" />
                  </div>
                ))}
              </div>
            </div>
            {/* Reviews */}
            <div>
              <SkeletonBox className="mb-5 h-6 w-36 rounded" />
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <SkeletonBox className="h-9 w-9 rounded-full" />
                      <div>
                        <SkeletonBox className="h-3.5 w-24 rounded mb-1" />
                        <SkeletonBox className="h-3 w-16 rounded" />
                      </div>
                    </div>
                    <SkeletonBox className="h-3 w-full rounded mb-1" />
                    <SkeletonBox className="h-3 w-3/4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
              <SkeletonBox className="mb-4 h-5 w-36 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonBox key={i} className="h-4 w-full rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
