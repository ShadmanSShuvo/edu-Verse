import { getStudentDashboardStats, getCourseProgress } from "@/db/dashboard";
import { Zap, Target, Star, CheckCircle2 } from "lucide-react";

type Stats = {
    enrolled_count: string;
    exams_taken: string;
    avg_score: string | null;
    best_score: string | null;
    questions_answered: string;
};

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

export async function QuickStatsPanel({ userId }: { userId: number }) {
    const [stats, courseProgress] = await Promise.all([
        getStudentDashboardStats(userId) as Promise<Stats>,
        getCourseProgress(userId) as Promise<CourseProgress[]>,
    ]);

    const examsTaken = parseInt(stats.exams_taken, 10) || 0;
    const questionsAnswered = parseInt(stats.questions_answered, 10) || 0;
    const totalExams = courseProgress.reduce((s, c) => s + c.total_exams, 0);
    const totalAttempted = courseProgress.reduce((s, c) => s + c.attempted_exams, 0);
    const overallProgress = progressPercent(totalAttempted, totalExams);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="text-indigo-500"><Zap className="h-4 w-4" /></span>
                Quick Stats
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-indigo-700">
                        <Target className="h-4 w-4" />
                        Questions Answered
                    </div>
                    <span className="text-lg font-extrabold text-indigo-800">{questionsAnswered}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                        <Star className="h-4 w-4" />
                        Exams Attempted
                    </div>
                    <span className="text-lg font-extrabold text-amber-800">{examsTaken}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Overall Progress
                    </div>
                    <span className="text-lg font-extrabold text-emerald-800">{overallProgress}%</span>
                </div>
            </div>
        </div>
    );
}
