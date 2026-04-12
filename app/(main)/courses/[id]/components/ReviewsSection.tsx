import { getReviews, getExistingReview } from "@/db/review";
import { isAlreadyEnrolled } from "@/db/enrollment";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { Star } from "lucide-react";
import { ReviewForm } from "@/components/review-form";
import { submitReviewAction, deleteReviewAction } from "../actions";

type Review = {
    review_id: number;
    user_id: number;
    rating: number;
    review_text: string | null;
    user_name: string;
};

export async function ReviewsSection({ 
    courseId, 
}: { 
    courseId: number; 
}) {
    const session = await getSession();
    let viewerRole: "guest" | "student" | "instructor" | "admin" = "guest";
    let userId: number | null = null;

    if (session) {
        userId = session.user_id;
        const roles = await getUserRoles(userId);
        viewerRole = roles.some((r: any) => r.name === "admin") ? "admin" : (roles[0]?.name ?? "student");
    }

    const reviews = await getReviews(courseId) as Review[];
    
    let enrolled = false;
    let existingReview: { review_id: number; rating: number; review_text: string | null } | null = null;

    if (userId && viewerRole === "student") {
        enrolled = await isAlreadyEnrolled(userId, courseId);
        if (enrolled) {
            existingReview = await getExistingReview(userId, courseId);
        }
    }

    return (
        <div>
            <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
                Student Reviews{" "}
                {reviews.length > 0 && (
                    <span className="text-base font-normal text-gray-400 dark:text-gray-500">
                        ({reviews.length})
                    </span>
                )}
            </h2>

            {viewerRole === "student" && enrolled && (
                <div className="mb-6">
                    <ReviewForm
                        courseId={courseId}
                        existingReview={existingReview}
                        submitAction={submitReviewAction}
                        deleteAction={deleteReviewAction}
                    />
                </div>
            )}

            {viewerRole === "student" && !enrolled && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-dashed border-violet-200 bg-violet-50 dark:bg-violet-500/10 dark:border-violet-500/20 px-5 py-4 text-sm text-violet-700 dark:text-violet-300">
                    <Star className="h-4 w-4 flex-shrink-0 text-violet-400" />
                    Enroll in this course to leave a review.
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 py-10 text-center">
                    <Star className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        No reviews yet. Be the first to review!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {reviews.map((rev) => {
                        const initials = rev.user_name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase();
                        return (
                            <div
                                key={rev.review_id}
                                className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-5 shadow-sm"
                            >
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white">
                                        {initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {rev.user_name}
                                        </p>
                                        <div className="mt-0.5 flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <Star
                                                    key={n}
                                                    className={`h-3 w-3 ${n <= rev.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-gray-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {rev.review_text && (
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        {rev.review_text}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
