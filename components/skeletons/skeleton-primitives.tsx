/**
 * Generic Skeleton primitive.
 * Use these building blocks to compose route-specific skeleton UIs.
 */

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700/60 ${className}`}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 animate-pulse rounded bg-gray-200 dark:bg-slate-700/60 ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gray-200 dark:bg-slate-700/60 ${className}`}
    />
  );
}
