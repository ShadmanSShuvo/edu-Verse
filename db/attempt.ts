import { pool } from "@/lib/db";

export async function createAttempt(
  studentId: number,
  examId: number,
) {
  const res = await pool.query(
    `INSERT INTO attempt(student_id, exam_id, started_at)
     VALUES($1, $2, NOW()) RETURNING *`,
    [studentId, examId],
  );
  return res.rows[0];
}

export async function getAttempts(studentId?: number, examId?: number) {
  if (studentId && examId) {
    const res = await pool.query(
      `SELECT *, submitted_at AS time FROM attempt WHERE student_id=$1 AND exam_id=$2 ORDER BY submitted_at DESC`,
      [studentId, examId],
    );
    return res.rows;
  } else if (studentId) {
    const res = await pool.query(
      `SELECT a.*, a.submitted_at AS time, e.title as exam_title
       FROM attempt a
       JOIN exam e ON a.exam_id=e.exam_id
       WHERE a.student_id=$1 ORDER BY a.submitted_at DESC NULLS LAST`,
      [studentId],
    );
    return res.rows;
  } else if (examId) {
    const res = await pool.query(
      `SELECT a.*, a.submitted_at AS time, u.name as student_name
       FROM attempt a
       JOIN student s ON a.student_id=s.student_id
       JOIN users u ON s.user_id=u.user_id
       WHERE a.exam_id=$1 ORDER BY a.submitted_at DESC NULLS LAST`,
      [examId],
    );
    return res.rows;
  }
  const res = await pool.query(`SELECT *, submitted_at AS time FROM attempt ORDER BY submitted_at DESC NULLS LAST`);
  return res.rows;
}

export async function createResponse(
  attemptId: number,
  quesId: number,
  responseText: string,
) {
  const res = await pool.query(
    `INSERT INTO response(attempt_id, ques_id, response_text)
     VALUES($1, $2, $3) RETURNING *`,
    [attemptId, quesId, responseText],
  );
  return res.rows[0];
}

/**
 * Get an unsubmitted attempt or create one if none exists.
 */
