import { SkeletonBox } from "@/components/skeletons/skeleton-primitives";

export function StudentExamsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Course Section */}
      {Array.from({ length: 2 }).map((_, ci) => (
        <section key={ci}>
          <div className="mb-5 flex items-center gap-3">
            <SkeletonBox className="h-10 w-10 rounded-xl" />
            <SkeletonBox className="h-5 w-48 rounded" />
          </div>
          
          <div className="space-y-4">
            {/* Module Card */}
            {Array.from({ length: 1 }).map((_, mi) => (
              <div key={mi} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3 dark:border-white/10 dark:bg-slate-800/40">
                  <SkeletonBox className="h-4 w-4 rounded" />
                  <SkeletonBox className="h-4 w-32 rounded" />
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                  {Array.from({ length: 2 }).map((_, ei) => (
                    <div key={ei} className="flex items-center gap-4 px-5 py-4">
                      <SkeletonBox className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-1/3 rounded" />
                        <SkeletonBox className="h-3 w-1/4 rounded" />
                      </div>
                      <SkeletonBox className="h-8 w-24 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function InstructorExamsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {Array.from({ length: 2 }).map((_, ci) => (
        <section key={ci}>
          <div className="mb-5 flex items-center gap-3">
            <SkeletonBox className="h-10 w-10 rounded-xl" />
            <SkeletonBox className="h-5 w-48 rounded" />
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: 1 }).map((_, mi) => (
              <div key={mi} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/40">
                 <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3 dark:border-white/10 dark:bg-slate-800/40">
                  <SkeletonBox className="h-4 w-4 rounded" />
                  <SkeletonBox className="h-4 w-32 rounded" />
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                  {Array.from({ length: 2 }).map((_, ei) => (
                    <div key={ei} className="flex items-center gap-4 px-5 py-4">
                      <SkeletonBox className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-1/3 rounded" />
                        <SkeletonBox className="h-3 w-1/4 rounded" />
                      </div>
                      <SkeletonBox className="h-8 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
