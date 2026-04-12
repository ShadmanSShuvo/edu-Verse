import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/db/courses";
import { CheckCircle, Tag } from "lucide-react";

// Components
import { CurriculumSection } from "./components/CurriculumSection";
import { InstructorsSection } from "./components/InstructorsSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { EnrollCard } from "./components/EnrollCard";
import { CourseHero } from "./components/CourseHero";

// Skeletons
import { CourseDetailSkeleton } from "@/components/skeletons/CourseDetailSkeleton";

import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const courseId = parseInt(id, 10);
    if (isNaN(courseId)) notFound();

    // Fetch minimal data needed for initial validation
    const course = await getCourseById(courseId);
    if (!course) notFound();

    const subjectTags = course.subjects
        ? course.subjects.split(", ").filter(Boolean)
        : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <Suspense fallback={<div className="h-[400px] animate-pulse bg-slate-900" />}>
                <CourseHero courseId={courseId} />
            </Suspense>

            {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* ── LEFT / MAIN ─────────────────────────────────────────────── */}
                    <div className="flex flex-col gap-8 lg:col-span-2">
                        <ScrollReveal delay={0.1}>
                            <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-gray-200" />)}</div>}>
                                <CurriculumSection courseId={courseId} />
                            </Suspense>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                            <Suspense fallback={<div className="h-32 w-full animate-pulse rounded-2xl bg-gray-200" />}>
                                <InstructorsSection courseId={courseId} />
                            </Suspense>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                            <Suspense fallback={<div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-gray-200" />)}</div>}>
                                <ReviewsSection courseId={courseId} />
                            </Suspense>
                        </ScrollReveal>
                    </div>

                    {/* ── RIGHT SIDEBAR ───────────────────────────────────────────── */}
                    <div className="flex flex-col gap-5">
                        {/* Right: enroll card - now relative to main content for better layout on desktop */}
                        <ScrollReveal delay={0.1} className="lg:-mt-64 lg:relative lg:z-10">
                            <Suspense fallback={<div className="h-64 w-full max-w-sm animate-pulse rounded-2xl bg-white/10" />}>
                                <EnrollCard
                                    courseId={courseId}
                                    course={course}
                                />
                            </Suspense>
                        </ScrollReveal>

                        {/* What you'll learn */}
                        <ScrollReveal delay={0.1} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
                            <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
                                What you&apos;ll learn
                            </h3>
                            <ul className="flex flex-col gap-2">
                                {[
                                    "Core concepts & theory",
                                    "Hands-on projects",
                                    "Real-world applications",
                                    "Best practices & patterns",
                                    "Community Q&A access",
                                    "Certificate of completion",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </ScrollReveal>

                        {/* Subjects */}
                        {subjectTags.length > 0 && (
                            <ScrollReveal delay={0.1} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
                                <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Topics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {subjectTags.map((tag: string) => (
                                        <Link
                                            key={tag}
                                            href={`/courses?subject=${encodeURIComponent(tag)}`}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition"
                                        >
                                            <Tag className="h-2.5 w-2.5" />
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </ScrollReveal>
                        )}

                        {/* Other courses CTA */}
                        <ScrollReveal delay={0.1} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-500/10 dark:to-blue-500/10 p-6 shadow-sm">
                            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Explore more courses
                            </p>
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition"
                            >
                                Browse Catalog →
                            </Link>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div >
    );
}
