"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getInstructorByUserId } from "@/db/instructor";
import {
    createComment,
    deleteComment,
    createReply,
    deleteReply,
} from "@/db/comments";
import {
    createNotification,
    getInstructorUserIdsForModule,
    getCommentOwnerUserId,
    getModuleContext,
} from "@/db/notifications";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function requireAuth() {
    const session = await getSession();
    if (!session) redirect("/signin");
    return session;
}

async function getRole(userId: number) {
    const roles = await getUserRoles(userId);
    return roles[0]?.name ?? "student";
}

// ── STUDENT: Post a question/comment ──────────────────────────────────────────

export async function postCommentAction(formData: FormData): Promise<void> {
    const session = await requireAuth();

    const moduleId = Number(formData.get("module_id"));
    const commentText = (formData.get("comment_text") as string)?.trim();

    if (!moduleId || !commentText) return;

    // Only students can post questions
    const role = await getRole(session.user_id);
    if (role === "instructor") return;

    const comment = await createComment(session.user_id, moduleId, commentText);

    // 🔔 Notify all instructors who teach this module's course
    const ctx = await getModuleContext(moduleId);
    const instructorUserIds = await getInstructorUserIdsForModule(moduleId);
    const msg = ctx
        ? `New question in "${ctx.moduleTitle}" (${ctx.courseTitle}) from ${session.name}`
        : `New question posted in a module by ${session.name}`;

    await Promise.all(
        instructorUserIds.map((uid) =>
            createNotification(uid, msg, `/modules/${moduleId}`)
        )
    );

    revalidatePath(`/modules/${moduleId}`);
}

// ── STUDENT: Delete own comment ────────────────────────────────────────────────

export async function deleteCommentAction(formData: FormData): Promise<void> {
    const session = await requireAuth();

    const commentId = Number(formData.get("comment_id"));
    const moduleId = Number(formData.get("module_id"));
    if (!commentId || !moduleId) return;

    const role = await getRole(session.user_id);
    const ownerUserId = Number(formData.get("owner_user_id"));

    if (role !== "instructor" && ownerUserId !== session.user_id) return;

    await deleteComment(commentId);
    revalidatePath(`/modules/${moduleId}`);
}

// ── INSTRUCTOR: Post a reply ───────────────────────────────────────────────────

export async function postReplyAction(formData: FormData): Promise<void> {
    const session = await requireAuth();

    const role = await getRole(session.user_id);
    if (role !== "instructor") return;

    const commentId = Number(formData.get("comment_id"));
    const moduleId = Number(formData.get("module_id"));
    const replyText = (formData.get("reply_text") as string)?.trim();

    if (!commentId || !replyText || !moduleId) return;

    await createReply(commentId, replyText, session.user_id);

    // 🔔 Notify the student who asked the question
    const studentUserId = await getCommentOwnerUserId(commentId);
    if (studentUserId && studentUserId !== session.user_id) {
        const ctx = await getModuleContext(moduleId);
        const msg = ctx
            ? `Your question in "${ctx.moduleTitle}" (${ctx.courseTitle}) was answered by ${session.name}`
            : `Your question was answered by ${session.name}`;
        await createNotification(studentUserId, msg, `/modules/${moduleId}`);
    }

    revalidatePath(`/modules/${moduleId}`);
}

// ── INSTRUCTOR: Delete a reply ────────────────────────────────────────────────

export async function deleteReplyAction(formData: FormData): Promise<void> {
    const session = await requireAuth();

    const role = await getRole(session.user_id);
    if (role !== "instructor") return;

    const replyId = Number(formData.get("reply_id"));
    const moduleId = Number(formData.get("module_id"));
    if (!replyId || !moduleId) return;

    await deleteReply(replyId);
    revalidatePath(`/modules/${moduleId}`);
}
