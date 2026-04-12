import { pool } from "@/lib/db";
import { unstable_cache } from "next/cache";

/** Generic fetch for exams. */
export async function getExams(moduleId?: number, isPublished?: boolean) {
  const cacheKey = `exams-module-${moduleId ?? 'all'}-published-${isPublished ?? 'any'}`;
  return unstable_cache(
    async () => {
      let query = `SELECT exam_id, module_id, title, marks, duration, is_published, published_at FROM exam WHERE 1=1`;
      const values: any[] = [];
      let paramCount = 0;

      if (moduleId) {
        paramCount++;
        query += ` AND module_id=$${paramCount}`;
        values.push(moduleId);
      }

      if (isPublished !== undefined) {
        paramCount++;
        query += ` AND is_published=$${paramCount}`;
        values.push(isPublished);
      }

      const res = await pool.query(query, values);
      return res.rows;
    },
    [cacheKey],
    { revalidate: 3600, tags: ["exams", ...(moduleId ? [`module-${moduleId}-exams`] : [])] }
  )();
}

/** Single exam details. */
export async function getExamById(examId: number) {
  const res = await pool.query(
    `SELECT e.*, m.title AS module_title, c.course_id, c.title AS course_title
     FROM exam e
     JOIN module m ON e.module_id = m.module_id
     JOIN course c ON m.course_id = c.course_id
     WHERE e.exam_id = $1`,
    [examId]
  );
  return res.rows[0] || null;
}

/** Check if multiple roles can access a course/exam. */
export async function checkExamCourseAccess(examId: number, userId: number) {
  const res = await pool.query(
    `SELECT 1 FROM exam e
     JOIN module m ON e.module_id = m.module_id
     JOIN course c ON m.course_id = c.course_id
     JOIN enrollment en ON c.course_id = en.course_id
     JOIN student s ON en.student_id = s.student_id
     WHERE e.exam_id = $1 AND s.user_id = $2`,
    [examId, userId]
  );
  return res.rowCount !== null && res.rowCount > 0;
}

/** All exams for courses a student is enrolled in, with best score and attempt count. */
export async function getExamsForStudent(
  studentId: number,
  userId: number,
  options: { 
    courseId?: number; 
    status?: "pending" | "completed" | "all";
    page?: number;
    limit?: number;
  } = {}
) {
  const { courseId, status = "all", page = 1, limit = 12 } = options;
  const offset = (page - 1) * limit;

  // DIRECT JOIN: Enrollment -> Course -> Module -> Exam
  let query = `
    SELECT e.exam_id, e.title, e.marks, e.duration,
           m.module_id, m.title AS module_title,
           c.course_id, c.title AS course_title,
           MAX(a.score) as best_score,
           COUNT(a.attempt_id)::int as attempt_count
    FROM enrollment en
    JOIN course c ON en.course_id = c.course_id
    JOIN module m ON c.course_id = m.course_id
    JOIN exam e ON m.module_id = e.module_id
    LEFT JOIN attempt a ON (a.exam_id = e.exam_id AND a.student_id = en.student_id AND a.submitted_at IS NOT NULL)
    WHERE en.student_id = $1 AND e.is_published = TRUE
  `;
      
  const values: any[] = [studentId];
  let paramCount = 1;

  if (courseId) {
    paramCount++;
    query += ` AND c.course_id = $${paramCount}`;
    values.push(courseId);
  }

  query += ` GROUP BY e.exam_id, m.module_id, c.course_id, en.student_id`;

  if (status === "pending") {
    query += ` HAVING COUNT(a.attempt_id) = 0`;
  } else if (status === "completed") {
    query += ` HAVING COUNT(a.attempt_id) > 0`;
  }

  query += ` ORDER BY c.course_id, m.module_id, e.exam_id`;
  
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  values.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  values.push(offset);

  const res = await pool.query(query, values);
  return res.rows;
}

/** Get total count of exams for a student based on filters. */
export async function getExamsCountForStudent(
  studentId: number,
  userId: number,
  options: { courseId?: number; status?: "pending" | "completed" | "all" } = {}
) {
  const { courseId, status = "all" } = options;

  if (status === "pending" || status === "completed") {
    const values: any[] = [studentId];
    const subquery = `
      SELECT e.exam_id
      FROM enrollment en
      JOIN course c ON en.course_id = c.course_id
      JOIN module m ON c.course_id = m.course_id
      JOIN exam e ON m.module_id = e.module_id
      LEFT JOIN attempt a ON a.exam_id = e.exam_id AND a.student_id = en.student_id AND a.submitted_at IS NOT NULL
      WHERE en.student_id = $1 ${courseId ? `AND c.course_id = $2` : ''}
      GROUP BY e.exam_id
      HAVING ${status === "pending" ? 'COUNT(a.attempt_id) = 0' : 'COUNT(a.attempt_id) > 0'}
    `;
    
    if (courseId) values.push(courseId);
    
    const res = await pool.query(`SELECT COUNT(*)::int as total FROM (${subquery}) as filtered`, values);
    return res.rows[0]?.total ?? 0;
  }

  const values: any[] = [studentId];
  let paramCount = 1;
  let query = `
    SELECT COUNT(DISTINCT e.exam_id) as total
    FROM enrollment en
    JOIN course c ON en.course_id = c.course_id
    JOIN module m ON c.course_id = m.course_id
    JOIN exam e ON m.module_id = e.module_id
    WHERE en.student_id = $1 AND e.is_published = TRUE
  `;

  if (courseId) {
    paramCount++;
    query += ` AND c.course_id = $${paramCount}`;
    values.push(courseId);
  }

  const res = await pool.query(query, values);
  return parseInt(res.rows[0]?.total ?? "0", 10);
}

