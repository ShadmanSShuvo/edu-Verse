import { pool } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function createStudent(userId: number) {
  const res = await pool.query(
    `INSERT INTO student(user_id) VALUES($1) RETURNING *`,
    [userId],
  );
  return res.rows[0];
}

export async function getStudents() {
  const res = await pool.query(`
    SELECT s.student_id, s.user_id, u.name, u.email, u.phone_no
    FROM student s
    JOIN users u ON s.user_id=u.user_id
  `);
  return res.rows;
}

export const getStudentByUserId = unstable_cache(
  async function (userId: number) {
    const res = await pool.query(
      `SELECT s.student_id, s.user_id, u.name, u.email, u.phone_no
       FROM student s
       JOIN users u ON s.user_id=u.user_id
       WHERE s.user_id=$1`,
      [userId],
    );
    return res.rows[0] || null;
  },
  ["student-by-user-id"],
  { revalidate: 3600, tags: ["student-profiles"] }
);

export const getStudentAverageScore = unstable_cache(
  async function (studentId: number): Promise<number> {
    const res = await pool.query("SELECT get_student_average_score($1) as avg_score", [studentId]);
    return res.rows[0].avg_score ?? 0;
  },
  ["student-avg-score"],
  { revalidate: 60, tags: ["attempts"] }
);
