import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getInstructorByUserId } from "@/db/instructor";
import { getExamById } from "@/db/exam";
import { getQuestions } from "@/db/question";
import { getAttempts } from "@/db/attempt";
import {
    Trophy,
    Clock,
    Star,
    BookOpen,
    Layers,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
    Users,
    GraduationCap,
    PenLine,
    ShieldCheck,
} from "lucide-react";
import { isAlreadyEnrolled } from "@/db/enrollment";

// Components
import { ExamQuestionsSection } from "./components/ExamQuestionsSection";
import { StudentScoreCard } from "./components/StudentScoreCard";
import { addQuestionAction, deleteQuestionAction } from "@/app/(main)/exams/actions";

// ── Types ──────────────────────────────────────────────────────────────────────
type Question = {
    ques_id: number;
    exam_id: number;
    ques_statement: string;
    options: string | string[];
    correct_ans: string;
};

type Exam = {
    exam_id: number;
    module_id: number;
    title: string;
    marks: number | null;
    duration: number | null;
    module_title: string;
    course_id: number;
    course_title: string;
};

function parseOptions(raw: string | string[]): string[] {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return [raw]; }
}

import { InstructorExamView } from "./components/InstructorExamView";

export default async function ExamDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const sessionPromise = getSession();
    const paramsPromise = params;

    const [session, { id }] = await Promise.all([sessionPromise, paramsPromise]);
    
    const examId = parseInt(id, 10);
    if (isNaN(examId)) notFound();

    if (!session) redirect(`/signin?redirect=/exams/${examId}`);

    // Parallelize exam and roles
    const [exam, roles] = await Promise.all([
        getExamById(examId) as Promise<Exam | null>,
        getUserRoles(session.user_id)
    ]);

    if (!exam) notFound();

    const roleNames = roles.map((r: any) => r.name.toLowerCase());
    const isAdmin = roleNames.includes("admin");
    const isInstructor = roleNames.includes("instructor");
    const isStudent = roleNames.includes("student") || roleNames.length === 0;

    if (isStudent && !isAdmin && !isInstructor) {
        const enrolled = await isAlreadyEnrolled(session.user_id, exam.course_id);
        if (!enrolled) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                        
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 h-2 w-full relative z-10" />
                        
                        <div className="p-10 text-center flex flex-col items-center gap-6 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                                <div className="h-20 w-20 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <XCircle className="h-12 w-12" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Access Denied</h2>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Restricted Content</p>
                            </div>
                            
                            <p className="text-gray-600 leading-relaxed text-lg">
                                You are not enrolled in the course <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{exam.course_title}</span>. 
                                Please enroll first to access this exam.
                            </p>
                            
                            <div className="flex flex-col gap-3 w-full">
                                <Link 
                                    href={`/courses/${exam.course_id}`}
                                    className="group/btn relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 p-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
                                >
                                    <span className="relative z-10">View Course Details</span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/btn:translate-x-full transition-transform duration-1000" />
                                </Link>
                                
                                <Link 
                                    href="/exams"
                                    className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    <Trophy className="h-4 w-4" />
                                    <span>Back to Exams</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (isInstructor || isAdmin) {
        return (
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50">
                    <div className="h-40 w-full animate-pulse bg-violet-600" />
                    <div className="mx-auto max-w-6xl px-6 py-10">
                        <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-200" />
                    </div>
                </div>
            }>
                <InstructorExamView exam={exam} userId={session.user_id} isAdmin={isAdmin} />
            </Suspense>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 py-14">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/30 via-transparent to-transparent"
                />
                <div className="mx-auto max-w-4xl px-6">
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        <Link href="/exams" className="hover:text-white transition flex items-center gap-1">
                            <Trophy className="h-3 w-3" /> Exams
                        </Link>
                        <span>/</span>
                        <Link href={`/courses/${exam.course_id}`} className="hover:text-white transition">
                            {exam.course_title}
                        </Link>
                        <span>/</span>
                        <span className="text-white/70">{exam.module_title}</span>
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{exam.title}</h1>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/60">
                                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-indigo-300" />{exam.course_title}</span>
                                <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-indigo-300" />{exam.module_title}</span>
                                {exam.marks != null && <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" />{exam.marks} marks</span>}
                                {exam.duration != null && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-300" />{exam.duration} min</span>}
                            </div>
                        </div>

                        <Suspense fallback={<div className="h-20 w-32 animate-pulse rounded-2xl bg-white/10" />}>
                            <StudentScoreCard userId={session.user_id} examId={examId} />
                        </Suspense>
                    </div>
                </div>
            </div>

            <Suspense fallback={
                <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
                    <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-200" />
                    <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-200" />
                </div>
            }>
                <ExamQuestionsSection exam={exam} userId={session.user_id} />
            </Suspense>
        </div>
    );
}
