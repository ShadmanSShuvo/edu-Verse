import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getInstructorByUserId } from "@/db/instructor";
import { getInstructorCourses } from "@/db/instructs";
import { getCourses } from "@/db/courses";
import { getSubjects } from "@/db/subject";
import { getModules } from "@/db/modules";
import { getExams } from "@/db/exam";
import { getQuestions } from "@/db/question";
import { getMaterials, getMaterialTypes } from "@/db/material";
import {
    getInstructorDashboardStats,
    getInstructorCourseDetails,
    getInstructorRecentActivity,
    getSubjectDashboardStats,
    getSubjectCourseDetails,
    getSubjectRecentActivity,
    getAllDashboardStats,
    getAllCourseDetails,
    getAllRecentActivity,
    getInstructorRevenueReport,
    getInstructorDifficultQuestions,
} from "@/db/dashboard";
import {
    createCourseAction,
    updateCourseAction,
    deleteCourseAction,
    createModuleAction,
    updateModuleAction,
    deleteModuleAction,
    addMaterialAction,
    deleteMaterialAction,
    createExamAction,
    updateExamAction,
    deleteExamAction,
    publishExamAction,
    addQuestionAction,
    deleteQuestionAction,
    assignSubjectAction,
    assignInstructorSubjectAction,
} from "./actions";
import { SubjectSelector, AssignSubjectSelector, InstructorSubjectSelector } from "@/components/subject-selector";
import { AddMaterialForm } from "@/components/add-material-form";
import { FormProgress } from "@/components/form-progress";
import { MaterialLink } from "@/components/material-item";
import { AutoQuizGenerator } from "@/components/auto-quiz-generator";
import { getCoursesBySubject } from "@/db/courses";
import {
    LayoutDashboard, BookOpen, Layers, Trophy, FileText, Users,
    Plus, Trash2, PenLine, ChevronDown, ChevronRight, BarChart3,
    GraduationCap, Clock, Star, Zap, Link2, Video, FileArchive,
    Presentation, CheckCircle2, AlertCircle, ArrowUpRight, BookMarked,
    MessageSquare, Settings, Target, Activity, Sparkles,
} from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";

// ── Types ──────────────────────────────────────────────────────────────────────
type Course = { course_id: number; title: string; description: string | null; price: number };
type Module = { module_id: number; course_id: number; title: string; description: string | null };
type Exam = { exam_id: number; module_id: number; title: string; marks: number | null; duration: number | null; is_published: boolean; published_at: string | null };
type Question = { ques_id: number; exam_id: number; ques_statement: string; options: string[]; correct_ans: string };
type Material = { material_id: number; module_id: number; type_id: number; name: string; url: string; type_name: string; mux_playback_id?: string; mux_asset_id?: string; mux_status?: string };

