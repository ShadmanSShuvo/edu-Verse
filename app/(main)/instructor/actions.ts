"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createInstructor, getInstructorByUserId, updateInstructorSubject } from "@/db/instructor";
import { createCourse } from "@/db/courses";
import { assignInstructorToCourse } from "@/db/instructs";
import { createModule, updateModule, deleteModule } from "@/db/modules";
import { createMaterial, deleteMaterial } from "@/db/material";
import { createExam, updateExam, deleteExam, publishExam } from "@/db/exam";
import { createQuestion, deleteQuestion } from "@/db/question";
import { getSubjects, createSubject } from "@/db/subject";
import { assignCourseToSubject } from "@/db/course-subject";
import { pool } from "@/lib/db";
import { getUserRoles } from "@/db/roles";
import { uploadToSupabase } from "@/lib/storage";

// ── Auth guard ─────────────────────────────────────────────────────────────────
async function requireInstructor() {
    const session = await getSession();
    if (!session) redirect("/signin");

    const roles = await getUserRoles(session.user_id);
    const isAdmin = roles.some((r: any) => r.name === "admin");
    
    let instructor = await getInstructorByUserId(session.user_id);

    if (!instructor) {
        if (isAdmin) {
            // Automatically create instructor record for admin if it doesn't exist
            instructor = await createInstructor(session.user_id, "System Administrator");
        } else {
            redirect("/signin");
        }
    }

    return { session, instructor };
}

// ── COURSE ─────────────────────────────────────────────────────────────────────

export async function createCourseAction(formData: FormData) {
    const { instructor } = await requireInstructor();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    const price = parseFloat((formData.get("price") as string) ?? "0") || 0;
    if (!title) return;

    const course = await createCourse(title, description, price);
    await assignInstructorToCourse(instructor.instructor_id, course.course_id);

    // Assign subject: prefer existing selection, fall back to creating a new one
    const subjectId = Number(formData.get("subject_id") ?? 0);
    const newSubjectName = (formData.get("new_subject") as string)?.trim();
    if (subjectId > 0) {
        await assignCourseToSubject(course.course_id, subjectId);
    } else if (newSubjectName) {
        const newSub = await createSubject(newSubjectName);
        await assignCourseToSubject(course.course_id, newSub.subject_id);
    }

    revalidatePath("/instructor");
    revalidatePath("/admin");
}

// ── SUBJECT ────────────────────────────────────────────────────────────────────

export async function getSubjectsAction() {
    return getSubjects();
}

export async function createSubjectAction(formData: FormData) {
    await requireInstructor();
    const name = (formData.get("subject_name") as string)?.trim();
    if (!name) return;
    await createSubject(name);
    revalidatePath("/instructor");
}

export async function assignSubjectAction(formData: FormData) {
    await requireInstructor();
    const courseId = Number(formData.get("course_id"));
    const subjectId = Number(formData.get("subject_id"));
    const newSubjectName = (formData.get("new_subject") as string)?.trim();
    if (!courseId) return;
    if (subjectId > 0) {
        await assignCourseToSubject(courseId, subjectId);
    } else if (newSubjectName) {
        const newSub = await createSubject(newSubjectName);
        await assignCourseToSubject(courseId, newSub.subject_id);
    }
    revalidatePath("/instructor");
}

export async function updateCourseAction(formData: FormData) {
    await requireInstructor();
    const courseId = Number(formData.get("course_id"));
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    const price = parseFloat((formData.get("price") as string) ?? "0") || 0;
    if (!courseId || !title) return;

    await pool.query(
        `UPDATE course SET title=$1, description=$2, price=$3 WHERE course_id=$4`,
        [title, description, price, courseId]
    );
    revalidatePath("/instructor");
}

export async function deleteCourseAction(formData: FormData) {
    await requireInstructor();
    const courseId = Number(formData.get("course_id"));
    if (!courseId) return;
    await pool.query(`DELETE FROM course WHERE course_id=$1`, [courseId]);
    revalidatePath("/instructor");
}

// ── MODULE ─────────────────────────────────────────────────────────────────────

export async function createModuleAction(formData: FormData) {
    await requireInstructor();
    const courseId = Number(formData.get("course_id"));
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    if (!courseId || !title) return;
    await createModule(courseId, title, description);
    revalidatePath("/instructor");
}

export async function updateModuleAction(formData: FormData) {
    await requireInstructor();
    const moduleId = Number(formData.get("module_id"));
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    if (!moduleId || !title) return;
    await updateModule(moduleId, title, description);
    revalidatePath("/instructor");
}

export async function deleteModuleAction(formData: FormData) {
    await requireInstructor();
    const moduleId = Number(formData.get("module_id"));
    if (!moduleId) return;
    await deleteModule(moduleId);
    revalidatePath("/instructor");
}

