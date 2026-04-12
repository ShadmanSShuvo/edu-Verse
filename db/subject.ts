import { pool } from "@/lib/db";

export async function createSubject(subjectName: string) {
  const res = await pool.query(
    `INSERT INTO subject(subject_name) VALUES($1) RETURNING *`,
    [subjectName],
  );
  return res.rows[0];
}

export async function getSubjects() {
  const res = await pool.query(`SELECT * FROM subject ORDER BY subject_id`);
  return res.rows;
}
