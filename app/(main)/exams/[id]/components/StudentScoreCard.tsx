import { getStudentIdByUserId, getBestAttempt, countAttempts } from "@/db/attempt";

export async function StudentScoreCard({ userId, examId }: { userId: number, examId: number }) {
    const studentId = await getStudentIdByUserId(userId);
    if (!studentId) return null;

    const [bestAttempt, attemptCount] = await Promise.all([
        getBestAttempt(studentId, examId),
        countAttempts(studentId, examId),
    ]);

    if (!bestAttempt) return null;

    const bestScore = Number(bestAttempt.score);

    return (
        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-center backdrop-blur-md">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Best Score</p>
            <p className={`text-4xl font-extrabold ${bestScore >= 80 ? "text-emerald-400" : bestScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {bestScore}%
            </p>
            <p className="text-xs text-white/50 mt-1">{attemptCount} attempt{attemptCount > 1 ? "s" : ""}</p>
        </div>
    );
}
