import Link from "next/link";
import { getStudentDashboardStats } from "@/db/dashboard";
import { MessageCircle } from "lucide-react";

type Stats = {
    avg_score: string | null;
};

export async function MotivationCard({ userId }: { userId: number }) {
    const stats = await getStudentDashboardStats(userId) as Stats;
    const avgScore = stats.avg_score ? parseFloat(stats.avg_score) : null;

    if (avgScore === null) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-lg">
            <div aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <p className="relative text-sm font-semibold text-white/80">Keep it up! 🚀</p>
            <p className="relative mt-1 text-2xl font-extrabold">
                {avgScore >= 80
                    ? "You're crushing it!"
                    : avgScore >= 50
                        ? "Making solid progress"
                        : "Every attempt counts!"}
            </p>
            <p className="relative mt-2 text-xs text-white/60">
                Your average score is <strong className="text-white">{avgScore}%</strong>.{" "}
                {avgScore < 80
                    ? "Review past attempts to improve."
                    : "Maintain this momentum!"}
            </p>
            <Link
                href="/exams"
                className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
            >
                <MessageCircle className="h-3.5 w-3.5" /> View Exam History
            </Link>
        </div>
    );
}
