import { redirect } from "next/navigation";
import Link from "next/link";
import { AddMaterialForm } from "@/components/add-material-form";
import { FormProgress } from "@/components/form-progress";
import { StudentMaterialItem, MaterialLink } from "@/components/material-item";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getInstructorByUserId } from "@/db/instructor";
import { getInstructorCourses } from "@/db/instructs";
import { getModules, getModulesCount } from "@/db/modules";
import { getMaterials, getMaterialTypes } from "@/db/material";
import { getExams } from "@/db/exam";
import { getStudentEnrollments, isAlreadyEnrolled } from "@/db/enrollment";
import { getCoursesBySubject, getCourses } from "@/db/courses";
import {
    createModuleAction,
    updateModuleAction,
    deleteModuleAction,
    addMaterialAction,
    deleteMaterialAction,
    addExamAction,
    deleteExamAction,
    publishExamAction,
} from "./actions";
import {
    Layers,
    BookOpen,
    Plus,
    Trash2,
    PenLine,
    FileText,
    Link2,
    Trophy,
    Clock,
    GraduationCap,
    ChevronRight,
    Package,
    AlertCircle,
    MessageCircle,
    ShieldCheck,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import { StudentModulesDashboard } from "./components/StudentModulesDashboard";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// ─────────────────────────────────────────────────────────────── TYPES ────────


type Module = { module_id: number; course_id: number; title: string; description: string | null };
type Exam = {
    exam_id: number;
    module_id: number;
    title: string;
    marks: number | null;
    duration: number | null;
    is_published: boolean;
    published_at: string | null;
};

type Material = {
    material_id: number;
    module_id: number;
    type_id: number;
    name: string;
    url: string;
    type_name: string;
    mux_playback_id?: string;
    mux_status?: string;
};

type MaterialType = {
    type_id: number;
    type_name: string;
};

type Course = {
    course_id: number;
    title: string;
    description: string | null;
    price: number;
};

// ──────────────────────────────────────── SHARED SMALL COMPONENTS ─────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            {children}
        </span>
    );
}

function EmptyState({
    icon,
    message,
}: {
    icon: React.ReactNode;
    message: string;
}) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-10 text-center">
            <span className="text-gray-300">{icon}</span>
            <p className="text-sm text-gray-400 italic">{message}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────── PAGE ─────────────

export default async function ModulesPage({
    searchParams,
}: {
    searchParams: Promise<{ course?: string }>;
}) {
    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const role = roles[0]?.name ?? "student";
    const isInstructor = role === "instructor";
    const isAdmin = role === "admin";

    // Instructors / admins are always sent to their own view — ignore ?course param
    if (isInstructor || isAdmin) {
        return <InstructorModulesPage session={session} role={role} />;
    }

    // ── Student: check ?course param ──────────────────────────────────────────
    const { course: courseParam } = await searchParams;

    if (courseParam !== undefined) {
        const courseId = parseInt(courseParam, 10);

        // Edge-case: non-numeric or non-positive → back to /modules
        if (isNaN(courseId) || courseId <= 0) {
            redirect("/modules");
        }

        // Edge-case: not enrolled → redirect with error
        const enrolled = await isAlreadyEnrolled(session.user_id, courseId);
        if (!enrolled) {
            redirect("/my-courses?error=not-enrolled");
        }

        return (
            <SingleCourseModulesView
                courseId={courseId}
                userId={session.user_id}
            />
        );
    }

    return <StudentModulesPage session={session} searchParams={searchParams} />;
}

// ───────────────────────────────────────────── INSTRUCTOR PAGE ────────────────

import { Footer } from "@/components/footer";

