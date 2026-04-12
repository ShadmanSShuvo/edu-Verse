import { pool } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

/** Returns true if the user (by user_id) is already enrolled in the course. */
export async function isAlreadyEnrolled(
  userId: number,
  courseId: number
): Promise<boolean> {
  const res = await pool.query(
    `SELECT 1
     FROM enrollment e
     JOIN student s ON e.student_id = s.student_id
     WHERE s.user_id = $1 AND e.course_id = $2
     LIMIT 1`,
    [userId, courseId]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function enrollUser(
  userId: number,
  courseId: number,
  orderId?: number
) {
  // 1. Ensure the user has a student profile record
  let studentRes = await pool.query(
    "SELECT student_id FROM student WHERE user_id = $1",
    [userId]
  );
  
  let studentId;
  if (studentRes.rowCount === 0) {
    const newStudent = await pool.query(
      "INSERT INTO student(user_id) VALUES($1) RETURNING student_id",
      [userId]
    );
    studentId = newStudent.rows[0].student_id;
  } else {
    studentId = studentRes.rows[0].student_id;
  }

  // 3. Perform the enrollment
  const res = await pool.query(
    `INSERT INTO enrollment(student_id, course_id, order_id)
     VALUES($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [studentId, courseId, orderId ?? null]
  );

  if (res.rows[0]) {
    revalidateTag(`user-${userId}-enrollments`, 'default');
    revalidateTag(`user-${userId}-exams`, 'default');
    revalidateTag('enrollments', 'default');
    revalidatePath('/my-courses', 'page');
    revalidatePath('/modules', 'page');
    revalidatePath('/exams', 'page');
    return res.rows[0];
  }

  // 4. Return existing enrollment if already there
  const check = await pool.query(
    `SELECT * FROM enrollment WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId]
  );
  return check.rows[0];
}

export async function unenrollUser(userId: number, courseId: number) {
  const res = await pool.query(
    `DELETE FROM enrollment
     WHERE student_id = (SELECT student_id FROM student WHERE user_id = $1)
       AND course_id = $2
     RETURNING *`,
    [userId, courseId]
  );
  if (res.rows[0]) {
    revalidateTag(`user-${userId}-enrollments`, 'default');
    revalidateTag(`user-${userId}-exams`, 'default');
    revalidateTag('enrollments', 'default');
    revalidatePath('/my-courses', 'page');
    revalidatePath('/modules', 'page');
    revalidatePath('/exams', 'page');
  }
  return res.rows[0] ?? null;
}

/** Update a student's progress (0–100) for a course. */
export async function updateProgress(
  userId: number,
  courseId: number,
  progress: number
) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const res = await pool.query(
    `UPDATE enrollment
     SET progress = $3
     WHERE student_id = (SELECT student_id FROM student WHERE user_id = $1)
       AND course_id = $2
     RETURNING *`,
    [userId, courseId, clamped]
  );
  if (res.rows[0]) {
    revalidateTag(`user-${userId}-enrollments`, 'default');
    revalidateTag(`user-${userId}-exams`, 'default');
    revalidateTag('enrollments', 'default');
    revalidatePath('/my-courses', 'page');
    revalidatePath('/modules', 'page');
    revalidatePath('/exams', 'page');
  }
  return res.rows[0] ?? null;
}

/** Get progress (0–100) for a student in a course. */
export async function getProgress(
  userId: number,
  courseId: number
): Promise<number> {
  const res = await pool.query(
    `SELECT COALESCE(e.progress, 0) AS progress
     FROM enrollment e
     JOIN student s ON e.student_id = s.student_id
     WHERE s.user_id = $1 AND e.course_id = $2
     LIMIT 1`,
    [userId, courseId]
  );
  return parseFloat(res.rows[0]?.progress ?? "0");
}

import { unstable_cache } from "next/cache";

export async function getStudentEnrollments(userId: number, options: {
  q?: string;
  filter?: string;
  sort?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { q, filter, sort, limit, offset } = options;
  const cacheKey = `student-enrollments-${userId}-${q ?? 'all'}-${filter ?? 'all'}-${sort ?? 'all'}-${limit ?? 'none'}-${offset ?? 'none'}`;
  
  return unstable_cache(
    async () => {
      const values: any[] = [userId];
      let whereClauses = [`s.user_id = $1`];
      
      if (q) {
        values.push(`%${q}%`);
        whereClauses.push(`(c.title ILIKE $${values.length} OR c.description ILIKE $${values.length})`);
      }
      
      if (filter === "completed") whereClauses.push(`e.progress >= 100`);
      else if (filter === "in-progress") whereClauses.push(`e.progress > 0 AND e.progress < 100`);
      else if (filter === "not-started") whereClauses.push(`e.progress = 0`);
      
      let orderBy = 'e.enrollment_id DESC';
      if (sort === "progress") orderBy = 'e.progress DESC';
      
      const query = `
        SELECT c.course_id, c.title, c.description, c.price,
               e.enrolled_at, COALESCE(e.progress, 0) AS progress
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        JOIN course c ON e.course_id = c.course_id
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY ${orderBy}
        ${limit !== undefined ? `LIMIT ${limit}` : ''}
        ${offset !== undefined ? `OFFSET ${offset}` : ''}
      `;
      
      const res = await pool.query(query, values);
      return res.rows;
    },
    [cacheKey],
    { revalidate: 3600, tags: [`user-${userId}-enrollments`] }
  )();
}

export async function getStudentEnrollmentsCount(userId: number, options: {
  q?: string;
  filter?: string;
} = {}) {
  const { q, filter } = options;
  const cacheKey = `student-enrollments-count-${userId}-${q ?? 'all'}-${filter ?? 'all'}`;
  
  return unstable_cache(
    async () => {
      const values: any[] = [userId];
      let whereClauses = [`s.user_id = $1`];
      
      if (q) {
        values.push(`%${q}%`);
        whereClauses.push(`(c.title ILIKE $${values.length} OR c.description ILIKE $${values.length})`);
      }
      
      if (filter === "completed") whereClauses.push(`e.progress >= 100`);
      else if (filter === "in-progress") whereClauses.push(`e.progress > 0 AND e.progress < 100`);
      else if (filter === "not-started") whereClauses.push(`e.progress = 0`);
      
      const query = `
        SELECT COUNT(*)::int as count
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        JOIN course c ON e.course_id = c.course_id
        WHERE ${whereClauses.join(' AND ')}
      `;
      
      const res = await pool.query(query, values);
      return res.rows[0].count;
    },
    [cacheKey],
    { revalidate: 3600, tags: [`user-${userId}-enrollments`] }
  )();
}

export async function getEnrollments() {
  const res = await pool.query(`
    SELECT u.name, c.title, COALESCE(e.progress, 0) AS progress,
           e.enrolled_at
    FROM enrollment e
    JOIN student s ON e.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN course c ON e.course_id = c.course_id
  `);
  return res.rows;
}
