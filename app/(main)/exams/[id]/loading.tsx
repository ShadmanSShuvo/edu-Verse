import { ExamDetailSkeleton } from "@/components/skeletons/ExamCardSkeleton";

/**
 * Next.js loading.tsx — Shows exam detail skeleton with
 * question and option placeholders while data streams in.
 */
export default function ExamDetailLoading() {
  return <ExamDetailSkeleton />;
}
