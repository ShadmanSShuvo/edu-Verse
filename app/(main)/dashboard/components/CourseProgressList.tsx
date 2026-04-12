import Link from "next/link";
import { getCourseProgress } from "@/db/dashboard";
import { BookOpen, TrendingUp, ArrowUpRight, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";

type CourseProgress = {
    course_id: number;
    course_title: string;
    total_exams: number;
    attempted_exams: number;
    avg_best_score: string | null;
};

function progressPercent(attempted: number, total: number) {
    if (total === 0) return 0;
    return Math.round((attempted / total) * 100);
}

function scoreColor(score: number) {
    if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-100", ring: "ring-emerald-400" };
    if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-100", ring: "ring-amber-400" };
    return { text: "text-rose-600", bg: "bg-rose-100", ring: "ring-rose-400" };
}

function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function SectionHeader({ icon, title, href, linkLabel }: {
    icon: React.ReactNode;
    title: string;
    href?: string;
    linkLabel?: string;
}) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="text-indigo-500">{icon}</span>
                {title}
            </h2>
            {href && (
                <Link
                    href={href}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                    {linkLabel ?? "View all"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            )}
        </div>
    );
}

export async function CourseProgressList({ userId }: { userId: number }) {
    const courseProgress = await getCourseProgress(userId) as CourseProgress[];

    return (
        <div className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-8 shadow-sm shadow-slate-200/50">
            <SectionHeader
                icon={<TrendingUp className="h-4 w-4" />}
                title="Your Learning Roadmap"
                href="/modules"
                linkLabel="Curriculum"
            />

            {courseProgress.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Start your first course</p>
                        <p className="text-sm text-slate-400">Your roadmap will appear here once you enroll.</p>
                    </div>
                    <Link href="/courses" className="mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {courseProgress.map((cp) => {
                        const pct = progressPercent(cp.attempted_exams, cp.total_exams);
                        const avgBS = cp.avg_best_score ? parseFloat(cp.avg_best_score) : null;
                        return (
                            <div key={cp.course_id} className="group relative rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-5 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1 flex items-center justify-between">
                                            <p className="truncate text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {cp.course_title}
                                            </p>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{pct}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                             <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 group-hover:bg-indigo-500" 
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {avgBS !== null && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${scoreColor(avgBS).text} ${scoreColor(avgBS).bg} dark:bg-opacity-20`}>
                                                        Avg {avgBS}%
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {cp.attempted_exams}/{cp.total_exams} Units
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/modules?course=${cp.course_id}`}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-white/10 transition-all hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-400/30 group-hover:scale-110 shadow-sm"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
