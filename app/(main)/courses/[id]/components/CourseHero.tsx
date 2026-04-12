import Link from "next/link";
import { Star, Tag, GraduationCap, Users, Layers, ArrowLeft } from "lucide-react";
import { getCourseById } from "@/db/courses";
import { notFound } from "next/navigation";

export async function CourseHero({ courseId }: { courseId: number }) {
    const course = await getCourseById(courseId);
    if (!course) return null;

    const rating = course.avg_rating ? Number(course.avg_rating) : null;
    const subjectTags = course.subjects
        ? course.subjects.split(", ").filter(Boolean)
        : [];

    return (
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 py-16">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/30 via-transparent to-transparent"
            />
            <div className="mx-auto max-w-6xl px-6">
                <Link
                    href="/courses"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Courses
                </Link>

                <div className="grid gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {subjectTags.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {subjectTags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                            {course.title}
                        </h1>

                        {course.description && (
                            <p className="mb-6 text-base leading-relaxed text-white/70">
                                {course.description}
                            </p>
                        )}

                        {course.instructors && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
                                <GraduationCap className="h-4 w-4 flex-shrink-0 text-violet-300" />
                                <span>
                                    Taught by{" "}
                                    <span className="font-semibold text-white">
                                        {course.instructors}
                                    </span>
                                </span>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                            {rating ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="font-bold text-amber-400">
                                        {rating.toFixed(1)}
                                    </span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Star
                                                key={n}
                                                className={`h-3.5 w-3.5 ${n <= Math.round(rating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-white/20"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span>({course.review_count} reviews)</span>
                                </span>
                            ) : (
                                <span className="italic text-white/40">No ratings yet</span>
                            )}
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {course.student_count} enrolled
                            </span>
                            <span className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                {course.module_count}{" "}
                                {Number(course.module_count) === 1 ? "module" : "modules"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
