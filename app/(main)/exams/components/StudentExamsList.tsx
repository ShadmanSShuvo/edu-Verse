import Link from "next/link";
import { getExamsForStudent, getExamsCountForStudent } from "@/db/exam";
import { getStudentEnrollments } from "@/db/enrollment";
import { Trophy, Clock, BookOpen, Layers, Star, AlertCircle } from "lucide-react";
import { StudentExamsDashboard } from "./StudentExamsDashboard";

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

function groupByCourse(exams: ExamRow[], enrollments: any[]): any[] {
    const map = new Map<number, { course_id: number; course_title: string; modules: Map<number, { module_id: number; module_title: string; exams: ExamRow[] }> }>();

    // Initialize with all enrollments so courses with no exams still appear
    for (const enrollment of enrollments) {
        map.set(enrollment.course_id, {
            course_id: enrollment.course_id,
            course_title: enrollment.title,
            modules: new Map()
        });
    }

    for (const exam of exams) {
        if (!map.has(exam.course_id)) {
            map.set(exam.course_id, { course_id: exam.course_id, course_title: exam.course_title, modules: new Map() });
        }
        const course = map.get(exam.course_id)!;
        if (!course.modules.has(exam.module_id)) {
            course.modules.set(exam.module_id, { module_id: exam.module_id, module_title: exam.module_title, exams: [] });
        }
        course.modules.get(exam.module_id)!.exams.push(exam);
    }

    return [...map.values()].map((c) => ({
        course_id: c.course_id,
        course_title: c.course_title,
        modules: [...c.modules.values()]
    }));
}

export async function StudentExamsList({
    userId,
    student,
    courseId,
    status = "all",
    page = 1
}: {
    userId: number;
    student: any;
    courseId?: number;
    status?: "pending" | "completed" | "all";
    page?: number;
}) {
    const limit = 12;

    if (!student) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                <AlertCircle className="h-12 w-12 text-gray-300" />
                <p className="text-lg font-semibold text-gray-500">No student profile found</p>
                <p className="text-sm text-gray-400">Please contact support or ensure your account is correctly set up.</p>
            </div>
        );
    }

    const enrollments = await getStudentEnrollments(userId);

    if (enrollments.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                <AlertCircle className="h-12 w-12 text-gray-300" />
                <p className="text-lg font-semibold text-gray-500">No exams available</p>
                <p className="text-sm text-gray-400">Enroll in courses with exams to see them here.</p>
                <Link href="/courses" className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
                    Browse Courses
                </Link>
            </div>
        );
    }

    // Use the purpose-built query that directly joins enrollment → course → module → exam
    // This avoids the getModules() → getExamsByModuleIds() chain which had caching issues
    const [rawExams, totalExams] = await Promise.all([
        getExamsForStudent(student.student_id, userId, { courseId, status, page, limit }),
        getExamsCountForStudent(student.student_id, userId, { courseId, status }),
    ]);

    const totalPages = Math.ceil(totalExams / limit);
    const grouped = groupByCourse(rawExams as ExamRow[], enrollments);

    return (
        <div className="w-full">
            <StudentExamsDashboard
                groupedExams={grouped}
                initialCourseId={courseId}
                initialStatus={status}
                currentPage={page}
                totalPages={totalPages}
                totalResults={totalExams}
            />
        </div>
    );
}