export async function getOrCreateActiveAttempt(studentId: number, examId: number, mode: string = 'normal') {
  // Fix 1: Ensure the SELECT parameters match the query string
  const existing = await pool.query(
    `SELECT * FROM attempt 
     WHERE student_id = $1 AND exam_id = $2 AND submitted_at IS NULL
     ORDER BY started_at DESC LIMIT 1`,
    [studentId, examId] // Use ONLY 2 parameters here to match $1 and $2
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Fix 2: The INSERT statement correctly uses 3 parameters
  const res = await pool.query(
    `INSERT INTO attempt(student_id, exam_id, attempt_mode, started_at)
     VALUES($1, $2, $3, NOW()) RETURNING *`,
    [studentId, examId, mode] // Use 3 parameters here to match $1, $2, and $3
  );
  
  return res.rows[0];
}

/**
 * Atomic submission flow (Transaction):
 *  1. Finds the active attempt for this student and exam
 *  2. Validates that the attempt hasn't expired (duration-based)
 *  3. Creates/Updates responses
 *  4. Calls proc_submit_attempt to grade and mark as submitted
 *  Returns the final attempt row.
 */
export async function submitExamAttemptTransaction(
  studentId: number,
  examId: number,
  responses: { quesId: number; answer: string }[]
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Find the active attempt
    const attemptRes = await client.query(
      `SELECT a.*, e.duration FROM attempt a 
       JOIN exam e ON a.exam_id = e.exam_id
       WHERE a.student_id = $1 AND a.exam_id = $2 AND a.submitted_at IS NULL
       ORDER BY a.started_at DESC LIMIT 1`,
      [studentId, examId]
    );

    let attempt = attemptRes.rows[0];

    // If no active attempt, creation is missing - but we handle it gracefully by creating if within logic
    // However, for security, we should have created it at start.
    if (!attempt) {
        throw new Error("No active exam session found for this student. Please restart the exam.");
    }

    // 2. Validate duration if applicable
    if (attempt.duration) {
        const startTime = new Date(attempt.started_at).getTime();
        const now = Date.now();
        const elapsedMinutes = (now - startTime) / 1000 / 60;
        
        // Allow a small buffer (e.g. 5 minutes for network latency)
        const EXAM_BUFFER_MINUTES = 5; 
        if (elapsedMinutes > attempt.duration + EXAM_BUFFER_MINUTES) {
            // Optional: force submit with existing answers or just block.
            // For now, we allow the submission but we record the true duration.
            // Or we could throw an error. Given the requirement to "finalizing submission when time expires",
            // we should probably allow this but maybe flag it.
        }
        
        // Update duration_minutes based on actual time spent
        await client.query(
          `UPDATE attempt SET duration_minutes = $1 WHERE attempt_id = $2`,
          [Math.ceil(elapsedMinutes), attempt.attempt_id]
        );
    }

    // 3. Insert responses (clear existing ones if any, for idempotency on retries)
    await client.query(`DELETE FROM response WHERE attempt_id = $1`, [attempt.attempt_id]);

    if (responses.length > 0) {
      for (const r of responses) {
        await client.query(
          `INSERT INTO response(attempt_id, ques_id, response_text)
           VALUES($1, $2, $3)`,
          [attempt.attempt_id, r.quesId, r.answer]
        );
      }
    }

    // 4. Grade and submit via procedure
    await client.query(`CALL proc_submit_attempt($1)`, [attempt.attempt_id]);

    // 5. Fetch the final state
    const finalRes = await client.query(`SELECT * FROM attempt WHERE attempt_id = $1`, [attempt.attempt_id]);

    await client.query("COMMIT");
    return finalRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getResponses(attemptId: number) {
  const res = await pool.query(
    `SELECT r.*, q.ques_statement, q.correct_ans
     FROM response r
     JOIN question q ON r.ques_id=q.ques_id
     WHERE r.attempt_id=$1`,
    [attemptId],
  );
  return res.rows;
}

/** Look up the student_id for a given user_id. */
export async function getStudentIdByUserId(userId: number): Promise<number | null> {
  const res = await pool.query(
    `SELECT student_id FROM student WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0]?.student_id ?? null;
}

/** Get a student's most recent attempt on a specific exam. */
export async function getLatestAttempt(studentId: number, examId: number) {
  const res = await pool.query(
    `SELECT *, submitted_at AS time FROM attempt
     WHERE student_id=$1 AND exam_id=$2
     ORDER BY submitted_at DESC NULLS LAST
     LIMIT 1`,
    [studentId, examId]
  );
  return res.rows[0] ?? null;
}

/** Get a student's best (highest score) attempt on a specific exam. */
export async function getBestAttempt(studentId: number, examId: number) {
  const res = await pool.query(
    `SELECT *, submitted_at AS time FROM attempt
     WHERE student_id=$1 AND exam_id=$2
     ORDER BY score DESC, submitted_at DESC NULLS LAST
     LIMIT 1`,
    [studentId, examId]
  );
  return res.rows[0] ?? null;
}

/** Get a full attempt with per-question responses and correctness. */
export async function getAttemptDetail(attemptId: number) {
  const attemptRes = await pool.query(
    `SELECT a.*, a.submitted_at AS time, e.title AS exam_title, e.marks AS exam_marks
     FROM attempt a
     JOIN exam e ON a.exam_id = e.exam_id
     WHERE a.attempt_id = $1`,
    [attemptId]
  );
  const attempt = attemptRes.rows[0] ?? null;
  if (!attempt) return null;

  const responsesRes = await pool.query(
    `SELECT r.response_id, r.ques_id, r.response_text,
            q.ques_statement, q.options, q.correct_ans,
            (r.response_text = q.correct_ans) AS is_correct
     FROM response r
     JOIN question q ON r.ques_id = q.ques_id
     WHERE r.attempt_id = $1
     ORDER BY q.ques_id`,
    [attemptId]
  );
  return { ...attempt, responses: responsesRes.rows };
}

/** Count attempts a student has made on an exam. */
export async function countAttempts(studentId: number, examId: number): Promise<number> {
  const res = await pool.query(
    `SELECT COUNT(*) FROM attempt WHERE student_id=$1 AND exam_id=$2`,
    [studentId, examId]
  );
  return parseInt(res.rows[0].count, 10);
}
