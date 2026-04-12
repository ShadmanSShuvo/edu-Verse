import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

/**
 * Next.js loading.tsx — Shows profile skeleton while
 * user role, permissions, and profile data load.
 */
export default function ProfileLoading() {
  return <ProfileSkeleton />;
}
