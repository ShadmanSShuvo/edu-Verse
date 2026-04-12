import Link from "next/link";
import { getStudentDashboardStats, getCourseProgress, getRecentlyActiveCourse } from "@/db/dashboard";
import { BookOpen, Trophy, PlayCircle, ChevronRight, GraduationCap } from "lucide-react";

type Stats = {
    enrolled_count: string;
    exams_taken: string;
};

type CourseProgress = {
    total_exams: number;
    attempted_exams: number;
};

function progressPercent(attempted: number, total: number) {
    if (total === 0) return 0;
    return Math.round((attempted / total) * 100);
}

export async function DashboardHero({ userId, name }: { userId: number, name: string }) {
    const [stats, courseProgress, recentActive] = await Promise.all([
        getStudentDashboardStats(userId) as Promise<Stats>,
        getCourseProgress(userId) as Promise<CourseProgress[]>,
        getRecentlyActiveCourse(userId)
    ]);

    const enrolledCount = parseInt(stats.enrolled_count, 10) || 0;
    const totalExams = courseProgress.reduce((s, c) => s + c.total_exams, 0);
    const totalAttempted = courseProgress.reduce((s, c) => s + c.attempted_exams, 0);
    const overallProgress = progressPercent(totalAttempted, totalExams);

    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return (
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 pb-24 pt-12">
            {/* Background elements */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl opacity-50" />
                <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl opacity-50" />
                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-6">
                         <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 backdrop-blur-sm">
                            <GraduationCap className="h-3.5 w-3.5" />
                            My Learning Journey
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-extrabold text-white shadow-xl shadow-indigo-500/20">
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">{greeting},</p>
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">{name} 👋</h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/courses" className="group inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/20">
                                <BookOpen className="h-4 w-4 text-indigo-400" /> Browse Catalog
                            </Link>
                            <Link href="/exams" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95">
                                <Trophy className="h-4 w-4" /> My Exams
                            </Link>
                        </div>
                    </div>

                    {/* RESUME LEARNING CARD ────────────────────────────────────────────── */}
                    <div className="relative w-full lg:max-w-md">
                        {recentActive ? (
                            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-md shadow-2xl">
                                <div className="rounded-[22px] bg-slate-900/60 p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Continue Learning</span>
                                        <span className="text-[10px] font-medium text-slate-500">Last active {new Date(recentActive.last_active).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="mb-1 text-lg font-bold text-white line-clamp-1">{recentActive.course_title}</h3>
                                    <p className="mb-6 text-sm text-slate-400 line-clamp-1">Module: {recentActive.module_title}</p>
                                    
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" 
                                                style={{ width: `${overallProgress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-white">{overallProgress}%</span>
                                    </div>

                                    <Link 
                                        href={`/modules?course=${recentActive.course_id}`}
                                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-indigo-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <PlayCircle className="h-4 w-4 text-indigo-600 transition-transform group-hover:scale-110 dark:text-indigo-300" />
                                        Jump Back In
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-30 dark:opacity-60" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center backdrop-blur-sm">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-bold text-white">Ready to start?</h3>
                                <p className="mb-6 text-sm text-slate-400 line-clamp-2">Enroll in your first course and start your learning journey today.</p>
                                <Link 
                                    href="/courses"
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        )}
                        
                        {/* Decorative glow behind card */}
                        <div className="absolute -right-4 -top-4 -z-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
                        <div className="absolute -bottom-4 -left-4 -z-10 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
