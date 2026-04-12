import { getModules } from "@/db/modules";
import { BookOpen, ChevronDown } from "lucide-react";
import { AnimatedModuleList } from "./AnimatedModuleList";

type Module = {
    module_id: number;
    course_id: number;
    title: string;
    description: string | null;
};

export async function CurriculumSection({ courseId }: { courseId: number }) {
    const modules = await getModules(courseId) as Module[];

    return (
        <div id="curriculum">
            <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
                Course Curriculum
            </h2>
            {modules.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                    <BookOpen className="h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-400">No modules added yet.</p>
                </div>
            ) : (
                <AnimatedModuleList>
                    {modules.map((mod, idx) => (
                        <details
                            key={mod.module_id}
                            className="module-card group rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm transition-all duration-300"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20 text-xs font-bold text-violet-700 dark:text-violet-300">
                                        {idx + 1}
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-violet-600 transition-colors">
                                        {mod.title}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                            </summary>
                            {mod.description && (
                                <div className="border-t border-gray-100 dark:border-white/5 px-5 py-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-800/20">
                                    {mod.description}
                                </div>
                            )}
                        </details>
                    ))}
                </AnimatedModuleList>
            )}
        </div>
    );
}
