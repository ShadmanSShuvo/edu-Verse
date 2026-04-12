import { CoursesSkeleton } from "@/components/skeletons/CourseCardSkeleton";

/**
 * Next.js loading.tsx — Instantly displays a skeleton grid while
 * course data is fetched server-side.
 */
export default function CoursesLoading() {
  return <CoursesSkeleton />;
}
