import { CourseDetailSkeleton } from "@/components/skeletons/CourseDetailSkeleton";

/**
 * Next.js loading.tsx — Shows the course detail skeleton while
 * course, modules, reviews, and instructor data loads.
 */
export default function CourseDetailLoading() {
  return <CourseDetailSkeleton />;
}
