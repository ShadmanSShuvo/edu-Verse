"use client";

import { useState } from "react";

type Subject = { subject_id: number; subject_name: string };

const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition";

/**
 * Renders:
 *  – A <select> listing existing subjects + a sentinel "＋ Create new subject…" option
 *  – When the sentinel is selected, hides the <select> name and shows a text <input>
 *    so only the new name reaches the server action via `new_subject`.
 */
export function SubjectSelector({ subjects }: { subjects: Subject[] }) {
    const [isNew, setIsNew] = useState(false);

    return (
        <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-gray-600">
                Subject{" "}
                <span className="text-gray-400 font-normal">
                    (optional — assign one now or later)
                </span>
            </label>

            {/* Dropdown — name is cleared when creating a new subject */}
            <select
                name={isNew ? undefined : "subject_id"}
                className={inputCls}
                value={isNew ? "__new__" : undefined}
                defaultValue=""
                onChange={(e) => setIsNew(e.target.value === "__new__")}
            >
                <option value="">— No subject —</option>
                {subjects.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name}
                    </option>
                ))}
                <option value="__new__">＋ Create a new subject…</option>
            </select>

            {/* New subject text input — only rendered (and named) when sentinel is chosen */}
            {isNew && (
                <input
                    name="new_subject"
                    required
                    autoFocus
                    placeholder="New subject name…"
                    className={`${inputCls} border-violet-300 focus:border-violet-500 focus:ring-violet-100`}
                />
            )}

            {isNew && (
                <button
                    type="button"
                    onClick={() => setIsNew(false)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 underline"
                >
                    ← Back to existing subjects
                </button>
            )}

            {!isNew && (
                <p className="text-[11px] text-gray-400">
                    If the subject doesn&apos;t exist, pick{" "}
                    <em>&quot;＋ Create a new subject…&quot;</em> from the list.
                </p>
            )}
        </div>
    );
}

/**
 * Variant used inside the per-course "Assign Subject" panel.
 * Renders identically but without the "optional" label hint.
 */
export function AssignSubjectSelector({ subjects }: { subjects: Subject[] }) {
    const [isNew, setIsNew] = useState(false);

    return (
        <>
            <label className="sm:col-span-2 text-xs font-semibold text-gray-500 flex items-center gap-1">
                📂 Assign Subject
            </label>

            <select
                name={isNew ? undefined : "subject_id"}
                className={`${inputCls} sm:col-span-2`}
                value={isNew ? "__new__" : undefined}
                defaultValue=""
                onChange={(e) => setIsNew(e.target.value === "__new__")}
            >
                <option value="">— Select existing subject —</option>
                {subjects.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name}
                    </option>
                ))}
                <option value="__new__">＋ Create a new subject…</option>
            </select>

            {isNew && (
                <input
                    name="new_subject"
                    required
                    autoFocus
                    placeholder="New subject name…"
                    className={`${inputCls} sm:col-span-2 border-violet-300 focus:border-violet-500`}
                />
            )}

            {isNew && (
                <button
                    type="button"
                    onClick={() => setIsNew(false)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 underline sm:col-span-2 text-left"
                >
                    ← Back to existing subjects
                </button>
            )}
        </>
    );
}
/**
 * Instructor variant to assign their primary subject.
 * No "Create new" since they define which existing subject they teach.
 */
export function InstructorSubjectSelector({ subjects }: { subjects: Subject[] }) {
    return (
        <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Choose Your Preferred Subject
                <span className="ml-1 text-xs font-normal text-gray-400">
                    (You can only pick one subject to specialize in)
                </span>
            </label>
            <select
                name="subject_id"
                required
                className={inputCls}
                defaultValue=""
            >
                <option value="" disabled>Select your subject...</option>
                {subjects.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name}
                    </option>
                ))}
            </select>
            <p className="text-xs text-amber-600 font-medium">
                Note: This assignment is permanent for your account. You will only see courses and exams related to this subject.
            </p>
        </div>
    );
}