/** All exams for courses taught by an instructor, with module + course info. */
export async function getExamsForInstructor(instructorId: number) {
  // DIRECT JOIN: Instructs -> Course -> Module -> Exam
  const res = await pool.query(
    `SELECT e.exam_id, e.title, e.marks, e.duration, e.is_published, e.published_at,
            m.module_id, m.title AS module_title,
            c.course_id, c.title AS course_title
     FROM instructs ins
     JOIN course c ON ins.course_id = c.course_id
     JOIN module m ON c.course_id = m.course_id
     JOIN exam e ON m.module_id = e.module_id
     WHERE ins.instructor_id = $1
     ORDER BY c.course_id, m.module_id, e.exam_id`,
    [instructorId]
  );
  return res.rows;
}

/** All exams for courses within a specific subject, with module + course info. */
export async function getExamsBySubject(subjectId: number) {
  // DIRECT JOIN: CourseSub -> Course -> Module -> Exam
  const res = await pool.query(
    `SELECT e.exam_id, e.title, e.marks, e.duration, e.is_published, e.published_at,
            m.module_id, m.title AS module_title,
            c.course_id, c.title AS course_title
     FROM course_sub cs
     JOIN course c ON cs.course_id = c.course_id
     JOIN module m ON c.course_id = m.course_id
     JOIN exam e ON m.module_id = e.module_id
     WHERE cs.subject_id = $1
     ORDER BY c.course_id, m.module_id, e.exam_id`,
    [subjectId]
  );
  return res.rows;
}

/** Get all exams with module + course info (for admins). */
export async function getAllExamsWithDetails() {
  const res = await pool.query(
    `SELECT e.exam_id, e.title, e.marks, e.duration, e.is_published, e.published_at,
            m.module_id, m.title AS module_title,
            c.course_id, c.title AS course_title
     FROM course c
     JOIN module m ON c.course_id = m.course_id
     JOIN exam e ON m.module_id = e.module_id
     ORDER BY c.course_id, m.module_id, e.exam_id`
  );
  return res.rows;
}

/** Create a new exam. */
export async function createExam(
  moduleId: number,
  title: string,
  marks: number,
  duration: number,
  isPublished: boolean = false
) {
  const publishedAt = isPublished ? new Date() : null;
  const res = await pool.query(
    `INSERT INTO exam (module_id, title, marks, duration, is_published, published_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [moduleId, title, marks, duration, isPublished, publishedAt]
  );
  return res.rows[0];
}

/** Delete an exam. */
export async function deleteExam(examId: number) {
  const res = await pool.query(
    `DELETE FROM exam WHERE exam_id = $1 RETURNING *`,
    [examId]
  );
  return res.rows[0];
}

/** Mark an exam as published. Trigger trg_set_exam_publish_timestamp handles published_at. */
export async function publishExam(examId: number) {
  const res = await pool.query(
    `UPDATE exam SET is_published = TRUE WHERE exam_id = $1 RETURNING *`,
    [examId]
  );
  return res.rows[0];
}

/** Publish all currently unpublished exams. */
export async function publishAllDraftExams() {
  const res = await pool.query(
    `UPDATE exam SET is_published = TRUE WHERE is_published = FALSE RETURNING *`
  );
  return res.rows;
}

/** Update an exam. */
export async function updateExam(
  examId: number,
  title: string,
  marks: number,
  duration: number
) {
  const res = await pool.query(
    `UPDATE exam 
     SET title = $1, marks = $2, duration = $3 
     WHERE exam_id = $4 
     RETURNING *`,
    [title, marks, duration, examId]
  );
  return res.rows[0];
}

/** Get exams for multiple modules, with student stats. */
export async function getExamsByModuleIds(moduleIds: number[], studentId: number, userId: number) {
  if (!moduleIds || moduleIds.length === 0) return [];
  
  return unstable_cache(
    async () => {
      const res = await pool.query(
        `SELECT e.exam_id, e.title, e.marks, e.duration,
                m.module_id, m.title AS module_title,
                c.course_id, c.title AS course_title,
                MAX(a.score) as best_score,
                COUNT(a.attempt_id)::int as attempt_count
         FROM exam e
         JOIN module m ON e.module_id = m.module_id
         JOIN course c ON m.course_id = c.course_id
         LEFT JOIN attempt a ON (a.exam_id = e.exam_id AND a.student_id = $2 AND a.submitted_at IS NOT NULL)
         WHERE e.module_id = ANY($1) AND e.is_published = TRUE
         GROUP BY e.exam_id, m.module_id, c.course_id
         ORDER BY c.course_id, m.module_id, e.exam_id`,
        [moduleIds, studentId]
      );
      return res.rows;
    },
    [`exams-modules-${[...moduleIds].sort().join(",")}-student-${studentId}`],
    { revalidate: 3600, tags: [`user-${userId}-exams`, "exams"] }
  )();
}
