import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getStudentByUserId } from "@/db/student";
import { getInstructorByUserId } from "@/db/instructor";
import { getExamsForInstructor, getExamsBySubject, getAllExamsWithDetails } from "@/db/exam";
import {
    Trophy,
    GraduationCap,
    Clock,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { StudentExamsList } from "./components/StudentExamsList";
import { InstructorExamsList } from "./components/InstructorExamsList";
// Skeletons for exam lists
import { StudentExamsSkeleton, InstructorExamsSkeleton } from "@/app/(main)/exams/components/ExamsSkeletons";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

import { Footer } from "@/components/footer";

export default async function ExamsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const sp = await searchParams;
    const courseId = sp.courseId ? Number(sp.courseId) : undefined;
    const status = (sp.status as "all" | "pending" | "completed") || "all";
    const page = sp.page ? Number(sp.page) : 1;

    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const isStudent = roles.some(r => r.name === "student");
    const isInstructor = roles.some(r => r.name === "instructor");
    const isAdmin = roles.some(r => r.name === "admin");
    const role = roles[0]?.name ?? "student";

    // Resolve IDs
    const student = await getStudentByUserId(session.user_id);
    const instructor = (isInstructor || isAdmin) ? await getInstructorByUserId(session.user_id) : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* ── SHARED HEADER ────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 py-16">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_70%)] opacity-20" />
                <HeroReveal className="relative mx-auto max-w-7xl px-6">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/30 transition hover:bg-white/30">
                        {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
                        <span className="tracking-wide uppercase text-[10px] sm:text-xs">
                            EduVerse Examination System
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3 sm:text-5xl lg:text-6xl">
                        Exams & Assessments
                    </h1>
                    <p className="max-w-2xl text-lg text-white/80 font-medium leading-relaxed">
                        Assess your skills, track your performance, and achieve your learning milestones with EduVerse's interactive exams.
                    </p>
                </HeroReveal>
            </div>

            <ScrollReveal delay={1.0}>
                <div className="mx-auto max-w-7xl px-6 py-12">
                    {(isInstructor || isAdmin) && (
                        <div className="mb-14 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Overview</h2>
                            </div>
                            <Suspense fallback={<InstructorExamsSkeleton />}>
                                <InstructorExamsList
                                    userId={session.user_id}
                                    role={role}
                                    instructorId={instructor?.instructor_id}
                                    subjectId={instructor?.subject_id}
                                />
                            </Suspense>
                        </div>
                    )}

                    {isStudent && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Exams</h2>
                            </div>
                            <Suspense fallback={<StudentExamsSkeleton />}>
                                <StudentExamsList
                                    userId={session.user_id}
                                    student={student}
                                    courseId={courseId}
                                    status={status}
                                    page={page}
                                />
                            </Suspense>
                        </div>
                    )}

                    {!isStudent && !isInstructor && !isAdmin && (
                        <div className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-gray-200 bg-white p-16 text-center shadow-sm">
                            <AlertCircle className="h-16 w-16 text-gray-300" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">No active roles assigned</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                                    You don't have student or instructor permissions to access this page. Please contact your administrator.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}
