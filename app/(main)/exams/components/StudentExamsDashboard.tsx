"use client";

import Link from "next/link";
import { 
    Trophy, Clock, BookOpen, Layers, Star, 
    ChevronRight, AlertCircle, Filter, CheckCircle2, Circle,
    ChevronLeft
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type ExamRow = {
    exam_id: number;
    title: string;
    marks: number | null;
    duration: number | null;
    module_id: number;
    module_title: string;
    course_id: number;
    course_title: string;
    best_score: string | null;
    attempt_count: string;
};

type CourseGroup = {
    course_id: number;
    course_title: string;
    modules: {
        module_id: number;
        module_title: string;
        exams: ExamRow[];
    }[];
};

function scoreBadge(score: number | null) {
    if (score === null) return null;
    if (score >= 80) return { bg: "bg-emerald-100", text: "text-emerald-700", label: `${score}%` };
    if (score >= 50) return { bg: "bg-amber-100", text: "text-amber-700", label: `${score}%` };
    return { bg: "bg-red-100", text: "text-red-700", label: `${score}%` };
}

export function StudentExamsDashboard({ 
    groupedExams,
    initialCourseId,
    initialStatus,
    currentPage,
    totalPages,
    totalResults
}: { 
    groupedExams: CourseGroup[];
    initialCourseId?: number;
    initialStatus: "pending" | "completed" | "all";
    currentPage: number;
    totalPages: number;
    totalResults: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function updateFilters(updates: Record<string, string | null>) {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        // Reset to page 1 when filters change
        if (!updates.page) {
            params.delete("page");
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    const hasResults = groupedExams.some(course => course.modules.some(mod => mod.exams.length > 0));

    return (
        <div className="space-y-8">
            {/* ── Filter Bar ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                
                {/* Course Dropdown */}
                <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-indigo-500" />
                    <select
                        className="w-full md:w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer appearance-none dark:bg-slate-950 dark:border-slate-800"
                        value={initialCourseId ?? "all"}
                        onChange={(e) => updateFilters({ courseId: e.target.value })}
                    >
                        <option value="all">All Enrolled Courses</option>
                        {/* We would ideally have a separate enrollments list here, 
                            but for now we use the groupedExams which are filtered. 
                            Wait, to show ALL courses in dropdown we need the full enrollments list.
                            However, groupedExams are already what the server sent.
                        */}
                        {groupedExams.map(c => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.course_title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center bg-gray-50 dark:bg-slate-950/50 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
                    <button 
                        onClick={() => updateFilters({ status: "all" })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${initialStatus === 'all' ? 'bg-white shadow dark:bg-slate-800 dark:text-slate-100 dark:shadow-slate-950/50 text-gray-800' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        All Exams
                    </button>
                    <button 
                        onClick={() => updateFilters({ status: "pending" })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${initialStatus === 'pending' ? 'bg-white shadow dark:bg-indigo-900/40 dark:text-indigo-300 dark:shadow-indigo-950/50 text-indigo-700' : 'text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'}`}
                    >
                        <Circle className="h-3.5 w-3.5" /> Pending
                    </button>
                    <button 
                        onClick={() => updateFilters({ status: "completed" })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${initialStatus === 'completed' ? 'bg-white shadow dark:bg-emerald-900/40 dark:text-emerald-300 dark:shadow-emerald-950/50 text-emerald-700' : 'text-gray-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'}`}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </button>
                </div>

            </div>

            {/* ── Dashboard Content ───────────────────────────────────────────── */}
            {!hasResults ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-gray-300" />
                    <p className="font-medium text-gray-500">No exams match your current filters.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="space-y-10">
                        {groupedExams.filter(course => course.modules.length > 0).map((course, index) => (
                            <ScrollReveal key={course.course_id} delay={index * 0.5}>
                            <section key={course.course_id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 shadow-sm">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{course.course_title}</h2>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {course.modules.flatMap(mod => 
                                        mod.exams.map((exam: ExamRow) => {
                                            const bestScore = exam.best_score ? Number(exam.best_score) : null;
                                            const attemptCount = parseInt(exam.attempt_count, 10);
                                            const badge = scoreBadge(bestScore);
                                            const isCompleted = attemptCount > 0;

                                            return (
                                                <Link 
                                                    href={`/exams/${exam.exam_id}`} 
                                                    key={exam.exam_id}
                                                    className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${
                                                        isCompleted 
                                                            ? "bg-white border-gray-200 dark:bg-slate-900/40 dark:border-slate-800" 
                                                            : "bg-gradient-to-b from-white to-indigo-50/30 border-indigo-100 shadow-sm ring-1 ring-indigo-500/5 dark:from-indigo-950/30 dark:to-slate-900/40 dark:border-indigo-500/20 dark:ring-indigo-500/10"
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="mb-3 flex items-start justify-between">
                                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isCompleted ? 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500' : 'bg-indigo-100 text-indigo-600'} transition-colors group-hover:bg-indigo-600 group-hover:text-white`}>
                                                                <Trophy className="h-5 w-5" />
                                                            </div>
                                                            {badge ? (
                                                                <div className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${badge.bg} ${badge.text}`}>
                                                                    {badge.label}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                                                    <Circle className="h-3 w-3" /> Pending
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{exam.title}</h3>
                                                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                                            <Layers className="h-3.5 w-3.5" /> {mod.module_title}
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between text-xs text-gray-500">
                                                        <div className="flex items-center gap-3">
                                                            {exam.marks != null && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" /> {exam.marks} pts</span>}
                                                            {exam.duration != null && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-400" /> {exam.duration}m</span>}
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <button
                                onClick={() => updateFilters({ page: String(currentPage - 1) })}
                                disabled={currentPage === 1}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    const isCurrent = pageNum === currentPage;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => updateFilters({ page: String(pageNum) })}
                                            className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                                                isCurrent 
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20" 
                                                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => updateFilters({ page: String(currentPage + 1) })}
                                disabled={currentPage === totalPages}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
