import { getCourseInstructors } from "@/db/instructs";

type Instructor = {
    instructor_id: number;
    bio: string | null;
    name: string;
    email: string;
};

export async function InstructorsSection({ courseId }: { courseId: number }) {
    const instructors = await getCourseInstructors(courseId) as Instructor[];

    if (instructors.length === 0) return null;

    return (
        <div>
            <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
                {instructors.length === 1 ? "Instructor" : "Instructors"}
            </h2>
            <div className="flex flex-col gap-4">
                {instructors.map((inst) => {
                    const initials = inst.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                    return (
                        <div
                            key={inst.instructor_id}
                            className="flex gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-5 shadow-sm"
                        >
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-sm font-bold text-white shadow">
                                {initials}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{inst.name}</p>
                                <p className="mb-2 text-xs text-gray-400">
                                    {inst.email}
                                </p>
                                {inst.bio && (
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        {inst.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
