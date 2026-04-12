"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function CourseSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentSort = searchParams.get("sort") || "";

    const handleSortChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newSort = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (newSort) {
                params.set("sort", newSort);
            } else {
                params.delete("sort");
            }
            router.push(`/courses?${params.toString()}`);
        },
        [router, searchParams]
    );

    return (
        <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort by:</span>
            <select
                title="Sort courses"
                aria-label="Sort courses"
                value={currentSort}
                onChange={handleSortChange}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
                <option value="">Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="enrolled_desc">Most Enrolled</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="modules_desc">Most Modules</option>
            </select>
        </div>
    );
}
