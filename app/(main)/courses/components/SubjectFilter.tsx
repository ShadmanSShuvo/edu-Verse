import Link from "next/link";
import { getSubjects } from "@/db/subject";

export async function SubjectFilter({ q, subject, sort }: { q: string; subject: string; sort?: string }) {
    const subjects = await getSubjects() as { subject_id: number; subject_name: string }[];

    const buildHref = (sName?: string) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (sName) params.set("subject", sName);
        if (sort) params.set("sort", sort);
        return `/courses${params.toString() ? `?${params.toString()}` : ""}`;
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Link
                href={buildHref()}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${!subject
                        ? "border-violet-400 bg-violet-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-700"
                    }`}
            >
                All
            </Link>
            {subjects.map((s) => (
                <Link
                    key={s.subject_id}
                    href={buildHref(s.subject_name)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${subject === s.subject_name
                                ? "border-violet-400 bg-violet-600 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-700"
                            }`}
                    >
                        {s.subject_name}
                    </Link>
            ))}
        </div>
    );
}
