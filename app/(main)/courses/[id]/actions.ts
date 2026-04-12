"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { enrollUser, unenrollUser, isAlreadyEnrolled } from "@/db/enrollment";
import { createReview, updateReview, deleteReview, getExistingReview } from "@/db/review";

// ── Enroll ─────────────────────────────────────────────────────────────────────

export async function enrollAction(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const role = roles[0]?.name ?? "student";
    if (role !== "student") return;

    const courseId = Number(formData.get("course_id"));
    if (!courseId || isNaN(courseId)) return;

    const already = await isAlreadyEnrolled(session.user_id, courseId);
    if (already) {
        revalidatePath(`/courses/${courseId}`);
        return;
    }

    await enrollUser(session.user_id, courseId);
    revalidatePath(`/courses/${courseId}`);
}

export async function unenrollAction(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) redirect("/signin");

    const courseId = Number(formData.get("course_id"));
    if (!courseId || isNaN(courseId)) return;

    await unenrollUser(session.user_id, courseId);
    revalidatePath(`/courses/${courseId}`);
}

// ── Review ─────────────────────────────────────────────────────────────────────

export async function submitReviewAction(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) redirect("/signin");

    // Only students may review
    const roles = await getUserRoles(session.user_id);
    const role = roles[0]?.name ?? "student";
    if (role !== "student") return;

    const courseId = Number(formData.get("course_id"));
    const rating = Number(formData.get("rating"));
    const reviewText = ((formData.get("review_text") as string) ?? "").trim();

    if (!courseId || !rating || rating < 1 || rating > 5) return;

    // Must be enrolled to review
    const enrolled = await isAlreadyEnrolled(session.user_id, courseId);
    if (!enrolled) return;

    // Upsert: update if already reviewed, create otherwise
    const existing = await getExistingReview(session.user_id, courseId);
    if (existing) {
        await updateReview(existing.review_id, rating, reviewText);
    } else {
        await createReview(session.user_id, courseId, rating, reviewText);
    }

    revalidatePath(`/courses/${courseId}`);
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) redirect("/signin");

    const courseId = Number(formData.get("course_id"));
    const reviewId = Number(formData.get("review_id"));
    if (!courseId || !reviewId) return;

    // Only the review owner may delete
    const existing = await getExistingReview(session.user_id, courseId);
    if (!existing || existing.review_id !== reviewId) return;

    await deleteReview(reviewId);
    revalidatePath(`/courses/${courseId}`);
}
