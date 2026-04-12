import { SkeletonBox } from "@/components/skeletons/skeleton-primitives";

/**
 * Next.js loading.tsx — Shows a skeleton for the admin dashboard
 * while analytics and user data load.
 */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-rose-900 to-red-900 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-3 h-7 w-32 rounded-full bg-white/20" />
          <SkeletonBox className="mb-2 h-9 w-56 rounded bg-white/15" />
          <SkeletonBox className="h-4 w-80 max-w-full rounded bg-white/10" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-5 shadow-sm animate-pulse">
              <SkeletonBox className="mb-3 h-10 w-10 rounded-xl" />
              <SkeletonBox className="h-7 w-16 rounded mb-1" />
              <SkeletonBox className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>

        {/* Data tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
              <div className="border-b border-gray-100 dark:border-white/10 px-6 py-4">
                <SkeletonBox className="h-5 w-32 rounded" />
              </div>
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 p-3">
                    <SkeletonBox className="h-4 w-40 rounded" />
                    <SkeletonBox className="h-4 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
