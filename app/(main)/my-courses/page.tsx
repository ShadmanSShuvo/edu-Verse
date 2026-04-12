import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { TakaSymbol } from "@/components/taka-symbol";
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { NumberedPagination } from "@/components/pagination";
import { getStudentEnrollments, getStudentEnrollmentsCount } from "@/db/enrollment";
import { AnimatedEnrolledCourseCard } from "./components/AnimatedEnrolledCourseCard";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

type Enrollment = {
  course_id: number;
  title: string;
  description: string | null;
  price: number;
  enrolled_at: string;
  progress: number;
};

// ─── Search-param shape (wired-in for future client-side filtering/sorting) ───

type SearchParams = {
  sort?: string;   // "recent" | "progress"
  filter?: string; // "in-progress" | "completed" | "not-started"
  q?: string;      // free-text search
  page?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────



// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <ScrollReveal>
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-gray-200 py-24 text-center dark:border-white/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-500">
          <BookOpen className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-700">
            You haven&apos;t enrolled in any courses yet
          </p>
          <p className="text-sm text-gray-400">
            Explore our catalog and start your learning journey today.
          </p>
        </div>
        <Link
          href="/courses"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <BookOpen className="h-4 w-4" />
          Browse Courses
        </Link>
      </div>
    </ScrollReveal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

import { Footer } from "@/components/footer";

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/signin");

  const roles = await getUserRoles(session.user_id);
  const roleName = roles[0]?.name ?? "student";
  if (roleName === "instructor" || roleName === "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const [enrollments, totalCount] = await Promise.all([
    getStudentEnrollments(session.user_id, {
      q: params.q,
      filter: params.filter,
      sort: params.sort,
      limit: pageSize,
      offset
    }),
    getStudentEnrollmentsCount(session.user_id, {
      q: params.q,
      filter: params.filter
    })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 py-16">
        {/* Dot pattern overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 bg-hero-my-courses"
        />

        <HeroReveal className="relative mx-auto max-w-6xl px-6">
          {/* Badge pill */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <GraduationCap className="h-3.5 w-3.5" />
            My Learning Journey
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Learning Journey
          </h1>
          <p className="mt-2 text-white/80">
            {totalCount === 0
              ? "Start enrolling in courses to track your progress here."
              : `You are enrolled in ${totalCount} ${totalCount === 1 ? "course" : "courses"}.`}
          </p>
        </HeroReveal>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {enrollments.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollReveal delay={0.1}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment: Enrollment, idx: number) => (
                <ScrollReveal key={enrollment.course_id} delay={0.1 * (idx % 3)}>
                  <AnimatedEnrolledCourseCard enrollment={enrollment} />
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        <ScrollReveal className="mt-12">
          <NumberedPagination
            totalItems={totalCount}
            pageSize={pageSize}
            currentPage={page}
          />
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
