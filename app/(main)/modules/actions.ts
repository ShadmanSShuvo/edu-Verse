"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getInstructorByUserId } from "@/db/instructor";
import { createModule, updateModule, deleteModule } from "@/db/modules";
import { createMaterial, deleteMaterial } from "@/db/material";
import { createExam, deleteExam, publishExam } from "@/db/exam";

// ── Guard: must be a logged-in instructor ─────────────────────────────────────
async function requireInstructor() {
    const session = await getSession();
    if (!session) redirect("/signin");

    const instructor = await getInstructorByUserId(session.user_id);
    if (!instructor) redirect("/signin");

    return { session, instructor };
}

// ── Module CRUD ───────────────────────────────────────────────────────────────

export async function createModuleAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const courseId = Number(formData.get("course_id"));
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";

    if (!courseId || !title) return;

    await createModule(courseId, title, description);
    revalidatePath("/modules");
}

export async function updateModuleAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const moduleId = Number(formData.get("module_id"));
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";

    if (!moduleId || !title) return;

    await updateModule(moduleId, title, description);
    revalidatePath("/modules");
}

export async function deleteModuleAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const moduleId = Number(formData.get("module_id"));
    if (!moduleId) return;

    await deleteModule(moduleId);
    revalidatePath("/modules");
}

// ── Material CRUD ─────────────────────────────────────────────────────────────

export async function addMaterialAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const moduleId = Number(formData.get("module_id"));
    const typeId = Number(formData.get("type_id"));
    const name = (formData.get("name") as string)?.trim();
    const url = (formData.get("url") as string)?.trim();

    if (!moduleId || !typeId || !name || !url) return;

    await createMaterial(moduleId, typeId, name, url);
    revalidatePath("/modules");
}

export async function deleteMaterialAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const materialId = Number(formData.get("material_id"));
    if (!materialId) return;

    await deleteMaterial(materialId);
    revalidatePath("/modules");
}

// ── Exam CRUD ─────────────────────────────────────────────────────────────────

export async function addExamAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const moduleId = Number(formData.get("module_id"));
    const title = (formData.get("title") as string)?.trim();
    const marks = Number(formData.get("marks")) || 0;
    const duration = Number(formData.get("duration")) || 0;
    const isPublished = formData.get("is_published") === "true";

    if (!moduleId || !title) return;

    await createExam(moduleId, title, marks, duration, isPublished);
    revalidatePath("/modules");
}

export async function publishExamAction(formData: FormData): Promise<void> {
    await requireInstructor();
    const examId = Number(formData.get("exam_id"));
    if (!examId) return;
    try {
        await publishExam(examId);
    } catch (error: any) {
        if (error.code === 'P0001') {
             throw new Error('Published exams cannot be edited or deleted.');
        }
        throw error;
    }
    revalidatePath("/modules");
}

export async function deleteExamAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const examId = Number(formData.get("exam_id"));
    if (!examId) return;

    try {
        await deleteExam(examId);
    } catch (error: any) {
        if (error.code === 'P0001') {
            throw new Error('Published exams cannot be edited or deleted.');
        }
        throw error;
    }
    revalidatePath("/modules");
}
