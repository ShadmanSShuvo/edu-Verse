import { pool } from "@/lib/db";

export async function assignCourseToSubject(courseId: number, subjectId: number) {
  const res = await pool.query(
    `INSERT INTO course_sub(course_id, subject_id) VALUES($1, $2) RETURNING *`,
    [courseId, subjectId],
  );
  return res.rows[0];
}

export async function getCourseSubjects(courseId: number) {
  const res = await pool.query(
    `SELECT s.subject_id, s.subject_name
     FROM course_sub cs
     JOIN subject s ON cs.subject_id=s.subject_id
     WHERE cs.course_id=$1`,
    [courseId],
  );
  return res.rows;
}
