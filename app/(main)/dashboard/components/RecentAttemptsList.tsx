import Link from "next/link";
import { getRecentAttempts } from "@/db/dashboard";
import { Clock, ArrowUpRight, Target, ChevronRight } from "lucide-react";

type RecentAttempt = {
    attempt_id: number;
    score: number;
    time: string;
    exam_title: string;
    marks: number;
    module_title: string;
    course_title: string;
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function scoreColor(score: number) {
    if (score >= 80) return { 
        text: "text-emerald-600 dark:text-emerald-400", 
        bg: "bg-emerald-100 dark:bg-emerald-500/20", 
        stroke: "stroke-emerald-500 dark:stroke-emerald-400" 
    };
    if (score >= 50) return { 
        text: "text-amber-600 dark:text-amber-400", 
        bg: "bg-amber-100 dark:bg-amber-500/20", 
        stroke: "stroke-amber-500 dark:stroke-amber-400" 
    };
    return { 
        text: "text-rose-600 dark:text-rose-400", 
        bg: "bg-rose-100 dark:bg-rose-500/20", 
        stroke: "stroke-rose-500 dark:stroke-rose-400" 
    };
}

function gradeLabel(score: number) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
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

function ScoreRing({ score }: { score: number }) {
    const { text, stroke } = scoreColor(score);
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex h-16 w-16 items-center justify-center">
            <svg viewBox="0 0 72 72" className="-rotate-90" width="64" height="64">
                <circle 
                    cx="36" cy="36" r={radius} 
                    fill="none" 
                    strokeWidth="6" 
                    className="stroke-gray-200/50 dark:stroke-white/10" 
                />
                <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ${stroke}`}
                />
            </svg>
            <span className={`absolute text-xs font-bold ${text}`}>{score}%</span>
        </div>
    );
}

export async function RecentAttemptsList({ userId }: { userId: number }) {
    const recentAttempts = await getRecentAttempts(userId, 8) as RecentAttempt[];

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 shadow-sm">
            <SectionHeader
                icon={<Clock className="h-4 w-4" />}
                title="Recent Exam Attempts"
                href="/exams"
                linkLabel="All exams"
            />

            {recentAttempts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Target className="h-10 w-10 text-gray-200" />
                    <p className="text-sm text-gray-400">No attempts yet. Take your first exam!</p>
                    <Link href="/exams" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
                        View exams →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {recentAttempts.map((a) => {
                        const score = Number(a.score);
                        const { text, bg } = scoreColor(score);
                        return (
                            <Link
                                key={a.attempt_id}
                                href={`/exams/${(a as { attempt_id: number }).attempt_id}/result/${a.attempt_id}`}
                                className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/60 p-3 transition hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/30 dark:hover:bg-slate-800 group"
                            >
                                <ScoreRing score={score} />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                                        {a.exam_title}
                                    </p>
                                    <p className="truncate text-xs text-gray-400">
                                        {a.course_title} · {a.module_title}
                                    </p>
                                </div>
                                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                                    <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${text} ${bg}`}>
                                        {gradeLabel(score)}
                                    </span>
                                    <span className="text-[11px] text-gray-400">{formatDate(a.time)}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-indigo-400 transition" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
