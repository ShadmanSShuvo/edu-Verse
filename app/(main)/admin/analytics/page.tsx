import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getTopCourses } from "@/db/admin";
import {
    TrendingUp, Users, Star, BookOpen,
    BarChart3, ArrowLeft, Award, Target,
    ChevronRight, GraduationCap, Layers
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type TopCourse = {
    course_id: number;
    title: string;
    description: string | null;
    price: string;
    instructors: string;
    subjects: string;
    enrollment_count: number;
    avg_rating: string | null;
    review_count: number;
    avg_progress: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number | null }) {
    const r = rating ?? 0;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg
                    key={s}
                    viewBox="0 0 20 20"
                    fill={r >= s ? "currentColor" : r >= s - 0.5 ? "url(#half)" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className={`h-3.5 w-3.5 ${r >= s - 0.4 ? "text-amber-400" : "text-gray-300 dark:text-slate-700"}`}
                >
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.951-.69L9.049 2.927z" />
                </svg>
            ))}
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-xs font-extrabold text-white shadow-md">🥇</span>
    );
    if (rank === 2) return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-xs font-extrabold text-white shadow-md">🥈</span>
    );
    if (rank === 3) return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-600 text-xs font-extrabold text-white shadow-md">🥉</span>
    );
    return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-slate-800 dark:text-slate-400">
            {rank}
        </span>
    );
}

