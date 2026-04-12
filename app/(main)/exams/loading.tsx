import { ExamsSkeleton } from "@/components/skeletons/ExamCardSkeleton";

/**
 * Next.js loading.tsx — Shows exam list skeleton while
 * exam data is fetched and grouped.
 */
export default function ExamsLoading() {
  return <ExamsSkeleton />;
}
