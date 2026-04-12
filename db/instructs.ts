import { pool } from "@/lib/db";

export async function assignInstructorToCourse(
  instructorId: number,
  courseId: number,
) {
  const res = await pool.query(
    `INSERT INTO instructs(instructor_id, course_id) VALUES($1, $2) RETURNING *`,
    [instructorId, courseId],
  );
  return res.rows[0];
}

export async function getInstructorCourses(instructorId: number) {
  const res = await pool.query(
    `SELECT c.course_id, c.title, c.description, c.price
     FROM instructs i
     JOIN course c ON i.course_id=c.course_id
     WHERE i.instructor_id=$1`,
    [instructorId],
  );
  return res.rows;
}

export async function getCourseInstructors(courseId: number) {
  const res = await pool.query(
    `SELECT i.instructor_id, i.bio, u.name, u.email
     FROM instructs ins
     JOIN instructor i ON ins.instructor_id=i.instructor_id
     JOIN users u ON i.user_id=u.user_id
     WHERE ins.course_id=$1`,
    [courseId],
  );
  return res.rows;
}