function SummaryCard({
    icon, label, value, sub, gradient,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    gradient: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
            <div aria-hidden className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-6 -right-2 h-28 w-28 rounded-full bg-white/5" />
            <div className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    {icon}
                </div>
                <p className="text-3xl font-extrabold leading-none tracking-tight">{value}</p>
                <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
                {sub && <p className="mt-0.5 text-xs text-white/50">{sub}</p>}
            </div>
        </div>
    );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default async function TopCoursesAnalyticsPage() {
    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const isAdmin = roles.some((r: { name: string }) => r.name === "admin");
    if (!isAdmin) redirect("/dashboard");

    const courses = (await getTopCourses(20)) as TopCourse[];

    // ── Derived summary stats ─────────────────────────────────────────────────
    const maxEnrollments = Math.max(...courses.map((c) => c.enrollment_count), 1);
    const totalEnrollments = courses.reduce((s, c) => s + c.enrollment_count, 0);
    const avgPlatformRating =
        courses.filter((c) => c.avg_rating).length > 0
            ? (
                courses.reduce((s, c) => s + parseFloat(c.avg_rating ?? "0"), 0) /
                courses.filter((c) => c.avg_rating).length
            ).toFixed(1)
            : "—";
    const totalReviews = courses.reduce((s, c) => s + c.review_count, 0);
    const topCourse = courses[0];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 pb-24 pt-12">
                {/* Background blobs */}
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -left-40 -top-20 h-[28rem] w-[28rem] rounded-full bg-violet-600/25 blur-3xl" />
                    <div className="absolute right-0 top-0 h-80 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
                </div>

                {/* Grid pattern overlay */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="mx-auto max-w-7xl px-6">
                    {/* Back link */}
                    <Link
                        href="/admin"
                        className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Admin Dashboard
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2.5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-lg">
                                    <BarChart3 className="h-6 w-6 text-violet-200" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-widest text-violet-300">Analytics</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Top Courses
                            </h1>
                            <p className="mt-2 max-w-lg text-sm text-indigo-200/80">
                                Ranked by total enrollments and average student rating — a joint analysis
                                of the <span className="font-semibold text-white">course</span>,{" "}
                                <span className="font-semibold text-white">enrollment</span>, and{" "}
                                <span className="font-semibold text-white">review</span> tables.
                            </p>
                        </div>

                        {/* Top-ranked pill */}
                        {topCourse && (
                            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm ring-1 ring-white/15 text-right shrink-0">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300 mb-1">🏆 #1 Course</p>
                                <p className="text-base font-bold text-white leading-tight max-w-[200px]">{topCourse.title}</p>
                                <p className="text-xs text-white/60 mt-0.5">{topCourse.enrollment_count} enrollments</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-7xl -mt-10 px-6 pb-24 space-y-8">

                {/* ── SUMMARY STAT CARDS ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <SummaryCard
                        icon={<BookOpen className="h-5 w-5" />}
                        label="Courses Ranked"
                        value={courses.length}
                        sub="Top performing"
                        gradient="bg-gradient-to-br from-violet-500 to-indigo-700"
                    />
                    <SummaryCard
                        icon={<Users className="h-5 w-5" />}
                        label="Total Enrollments"
                        value={totalEnrollments.toLocaleString()}
                        sub="Across all top courses"
                        gradient="bg-gradient-to-br from-blue-500 to-cyan-700"
                    />
                    <SummaryCard
                        icon={<Star className="h-5 w-5" />}
                        label="Avg Platform Rating"
                        value={avgPlatformRating}
                        sub="Out of 5.0 stars"
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    />
                    <SummaryCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Total Reviews"
                        value={totalReviews.toLocaleString()}
                        sub="Student feedback entries"
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
                    />
                </div>

                {/* ── RANKED TABLE ───────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                    {/* Table header */}
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-4 dark:bg-slate-900/50 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-violet-500" />
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Course Rankings</h2>
                        </div>
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20">
                            {courses.length} courses
                        </span>
                    </div>

                    {courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-500">
                            <GraduationCap className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-sm font-medium">No courses found</p>
                            <p className="text-xs mt-1">Create courses and enroll students to see analytics here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/30 dark:border-slate-800 dark:bg-slate-800/50">
                                        <th className="py-3 pl-6 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Rank</th>
                                        <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Course</th>
                                        <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell dark:text-slate-500">Instructor</th>
                                        <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell dark:text-slate-500">Subject</th>
                                        <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Enrollments</th>
                                        <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden sm:table-cell dark:text-slate-500">Rating</th>
                                        <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden xl:table-cell dark:text-slate-500">Reviews</th>
                                        <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden xl:table-cell dark:text-slate-500">Avg&nbsp;Progress</th>
                                        <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Price</th>
                                        <th className="py-3 pl-3 pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                    {courses.map((course, idx) => {
                                        const enrollPct = maxEnrollments > 0
                                            ? Math.round((course.enrollment_count / maxEnrollments) * 100)
                                            : 0;
                                        const ratingNum = parseFloat(course.avg_rating ?? "0");
                                        const progressNum = parseFloat(course.avg_progress ?? "0");

                                        return (
                                            <tr
                                                key={course.course_id}
                                                className={`group transition-colors hover:bg-violet-50/40 dark:hover:bg-violet-900/10 ${idx < 3 ? "bg-gradient-to-r from-amber-50/30 dark:from-amber-900/10 to-transparent" : ""}`}
                                            >
                                                {/* Rank */}
                                                <td className="py-4 pl-6 pr-3">
                                                    <RankBadge rank={idx + 1} />
                                                </td>

                                                {/* Course title + description */}
                                                <td className="py-4 px-3 max-w-[240px]">
                                                    <p className="font-semibold text-gray-900 dark:text-slate-100 leading-tight line-clamp-1">{course.title}</p>
                                                    {course.description && (
                                                        <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 line-clamp-1">{course.description}</p>
                                                    )}
                                                </td>

                                                {/* Instructor */}
                                                <td className="py-4 px-3 hidden lg:table-cell">
                                                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400">{course.instructors}</p>
                                                </td>

                                                {/* Subject badges */}
                                                <td className="py-4 px-3 hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {course.subjects.split(", ").slice(0, 2).map((sub) => (
                                                            <span
                                                                key={sub}
                                                                className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20"
                                                            >
                                                                {sub}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Enrollments + bar */}
                                                <td className="py-4 px-3 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="font-bold text-gray-900 dark:text-slate-100">{course.enrollment_count.toLocaleString()}</span>
                                                        <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all"
                                                                style={{ width: `${enrollPct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Rating */}
                                                <td className="py-4 px-3 hidden sm:table-cell">
                                                    <div className="flex flex-col items-end gap-1">
                                                        {course.avg_rating ? (
                                                            <>
                                                                <span className="font-bold text-amber-500">{course.avg_rating}</span>
                                                                <StarRating rating={ratingNum} />
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-slate-500">No ratings</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Review count */}
                                                <td className="py-4 px-3 text-right hidden xl:table-cell">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">{course.review_count}</span>
                                                </td>

                                                {/* Avg progress */}
                                                <td className="py-4 px-3 hidden xl:table-cell">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                                            {course.avg_progress ? `${course.avg_progress}%` : "—"}
                                                        </span>
                                                        {course.avg_progress && (
                                                            <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${progressNum >= 70
                                                                            ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                                                            : progressNum >= 40
                                                                                ? "bg-gradient-to-r from-amber-400 to-orange-400"
                                                                                : "bg-gradient-to-r from-red-400 to-rose-400"
                                                                        }`}
                                                                    style={{ width: `${progressNum}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="py-4 px-3 text-right">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${Number(course.price) === 0
                                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                                                                : "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                                                            }`}
                                                    >
                                                        {Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`}
                                                    </span>
                                                </td>

                                                {/* View link */}
                                                <td className="py-4 pl-3 pr-6 text-right">
                                                    <Link
                                                        href={`/courses/${course.course_id}`}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-500 opacity-0 ring-1 ring-gray-200 transition group-hover:opacity-100 hover:bg-violet-50 hover:text-violet-700 hover:ring-violet-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-violet-500/20 dark:hover:text-violet-400 dark:hover:ring-violet-500/30"
                                                    >
                                                        View <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── QUERY INFO CALLOUT ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
                            <Layers className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">How this data is computed</p>
                            <p className="mt-1 text-xs leading-relaxed text-indigo-700/80 dark:text-indigo-300/80">
                                This page executes a single SQL query that joins{" "}
                                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">course</code> →{" "}
                                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">enrollment</code> →{" "}
                                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">review</code> →{" "}
                                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">instructor</code> →{" "}
                                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">subject</code>.
                                Courses are ranked by <span className="font-semibold">enrollment&nbsp;count</span> (descending),
                                with ties broken by <span className="font-semibold">average rating</span> (descending).
                                The enrollment progress bar for each course is normalised relative to the top-ranked course.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
