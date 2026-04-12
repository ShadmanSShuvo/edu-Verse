import { SkeletonBox } from "@/components/skeletons/skeleton-primitives";

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/40">
      {/* Top accent bar */}
      <div className="h-1 w-full animate-pulse bg-gradient-to-r from-blue-200 via-cyan-200 to-emerald-200" />
      <div className="p-5 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-14 rounded-full" />
          <SkeletonBox className="h-3.5 w-28 rounded" />
        </div>
        {/* Title */}
        <SkeletonBox className="h-5 w-3/4 rounded" />
        {/* Description */}
        <div className="space-y-1.5">
          <SkeletonBox className="h-3.5 w-full rounded" />
          <SkeletonBox className="h-3.5 w-5/6 rounded" />
        </div>
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <SkeletonBox className="h-3 w-14 rounded" />
            <SkeletonBox className="h-3 w-20 rounded" />
          </div>
          <SkeletonBox className="h-2 w-full rounded-full" />
        </div>
        {/* Button */}
        <SkeletonBox className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function MyCoursesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-emerald-500/80 py-16 animate-pulse">
        <div className="mx-auto max-w-6xl px-6 space-y-3">
          <SkeletonBox className="h-7 w-44 rounded-full bg-white/20" />
          <SkeletonBox className="h-10 w-64 rounded bg-white/20" />
          <SkeletonBox className="h-4 w-48 rounded bg-white/15" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