async function InstructorModulesPage({
    session,
    role,
}: {
    session: { user_id: number; name: string };
    role: string;
}) {
    const isAdmin = role === "admin";
    let courses: Course[] = [];

    if (isAdmin) {
        courses = await getCourses();
    } else {
        const instructor = await getInstructorByUserId(session.user_id);
        if (!instructor) redirect("/signin");

        courses = instructor.subject_id
            ? await getCoursesBySubject(instructor.subject_id)
            : await getInstructorCourses(instructor.instructor_id);
    }
    const materialTypes: MaterialType[] = await getMaterialTypes();

    // Fetch modules + materials + exams for each course in parallel
    const courseData = await Promise.all(
        courses.map(async (c) => {
            const modules: Module[] = await getModules(c.course_id);
            const modulesWithContent = await Promise.all(
                modules.map(async (m) => {
                    const [materials, exams] = await Promise.all([
                        getMaterials(m.module_id),
                        getExams(m.module_id),
                    ]);
                    return {
                        ...m,
                        materials: materials as Material[],
                        exams: exams as Exam[],
                    };
                })
            );
            return { course: c, modules: modulesWithContent };
        })
    );

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 py-14">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-20 bg-hero-modules-instructor"
                />
                <HeroReveal className="mx-auto max-w-6xl px-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                        {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                        {isAdmin ? "Admin Panel" : "Instructor Panel"}
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Manage Modules
                    </h1>
                    <p className="mt-2 text-white/70">
                        Organise your course content — add modules, materials, and exams for
                        each of your courses.
                    </p>
                </HeroReveal>
            </div>

            {/* ── BODY ────────────────────────────────────────────────────────────── */}
            <ScrollReveal delay={0.1}>
                <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
                    {courses.length === 0 ? (
                        <EmptyState
                            icon={<BookOpen className="h-12 w-12" />}
                            message="You haven't created any courses yet. Create a course first to manage its modules."
                        />
                    ) : (
                        courseData.map(({ course, modules: mods }) => (
                            <CourseSection
                                key={course.course_id}
                                course={course}
                                modules={mods}
                                materialTypes={materialTypes}
                            />
                        ))
                    )}
                </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}

// ─────────────────────────────────── COURSE SECTION (instructor) ──────────────

type ModuleWithContent = Module & {
    materials: Material[];
    exams: Exam[];
};

type CourseData = {
    course: Course;
    modules: ModuleWithContent[];
    courseFullCount: number;
};

