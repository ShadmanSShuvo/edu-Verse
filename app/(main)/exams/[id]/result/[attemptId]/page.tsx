import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getExamById } from "@/db/exam";
import { getAttemptDetail } from "@/db/attempt";
import {
    Trophy,
    CheckCircle,
    XCircle,
    ArrowLeft,
    RotateCcw,
    Star,
    Clock,
    BookOpen,
    Layers,
} from "lucide-react";

function ScoreRing({ score }: { score: number }) {
    const colour =
        score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
    const bgColour =
        score >= 80 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-500/10";
    const label =
        score >= 80 ? "Excellent!" : score >= 50 ? "Good Effort" : "Needs Improvement";
    return (
        <div className={`flex flex-col items-center justify-center rounded-3xl ${bgColour} px-10 py-8`}>
            <p className={`text-7xl font-black tabular-nums ${colour}`}>{score}%</p>
            <p className="mt-2 text-sm font-semibold text-white/70">{label}</p>
        </div>
    );
}

import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default async function ResultPage({
    params,
}: {
    params: Promise<{ id: string; attemptId: string }>;
}) {
    const { id, attemptId } = await params;
    const examId = parseInt(id, 10);
    const attemptIdNum = parseInt(attemptId, 10);
    if (isNaN(examId) || isNaN(attemptIdNum)) notFound();

    const session = await getSession();
    if (!session) redirect(`/signin`);

    const [exam, attemptDetail] = await Promise.all([
        getExamById(examId),
        getAttemptDetail(attemptIdNum),
    ]);

    if (!exam || !attemptDetail) notFound();

    const score = Number(attemptDetail.score);
    const responses = attemptDetail.responses as {
        response_id: number;
        ques_id: number;
        response_text: string;
        ques_statement: string;
        options: string | string[];
        correct_ans: string;
        is_correct: boolean;
    }[];

    const correctCount = responses.filter((r) => r.is_correct).length;
    const totalQuestions = responses.length;

    function parseOptions(raw: string | string[]): string[] {
        if (Array.isArray(raw)) return raw;
        try { return JSON.parse(raw); } catch { return [raw]; }
    }

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 py-16">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/30 via-transparent to-transparent"
                />
                <HeroReveal className="mx-auto max-w-4xl px-6">
                    {/* Back link */}
                    <Link
                        href={`/exams/${examId}`}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Exam
                    </Link>

                    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                                Exam Results
                            </div>
                            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                                {exam.title}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/50">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5 text-indigo-300" />
                                    {exam.course_title}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-indigo-300" />
                                    {exam.module_title}
                                </span>
                                {exam.marks != null && (
                                    <span className="flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5 text-amber-400" />
                                        {exam.marks} marks
                                    </span>
                                )}
                                {exam.duration != null && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-blue-300" />
                                        {exam.duration} min
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Score ring */}
                        <div className="shrink-0">
                            <ScoreRing score={score} />
                        </div>
                    </div>

                    {/* Sub-stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-400">{correctCount}</p>
                            <p className="text-xs text-white/50 mt-1">Correct</p>
                        </div>
                        <div className="text-center border-x border-white/10">
                            <p className="text-2xl font-bold text-red-400">{totalQuestions - correctCount}</p>
                            <p className="text-xs text-white/50 mt-1">Incorrect</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{totalQuestions}</p>
                            <p className="text-xs text-white/50 mt-1">Total</p>
                        </div>
                    </div>
                </HeroReveal>
            </div>

            {/* ── ANSWER REVIEW ────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-4xl px-6 py-10">
                <ScrollReveal delay={0.1}>
                    <h2 className="mb-6 text-xl font-bold text-gray-900">Answer Review</h2>
                </ScrollReveal>

                <div className="space-y-5">
                    {responses.map((r, idx) => {
                        const options = parseOptions(r.options);
                        return (
                            <ScrollReveal key={r.response_id} delay={0.1 + (idx * 0.05)}>
                                <div
                                    className={`overflow-hidden rounded-2xl border shadow-sm ${r.is_correct
                                        ? "border-emerald-200 bg-white"
                                        : "border-red-200 bg-white"}`}
                                >
                                    {/* Question */}
                                    <div
                                        className={`flex items-start gap-4 border-b px-6 py-4 ${r.is_correct ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${r.is_correct
                                                    ? "bg-emerald-200 text-emerald-800"
                                                    : "bg-red-200 text-red-800"}`}
                                            >
                                                {idx + 1}
                                            </span>
                                            {r.is_correct ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold leading-relaxed text-gray-900">
                                            {r.ques_statement}
                                        </p>
                                    </div>

                                    {/* Options */}
                                    <div className="grid gap-2 p-5 sm:grid-cols-2">
                                        {options.map((opt, oIdx) => {
                                            const isCorrect = opt === r.correct_ans;
                                            const isChosen = opt === r.response_text;
                                            let cls = "border-gray-200 bg-gray-50 text-gray-700";
                                            if (isCorrect) cls = "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
                                            else if (isChosen && !isCorrect) cls = "border-red-300 bg-red-50 text-red-900";

                                            return (
                                                <div
                                                    key={oIdx}
                                                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${cls}`}
                                                >
                                                    {isCorrect ? (
                                                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                                    ) : isChosen ? (
                                                        <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                                                    ) : (
                                                        <span className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-300" />
                                                    )}
                                                    {opt}
                                                    {isCorrect && (
                                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                                            Correct
                                                        </span>
                                                    )}
                                                    {isChosen && !isCorrect && (
                                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-red-500">
                                                            Your answer
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Skipped notice */}
                                    {!r.response_text && (
                                        <p className="px-6 pb-4 text-xs italic text-gray-400">
                                            ⚠️ This question was not answered.
                                        </p>
                                    )}
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>

                {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
                <ScrollReveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href={`/exams/${examId}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Retake Exam
                    </Link>
                    <Link
                        href="/exams"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Trophy className="h-4 w-4" />
                        All Exams
                    </Link>
                </ScrollReveal>
            </div>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}
