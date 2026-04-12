import { SkeletonBox } from "./skeleton-primitives";

/**
 * Skeleton for the profile page.
 * Mirrors: banner + avatar ➜ two-column layout with edit profile, stats, etc.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-gray-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 animate-pulse" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Profile header card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
          {/* Banner */}
          <div className="h-28 w-full animate-pulse bg-gradient-to-r from-violet-600/40 via-blue-600/40 to-indigo-600/40" />
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <div className="-mt-10">
              <SkeletonBox className="h-20 w-20 rounded-full" />
            </div>
            <div className="flex flex-1 flex-col gap-2 sm:pb-1">
              <SkeletonBox className="h-7 w-40 rounded" />
              <div className="flex gap-3">
                <SkeletonBox className="h-4 w-44 rounded" />
                <SkeletonBox className="h-4 w-28 rounded" />
              </div>
            </div>
            <SkeletonBox className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Edit profile */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 px-6 py-4">
                <SkeletonBox className="h-4 w-4 rounded" />
                <SkeletonBox className="h-4 w-24 rounded" />
              </div>
              <div className="p-6 space-y-4">
                <SkeletonBox className="h-10 w-full rounded-lg" />
                <SkeletonBox className="h-10 w-full rounded-lg" />
                <SkeletonBox className="h-10 w-full rounded-lg" />
              </div>
            </div>
            {/* Contact info */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 px-6 py-4">
                <SkeletonBox className="h-4 w-4 rounded" />
                <SkeletonBox className="h-4 w-28 rounded" />
              </div>
              <div className="p-6 space-y-3">
                <SkeletonBox className="h-4 w-full rounded" />
                <SkeletonBox className="h-4 w-3/4 rounded" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-5 shadow-sm">
                  <SkeletonBox className="h-11 w-11 rounded-xl" />
                  <div>
                    <SkeletonBox className="h-6 w-12 rounded mb-1" />
                    <SkeletonBox className="h-3 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
            {/* Content cards */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 px-6 py-4">
                  <SkeletonBox className="h-4 w-4 rounded" />
                  <SkeletonBox className="h-4 w-28 rounded" />
                </div>
                <div className="p-6 space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/40 p-4">
                      <div className="flex-1">
                        <SkeletonBox className="h-4 w-40 rounded mb-1" />
                        <SkeletonBox className="h-3 w-24 rounded" />
                      </div>
                      <SkeletonBox className="h-6 w-14 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
