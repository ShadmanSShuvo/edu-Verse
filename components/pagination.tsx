"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    paramName?: string;
}

export function NumberedPagination({
    totalItems,
    pageSize,
    currentPage,
    paramName = "page"
}: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) return null;

    function updatePage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete(paramName);
        } else {
            params.set(paramName, page.toString());
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }

        if (currentPage < totalPages - 2) pages.push("...");
        if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return (
        <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
            <button
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 dark:border-slate-800 dark:bg-slate-900/50"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1">
                {pages.map((page, idx) => (
                    typeof page === "number" ? (
                        <button
                            key={idx}
                            onClick={() => updatePage(page)}
                            className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-bold transition-all ${
                                currentPage === page
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "border border-transparent text-gray-600 hover:border-gray-200 hover:bg-white dark:text-gray-400 dark:hover:border-slate-800 dark:hover:bg-slate-900/50"
                            }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <div key={idx} className="flex h-10 w-8 items-center justify-center text-gray-400">
                            <MoreHorizontal className="h-4 w-4" />
                        </div>
                    )
                ))}
            </div>

            <button
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 dark:border-slate-800 dark:bg-slate-900/50"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </nav>
    );
}
