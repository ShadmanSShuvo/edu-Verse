import Link from "next/link";
import { getQuestions } from "@/db/question";
import { getStudentIdByUserId, getBestAttempt, countAttempts, getOrCreateActiveAttempt } from "@/db/attempt";
import { StudentExamForm } from "@/components/student-exam-form";
import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";

type Question = {
    ques_id: number;
    exam_id: number;
    ques_statement: string;
    options: string | string[];
    correct_ans: string;
};

export async function ExamQuestionsSection({ 
    exam, 
    userId
}: { 
    exam: any; 
    userId: number;
}) {
    const questions = await getQuestions(exam.exam_id) as Question[];
    const studentId = await getStudentIdByUserId(userId);
    
    if (!studentId) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-10">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 flex items-center gap-4 text-red-800">
                    <AlertTriangle className="h-6 w-6" />
                    <p className="font-semibold">Student record not found. Please re-login.</p>
                </div>
            </div>
        )
    }

    // Fetch parallel stats
    const [bestAttempt, attemptCount, activeAttempt] = await Promise.all([
        getBestAttempt(studentId, exam.exam_id),
        countAttempts(studentId, exam.exam_id),
        getOrCreateActiveAttempt(studentId, exam.exam_id, "live")
    ]);

    const bestAttemptId = bestAttempt?.attempt_id ?? null;
    const hasQuestions = questions.length > 0;
    const startedAt = activeAttempt?.started_at ? new Date(activeAttempt.started_at).toISOString() : null;

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            {/* Previous attempt review link */}
            {bestAttemptId && (
                <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-indigo-500" />
                        <div>
                            <p className="text-sm font-semibold text-indigo-900">You have previous attempts</p>
                            <p className="text-xs text-indigo-600">Review your answers and see detailed results</p>
                        </div>
                    </div>
                    <Link
                        href={`/exams/${exam.exam_id}/result/${bestAttemptId}`}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                        View Results
                    </Link>
                </div>
            )}

            {!hasQuestions ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                    <Trophy className="h-12 w-12 text-gray-300" />
                    <p className="text-lg font-semibold text-gray-500">No questions yet</p>
                    <p className="text-sm text-gray-400">Your instructor hasn&apos;t added questions to this exam.</p>
                </div>
            ) : (
                <StudentExamForm 
                    exam={exam} 
                    questions={questions} 
                    attemptCount={attemptCount} 
                    userId={userId} 
                    startedAt={startedAt} 
                />
            )}
        </div>
    );
}
