import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getAdminDashboardStats, getAllUsersForAdmin, getAllCoursesForAdmin } from "@/db/admin";
import { deleteUserAction, deleteCourseAdminAction } from "./actions";
import { FormProgress } from "@/components/form-progress";
import {
    Users, BookOpen, Layers, Trophy,
    ShieldAlert, Trash2, LayoutDashboard, Settings, BarChart3, GraduationCap,
    Plus, ChevronDown, ArrowUpRight
} from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";
import { createCourseAction } from "@/app/(main)/instructor/actions";
import { getSubjects } from "@/db/subject";
import { SubjectSelector } from "@/components/subject-selector";

// ── Types ──────────────────────────────────────────────────────────────────────
type AdminStats = {
    total_users: string;
    total_courses: string;
    total_modules: string;
    total_exams: string;
    total_enrollments: string;
    total_revenue: string;
};

type AdminUser = {
    user_id: number;
    name: string;
    email: string;
    role: string | null;
    created_at: string;
};

type AdminCourse = {
    course_id: number;
    title: string;
    price: number;
    instructor_name: string | null;
    enrolled_count: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode, label: string, value: React.ReactNode, gradient: string }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
            <div aria-hidden className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-6 -right-2 h-28 w-28 rounded-full bg-white/5" />
            <div className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">{icon}</div>
                <p className="text-3xl font-extrabold leading-none">{value}</p>
                <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
            </div>
        </div>
    );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default async function AdminDashboardPage() {
    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const isAdmin = roles.some((r: any) => r.name === "admin");
    if (!isAdmin) redirect("/dashboard");

    const [stats, users, courses, subjects] = await Promise.all([
        getAdminDashboardStats() as Promise<AdminStats>,
        getAllUsersForAdmin() as Promise<AdminUser[]>,
        getAllCoursesForAdmin() as Promise<AdminCourse[]>,
        getSubjects()
    ]);

    const initials = session.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-red-900 via-rose-900 to-slate-900 pb-20 pt-12">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-red-600/30 blur-3xl" />
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-slate-600/20 blur-3xl" />
                </div>

                <HeroReveal className="mx-auto max-w-7xl px-6">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/40">Super Admin Dashboard</p>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-extrabold text-red-100 backdrop-blur-sm shadow-sm ring-1 ring-white/30">
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm text-red-200">System Administrator,</p>
                                <h1 className="text-2xl font-extrabold text-white">{session.name} 🛡️</h1>
                            </div>
                        </div>
                    </div>
                </HeroReveal>
            </div>

            {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-7xl -mt-8 px-6 pb-20 space-y-8">

                <ScrollReveal delay={0.1}>
                    {/* ── STAT CARDS ────────────────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={stats.total_users || 0} gradient="bg-gradient-to-br from-blue-500 to-indigo-700" />
                        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={stats.total_courses || 0} gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
                        <StatCard icon={<Layers className="h-5 w-5" />} label="Modules" value={stats.total_modules || 0} gradient="bg-gradient-to-br from-fuchsia-500 to-pink-700" />
                        <StatCard icon={<Trophy className="h-5 w-5" />} label="Exams" value={stats.total_exams || 0} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
                        <StatCard icon={<LayoutDashboard className="h-5 w-5" />} label="Enrollments" value={stats.total_enrollments || 0} gradient="bg-gradient-to-br from-emerald-500 to-teal-700" />
                        <StatCard icon={<TakaSymbol className="h-5 w-5" />} label="Revenue" value={<>৳{stats.total_revenue || 0}</>} gradient="bg-gradient-to-br from-slate-700 to-gray-900" />
                    </div>
                </ScrollReveal>

                {/* ── ANALYTICS QUICK LINKS ────────────────────────────────────────── */}
                <ScrollReveal delay={0.1} className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/analytics"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Platform Analytics
                    </Link>
                    <Link
                        href="/modules"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                        <Layers className="h-4 w-4 text-violet-500" />
                        Manage Modules
                    </Link>
                    <Link
                        href="/exams"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Manage Exams
                    </Link>
                    <Link
                        href="/instructor"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                        <GraduationCap className="h-4 w-4 text-indigo-500" />
                        Content Hub
                    </Link>
                </ScrollReveal>

                {/* ── CREATE COURSE (ADMIN ACCESS) ────────────────────────────────── */}
                <ScrollReveal delay={0.1} className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 shadow-sm">
                    <details className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-indigo-900">Create New Course</h2>
                                <p className="text-xs text-indigo-700/70 font-medium">Add a new educational offering to the platform</p>
                            </div>
                            <ChevronDown className="ml-auto h-5 w-5 text-indigo-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <form action={createCourseAction} className="mt-6 grid gap-4 sm:grid-cols-2">
                            <FormProgress />
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Course Title *</label>
                                <input name="title" required placeholder="e.g., Advanced Quantum Physics" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Price (৳) *</label>
                                <input name="price" type="number" min="0" step="0.01" placeholder="0.00 for free" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Course Description</label>
                                <textarea name="description" rows={3} placeholder="Provide a brief overview of what students will learn..." className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition resize-none" />
                            </div>

                            <SubjectSelector subjects={subjects} />

                            <div className="sm:col-span-2 flex justify-end pt-2">
                                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0">
                                    <Plus className="h-5 w-5" /> Launch Course
                                </button>
                            </div>
                        </form>
                    </details>
                </ScrollReveal>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* ── USERS MANAGEMENT ─────────────────────────────────────────────── */}
                    <ScrollReveal delay={0.1} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 bg-gray-50/50">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            <h2 className="text-base font-bold text-gray-900">Manage Users</h2>
                        </div>
                        <div className="overflow-y-auto p-4 flex-1">
                            <div className="space-y-3">
                                {users.map((u) => (
                                    <div key={u.user_id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-red-200 transition">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-bold text-gray-900">{u.name}</p>
                                                {u.role === 'admin' ? (
                                                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">Admin</span>
                                                ) : u.role === 'instructor' ? (
                                                    <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">Instructor</span>
                                                ) : (
                                                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Student</span>
                                                )}
                                            </div>
                                            <p className="truncate text-xs text-gray-500 mt-1">{u.email}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {u.role !== 'admin' && (
                                            <form action={deleteUserAction}>
                                                <FormProgress />
                                                <input type="hidden" name="user_id" value={u.user_id} />
                                                <button type="submit" className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-700 transition" title="Delete User">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* ── COURSES MANAGEMENT ─────────────────────────────────────────────── */}
                    <ScrollReveal delay={0.1} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 bg-gray-50/50">
                            <Settings className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-base font-bold text-gray-900">Manage Courses</h2>
                        </div>
                        <div className="overflow-y-auto p-4 flex-1">
                            <div className="space-y-3">
                                {courses.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-6">No courses created yet.</p>
                                ) : (
                                    courses.map((c) => (
                                        <div key={c.course_id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-indigo-200 transition">
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-gray-900">{c.title}</p>
                                                <p className="truncate text-xs text-gray-500 mt-1">Instructor: <span className="font-medium text-gray-700">{c.instructor_name || 'Unassigned'}</span></p>
                                                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                                    <span>{c.enrolled_count} Enrollments</span>
                                                    <span className="font-semibold text-emerald-600">
                                                        {Number(c.price) === 0 ? "Free" : <>৳{c.price}</>}
                                                    </span>
                                                </div>
                                            </div>
                                            <form action={deleteCourseAdminAction}>
                                                <FormProgress />
                                                <input type="hidden" name="course_id" value={c.course_id} />
                                                <button type="submit" className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-700 transition" title="Delete Course">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

            </div>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}
