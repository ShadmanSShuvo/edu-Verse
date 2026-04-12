"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { deleteUser, deleteCourse } from "@/db/admin";

async function requireAdmin() {
    const session = await getSession();
    if (!session) redirect("/signin");
    const roles = await getUserRoles(session.user_id);
    if (!roles.some(r => r.name === "admin")) redirect("/dashboard");
    return session;
}

export async function deleteUserAction(formData: FormData) {
    await requireAdmin();
    const userId = Number(formData.get("user_id"));
    if (userId) await deleteUser(userId);
    revalidatePath("/admin");
}

export async function deleteCourseAdminAction(formData: FormData) {
    await requireAdmin();
    const courseId = Number(formData.get("course_id"));
    if (courseId) await deleteCourse(courseId);
    revalidatePath("/admin");
}
