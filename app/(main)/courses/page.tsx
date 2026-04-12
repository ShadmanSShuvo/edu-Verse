import { Suspense } from "react";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
    BookOpen,
    ArrowRight,
} from "lucide-react";
import { SearchBarWithSuggestions } from "@/components/search-bar-with-suggestions";
import { CourseList } from "./components/CourseList";
import { SubjectFilter } from "./components/SubjectFilter";
import { CourseSort } from "./components/CourseSort";
import { CoursesSkeleton, CourseCardSkeleton } from "@/components/skeletons/CourseCardSkeleton";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; subject?: string; sort?: string; page?: string }>;
}) {
    const [paramsResolved, session] = await Promise.all([
        searchParams,
        getSession()
    ]);
    const { q = "", subject = "", sort = "", page = "1" } = paramsResolved;

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── HERO BAND ──────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 py-16">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-20 bg-hero-courses"
                />
                <HeroReveal className="mx-auto max-w-6xl px-6 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                        <BookOpen className="h-3.5 w-3.5" />
                        Course Catalog
                    </div>
                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Explore All Courses
                    </h1>
                    <p className="mx-auto max-w-xl text-white/80">
                        Expert-taught courses — find your next skill and start learning today.
                    </p>
                </HeroReveal>
            </div>

            {/* ── SEARCH + FILTER ────────────────────────────────────────────── */}
            <div className="sticky top-[57px] z-30 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4">
                    <SearchBarWithSuggestions initialValue={q} subject={subject} />

                    <Suspense fallback={
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-gray-200" />
                            ))}
                        </div>
                    }>
                        <SubjectFilter q={q} subject={subject} sort={sort} />
                    </Suspense>

                    <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-full bg-gray-200" />}>
                        <CourseSort />
                    </Suspense>
                </div>
            </div>

            {/* ── COURSE GRID ────────────────────────────────────────────────── */}
            <Suspense key={q + subject} fallback={
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <div className="mb-6 h-4 w-36 animate-pulse rounded bg-gray-200" />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            }>
                <ScrollReveal delay={0.1}>
                    <CourseList q={q} subject={subject} sort={sort} page={Number(page)} />
                </ScrollReveal>
            </Suspense>

            {/* ── CTA ────────────────────────────────────────────────────────── */}
            {!session && (
                <div className="border-t border-gray-100 bg-white py-16">
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <h2 className="mb-3 text-2xl font-bold text-gray-900">
                            Can&apos;t find what you&apos;re looking for?
                        </h2>
                        <p className="mb-6 text-gray-500">
                            Sign up and let our AI recommend the perfect learning path for you.
                        </p>
                        <Link
                            href="/signup"
                            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Get Started Free
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            )}
            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}
