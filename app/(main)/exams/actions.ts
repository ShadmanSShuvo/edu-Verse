"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getInstructorByUserId } from "@/db/instructor";
import { createQuestion, deleteQuestion } from "@/db/question";
import {
    getStudentIdByUserId,
    submitExamAttemptTransaction,
} from "@/db/attempt";
import { getQuestions } from "@/db/question";
import { pool } from "@/lib/db";

// ── Guard helpers ──────────────────────────────────────────────────────────────

async function requireStudent() {
    const session = await getSession();
    if (!session) redirect("/signin");
    const roles = await getUserRoles(session.user_id);
    const role = roles[0]?.name ?? "student";
    if (role !== "student") redirect("/exams");
    return session;
}

async function requireInstructor() {
    const session = await getSession();
    if (!session) redirect("/signin");
    const instructor = await getInstructorByUserId(session.user_id);
    if (!instructor) redirect("/signin");
    return { session, instructor };
}

// ── Submit exam attempt ────────────────────────────────────────────────────────

/**
 * Called when a student submits the exam form.
 * FormData contains: exam_id, and one entry per question keyed as `q_<ques_id>`.
 * Grading is now handled server-side via the `proc_submit_attempt` procedure.
 */
export async function submitAttemptAction(prevState: any, formData: FormData) {
    let examId: number | null = null;
    try {
        const session = await requireStudent();

        examId = Number(formData.get("exam_id"));
        if (!examId || isNaN(examId)) {
            return { error: "Missing or invalid exam ID.", status: 400, success: false };
        }

        // Get the student record
        const studentId = await getStudentIdByUserId(session.user_id);
        if (!studentId) {
            return { error: "Student record not found. Please log in again.", status: 404, success: false };
        }

        // Collect responses from form data
        const responses: { quesId: number; answer: string }[] = [];
        for (const [key, value] of Array.from(formData.entries())) {
            if (key.startsWith("q_")) {
                const quesId = Number(key.replace("q_", ""));
                responses.push({ quesId, answer: value as string });
            }
        }

        // Use explicit manual transaction to avoid procedure/nested transaction conflicts
        const client = await pool.connect();
        let attempt;
        try {
            await client.query("BEGIN");

            // 1. Find active attempt
            const attemptRes = await client.query(
                `SELECT a.*, e.duration FROM attempt a 
                 JOIN exam e ON a.exam_id = e.exam_id
                 WHERE a.student_id = $1 AND a.exam_id = $2 AND a.submitted_at IS NULL
                 ORDER BY a.started_at DESC LIMIT 1`,
                [studentId, examId]
            );
            attempt = attemptRes.rows[0];

            if (!attempt) {
                throw new Error("No active exam session found. Please restart.");
            }

            // 2. Clear and Insert responses
            await client.query(`DELETE FROM response WHERE attempt_id = $1`, [attempt.attempt_id]);
            for (const r of responses) {
                await client.query(
                    `INSERT INTO response(attempt_id, ques_id, response_text) VALUES($1, $2, $3)`,
                    [attempt.attempt_id, r.quesId, r.answer]
                );
            }

            // 3. Grade using procedure (now without internal COMMIT)
            await client.query(`CALL proc_submit_attempt($1)`, [attempt.attempt_id]);

            await client.query("COMMIT");
        } catch (dbErr) {
            await client.query("ROLLBACK");
            throw dbErr;
        } finally {
            client.release();
        }

        revalidatePath(`/exams/${examId}`);
        revalidatePath("/exams");

        // The component will check state.success before the redirect completes
        return { success: true, attempt_id: attempt.attempt_id, redirect: `/exams/${examId}/result/${attempt.attempt_id}` };
    } catch (error: any) {
        // If it's a redirect object from the success return (handled by caller/component)
        // Actually we handle redirect in the component or here.
        // Let's just return the success state and handle redirect in useEffect in component.
        
        if (error.code === '23505' || error.code === 'P0002' || error.code === 'P0003') {
            return { error: error.message || "Invalid submission.", status: 400, success: false };
        }

        console.error("Exam submission failed:", error);
        return { 
            error: error.message || "An unexpected error occurred.", 
            status: 500,
            success: false
        };
    }
}

// ── Question CRUD (instructor) ─────────────────────────────────────────────────

export async function addQuestionAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const examId = Number(formData.get("exam_id"));
    const statement = (formData.get("ques_statement") as string)?.trim();
    const opt1 = (formData.get("opt1") as string)?.trim();
    const opt2 = (formData.get("opt2") as string)?.trim();
    const opt3 = (formData.get("opt3") as string)?.trim();
    const opt4 = (formData.get("opt4") as string)?.trim();
    const correctAns = (formData.get("correct_ans") as string)?.trim();

    if (!examId || !statement || !opt1 || !opt2 || !correctAns) return;

    // Store options as a JSON array string
    const options = JSON.stringify([opt1, opt2, opt3, opt4].filter(Boolean));

    await createQuestion(examId, statement, options, correctAns);
    revalidatePath(`/exams/${examId}`);
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
    await requireInstructor();

    const quesId = Number(formData.get("ques_id"));
    const examId = Number(formData.get("exam_id"));
    if (!quesId) return;

    await deleteQuestion(quesId);
    revalidatePath(`/exams/${examId}`);
}