type MatType = { type_id: number; type_name: string };
type Subject = { subject_id: number; subject_name: string };
type CourseStat = {
    course_id: number; title: string; description: string | null; price: number;
    module_count: number; exam_count: number; material_count: number; student_count: number; avg_score: string | null;
};
type Activity = { attempt_id: number; score: number; time: string; student_name: string; exam_title: string; course_title: string };

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}
function scoreColor(s: number) {
    if (s >= 80) return "text-emerald-600 bg-emerald-100";
    if (s >= 50) return "text-amber-600 bg-amber-100";
    return "text-rose-600 bg-rose-100";
}
function matIcon(type: string) {
    const t = type.toLowerCase();
    if (t.includes("video")) return <Video className="h-3.5 w-3.5" />;
    if (t.includes("pdf")) return <FileText className="h-3.5 w-3.5" />;
    if (t.includes("slide") || t.includes("pptx")) return <Presentation className="h-3.5 w-3.5" />;
    if (t.includes("doc")) return <FileArchive className="h-3.5 w-3.5" />;
    if (t.includes("link")) return <Link2 className="h-3.5 w-3.5" />;
    return <BookMarked className="h-3.5 w-3.5" />;
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, gradient }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; gradient: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
            <div aria-hidden className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-6 -right-2 h-28 w-28 rounded-full bg-white/5" />
            <div className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">{icon}</div>
                <p className="text-3xl font-extrabold leading-none">{value}</p>
                <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
                {sub && <p className="mt-0.5 text-xs text-white/60">{sub}</p>}
            </div>
        </div>
    );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ icon, title, children, id }: { icon: React.ReactNode; title: string; children: React.ReactNode; id?: string }) {
    return (
        <section id={id} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-6 py-4">
                <span className="text-violet-500 dark:text-violet-400">{icon}</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}

// ── Input helper ──────────────────────────────────────────────────────────────
const inputCls = "w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/20 transition";
const btnPrimary = "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-red-100 dark:border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition";

import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/footer";

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default async function InstructorDashboardPage() {
    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const role = roles.some((r: any) => r.name === "admin") ? "admin" : (roles[0]?.name ?? "student");
    if (role !== "instructor" && role !== "admin") redirect("/dashboard");

    const isAdmin = role === "admin";
    const instructor = await getInstructorByUserId(session.user_id);
    if (!isAdmin && !instructor) redirect("/signin");

    const [stats, courseStats, recentActivity, courses, matTypes, allCourses, subjects] = await Promise.all([
        (isAdmin ? getAllDashboardStats() : (instructor?.subject_id
            ? getSubjectDashboardStats(instructor.subject_id)
            : getInstructorDashboardStats(instructor!.instructor_id)
        )),
        (isAdmin ? getAllCourseDetails() : (instructor?.subject_id
            ? getSubjectCourseDetails(instructor.subject_id)
            : getInstructorCourseDetails(instructor!.instructor_id)
        )) as Promise<CourseStat[]>,
        (isAdmin ? getAllRecentActivity() : (instructor?.subject_id
            ? getSubjectRecentActivity(instructor.subject_id)
            : getInstructorRecentActivity(instructor!.instructor_id)
        )) as Promise<Activity[]>,
        (isAdmin ? getCourses() : (instructor?.subject_id
            ? getCoursesBySubject(instructor.subject_id)
            : getInstructorCourses(instructor!.instructor_id)
        )) as Promise<Course[]>,
        getMaterialTypes() as Promise<MatType[]>,
        (isAdmin
            ? getCourses()
            : (instructor?.subject_id ? getCoursesBySubject(instructor.subject_id) : Promise.resolve([]))
        ) as Promise<Course[]>,
        getSubjects() as Promise<Subject[]>,
    ]);

    const [revenueData, difficultQuestions] = await Promise.all([
        (!isAdmin && instructor && !instructor.subject_id) ? getInstructorRevenueReport(instructor.instructor_id) : Promise.resolve([]),
        (!isAdmin && instructor && !instructor.subject_id) ? getInstructorDifficultQuestions(instructor.instructor_id) : Promise.resolve([])
    ]);

    // Fetch modules + exams + questions + materials for instructor's own courses
    const courseData = await Promise.all(
        courses.map(async (c: Course) => {
            const modules = await getModules(c.course_id) as Module[];
            const modulesWithData = await Promise.all(
                modules.map(async (m) => {
                    const [exams, materials] = await Promise.all([
                        getExams(m.module_id) as Promise<Exam[]>,
                        getMaterials(m.module_id) as Promise<Material[]>,
                    ]);
                    const examsWithQuestions = await Promise.all(
                        exams.map(async (e) => ({
                            ...e,
                            questions: await getQuestions(e.exam_id) as Question[],
                        }))
                    );
                    return { ...m, exams: examsWithQuestions, materials };
                })
            );
            return { course: c, modules: modulesWithData };
        })
    );

    // Fetch modules + exams for ALL courses (used by the Exam Builder)
    const allCourseData = await Promise.all(
        allCourses.map(async (c: Course) => {
            const modules = await getModules(c.course_id) as Module[];
            const modulesWithExams = await Promise.all(
                modules.map(async (m) => {
                    const exams = await getExams(m.module_id) as Exam[];
                    return { ...m, exams };
                })
            );
            return { course: c, modules: modulesWithExams };
        })
    );

    const initials = session.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-violet-900 via-violet-900 to-slate-900 pb-44 sm:pb-32 pt-12">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
                </div>

                <HeroReveal className="mx-auto max-w-7xl px-6">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/40">
                        {isAdmin ? "Administrative Content Hub" : "Instructor Dashboard"}
                    </p>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-extrabold text-white backdrop-blur-sm">
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Welcome back,</p>
                                <h1 className="text-2xl font-extrabold text-white">{session.name} 🎓</h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="#courses" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                                <BookOpen className="h-4 w-4" /> {isAdmin ? "All Platform Courses" : "My Courses"}
                            </Link>
                            <Link href="#exam-builder" className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-violet-600 px-4 py-2 text-sm font-bold text-violet-700 dark:text-white shadow-lg transition hover:bg-violet-50 dark:hover:bg-violet-500">
                                <Trophy className="h-4 w-4" /> Exam Builder
                            </Link>
                        </div>
                    </div>
                </HeroReveal>
            </div>

            {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-7xl -mt-16 sm:-mt-10 pb-20 px-6 space-y-8 relative z-10">

                {(!isAdmin && !instructor?.subject_id) && (
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-amber-900 mb-2">Complete Your Instructor Profile</h2>
                                <p className="text-amber-800 text-sm mb-6 leading-relaxed">
                                    Before you can fully manage courses and quizzes, you must choose your preferred subject.
                                    This ensures you are assigned to the right content areas. Once selected, your dashboard will filter all available courses to only show those within your subject.
                                </p>
                                <form action={assignInstructorSubjectAction} className="flex flex-col sm:flex-row items-end gap-3 max-w-2xl">
                                    <FormProgress />
                                    <div className="flex-1 w-full">
                                        <InstructorSubjectSelector subjects={subjects} />
                                    </div>
                                    <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-600 px-6 font-bold text-white shadow-lg transition hover:bg-amber-700 active:scale-95">
                                        Assign Subject <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STAT CARDS ────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                    <div className="sm:col-span-1">
                        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={stats?.course_count ?? 0} gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
                    </div>
                    <div className="sm:col-span-1">
                        <StatCard icon={<Users className="h-5 w-5" />} label="Students" value={stats?.student_count ?? 0} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
                    </div>
                    <div className="sm:col-span-1">
                        <StatCard icon={<Layers className="h-5 w-5" />} label="Modules" value={stats?.module_count ?? 0} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
                    </div>
                    <div className="sm:col-span-1">
                        <StatCard icon={<Trophy className="h-5 w-5" />} label="Exams" value={stats?.exam_count ?? 0} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
                    </div>
                    <div className="sm:col-span-1">
                        <StatCard icon={<FileText className="h-5 w-5" />} label="Materials" value={stats?.material_count ?? 0} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
                    </div>
                    <div className="sm:col-span-1">
                        <StatCard icon={<Target className="h-5 w-5" />} label="Submissions" value={stats?.total_attempts ?? 0} gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
                    </div>
                    <div className="sm:col-span-1">
                        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Avg Score" value={stats?.avg_student_score ? `${stats.avg_student_score}%` : "—"} gradient="bg-gradient-to-br from-slate-600 to-slate-800" />
                    </div>
                </div>

                {/* ── TWO COLUMN ────────────────────────────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">

                        {/* ═══ COURSES ══════════════════════════════════════════════════ */}
                        <Section id="courses" icon={<BookOpen className="h-4 w-4" />} title={isAdmin ? "Platform Course Catalog" : "My Courses"}>

                            {/* Create course form */}
                            <details className="group mb-6 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4">
                                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-violet-700">
                                    <Plus className="h-4 w-4" /> Create New Course
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
                                </summary>
                                <form action={createCourseAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <FormProgress />
                                    <input name="title" required placeholder="Course title *" className={inputCls} />
                                    <input name="price" type="number" min="0" step="0.01" placeholder="Price (0 = free)" className={inputCls} />
                                    <textarea name="description" rows={2} placeholder="Description" className={`${inputCls} sm:col-span-2 resize-none`} />

                                    {/* ── Subject picker (client component handles show/hide) ── */}
                                    <SubjectSelector subjects={subjects} />

                                    <div className="sm:col-span-2 flex justify-end">
                                        <button type="submit" className={btnPrimary}><Plus className="h-4 w-4" /> Create Course</button>
                                    </div>
                                </form>
                            </details>

                            {/* Course list */}
                            {courseData.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-12 text-center">
                                    <BookOpen className="h-12 w-12 text-gray-200" />
                                    <p className="text-sm text-gray-400">No courses yet. Create your first course above.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {courseData.map(({ course, modules }: { course: Course, modules: any[] }) => {
                                        const cs = courseStats.find((s: CourseStat) => s.course_id === course.course_id);
                                        return (
                                            <details key={course.course_id} className="group/course overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 hover:bg-gray-50">
                                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate font-semibold text-gray-900">{course.title}</p>
                                                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                                            <span>{cs?.module_count ?? 0} {Number(cs?.module_count) === 1 ? "module" : "modules"}</span>
                                                            <span>{cs?.exam_count ?? 0} {Number(cs?.exam_count) === 1 ? "exam" : "exams"}</span>
                                                            <span>{cs?.student_count ?? 0} {Number(cs?.student_count) === 1 ? "student" : "students"}</span>
                                                            {cs?.avg_score && <span className="text-emerald-600">avg {cs.avg_score}%</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                            {Number(course.price) === 0 ? "Free" : <>৳{course.price}</>}
                                                        </span>
                                                        <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-open/course:rotate-90" />
                                                    </div>
                                                </summary>

                                                <div className="border-t border-gray-100 p-4 space-y-5">
                                                    {/* Edit course */}
                                                    <details className="group/edit rounded-xl border border-gray-100 bg-gray-50">
                                                        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100">
                                                            <PenLine className="h-3.5 w-3.5" /> Edit Course Details
                                                            <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open/edit:rotate-180" />
                                                        </summary>
                                                        <form className="p-4 grid gap-3 sm:grid-cols-2">
                                                            <FormProgress />
                                                            <input type="hidden" name="course_id" value={course.course_id} />
                                                            <input name="title" defaultValue={course.title} required placeholder="Title" className={inputCls} />
                                                            <input name="price" type="number" min="0" step="0.01" defaultValue={course.price} placeholder="Price" className={inputCls} />
                                                            <textarea name="description" rows={2} defaultValue={course.description ?? ""} placeholder="Description" className={`${inputCls} sm:col-span-2 resize-none`} />
                                                            <div className="sm:col-span-2 flex justify-between">
                                                                <button type="submit" formAction={deleteCourseAction} className={btnDanger}>
                                                                    <Trash2 className="h-3.5 w-3.5" /> Delete Course
                                                                </button>
                                                                <button type="submit" formAction={updateCourseAction} className={btnPrimary}>
                                                                    <CheckCircle2 className="h-4 w-4" /> Save Changes
                                                                </button>
                                                            </div>
                                                        </form>

                                                        {/* Assign / change subject (client component) */}
                                                        <form action={assignSubjectAction} className="border-t border-gray-100 px-4 pt-3 pb-4 grid gap-2 sm:grid-cols-2">
                                                            <FormProgress />
                                                            <input type="hidden" name="course_id" value={course.course_id} />
                                                            <AssignSubjectSelector subjects={subjects} />
                                                            <div className="sm:col-span-2 flex justify-end">
                                                                <button type="submit" className={`${btnGhost} text-[12px]`}>
                                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Assign Subject
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </details>

                                                    {/* ── MODULES ──────────────────────────────────── */}
                                                    <div>
                                                        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                                                            <Layers className="h-3.5 w-3.5" /> Modules ({modules.length})
                                                        </p>
                                                        <div className="space-y-3">
                                                            {modules.map((mod: any, idx: number) => (
                                                                <details key={mod.module_id} className="group/mod rounded-xl border border-gray-100 bg-gray-50">
                                                                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-gray-100">
                                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{idx + 1}</span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="truncate text-sm font-semibold text-gray-900">{mod.title}</p>
                                                                            <p className="text-[11px] text-gray-400">{mod.exams.length} exams · {mod.materials.length} materials</p>
                                                                        </div>
                                                                        <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-open/mod:rotate-90" />
                                                                    </summary>

                                                                    <div className="border-t border-gray-100 p-4 space-y-4">
                                                                        {/* Edit module */}
                                                                        <details className="group/medit rounded-lg border border-gray-200 bg-white">
                                                                            <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                                                                                <PenLine className="h-3.5 w-3.5" /> Edit / Delete Module
                                                                                <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open/medit:rotate-180" />
                                                                            </summary>
                                                                            <div className="p-3 space-y-2">
                                                                                <form className="flex flex-col gap-2">
                                                                                    <FormProgress />
                                                                                    <input type="hidden" name="module_id" value={mod.module_id} />
                                                                                    <input name="title" defaultValue={mod.title} required className={inputCls} />
                                                                                    <textarea name="description" rows={2} defaultValue={mod.description ?? ""} className={`${inputCls} resize-none`} />
                                                                                    <div className="flex justify-between">
                                                                                        <button type="submit" formAction={deleteModuleAction} className={btnDanger}>
                                                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                                                        </button>
                                                                                        <button type="submit" formAction={updateModuleAction} className={`${btnPrimary} text-[12px] px-[14px] py-[6px]`}>
                                                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Save
                                                                                        </button>
                                                                                    </div>
                                                                                </form>
                                                                            </div>
                                                                        </details>

                                                                        {/* ── MATERIALS ──────────────────────── */}
                                                                        <div>
                                                                            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                                                                                <FileText className="h-3.5 w-3.5" /> Study Materials
                                                                            </p>
                                                                            {mod.materials.length > 0 && (
                                                                                <ul className="mb-3 space-y-1.5">
                                                                                    {mod.materials.map((mat: Material) => (
                                                                                        <li key={mat.material_id} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                                                            <span className="text-gray-400">{matIcon(mat.type_name)}</span>
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="truncate text-xs font-semibold text-gray-800">{mat.name}</p>
                                                                                                <p className="text-[10px] text-gray-400">{mat.type_name}</p>
                                                                                            </div>
                                                                                            <MaterialLink
                                                                                                url={mat.url}
                                                                                                name={mat.name}
                                                                                                typeName={mat.type_name}
                                                                                                muxPlaybackId={mat.mux_playback_id}
                                                                                                muxStatus={mat.mux_status}
                                                                                                className="text-violet-400 hover:text-violet-600 cursor-pointer"
                                                                                                iconClassName="h-3.5 w-3.5"
                                                                                            />
                                                                                            <form action={deleteMaterialAction}>
                                                                                                <FormProgress />
                                                                                                <input type="hidden" name="material_id" value={mat.material_id} />
                                                                                                <button type="submit" className="text-red-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                                                                            </form>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                            {/* Add material */}
                                                                            <details className="group/addmat rounded-lg border border-dashed border-gray-200 p-3">
                                                                                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600">
                                                                                    <Plus className="h-3.5 w-3.5" /> Add Material
                                                                                </summary>
                                                                                <div className="mt-3">
                                                                                    <AddMaterialForm
                                                                                        moduleId={mod.module_id}
                                                                                        materialTypes={matTypes}
                                                                                        addMaterialAction={addMaterialAction}
                                                                                    />
                                                                                </div>
                                                                            </details>
                                                                        </div>

                                                                        {/* ── EXAMS in module ──────────────────── */}
                                                                        <div>
                                                                            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                                                                                <Trophy className="h-3.5 w-3.5" /> Exams ({mod.exams.length})
                                                                            </p>
                                                                            {mod.exams.map((exam: any) => (
                                                                                <details key={exam.exam_id} className="group/exam mb-2 rounded-lg border border-amber-100 bg-amber-50/40">
                                                                                    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5">
                                                                                        <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <p className="truncate text-xs font-semibold text-gray-900">{exam.title}</p>
                                                                                                {exam.is_published ? (
                                                                                                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 ring-1 ring-emerald-500/20">Published</span>
                                                                                                ) : (
                                                                                                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 ring-1 ring-slate-400/20">Draft</span>
                                                                                                )}
                                                                                            </div>
                                                                                            <p className="text-[10px] text-gray-400">{exam.marks ?? 0} marks · {exam.duration ?? 0} min · {exam.questions.length} questions</p>
                                                                                        </div>
                                                                                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 transition-transform group-open/exam:rotate-90" />
                                                                                    </summary>

                                                                                    <div className="border-t border-amber-100 p-3 space-y-3">
                                                                                        {/* Edit exam (only if draft) */}
                                                                                        {!exam.is_published ? (
                                                                                            <>
                                                                                                <form action={updateExamAction} className="grid gap-2 sm:grid-cols-3">
                                                                                                    <FormProgress />
                                                                                                    <input type="hidden" name="exam_id" value={exam.exam_id} />
                                                                                                    <input name="title" defaultValue={exam.title} required placeholder="Exam title" className={`${inputCls} sm:col-span-3`} />
                                                                                                    <input name="marks" type="number" defaultValue={exam.marks ?? 0} placeholder="Marks" className={inputCls} />
                                                                                                    <input name="duration" type="number" defaultValue={exam.duration ?? 0} placeholder="Duration (min)" className={inputCls} />
                                                                                                    <div className="flex items-end gap-2">
                                                                                                        <button type="submit" className={`${btnPrimary} w-full justify-center text-[11px] px-[10px] py-[7px]`}><CheckCircle2 className="h-3.5 w-3.5" /> Save Changes</button>
                                                                                                    </div>
                                                                                                </form>
                                                                                                <div className="flex gap-2">
                                                                                                    <form action={publishExamAction}>
                                                                                                        <FormProgress />
                                                                                                        <input type="hidden" name="exam_id" value={exam.exam_id} />
                                                                                                        <button type="submit" className={`${btnPrimary} bg-gradient-to-r from-emerald-500 to-teal-500 text-[11px] px-[10px] py-[7px]`}><Sparkles className="h-3.5 w-3.5" /> Publish Now</button>
                                                                                                    </form>
                                                                                                    <form action={deleteExamAction}>
                                                                                                        <FormProgress />
                                                                                                        <input type="hidden" name="exam_id" value={exam.exam_id} />
                                                                                                        <button type="submit" className={btnDanger}><Trash2 className="h-3.5 w-3.5" /> Delete Exam</button>
                                                                                                    </form>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : (
                                                                                            <div className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-100 flex items-center gap-2">
                                                                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                                                                This exam is published and cannot be modified or deleted. Students can now take this exam.
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Questions */}
                                                                                        <div>
                                                                                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Questions ({exam.questions.length})</p>
                                                                                            {exam.questions.map((q: Question, qi: number) => (
                                                                                                <div key={q.ques_id} className="mb-2 rounded-lg border border-gray-100 bg-white p-3">
                                                                                                    <div className="flex items-start justify-between gap-2">
                                                                                                        <p className="text-xs font-semibold text-gray-800"><span className="text-gray-400">Q{qi + 1}.</span> {q.ques_statement}</p>
                                                                                                        {!exam.is_published && (
                                                                                                            <form action={deleteQuestionAction}>
                                                                                                                <FormProgress />
                                                                                                                <input type="hidden" name="ques_id" value={q.ques_id} />
                                                                                                                <button type="submit" className="text-red-300 hover:text-red-500 flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                                                                                            </form>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                                                                        {(Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string)).map((opt: string, i: number) => (
                                                                                                            <span key={i} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${opt === q.correct_ans ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400" : "bg-gray-100 text-gray-600"}`}>
                                                                                                                {opt} {opt === q.correct_ans && "✓"}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}

                                                                                            {/* Add question (only if draft) */}
                                                                                            {!exam.is_published && (
                                                                                                <details className="group/addq rounded-lg border border-dashed border-gray-200 p-3">
                                                                                                    <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600">
                                                                                                        <Plus className="h-3.5 w-3.5" /> Add Question
                                                                                                    </summary>
                                                                                                    <form action={addQuestionAction} className="mt-3 space-y-2">
                                                                                                        <FormProgress />
                                                                                                        <input type="hidden" name="exam_id" value={exam.exam_id} />
                                                                                                        <textarea name="ques_statement" required rows={2} placeholder="Question statement *" className={`${inputCls} resize-none`} />
                                                                                                        <div className="grid grid-cols-2 gap-2">
                                                                                                            <input name="opt_a" required placeholder="Option A *" className={inputCls} />
                                                                                                            <input name="opt_b" required placeholder="Option B *" className={inputCls} />
                                                                                                            <input name="opt_c" required placeholder="Option C *" className={inputCls} />
                                                                                                            <input name="opt_d" required placeholder="Option D *" className={inputCls} />
                                                                                                        </div>
                                                                                                        <p className="text-[11px] text-gray-400">⚠ Enter the exact text of the correct option below</p>
                                                                                                        <input name="correct_ans" required placeholder="Exact text of correct answer *" className={inputCls} />
                                                                                                        <button type="submit" className={`${btnPrimary} text-[12px]`}>
                                                                                                            <Plus className="h-3.5 w-3.5" /> Add Question
                                                                                                        </button>
                                                                                                    </form>
                                                                                                </details>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </details>
                                                                            ))}

                                                                            {/* Add exam */}
                                                                            <details className="group/addexam rounded-lg border border-dashed border-amber-200 p-3 mt-2">
                                                                                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-800">
                                                                                    <Plus className="h-3.5 w-3.5" /> Add Exam to this Module
                                                                                </summary>
                                                                                <form action={createExamAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                                                                                    <FormProgress />
                                                                                    <input type="hidden" name="module_id" value={mod.module_id} />
                                                                                    <input name="title" required placeholder="Exam title *" className={`${inputCls} sm:col-span-2`} />
                                                                                    <input name="marks" type="number" min="0" placeholder="Total marks" className={inputCls} />
                                                                                    <input name="duration" type="number" min="0" placeholder="Duration (minutes)" className={inputCls} />
                                                                                    <div className="sm:col-span-2 flex justify-end">
                                                                                        <button type="submit" className={`${btnPrimary} text-[12px]`}>
                                                                                            <Plus className="h-3.5 w-3.5" /> Create Exam
                                                                                        </button>
                                                                                    </div>
                                                                                </form>
                                                                            </details>
                                                                        </div>
                                                                    </div>
                                                                </details>
                                                            ))}

                                                            {/* Add module */}
                                                            <details className="group/addmod rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-3">
                                                                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                                                    <Plus className="h-3.5 w-3.5" /> Add Module to {course.title}
                                                                </summary>
                                                                <form action={createModuleAction} className="mt-3 space-y-2">
                                                                    <FormProgress />
                                                                    <input type="hidden" name="course_id" value={course.course_id} />
                                                                    <input name="title" required placeholder="Module title *" className={inputCls} />
                                                                    <textarea name="description" rows={2} placeholder="Description (optional)" className={`${inputCls} resize-none`} />
                                                                    <button type="submit" className={`${btnPrimary} text-[12px]`}>
                                                                        <Plus className="h-3.5 w-3.5" /> Add Module
                                                                    </button>
                                                                </form>
                                                            </details>
                                                        </div>
                                                    </div>
                                                </div>
                                            </details>
                                        );
                                    })}
                                </div>
                            )}
                        </Section>

                        {/* ═══ EXAM BUILDER ═════════════════════════════════════════════ */}
                        <Section id="exam-builder" icon={<Trophy className="h-4 w-4" />} title="Exam Builder — Create Exam & Questions">
                            <p className="mb-5 text-sm text-gray-500">
                                Build a new exam by selecting a course and module, setting the exam details, then adding MCQ questions one by one.
                            </p>

                            {allCourses.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">
                                    {!isAdmin && !instructor?.subject_id
                                        ? "Please assign yourself a subject first to view available courses."
                                        : "No courses exist yet. Create one above first."}
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {/* Step 1: Choose course → module, create exam */}
                                    <div className="rounded-xl border border-violet-100 dark:border-violet-500/20 bg-violet-50/40 dark:bg-violet-500/5 p-5">
                                        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-800 dark:text-violet-300">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-extrabold">1</span>
                                            Create a New Exam
                                        </p>
                                        <form action={createExamAction} className="grid gap-3 sm:grid-cols-2">
                                            <FormProgress />
                                            {/* ALL courses → module selection */}
                                            {allCourseData.map(({ course, modules }: { course: Course; modules: any[] }) => modules.length > 0 && (
                                                <details key={course.course_id} className="sm:col-span-2 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900 p-3">
                                                    <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                                                        {course.title}
                                                        <span className="ml-auto text-gray-400 dark:text-gray-500">{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
                                                    </summary>
                                                    <div className="mt-2 space-y-1">
                                                        {modules.map((m: any) => (
                                                            <label key={m.module_id} className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-violet-200 dark:hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 cursor-pointer transition-colors">
                                                                <input type="radio" name="module_id" value={m.module_id} className="accent-violet-600" required />
                                                                <Layers className="h-3.5 w-3.5 text-indigo-300 dark:text-indigo-400" />
                                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.title}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </details>
                                            ))}
                                            <input name="title" required placeholder="Exam title *" className={`${inputCls} sm:col-span-2`} />
                                            <input name="marks" type="number" min="0" placeholder="Total marks (e.g. 100)" className={inputCls} />
                                            <input name="duration" type="number" min="0" placeholder="Duration in minutes" className={inputCls} />
                                            <div className="sm:col-span-2 flex justify-end gap-2">
                                                <button type="submit" name="is_published" value="false" className={`${btnGhost} font-bold px-5 py-2.5`}>
                                                    <PenLine className="h-4 w-4" /> Save as Draft
                                                </button>
                                                <button type="submit" name="is_published" value="true" className={`${btnPrimary} px-5`}>
                                                    <Sparkles className="h-4 w-4" /> Create & Publish
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Step 2: Add questions to existing exams */}
                                    <div className="rounded-xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5 p-5">
                                        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-extrabold">2</span>
                                            Add Questions to an Exam
                                        </p>
                                        {allCourseData.flatMap(cd => cd.modules.flatMap(m => m.exams)).length === 0 ? (
                                            <p className="text-sm text-gray-400 italic">No exams exist yet. Create one in Step 1 first.</p>
                                        ) : (
                                            <form action={addQuestionAction} className="space-y-3">
                                                <FormProgress />
                                                {/* Exam selector */}
                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Select Exam</label>
                                                    <select name="exam_id" title="Select Exam" aria-label="Select Exam" required className={inputCls}>
                                                        <option value="">Choose an exam *</option>
                                                        {allCourseData.map(({ course, modules }: { course: Course; modules: any[] }) =>
                                                            modules.map((m: any) =>
                                                                m.exams.map((e: any) => (
                                                                    <option key={e.exam_id} value={e.exam_id}>
                                                                        {course.title} › {m.title} › {e.title}
                                                                    </option>
                                                                ))
                                                            )
                                                        )}
                                                    </select>
                                                </div>

                                                {/* Question statement */}
                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Question Statement</label>
                                                    <textarea name="ques_statement" required rows={3} placeholder="Enter the full question here…" className={`${inputCls} resize-none`} />
                                                </div>

                                                {/* 4 Options */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    {["A", "B", "C", "D"].map((letter, i) => (
                                                        <div key={letter}>
                                                            <label className="mb-1 block text-xs font-semibold text-gray-600">Option {letter}</label>
                                                            <input name={`opt_${letter.toLowerCase()}`} required placeholder={`Option ${letter} *`} className={inputCls} />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Correct answer */}
                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Correct Answer</label>
                                                    <input name="correct_ans" required placeholder="Type the exact text of the correct option *" className={`${inputCls} border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100`} />
                                                    <p className="mt-1 text-[11px] text-gray-400">Must exactly match one of the 4 options above (case-sensitive).</p>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button type="submit" className={`${btnPrimary} bg-gradient-to-r from-amber-500 to-orange-500`}>
                                                        <Plus className="h-4 w-4" /> Add Question
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* AI EXAM GENERATOR Section */}
                        <Section icon={<Sparkles className="h-4 w-4" />} title="AI Automated Exam Generator">
                            <p className="mb-4 text-sm text-gray-500">
                                Create a complete exam with multiple choice questions instantly. Simply pick a module, set the exam details, and provide the content prompt.
                            </p>
                            <AutoQuizGenerator
                                modules={allCourseData.flatMap((cd: any) =>
                                    cd.modules.map((m: any) => ({
                                        module_id: m.module_id,
                                        title: m.title,
                                        course_title: cd.course.title
                                    }))
                                )}
                            />
                        </Section>
                    </div>

                    {/* ── RIGHT SIDEBAR ───────────────────────────────────────────────── */}
                    <div className="flex flex-col gap-6 lg:col-span-1">

                        {/* Recent activity */}
                        <Section icon={<Activity className="h-4 w-4" />} title="Student Activity">
                            {recentActivity.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <AlertCircle className="h-10 w-10 text-gray-200" />
                                    <p className="text-sm text-gray-400">No student submissions yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map((a: Activity) => {
                                        const score = Number(a.score);
                                        return (
                                            <div key={a.attempt_id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{a.student_name}</p>
                                                    <span className={`flex-shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold ${scoreColor(score)}`}>{score}%</span>
                                                </div>
                                                <p className="mt-0.5 text-[11px] text-gray-500 truncate">{a.exam_title}</p>
                                                <p className="text-[10px] text-gray-400">{a.course_title} · {timeAgo(a.time)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Section>

                        {/* Quick links */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                <Zap className="h-4 w-4 text-violet-500" /> Quick Actions
                            </p>
                            <div className="space-y-2">
                                {[
                                    { href: "/modules", icon: <Layers className="h-4 w-4" />, label: "Manage Modules", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
                                    { href: "/exams", icon: <Trophy className="h-4 w-4" />, label: "All Exams", color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
                                    { href: "/profile", icon: <GraduationCap className="h-4 w-4" />, label: "My Profile & Bio", color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
                                ].map(l => (
                                    <Link key={l.href} href={l.href} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${l.color}`}>
                                        {l.icon}{l.label}<ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Course summary cards */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                <BarChart3 className="h-4 w-4 text-violet-500" /> Course Overview
                            </p>
                            {courseStats.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No courses yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {courseStats.map((cs: CourseStat) => (
                                        <div key={cs.course_id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                            <p className="truncate text-xs font-semibold text-gray-900">{cs.title}</p>
                                            <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
                                                <div className="rounded-lg bg-white p-1.5">
                                                    <p className="text-sm font-bold text-indigo-600">{cs.student_count}</p>
                                                    <p className="text-[9px] text-gray-400">Students</p>
                                                </div>
                                                <div className="rounded-lg bg-white p-1.5">
                                                    <p className="text-sm font-bold text-amber-600">{cs.exam_count}</p>
                                                    <p className="text-[9px] text-gray-400">Exams</p>
                                                </div>
                                                <div className="rounded-lg bg-white p-1.5">
                                                    <p className="text-sm font-bold text-emerald-600">{cs.avg_score ?? "—"}{cs.avg_score ? "%" : ""}</p>
                                                    <p className="text-[9px] text-gray-400">Avg</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Instructor Analytics */}
                        {(!isAdmin && instructor) && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <BarChart3 className="h-4 w-4 text-emerald-500" /> Revenue & Performance
                                </p>

                                <div className="space-y-6">
                                    {/* Revenue */}
                                    <div>
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Course Revenue</p>
                                        {revenueData.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">No revenue data yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {revenueData.map((rd: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <p className="truncate text-xs font-medium text-gray-800">{rd.title}</p>
                                                            <p className="text-[10px] text-gray-400">{rd.total_students} students</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-emerald-600">৳{rd.total_revenue}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Difficult questions */}
                                    <div>
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Most Difficult Questions</p>
                                        {difficultQuestions.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">No attempt data yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {difficultQuestions.map((dq: any, i: number) => (
                                                    <div key={i} className="rounded-lg border border-rose-100 bg-rose-50/50 p-2 text-xs">
                                                        <p className="font-medium text-gray-800 truncate mb-1">{dq.ques_statement}</p>
                                                        <div className="flex justify-between items-center text-[10px]">
                                                            <span className="text-gray-500 truncate mr-2">{dq.exam_title}</span>
                                                            <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded flex-shrink-0">{dq.success_rate}% success</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}

