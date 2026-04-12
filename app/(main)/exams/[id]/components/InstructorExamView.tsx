import Link from "next/link";
import { 
    Trophy, BookOpen, Layers, GraduationCap, PenLine, ShieldCheck, 
    CheckCircle, XCircle, Trash2, Users, Plus 
} from "lucide-react";
import { getQuestions } from "@/db/question";
import { getInstructorByUserId } from "@/db/instructor";
import { getAttempts } from "@/db/attempt";
import { addQuestionAction, deleteQuestionAction } from "@/app/(main)/exams/actions";

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

export async function InstructorExamView({ 
    exam, 
    userId, 
    isAdmin 
}: { 
    exam: Exam; 
    userId: number; 
    isAdmin: boolean;
}) {
    // Parallel data fetching for instructor view
    const [questions, instructor, attempts] = await Promise.all([
        getQuestions(exam.exam_id) as Promise<Question[]>,
        getInstructorByUserId(userId),
        getAttempts(undefined, exam.exam_id)
    ]);

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 py-14">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        <Link href="/exams" className="hover:text-white transition">Exams</Link> / <Link href={`/courses/${exam.course_id}`} className="hover:text-white transition">{exam.course_title}</Link> / <span className="text-white/70">{exam.module_title}</span>
                    </div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                        {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                        {isAdmin ? "Admin Panel" : "Instructor Panel"}
                    </div>
                    <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{exam.title}</h1>
                </div>
            </div>
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Questions <span className="ml-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-sm font-semibold text-violet-700">{questions.length}</span></h2>
                        <div className="space-y-4">
                            {questions.map((q, idx) => {
                                const options = parseOptions(q.options);
                                return (
                                    <div key={q.ques_id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{idx + 1}</span>
                                                <p className="text-sm font-semibold text-gray-900 leading-relaxed">{q.ques_statement}</p>
                                            </div>
                                            <form action={deleteQuestionAction} className="shrink-0">
                                                <input type="hidden" name="ques_id" value={q.ques_id} /><input type="hidden" name="exam_id" value={q.exam_id} />
                                                <button type="submit" className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                                            </form>
                                        </div>
                                        <div className="grid gap-2 p-5 sm:grid-cols-2">
                                            {options.map((opt, oIdx) => (
                                                <div key={oIdx} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${opt === q.correct_ans ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-800" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                                                    {opt === q.correct_ans ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />} {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-6">
                            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-700"><Plus className="h-4 w-4" /> Add New Question</p>
                            <form action={addQuestionAction} className="space-y-4">
                                <input type="hidden" name="exam_id" value={exam.exam_id} />
                                <textarea name="ques_statement" required rows={2} placeholder="Question statement *" className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition" />
                                <div className="grid gap-3 sm:grid-cols-2">{(["opt1", "opt2", "opt3", "opt4"] as const).map((name, i) => (<input key={name} name={name} required={i < 2} placeholder={`Option ${i + 1}${i < 2 ? " *" : " (optional)"}`} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition" />))}</div>
                                <div><label className="mb-1.5 block text-xs font-semibold text-gray-500">Correct Answer <span className="text-red-400">*</span></label><input name="correct_ans" required placeholder="Must exactly match one of the options above" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition" /></div>
                                <div className="flex justify-end"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"><Plus className="h-4 w-4" /> Add Question</button></div>
                            </form>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900"><Users className="h-4 w-4 text-violet-500" /> Student Attempts <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">{attempts.length}</span></h3>
                            {attempts.length === 0 ? <p className="text-center text-sm text-gray-400 italic py-4">No attempts yet.</p> : <ul className="space-y-3">{attempts.slice(0, 10).map((a) => (<li key={a.attempt_id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-semibold text-gray-800">{a.student_name}</p><p className="text-[11px] text-gray-400">{new Date(a.time).toLocaleDateString()}</p></div><span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${Number(a.score) >= 80 ? "bg-emerald-100 text-emerald-700" : Number(a.score) >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{a.score}%</span></li>))}</ul>}
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="mb-4 font-bold text-gray-900">Quick Stats</h3><dl className="space-y-3"><div className="flex justify-between text-sm"><dt className="text-gray-500">Questions</dt><dd className="font-semibold text-gray-900">{questions.length}</dd></div><div className="flex justify-between text-sm"><dt className="text-gray-500">Total Attempts</dt><dd className="font-semibold text-gray-900">{attempts.length}</dd></div>{attempts.length > 0 && (<><div className="flex justify-between text-sm"><dt className="text-gray-500">Avg Score</dt><dd className="font-semibold text-gray-900">{Math.round(attempts.reduce((s, a) => s + Number(a.score), 0) / attempts.length)}%</dd></div><div className="flex justify-between text-sm"><dt className="text-gray-500">Top Score</dt><dd className="font-semibold text-emerald-600">{Math.max(...attempts.map((a) => Number(a.score)))}%</dd></div></>)}</dl></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