// ── MATERIAL ───────────────────────────────────────────────────────────────────

export async function addMaterialAction(formData: FormData) {
    const { instructor } = await requireInstructor();
    const moduleId = Number(formData.get("module_id"));
    const typeId = Number(formData.get("type_id"));
    const name = (formData.get("name") as string)?.trim();
    let url = (formData.get("url") as string)?.trim();

    const file = formData.get("file") as File | null;

    if (file && file.size > 0) {
        // Handle file upload via Supabase Storage
        url = await uploadToSupabase(file);
    }

    if (!moduleId || !typeId || !name || !url) return;
    await createMaterial(moduleId, typeId, name, url, instructor.instructor_id);
    revalidatePath("/instructor");
}

export async function deleteMaterialAction(formData: FormData) {
    await requireInstructor();
    const materialId = Number(formData.get("material_id"));
    if (!materialId) return;
    await deleteMaterial(materialId);
    revalidatePath("/instructor");
}

// ── EXAM ───────────────────────────────────────────────────────────────────────

export async function createExamAction(formData: FormData) {
    const { session, instructor } = await requireInstructor();
    const moduleId = Number(formData.get("module_id"));
    const title = (formData.get("title") as string)?.trim();
    const marks = Number(formData.get("marks")) || 0;
    const duration = Number(formData.get("duration")) || 0;
    const isPublished = formData.get("is_published") === "true";
    if (!moduleId || !title) return;

    const roles = await getUserRoles(session.user_id);
    const isAdmin = roles.some((r: any) => r.name === "admin");

    if (!isAdmin) {
        if (!instructor.subject_id) {
            throw new Error("Unauthorized: You must be assigned to a subject to create an exam.");
        }
        
        // Verify that the module's course belongs to the instructor's assigned subject
        const { rows } = await pool.query(`
            SELECT 1 
            FROM module m 
            JOIN course_sub cs ON m.course_id = cs.course_id 
            WHERE m.module_id = $1 AND cs.subject_id = $2
        `, [moduleId, instructor.subject_id]);
        
        if (rows.length === 0) {
            throw new Error("Unauthorized: Module does not belong to a course in your assigned subject.");
        }
    }

    await createExam(moduleId, title, marks, duration, isPublished);
    revalidatePath("/instructor");
}

export async function publishExamAction(formData: FormData) {
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
    revalidatePath("/instructor");
}

export async function updateExamAction(formData: FormData) {
    await requireInstructor();
    const examId = Number(formData.get("exam_id"));
    const title = (formData.get("title") as string)?.trim();
    const marks = Number(formData.get("marks")) || 0;
    const duration = Number(formData.get("duration")) || 0;
    if (!examId || !title) return;
    try {
        await updateExam(examId, title, marks, duration);
    } catch (error: any) {
        if (error.code === 'P0001') {
            throw new Error('Published exams cannot be edited or deleted.');
        }
        throw error;
    }
    revalidatePath("/instructor");
}

export async function deleteExamAction(formData: FormData) {
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
    revalidatePath("/instructor");
}

// ── QUESTION ───────────────────────────────────────────────────────────────────

export async function assignInstructorSubjectAction(formData: FormData) {
    const { instructor } = await requireInstructor();
    const subjectId = Number(formData.get("subject_id"));
    if (!subjectId) return;
    await updateInstructorSubject(instructor.instructor_id, subjectId);
    revalidatePath("/instructor");
}

export async function addQuestionAction(formData: FormData) {
    await requireInstructor();
    const examId = Number(formData.get("exam_id"));
    const statement = (formData.get("ques_statement") as string)?.trim();
    const optA = (formData.get("opt_a") as string)?.trim();
    const optB = (formData.get("opt_b") as string)?.trim();
    const optC = (formData.get("opt_c") as string)?.trim();
    const optD = (formData.get("opt_d") as string)?.trim();
    const correct = (formData.get("correct_ans") as string)?.trim();
    if (!examId || !statement || !optA || !optB || !optC || !optD || !correct) return;
    const options = JSON.stringify([optA, optB, optC, optD]);
    try {
        await createQuestion(examId, statement, options, correct);
    } catch (error: any) {
        if (error.code === 'P0001') {
            throw new Error('Published exams cannot be edited or deleted.');
        }
        throw error;
    }
    revalidatePath("/instructor");
}

export async function deleteQuestionAction(formData: FormData) {
    await requireInstructor();
    const quesId = Number(formData.get("ques_id"));
    if (!quesId) return;
    try {
        await deleteQuestion(quesId);
    } catch (error: any) {
        if (error.code === 'P0001') {
            throw new Error('Published exams cannot be edited or deleted.');
        }
        throw error;
    }
    revalidatePath("/instructor");
}
