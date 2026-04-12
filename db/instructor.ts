import { pool } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function createInstructor(userId: number, bio?: string) {
  const res = await pool.query(
    `INSERT INTO instructor(user_id, bio) VALUES($1, $2) RETURNING *`,
    [userId, bio || null],
  );
  return res.rows[0];
}

export async function getInstructors() {
  const res = await pool.query(`
    SELECT i.instructor_id, i.user_id, i.bio, u.name, u.email
    FROM instructor i
    JOIN users u ON i.user_id=u.user_id
  `);
  return res.rows;
}

export async function updateInstructorBio(instructorId: number, bio: string) {
  const res = await pool.query(
    `UPDATE instructor SET bio=$1 WHERE instructor_id=$2 RETURNING *`,
    [bio, instructorId],
  );
  return res.rows[0];
}

export const getInstructorByUserId = unstable_cache(
  async function (userId: number) {
    const res = await pool.query(
      `SELECT i.instructor_id, i.user_id, i.bio, i.subject_id, u.name, u.email, u.phone_no, u.created_at
       FROM instructor i
       JOIN users u ON i.user_id=u.user_id
       WHERE i.user_id=$1`,
      [userId],
    );
    return res.rows[0] || null;
  },
  ["instructor-by-user-id"],
  { revalidate: 3600, tags: ["instructor-profiles"] }
);

export async function updateInstructorSubject(instructorId: number, subjectId: number) {
  const res = await pool.query(
    `UPDATE instructor SET subject_id=$1 WHERE instructor_id=$2 RETURNING *`,
    [subjectId, instructorId],
  );
  return res.rows[0];
}

export async function getInstructorStats(instructorId: number) {
  const res = await pool.query(
    `SELECT
       COUNT(DISTINCT ins.course_id) AS course_count,
       COUNT(DISTINCT e.student_id) AS student_count
     FROM instructs ins
     LEFT JOIN enrollment e ON ins.course_id=e.course_id
     WHERE ins.instructor_id=$1`,
    [instructorId],
  );
  return res.rows[0];
}
