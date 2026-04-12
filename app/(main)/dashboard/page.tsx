import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import {
    BookOpen,
    Layers,
    GraduationCap,
    ChevronRight,
} from "lucide-react";

// Components
import { DashboardHero } from "./components/DashboardHero";
import { DashboardStatsCards } from "./components/DashboardStatsCards";
import { CourseProgressList } from "./components/CourseProgressList";
import { RecentAttemptsList } from "./components/RecentAttemptsList";
import { QuickStatsPanel } from "./components/QuickStatsPanel";
import { UnattemptedExamsList } from "./components/UnattemptedExamsList";
import { MotivationCard } from "./components/MotivationCard";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// Skeletons
import {
    DashboardStatSkeleton,
    CourseProgressSkeleton,
    RecentAttemptsSkeleton,
    QuickStatsSkeleton,
    UnattemptedExamsSkeleton,
    HeroProgressSkeleton,
} from "@/components/skeletons/DashboardSkeleton";
import { SkeletonBox } from "@/components/skeletons/skeleton-primitives";

import { Footer } from "@/components/footer";

export default async function StudentDashboardPage() {
    const sessionPromise = getSession();
    const session = await sessionPromise;
    if (!session) redirect("/signin");

    const userId = session.user_id;
    const roles = await getUserRoles(userId);

    const isAdmin = roles.some((r: any) => r.name === "admin");
    if (isAdmin) redirect("/admin");

    const role = roles[0]?.name ?? "student";
    if (role === "instructor") redirect("/profile");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">


            {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
            <Suspense fallback={
                <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-blue-900 pb-20 pt-12">
                    <div className="mx-auto max-w-6xl px-6">
                        <SkeletonBox className="mb-6 h-3 w-32 rounded bg-white/10" />
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <SkeletonBox className="h-14 w-14 rounded-2xl bg-white/20" />
                                <div>
                                    <SkeletonBox className="h-3 w-24 rounded bg-white/10 mb-2" />
                                    <SkeletonBox className="h-7 w-48 rounded bg-white/15" />
                                </div>
                            </div>
                        </div>
                        <HeroProgressSkeleton />
                    </div>
                </div>
            }>
                <HeroReveal>
                    <DashboardHero userId={userId} name={session.name} />
                </HeroReveal>
            </Suspense>

            {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl -mt-12 px-6 pb-16 space-y-10 relative z-10">

                {/* ── STAT CARDS ────────────────────────────────────────────────────── */}
                <Suspense fallback={
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)}
                    </div>
                }>
                    <DashboardStatsCards userId={userId} />
                </Suspense>

                {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────────── */}
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* ── LEFT: Progress + recent ─────────────────────────────────── */}
                    <div className="flex flex-col gap-8 lg:col-span-2">
                        <ScrollReveal delay={0.1}>
                            <Suspense fallback={<CourseProgressSkeleton />}>
                                <CourseProgressList userId={userId} />
                            </Suspense>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                            <Suspense fallback={<RecentAttemptsSkeleton />}>
                                <RecentAttemptsList userId={userId} />
                            </Suspense>
                        </ScrollReveal>
                    </div>

                    {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
                    <ScrollReveal delay={0.1} className="flex flex-col gap-6 lg:col-span-1">
                        <Suspense fallback={<UnattemptedExamsSkeleton />}>
                            <UnattemptedExamsList userId={userId} />
                        </Suspense>

                        {/* QUICK LINKS ─────────────────────────────────────────────────── */}
                        <div className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 shadow-sm shadow-slate-200/50">
                            <div className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                                <span className="text-indigo-500"><Layers className="h-4 w-4" /></span>
                                Explore
                            </div>
                            <div className="space-y-2">
                                {[
                                    { href: "/courses", icon: <BookOpen className="h-4 w-4" />, label: "Browse Courses", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" },
                                    { href: "/modules", icon: <Layers className="h-4 w-4" />, label: "Course Modules", color: "text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400" },
                                    { href: "/exams", icon: <Trophy className="h-4 w-4" />, label: "All Exams", color: "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400" },
                                    { href: "/profile", icon: <GraduationCap className="h-4 w-4" />, label: "My Profile", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400" },
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all hover:translate-x-1 ${link.color}`}
                                    >
                                        {link.icon}
                                        {link.label}
                                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Suspense fallback={<div className="h-40 w-full animate-pulse rounded-2xl bg-gray-200" />}>
                            <MotivationCard userId={userId} />
                        </Suspense>
                    </ScrollReveal>
                </div>
            </div>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
