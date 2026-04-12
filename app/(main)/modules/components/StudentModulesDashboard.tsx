"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
    Layers, BookOpen, FileText, Trophy, ChevronRight, 
    Filter, PlayCircle, Loader2, RefreshCw
} from "lucide-react";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { NumberedPagination } from "@/components/pagination";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type Material = {
    material_id: number;
    module_id: number;
    type_id: number;
    name: string;
    url: string;
    type_name: string;
    mux_playback_id?: string;
    mux_status?: string;
};

type Exam = {
    exam_id: number;
    module_id: number;
    title: string;
    marks: number | null;
    duration: number | null;
};

type ModuleWithContent = {
    module_id: number;
    course_id: number;
    title: string;
    description: string | null;
    materials: Material[];
    exams: Exam[];
};

type Course = {
    course_id: number;
    title: string;
    description: string | null;
    price: number;
};

type CourseData = {
    course: Course;
    modules: ModuleWithContent[];
    courseFullCount: number;
};

export function StudentModulesDashboard({ 
    courseData,
    allEnrollments,
    initialCourseId,
    totalModules,
    currentPage,
    pageSize
}: { 
    courseData: CourseData[];
    allEnrollments: any[];
    initialCourseId: number | "all";
    totalModules: number;
    currentPage: number;
    pageSize: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function updateCourseFilter(courseId: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (courseId === "all") {
            params.delete("course");
        } else {
            params.set("course", courseId);
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    }

    function updatePageSize(size: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", size);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    }

    const hasResults = courseData.some(d => d.modules.length > 0);

    return (
        <div className="space-y-8">
            {/* ── Filter Bar ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Filter className="h-5 w-5 text-blue-500" />
                        <span>Filters:</span>
                    </div>
                    <select
                        className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-950 dark:border-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer appearance-none"
                        value={initialCourseId}
                        onChange={(e) => updateCourseFilter(e.target.value)}
                    >
                        <option value="all">All Enrolled Courses</option>
                        {allEnrollments.map(c => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Page Size</span>
                    <select
                        className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-slate-950 dark:border-slate-800 px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-400 transition cursor-pointer"
                        value={pageSize}
                        onChange={(e) => updatePageSize(e.target.value)}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            {/* ── Dashboard Content ───────────────────────────────────────────── */}
            {!hasResults ? (
                <div className="flex flex-col items-center gap-3 py-24 text-center bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-gray-50 dark:border-slate-800">
                    <div className="h-16 w-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-300">
                        <Layers className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            {initialCourseId === "all" ? "No modules found on this page" : "No modules found for this course"}
                        </p>
                        <p className="text-sm text-gray-400">
                            Try checking another page or selecting a different course.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {courseData.map(({ course, modules, courseFullCount }, index: number) => {
                        if (modules.length === 0) return null;

                        return (
                            <ScrollReveal key={course.course_id} delay={index * 0.4}>
                            <div key={course.course_id} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Course Header */}
                                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <Layers className="h-3.5 w-3.5" />
                                            {modules.length} {modules.length === 1 ? 'module' : 'modules'} out of {courseFullCount} modules found
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {modules.map((mod: ModuleWithContent, idx: number) => (
                                        <InteractiveModuleCard 
                                            key={mod.module_id} 
                                            mod={mod} 
                                            index={idx + 1} 
                                        />
                                    ))}
                                </div>
                            </div>
                            </ScrollReveal>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination ─────────────────────────────────────────────────── */}
            <NumberedPagination 
                totalItems={totalModules}
                pageSize={pageSize}
                currentPage={currentPage}
            />
        </div>
    );
}

// ── Material Item with full Mux support ─────────────────────────────────────

function MaterialItem({ mat }: { mat: Material }) {
    const router = useRouter();
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const isVideo = mat.type_name.toLowerCase() === "video" 
        || mat.url.toLowerCase().endsWith(".mp4") 
        || mat.url.toLowerCase().endsWith(".webm");
    
    const isMuxPending = isVideo && !mat.mux_playback_id && (mat.mux_status === "pending" || mat.url === "pending-upload");
    const isMuxReady = isVideo && !!mat.mux_playback_id;

    const handleSync = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSyncing(true);
        try {
            await fetch("/api/video/sync");
            router.refresh();
        } finally {
            setIsSyncing(false);
        }
    };

    if (isMuxPending) {
        return (
            <li>
                <div className="group flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 dark:bg-amber-900/10 dark:border-amber-500/20 px-3 py-2">
                    <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400 truncate block">{mat.name}</span>
                        <span className="text-[10px] text-amber-500/70">Processing… Mux is encoding your video</span>
                    </div>
                    <button
                        onClick={handleSync}
                        title="Check if video is ready"
                        className="ml-auto rounded-md p-1 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition flex-shrink-0"
                    >
                        {isSyncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3" />
                        )}
                    </button>
                </div>
                <span className="mt-0.5 block text-[10px] text-amber-500/60 px-3">
                    Click 🔄 after ~1 min to check if ready
                </span>
            </li>
        );
    }

    if (isMuxReady) {
        return (
            <li>
                <button
                    onClick={() => setIsVideoOpen(true)}
                    className="group w-full flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-white hover:border-violet-200 hover:shadow-sm transition text-left"
                >
                    <PlayCircle className="h-3.5 w-3.5 text-violet-500 group-hover:text-violet-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-violet-600 truncate">{mat.name}</span>
                </button>
                <VideoPlayerModal 
                    url={mat.url}
                    title={mat.name}
                    isOpen={isVideoOpen}
                    onClose={() => setIsVideoOpen(false)}
                    playbackId={mat.mux_playback_id}
                />
            </li>
        );
    }

    // Standard file / link
    return (
        <li>
            <a 
                href={mat.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-white hover:border-gray-200 hover:shadow-sm transition"
            >
                <FileText className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 truncate">{mat.name}</span>
            </a>
        </li>
    );
}

// Interactive client-side specific card with smooth transitions
function InteractiveModuleCard({ mod, index, isPriority = false }: { mod: ModuleWithContent, index: number, isPriority?: boolean }) {
    const [isOpen, setIsOpen] = useState(isPriority);

    const baseClasses = "overflow-hidden rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900/50";
    const priorityClasses = isPriority 
        ? "border-blue-200 shadow-md ring-1 ring-blue-50 dark:border-blue-500/30 dark:ring-blue-500/10 dark:shadow-blue-900/10" 
        : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow dark:border-slate-800 dark:hover:border-slate-700 dark:shadow-slate-950/20";

    return (
        <div className={`${baseClasses} ${priorityClasses}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex text-left items-center gap-4 p-4 transition hover:bg-gray-50"
            >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-inner ${
                    isPriority ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                }`}>
                    {index}
                </div>
                <div className="flex-1">
                    <p className={`font-semibold ${isPriority ? "text-blue-900" : "text-gray-900"}`}>{mod.title}</p>
                    {mod.description && (
                        <p className="mt-0.5 text-xs text-gray-500 truncate max-w-sm">{mod.description}</p>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> {mod.materials.length}
                    </span>
                    <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> {mod.exams.length}
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90 text-blue-500" : "text-gray-300"}`} />
                </div>
            </button>

            {/* Expanded Content */}
            <div 
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50/30">
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Materials */}
                            <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Materials</p>
                                {mod.materials.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">None available.</p>
                                ) : (
                                    <ul className="space-y-1.5">
                                        {mod.materials.map(mat => (
                                            <MaterialItem key={mat.material_id} mat={mat} />
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Exams */}
                            <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Exams</p>
                                {mod.exams.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">None available.</p>
                                ) : (
                                    <ul className="space-y-1.5">
                                        {mod.exams.map(exam => (
                                            <li key={exam.exam_id}>
                                                <Link href={`/exams/${exam.exam_id}`} className="group flex items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-white hover:border-gray-200 hover:shadow-sm transition">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                                        <span className="text-xs font-medium text-gray-700 group-hover:text-amber-600 truncate">{exam.title}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
