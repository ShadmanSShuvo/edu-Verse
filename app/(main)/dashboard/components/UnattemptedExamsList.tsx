import Link from "next/link";
import { getUnattemptedExams } from "@/db/dashboard";
import { PlayCircle, Trophy, Clock, ChevronRight, CheckCircle2 } from "lucide-react";

type UpcomingExam = {
    exam_id: number;
    title: string;
    marks: number | null;
    duration: number | null;
    module_title: string;
    course_title: string;
};

export async function UnattemptedExamsList({ userId }: { userId: number }) {
    const unattempted = await getUnattemptedExams(userId, 5) as UpcomingExam[];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="text-indigo-500"><PlayCircle className="h-4 w-4" /></span>
                Unattempted Exams
            </div>

            {unattempted.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                    <p className="text-sm font-semibold text-emerald-600">All done!</p>
                    <p className="text-xs text-gray-400">You&apos;ve attempted every available exam.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {unattempted.map((exam) => (
                        <Link
                            key={exam.exam_id}
                            href={`/exams/${exam.exam_id}`}
                            className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
                                <Trophy className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-900 group-hover:text-indigo-700">
                                    {exam.title}
                                </p>
                                <p className="truncate text-[11px] text-gray-400">{exam.course_title}</p>
                                <div className="mt-1 flex gap-2 text-[11px] text-gray-400">
                                    {exam.marks && <span>{exam.marks} marks</span>}
                                    {exam.duration && (
                                        <span className="flex items-center gap-0.5">
                                            <Clock className="h-3 w-3" />{exam.duration}m
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-gray-300 group-hover:text-indigo-400 transition" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
