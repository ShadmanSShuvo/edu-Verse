import Link from "next/link";
import { redirect } from "next/navigation";
import { 
    Trophy, BookOpen, Layers, GraduationCap, ChevronRight, Star, 
    PenLine, ShieldCheck, Clock 
} from "lucide-react";
import { getInstructorByUserId } from "@/db/instructor";
import { getExamsForInstructor, getExamsBySubject, getAllExamsWithDetails } from "@/db/exam";

export async function InstructorExamsList({ 
    userId, 
    role,
    instructorId,
    subjectId
}: { 
    userId: number; 
    role: string;
    instructorId?: number;
    subjectId?: number | null;
}) {
    const isAdmin = role === "admin";
    let rawExams: any[] = [];

    if (isAdmin) {
        rawExams = await getAllExamsWithDetails();
    } else {
        if (!instructorId) {
            return (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                    <GraduationCap className="h-12 w-12 text-gray-300" />
                    <p className="text-lg font-semibold text-gray-500">No instructor profile found</p>
                </div>
            );
        }

        rawExams = subjectId
            ? await getExamsBySubject(subjectId)
            : await getExamsForInstructor(instructorId);
    }
    
    // Grouping helper
    const map = new Map<number, any>();
    for (const exam of rawExams) {
        if (!map.has(exam.course_id)) {
            map.set(exam.course_id, { course_id: exam.course_id, course_title: exam.course_title, modules: new Map() });
        }
        const course = map.get(exam.course_id)!;
        if (!course.modules.has(exam.module_id)) {
            course.modules.set(exam.module_id, { module_id: exam.module_id, module_title: exam.module_title, exams: [] });
        }
        course.modules.get(exam.module_id)!.exams.push(exam);
    }
    const grouped = [...map.values()].map((c) => ({ course_id: c.course_id, course_title: c.course_title, modules: [...c.modules.values()] }));

    if (rawExams.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                <Trophy className="h-12 w-12 text-gray-300" />
                <p className="text-lg font-semibold text-gray-500">No exams yet</p>
                <p className="text-sm text-gray-400">Create exams from the <Link href="/modules" className="text-violet-600 hover:underline">Modules</Link> page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {grouped.map((course) => (
                <section key={course.course_id}>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{course.course_title}</h2>
                    </div>
                    <div className="space-y-4">
                        {course.modules.map((mod: any) => (
                            <div key={mod.module_id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
                                    <Layers className="h-4 w-4 text-violet-400" />
                                    <span className="text-sm font-semibold text-gray-700">{mod.module_title}</span>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {mod.exams.map((exam: any) => (
                                        <li key={exam.exam_id}>
                                            <Link href={`/exams/${exam.exam_id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-violet-50/50">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                                                    <Trophy className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 group-hover:text-violet-700 transition truncate">{exam.title}</p>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                                        {exam.marks != null && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{exam.marks} marks</span>}
                                                        {exam.duration != null && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} min</span>}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                                                        <PenLine className="h-3 w-3" />Manage
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 transition" />
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
