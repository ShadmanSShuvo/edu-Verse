"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle, Loader2 } from "lucide-react";
import { submitAttemptAction } from "@/app/(main)/exams/actions";
import { FormProgress } from "@/components/form-progress";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

type Question = {
    ques_id: number;
    exam_id: number;
    ques_statement: string;
    options: string | string[];
    correct_ans: string;
};

type Exam = {
    exam_id: number;
    title: string;
    duration: number | null;
    course_id: number;
};

interface StudentExamFormProps {
    exam: Exam;
    questions: Question[];
    attemptCount: number;
    userId: number;
    startedAt: string | null;
}

function parseOptions(raw: string | string[]): string[] {
    if (Array.isArray(raw)) return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return [raw];
    }
}

export function StudentExamForm({ exam, questions, attemptCount, userId, startedAt }: StudentExamFormProps) {
    const [state, formAction, isPending] = useActionState(submitAttemptAction, null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const answersRef = useRef<Record<number, string>>({});

    const storageKey = `exam_timer_${userId}_${exam.exam_id}_${attemptCount}`;
    const progressKey = `exam_progress_${userId}_${exam.exam_id}_${attemptCount}`;

    // Update ref when state changes to avoid stale closures in timer
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // Initialize timer and handle auto-submit guard
    useEffect(() => {
        if (!exam.duration) return;

        let expiryTime: number;
        // Include attemptCount to differentiate retakes
        const mainStorageKey = `exam_${exam.exam_id}_${userId}_${attemptCount}`;
        const timerStorageKey = `exam_timer_${exam.exam_id}_${userId}_${attemptCount}`;
        
        // 1. Calculate expiry time accurately
        if (startedAt) {
            expiryTime = new Date(startedAt).getTime() + exam.duration * 60 * 1000;
        } else {
            const storedExpiry = localStorage.getItem(timerStorageKey);
            expiryTime = storedExpiry ? parseInt(storedExpiry, 10) : Date.now() + exam.duration * 60 * 1000;
        }
        localStorage.setItem(timerStorageKey, expiryTime.toString());

        // 2. Refresh progress from storage on mount
        const saved = localStorage.getItem(mainStorageKey);
        if (saved) {
            try {
                setAnswers(JSON.parse(saved));
            } catch (e) { console.error("Restore failed", e); }
        }

        // 3. Timer interval
        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                setIsTimeUp(true);
                // Guard: only submit once and only if not already pending/successful
                if (!isPending && !state?.success) {
                    formRef.current?.requestSubmit();
                    // Cleanup storage after auto-submit starts
                    localStorage.removeItem(mainStorageKey);
                    localStorage.removeItem(timerStorageKey);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [exam.exam_id, exam.duration, userId, attemptCount, startedAt, isPending, state?.success]);

    // Handle redirect after successful submission
    useEffect(() => {
        if (state?.success && state?.redirect) {
            const mainStorageKey = `exam_${exam.exam_id}_${userId}_${attemptCount}`;
            const timerStorageKey = `exam_timer_${exam.exam_id}_${userId}_${attemptCount}`;
            localStorage.removeItem(mainStorageKey);
            localStorage.removeItem(timerStorageKey);
            window.location.href = state.redirect;
        }
    }, [state?.success, state?.redirect, exam.exam_id, userId, attemptCount]);

    const handleChoiceChange = (quesId: number, value: string) => {
        const updated = { ...answers, [quesId]: value };
        setAnswers(updated);
        
        // Progress persistence
        const storageKey = `exam_${exam.exam_id}_${userId}_${attemptCount}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const handleSubmit = (e: React.FormEvent) => {
        // Additional form submission logic can go here
        // The action is already handled by the 'action' prop on the form
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const timerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (timeLeft !== null && timeLeft < 60 && timerRef.current) {
            gsap.to(timerRef.current, {
                color: "#ef4444",
                backgroundColor: "#fef2f2",
                borderColor: "#fca5a5",
                scale: 1.05,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        } else if (timerRef.current) {
            gsap.killTweensOf(timerRef.current);
            gsap.set(timerRef.current, { clearProps: "all" });
        }
    }, [timeLeft]);

    return (
        <form ref={formRef} action={formAction} onSubmit={handleSubmit}>
            <FormProgress />
            <input type="hidden" name="exam_id" value={exam.exam_id} />

            {/* Sticky Timer Bar */}
            {timeLeft !== null && (
                <div ref={timerRef} className="sticky top-4 z-20 mb-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-lg backdrop-blur-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-xl bg-gray-50 p-2 ${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'}`}>
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Remaining Time</p>
                            <p className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>
                    {timeLeft < 60 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-red-500 px-3 py-1 bg-red-50 rounded-full">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Time almost up!
                        </div>
                    )}
                </div>
            )}

            {isTimeUp && (
                <div className="mb-6 rounded-xl bg-red-50 p-4 text-center border border-red-100">
                    <p className="text-sm font-bold text-red-600">Time is up! Submitting your exam automatically...</p>
                </div>
            )}

            {state?.error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4" />
                    {state.error}
                </div>
            )}

            <div className="space-y-5">
                {questions.map((q, idx) => {
                    const options = parseOptions(q.options);
                    return (
                        <div
                            key={q.ques_id}
                            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
                        >
                            {/* Question header */}
                            <div className="flex items-start gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                    {idx + 1}
                                </span>
                                <p className="text-sm font-semibold leading-relaxed text-gray-900">
                                    {q.ques_statement}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="grid gap-2 p-5 sm:grid-cols-2">
                                {options.map((opt, oIdx) => (
                                    <label
                                        key={oIdx}
                                        className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition hover:border-indigo-400 hover:bg-indigo-50 ${
                                            answers[q.ques_id] === opt 
                                            ? "border-indigo-500 bg-indigo-50" 
                                            : "border-gray-200"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`q_${q.ques_id}`}
                                            value={opt}
                                            checked={answers[q.ques_id] === opt}
                                            onChange={() => handleChoiceChange(q.ques_id, opt)}
                                            disabled={isTimeUp || isPending}
                                            className="h-4 w-4 accent-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className={`text-sm ${
                                            answers[q.ques_id] === opt 
                                            ? "font-semibold text-indigo-900" 
                                            : "text-gray-700"
                                        }`}>
                                            {opt}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit */}
            <div className="mt-8 flex items-center justify-between">
                <Link
                    href="/exams"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition font-medium"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Exams
                </Link>
                <button
                    type="submit"
                    disabled={isTimeUp || isPending}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Exam"
                    )}
                </button>
            </div>
        </form>
    );
}
