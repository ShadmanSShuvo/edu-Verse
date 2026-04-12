import Link from "next/link";
import { getCoursesWithDetails, getCoursesCount } from "@/db/courses";
import { BookOpen, Tag, GraduationCap, Star, Layers, Users } from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";
import { NumberedPagination } from "@/components/pagination";

const ACCENTS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-500",
    "from-cyan-500 to-blue-500",
    "from-fuchsia-500 to-violet-600",
    "from-green-500 to-emerald-600",
];

type Course = {
    course_id: number;
    title: string;
    description: string | null;
    price: string;
    instructors: string;
    subjects: string;
    module_count: string;
    student_count: string;
    avg_rating: string | null;
    review_count: string;
};

import { AnimatedCourseCard } from "./AnimatedCourseCard";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export async function CourseList({ 
    q, 
    subject, 
    sort,
    page = 1
}: { 
    q: string; 
    subject: string; 
    sort?: string;
    page?: number;
}) {
    const pageSize = 9;
    const offset = (page - 1) * pageSize;

    const [courses, totalCount] = await Promise.all([
        getCoursesWithDetails({ 
            q, 
            subject, 
            sort: sort === "price_asc" ? "price-low" : 
                  sort === "price_desc" ? "price-high" : 
                  sort === "rating_desc" ? "rating" : 
                  sort === "enrolled_desc" ? "students" : undefined,
            limit: pageSize,
            offset
        }) as unknown as Course[],
        getCoursesCount(q, subject)
    ]);

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="mb-6 text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">{courses.length}</span>{" "}
                {courses.length === 1 ? "course" : "courses"}
                {q && (
                    <>
                        {" "}for &ldquo;<span className="text-violet-600">{q}</span>&rdquo;
                    </>
                )}
                {subject && (
                    <>
                        {" "}in{" "}
                        <span className="text-violet-600">{subject}</span>
                    </>
                )}
            </p>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                    <BookOpen className="h-14 w-14 text-gray-300" />
                    <p className="text-lg font-semibold text-gray-500">No courses found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or clearing the subject filter.</p>
                    <Link
                        href="/courses"
                        className="mt-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
                    >
                        Clear filters
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course, idx) => {
                        const accent = ACCENTS[idx % ACCENTS.length];
                        const price = Number(course.price);
                        const rating = course.avg_rating ? Number(course.avg_rating) : null;
                        const subjectTags = course.subjects
                            ? course.subjects.split(", ").filter(Boolean)
                            : [];

                        return (
                            <ScrollReveal key={course.course_id} delay={0.1 * (idx % 9)}>
                                <AnimatedCourseCard 
                                    course={course}
                                    accent={accent} 
                                />
                            </ScrollReveal>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination ─────────────────────────────────────────────────── */}
            <NumberedPagination 
                totalItems={totalCount}
                pageSize={pageSize}
                currentPage={page}
            />
        </div>
    );
}
