import { SkeletonBox } from "@/components/skeletons/skeleton-primitives";

/**
 * Next.js loading.tsx — Shows a skeleton for the module detail / discussion page.
 */
export default function ModuleDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <SkeletonBox className="mb-4 h-4 w-24 rounded bg-white/10" />
          <SkeletonBox className="mb-2 h-8 w-72 rounded bg-white/15" />
          <SkeletonBox className="h-4 w-96 max-w-full rounded bg-white/10" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        {/* Discussion post form skeleton */}
        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
          <SkeletonBox className="mb-4 h-5 w-36 rounded" />
          <SkeletonBox className="mb-3 h-24 w-full rounded-lg" />
          <SkeletonBox className="h-10 w-28 rounded-lg ml-auto" />
        </div>

        {/* Discussion posts */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/40 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <SkeletonBox className="h-9 w-9 rounded-full" />
              <div>
                <SkeletonBox className="h-3.5 w-24 rounded mb-1" />
                <SkeletonBox className="h-2.5 w-16 rounded" />
              </div>
            </div>
            <SkeletonBox className="h-3 w-full rounded mb-1" />
            <SkeletonBox className="h-3 w-full rounded mb-1" />
            <SkeletonBox className="h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
