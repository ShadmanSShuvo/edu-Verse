"use client";

import { useRef, useState } from "react";
import { Star, Send, Trash2, PenLine } from "lucide-react";

type Props = {
    courseId: number;
    existingReview: { review_id: number; rating: number; review_text: string | null } | null;
    submitAction: (formData: FormData) => Promise<void>;
    deleteAction: (formData: FormData) => Promise<void>;
};

export function ReviewForm({ courseId, existingReview, submitAction, deleteAction }: Props) {
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [hovered, setHovered] = useState(0);
    const [pending, setPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const display = hovered || rating;
    const isEdit = !!existingReview;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!rating) return;
        setPending(true);
        const fd = new FormData(event.currentTarget);
        await submitAction(fd);
        setPending(false);
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                <PenLine className="h-4 w-4 text-violet-500" />
                {isEdit ? "Edit Your Review" : "Write a Review"}
            </h3>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="course_id" value={courseId} />
                <input type="hidden" name="rating" value={rating} />

                {/* Star picker */}
                <div>
                    <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Rating</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onMouseEnter={() => setHovered(n)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(n)}
                                className="transition-transform hover:scale-110 active:scale-95"
                                aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
                            >
                                <Star
                                    className={`h-7 w-7 transition-colors ${n <= display
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-200"
                                        }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 self-center text-sm font-semibold text-gray-500">
                                {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Text */}
                <div>
                    <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Your thoughts (optional)</p>
                    <textarea
                        name="review_text"
                        rows={3}
                        defaultValue={existingReview?.review_text ?? ""}
                        placeholder="Share what you liked, learned, or would improve…"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Delete button if editing */}
                    {isEdit && (
                        <button
                            type="button"
                            disabled={pending}
                            onClick={async () => {
                                setPending(true);
                                const fd = new FormData();
                                fd.append("course_id", String(courseId));
                                fd.append("review_id", String(existingReview!.review_id));
                                await deleteAction(fd);
                                setPending(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete review
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={!rating || pending}
                        className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                        <Send className="h-4 w-4" />
                        {pending ? "Submitting…" : isEdit ? "Update Review" : "Submit Review"}
                    </button>
                </div>
            </form>
        </div>
    );
}