function CourseSection({
    course,
    modules,
    materialTypes,
}: {
    course: Course;
    modules: ModuleWithContent[];
    materialTypes: MaterialType[];
}) {
    return (
        <section>
            {/* Course heading */}
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
                    {course.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                            {course.description}
                        </p>
                    )}
                </div>
                <SectionBadge>
                    <Layers className="h-3 w-3" />
                    {modules.length} {modules.length === 1 ? "module" : "modules"}
                </SectionBadge>
            </div>

            {/* Module list */}
            <div className="space-y-4">
                {modules.length === 0 ? (
                    <EmptyState
                        icon={<Package className="h-10 w-10" />}
                        message="No modules yet. Add the first module below."
                    />
                ) : (
                    modules.map((mod, idx) => (
                        <ModuleCard
                            key={mod.module_id}
                            mod={mod}
                            index={idx + 1}
                            materialTypes={materialTypes}
                        />
                    ))
                )}
            </div>

            {/* ── Create module form ─────────────────────────────────────────────── */}
            <div className="mt-5 rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700">
                    <Plus className="h-4 w-4" />
                    Add New Module
                </p>
                <form action={createModuleAction} className="flex flex-col gap-3">
                    <FormProgress />
                    <input type="hidden" name="course_id" value={course.course_id} />
                    <input
                        name="title"
                        required
                        placeholder="Module title *"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                    />
                    <textarea
                        name="description"
                        rows={2}
                        placeholder="Module description (optional)"
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="h-4 w-4" />
                            Create Module
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

// ────────────────────────────────────────── MODULE CARD (instructor) ──────────

function ModuleCard({
    mod,
    index,
    materialTypes,
}: {
    mod: ModuleWithContent;
    index: number;
    materialTypes: MaterialType[];
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Module header */}
            <div className="flex items-start gap-4 border-b border-gray-100 p-5">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {index}
                </span>
                <div className="flex-1">
                    <p className="font-semibold text-gray-900">{mod.title}</p>
                    {mod.description && (
                        <p className="mt-0.5 text-sm text-gray-500">{mod.description}</p>
                    )}
                </div>

                {/* Edit + Delete actions */}
                <div className="flex shrink-0 items-center gap-2">
                    {/* ── Inline edit (details/summary) ── */}
                    <details className="relative">
                        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                            <PenLine className="h-3.5 w-3.5" />
                            Edit
                        </summary>
                        <div className="absolute right-0 top-9 z-10 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-xl">
                            <p className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Edit Module
                            </p>
                            <form action={updateModuleAction} className="flex flex-col gap-2">
                                <FormProgress />
                                <input
                                    type="hidden"
                                    name="module_id"
                                    value={mod.module_id}
                                />
                                <input
                                    name="title"
                                    required
                                    defaultValue={mod.title}
                                    placeholder="Title"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                                />
                                <textarea
                                    name="description"
                                    rows={2}
                                    defaultValue={mod.description ?? ""}
                                    placeholder="Description"
                                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                                />
                                <button
                                    type="submit"
                                    className="self-end rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition"
                                >
                                    Save
                                </button>
                            </form>
                        </div>
                    </details>

                    {/* Delete module */}
                    <form action={deleteModuleAction}>
                        <FormProgress />
                        <input type="hidden" name="module_id" value={mod.module_id} />
                        <button
                            type="submit"
                            title="Delete module"
                            className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid gap-0 sm:grid-cols-2">
                {/* ── MATERIALS ─────────────────────────────────────────────────── */}
                <div className="border-b border-gray-100 p-5 sm:border-b-0 sm:border-r">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <FileText className="h-3.5 w-3.5" />
                        Materials
                    </p>

                    {mod.materials.length === 0 ? (
                        <p className="py-2 text-center text-xs text-gray-300 italic">
                            No materials yet.
                        </p>
                    ) : (
                        <ul className="mb-3 space-y-2">
                            {mod.materials.map((mat) => (
                                <li
                                    key={mat.material_id}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-gray-800">
                                            {mat.name}
                                        </p>
                                        <p className="text-[11px] text-gray-400">{mat.type_name}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <MaterialLink
                                            url={mat.url}
                                            name={mat.name}
                                            typeName={mat.type_name}
                                            muxPlaybackId={mat.mux_playback_id}
                                            className="text-violet-500 hover:text-violet-700 transition"
                                        />
                                        <form action={deleteMaterialAction}>
                                            <FormProgress />
                                            <input
                                                type="hidden"
                                                name="material_id"
                                                value={mat.material_id}
                                            />
                                            <button
                                                type="submit"
                                                className="text-red-400 hover:text-red-600 transition"
                                                title="Delete material"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </form>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Add material form */}
                    <div className="pt-2">
                        <AddMaterialForm
                            moduleId={mod.module_id}
                            materialTypes={materialTypes}
                            addMaterialAction={addMaterialAction}
                        />
                    </div>
                </div>

                {/* ── EXAMS ─────────────────────────────────────────────────────── */}
                <div className="p-5">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <Trophy className="h-3.5 w-3.5" />
                        Exams
                    </p>

                    {mod.exams.length === 0 ? (
                        <p className="py-2 text-center text-xs text-gray-300 italic">
                            No exams yet.
                        </p>
                    ) : (
                        <ul className="mb-3 space-y-2">
                            {mod.exams.map((exam) => (
                                <li
                                    key={exam.exam_id}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-xs font-semibold text-gray-800">
                                                {exam.title}
                                            </p>
                                            {exam.is_published ? (
                                                <span className="rounded-full bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-600 ring-1 ring-emerald-500/10">Published</span>
                                            ) : (
                                                <span className="rounded-full bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-500 ring-1 ring-slate-400/10">Draft</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                            {exam.marks != null && (
                                                <span>{exam.marks} marks</span>
                                            )}
                                            {exam.duration != null
                                                ? `${exam.duration} min`
                                                : "no limit"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!exam.is_published && (
                                            <form action={publishExamAction}>
                                                <FormProgress />
                                                <input type="hidden" name="exam_id" value={exam.exam_id} />
                                                <button
                                                    type="submit"
                                                    className="text-emerald-500 hover:text-emerald-700 transition"
                                                    title="Publish exam"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                </button>
                                            </form>
                                        )}
                                        {!exam.is_published && (
                                            <form action={deleteExamAction}>
                                                <FormProgress />
                                                <input type="hidden" name="exam_id" value={exam.exam_id} />
                                                <button
                                                    type="submit"
                                                    className="text-red-400 hover:text-red-600 transition"
                                                    title="Delete exam"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Add exam form */}
                    <form action={addExamAction} className="space-y-2">
                        <FormProgress />
                        <input type="hidden" name="module_id" value={mod.module_id} />
                        <input
                            name="title"
                            required
                            placeholder="Exam title *"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                        />
                        <div className="flex gap-2">
                            <input
                                name="marks"
                                type="number"
                                min="0"
                                placeholder="Marks"
                                className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                            />
                            <input
                                name="duration"
                                type="number"
                                min="0"
                                placeholder="Duration (min)"
                                className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                name="is_published"
                                value="false"
                                className="flex w-1/2 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                                <PenLine className="h-3.5 w-3.5" />
                                Save Draft
                            </button>
                            <button
                                type="submit"
                                name="is_published"
                                value="true"
                                className="flex w-1/2 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Publish
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Discussion link ────────────────────────────────────────────── */}
            <div className="border-t border-gray-100 px-5 py-3">
                <Link
                    href={`/modules/${mod.module_id}`}
                    className="group inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white hover:shadow-md"
                >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Discussion & Q&amp;A
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────── STUDENT PAGE ─────────────────

async function StudentModulesPage({
    session,
    searchParams,
}: {
    session: { user_id: number; name: string };
    searchParams: Promise<{ course?: string; page?: string; limit?: string }>;
}) {
    const sp = await searchParams;
    const selectedCourseId = sp.course ? Number(sp.course) : "all";
    const currentPage = sp.page ? Number(sp.page) : 1;
    const pageSize = sp.limit ? Number(sp.limit) : 20;

    const enrollments: Course[] = await getStudentEnrollments(session.user_id);

    // Filter enrollments based on selection
    const filteredEnrollments = selectedCourseId === "all"
        ? enrollments
        : enrollments.filter(e => e.course_id === selectedCourseId);

    // Build the scoped course ID list for the "All Courses" case.
    // This is the KEY fix: LIMIT/OFFSET must run against only the student's modules,
    // not the entire module table — otherwise pages end up with inconsistent counts.
    const scopedCourseId = selectedCourseId === "all" ? undefined : (selectedCourseId as number);
    const scopedCourseIds = selectedCourseId === "all"
        ? enrollments.map(e => e.course_id)
        : undefined;

    const [rawModules, totalCount] = await Promise.all([
        getModules(scopedCourseId, pageSize, (currentPage - 1) * pageSize, scopedCourseIds),
        getModulesCount(scopedCourseId, scopedCourseIds)
    ]);

    // Group the paginated modules by course
    // Only include courses that have modules on the current page to avoid "ghost" headers
    const courseMap = new Map<number, { course: Course; modules: any[]; courseFullCount: number }>();

    for (const m of rawModules) {
        if (!courseMap.has(m.course_id)) {
            const enrollment = enrollments.find(e => e.course_id === m.course_id);
            if (enrollment) {
                // Fetch full count for this course for the "n out of m" metadata
                const fullCount = await getModulesCount(m.course_id);
                courseMap.set(m.course_id, {
                    course: enrollment,
                    modules: [],
                    courseFullCount: fullCount
                });
            }
        }

        const entry = courseMap.get(m.course_id);
        if (entry) {
            const [materials, exams] = await Promise.all([
                getMaterials(m.module_id),
                getExams(m.module_id, true),
            ]);
            entry.modules.push({
                ...m,
                materials: materials as Material[],
                exams: exams as Exam[],
            });
        }
    }

    const courseData = Array.from(courseMap.values());

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 py-14">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-20 bg-hero-modules-student"
                />
                <HeroReveal className="mx-auto max-w-6xl px-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                        <GraduationCap className="h-3.5 w-3.5" />
                        My Learning
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Course Modules
                    </h1>
                    <p className="mt-2 text-white/70">
                        Browse the curriculum for all your enrolled courses.
                    </p>
                </HeroReveal>
            </div>

            {/* ── BODY ────────────────────────────────────────────────────────────── */}
            <ScrollReveal delay={0.1}>
                <div className="mx-auto max-w-6xl px-6 py-12">
                    {enrollments.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
                            <AlertCircle className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-500">
                                No enrolled courses
                            </p>
                            <p className="text-sm text-gray-400">
                                Enroll in a course to view its modules and materials.
                            </p>
                            <a
                                href="/courses"
                                className="mt-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Browse Courses
                            </a>
                        </div>
                    ) : (
                        <StudentModulesDashboard
                            courseData={courseData}
                            allEnrollments={enrollments}
                            initialCourseId={selectedCourseId}
                            totalModules={totalCount}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    )}
                </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}

// ──────────────────────────────────── STUDENT COURSE SECTION ─────────────────

function StudentCourseSection({
    course,
    modules,
    courseFullCount,
}: {
    course: Course;
    modules: ModuleWithContent[];
    courseFullCount: number;
}) {
    return (
        <section>
            {/* Course heading */}
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
                    {course.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                            {course.description}
                        </p>
                    )}
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    {modules.length} {modules.length === 1 ? 'module' : 'modules'} out of {courseFullCount} modules found
                </p>
            </div>

            {modules.length === 0 ? (
                <EmptyState
                    icon={<Package className="h-10 w-10" />}
                    message="No modules have been added to this course yet."
                />
            ) : (
                <div className="space-y-4">
                    {modules.map((mod, idx) => (
                        <StudentModuleCard key={mod.module_id} mod={mod} index={idx + 1} />
                    ))}
                </div>
            )}
        </section>
    );
}

// ─────────────────────────────────── STUDENT MODULE CARD ─────────────────────

function StudentModuleCard({
    mod,
    index,
}: {
    mod: ModuleWithContent;
    index: number;
}) {
    return (
        <details className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-4 p-5 transition hover:bg-gray-50">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {index}
                </span>
                <div className="flex-1">
                    <p className="font-semibold text-gray-900">{mod.title}</p>
                    {mod.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{mod.description}</p>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-gray-400">
                    {mod.materials.length > 0 && (
                        <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {mod.materials.length}
                        </span>
                    )}
                    {mod.exams.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Trophy className="h-3.5 w-3.5" />
                            {mod.exams.length}
                        </span>
                    )}
                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </div>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Materials */}
                    <div>
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <FileText className="h-3.5 w-3.5" />
                            Materials
                        </p>
                        {mod.materials.length === 0 ? (
                            <p className="text-xs text-gray-300 italic">
                                No materials available.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {mod.materials.map((mat) => (
                                    <StudentMaterialItem
                                        key={mat.material_id}
                                        url={mat.url}
                                        name={mat.name}
                                        typeName={mat.type_name}
                                        muxPlaybackId={mat.mux_playback_id}
                                        muxStatus={mat.mux_status}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Exams */}
                    <div>
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <Trophy className="h-3.5 w-3.5" />
                            Exams
                        </p>
                        {mod.exams.length === 0 ? (
                            <p className="text-xs text-gray-300 italic">
                                No exams for this module.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {mod.exams.map((exam) => (
                                    <li
                                        key={exam.exam_id}
                                        className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                                    >
                                        <Trophy className="h-4 w-4 flex-shrink-0 text-amber-400" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-gray-800">
                                                {exam.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                {exam.marks != null && (
                                                    <span>{exam.marks} marks</span>
                                                )}
                                                {exam.duration != null && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {exam.duration} min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ── Discussion link ──────────────────────────────────────── */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                    <Link
                        href={`/modules/${mod.module_id}`}
                        className="group inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white hover:shadow-md"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Discussion & Q&amp;A
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </details>
    );
}

// ─────────────────────────── SINGLE-COURSE MODULES VIEW ──────────────────────

type EnrollmentRow = {
    course_id: number;
    title: string;
    description: string | null;
    price: number;
    enrolled_at: string;
    progress: number;
};

async function SingleCourseModulesView({
    courseId,
    userId,
}: {
    courseId: number;
    userId: number;
}) {
    // Reuse the same getStudentEnrollments call — find the matching course
    const enrollments: EnrollmentRow[] = await getStudentEnrollments(userId);
    const course = enrollments.find((e) => e.course_id === courseId);

    // Shouldn't happen since we already checked isAlreadyEnrolled, but guard anyway
    if (!course) redirect("/my-courses?error=not-enrolled");

    const progress = Math.min(100, Math.max(0, Math.round(course.progress)));

    // Fetch modules + their content in parallel
    const rawModules: Module[] = await getModules(courseId);
    const modulesWithContent: ModuleWithContent[] = await Promise.all(
        rawModules.map(async (m) => {
            const [materials, exams] = await Promise.all([
                getMaterials(m.module_id),
                getExams(m.module_id, true),
            ]);
            return {
                ...m,
                materials: materials as Material[],
                exams: exams as Exam[],
            };
        })
    );

    const progressColor =
        progress >= 100
            ? "bg-emerald-400"
            : progress >= 60
                ? "bg-blue-400"
                : progress >= 30
                    ? "bg-cyan-400"
                    : "bg-blue-300";

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 py-14">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-20 bg-hero-modules-student"
                />
                <div className="relative mx-auto max-w-6xl px-6">

                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-white/60">
                        <Link
                            href="/my-courses"
                            className="flex items-center gap-1 transition hover:text-white/90"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            My Courses
                        </Link>
                        <span className="select-none">/</span>
                        <span className="max-w-xs truncate text-white/80 font-medium">
                            {course.title}
                        </span>
                    </nav>

                    {/* Badge */}
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                        <GraduationCap className="h-3.5 w-3.5" />
                        My Learning
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        {course.title}
                    </h1>
                    {course.description && (
                        <p className="mt-2 text-white/70 max-w-2xl">
                            {course.description}
                        </p>
                    )}

                    {/* Overall progress bar */}
                    <div className="mt-6 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                        <div className="mb-1.5 flex items-center justify-between text-sm text-white/80">
                            <span className="font-medium">Overall progress</span>
                            <span className="font-bold text-white">{progress}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-white/50">
                            {progress >= 100
                                ? "You have completed this course. 🎉"
                                : `${progress}% complete — keep going!`}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl space-y-4 px-6 py-12">

                {/* Back button */}
                <div className="flex items-center gap-3 mb-2">
                    <Link
                        href="/my-courses"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-slate-900/40 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to My Courses
                    </Link>
                    <span className="text-sm text-gray-400">
                        {modulesWithContent.length}{" "}
                        {modulesWithContent.length === 1 ? "module" : "modules"}
                    </span>
                </div>

                {modulesWithContent.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-white/10">
                        <Package className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-semibold text-gray-500">
                            No modules have been added yet
                        </p>
                        <p className="text-sm text-gray-400">
                            Check back soon — the instructor is still building out this course.
                        </p>
                        <Link
                            href="/my-courses"
                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to My Courses
                        </Link>
                    </div>
                ) : (
                    modulesWithContent.map((mod, idx) => (
                        <StudentModuleCard key={mod.module_id} mod={mod} index={idx + 1} />
                    ))
                )}
            </div>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}
