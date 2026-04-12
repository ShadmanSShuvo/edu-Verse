"use client";

import Link from "next/link";
import { Tag, GraduationCap, Star, Layers, Users, Eye } from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";

export function AnimatedCourseCard({
    course,
    accent,
}: {
    course: any;
    accent: string;
}) {
    const price = Number(course.price);
    const rating = course.avg_rating ? Number(course.avg_rating) : null;
    const subjectTags = course.subjects
        ? course.subjects.split(", ").filter(Boolean)
        : [];

    return (
        <Link
            href={`/courses/${course.course_id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r ${accent} z-10`} />

            {/* Card content — blurs on hover */}
            <div className="flex flex-1 flex-col p-6 relative z-0 transition-[filter] duration-300 group-hover:blur-[2px]">
                {subjectTags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                        {subjectTags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                                <Tag className="h-2.5 w-2.5" /> {tag}
                            </span>
                        ))}
                        {subjectTags.length > 2 && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                                +{subjectTags.length - 2}
                            </span>
                        )}
                    </div>
                )}
                <h2 className="mb-1.5 text-base font-bold leading-snug text-gray-900 line-clamp-2">
                    {course.title}
                </h2>
                {course.instructors && (
                    <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                        <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{course.instructors}</span>
                    </p>
                )}
                {course.description && (
                    <p className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-2">
                        {course.description}
                    </p>
                )}
                <div className="mb-4 flex items-center gap-2">
                    {rating ? (
                        <>
                            <span className="text-sm font-bold text-amber-500">{rating.toFixed(1)}</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">({course.review_count})</span>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400 italic">No ratings yet</span>
                    )}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" />
                            {course.module_count} {Number(course.module_count) === 1 ? "module" : "modules"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course.student_count} {Number(course.student_count) === 1 ? "student" : "students"}
                        </span>
                    </div>
                    <span className={`flex items-center gap-0.5 rounded-lg px-2.5 py-1 text-xs font-bold ${price === 0 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                        {price === 0 ? "Free" : <><TakaSymbol className="h-3 w-3" />{price}</>}
                    </span>
                </div>
            </div>

            {/* Hover overlay — single "View Course" CTA */}
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                <span className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/50 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <Eye className="h-4 w-4" /> View Course
                </span>
            </div>
        </Link>
    );
}

