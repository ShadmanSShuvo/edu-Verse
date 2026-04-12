import { getStudentDashboardStats } from "@/db/dashboard";
import { BookOpen, Trophy, BarChart3, Award } from "lucide-react";

type Stats = {
    enrolled_count: string;
    exams_taken: string;
    avg_score: string | null;
    best_score: string | null;
    questions_answered: string;
};

function gradeLabel(score: number) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
}

import { AnimatedStatCard } from "./AnimatedStatCard";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export async function DashboardStatsCards({ userId }: { userId: number }) {
    const stats = await getStudentDashboardStats(userId) as Stats;

    const enrolledCount = parseInt(stats.enrolled_count, 10) || 0;
    const examsTaken = parseInt(stats.exams_taken, 10) || 0;
    const avgScore = stats.avg_score ? parseFloat(stats.avg_score) : null;
    const bestScore = stats.best_score ? parseFloat(stats.best_score) : null;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScrollReveal delay={0}>
                <AnimatedStatCard
                    icon={<BookOpen className="h-5 w-5" />}
                    label="Courses"
                    value={enrolledCount}
                    color="bg-indigo-500 text-indigo-500 border-indigo-500"
                />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
                <AnimatedStatCard
                    icon={<Trophy className="h-5 w-5" />}
                    label="Exams"
                    value={examsTaken}
                    color="bg-amber-500 text-amber-500 border-amber-500"
                />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
                <AnimatedStatCard
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Avg Score"
                    value={avgScore !== null ? `${avgScore}%` : "—"}
                    sub={avgScore !== null ? gradeLabel(avgScore) : "Pending"}
                    color="bg-violet-500 text-violet-500 border-violet-500"
                />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
                <AnimatedStatCard
                    icon={<Award className="h-5 w-5" />}
                    label="Best"
                    value={bestScore !== null ? `${bestScore}%` : "—"}
                    sub={bestScore !== null ? gradeLabel(bestScore) : "Pending"}
                    color="bg-emerald-500 text-emerald-500 border-emerald-500"
                />
            </ScrollReveal>
        </div>
    );
}
