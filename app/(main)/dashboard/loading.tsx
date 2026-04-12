import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

/**
 * Next.js loading.tsx — Instantly displays a skeleton UI while the
 * dashboard page's server component streams in.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
