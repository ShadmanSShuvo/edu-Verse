import { pool } from "@/lib/db";

export async function insertSession(token: string, userId: number, expiresAt: Date) {
  const res = await pool.query(
    `INSERT INTO sessions(token, user_id, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [token, userId, expiresAt]
  );
  return res.rows[0];
}

export async function getSessionByToken(token: string) {
  const res = await pool.query(
    `SELECT s.token, s.expires_at, s.user_id, u.name, u.email, u.avatar_url
     FROM sessions s
     JOIN users u ON s.user_id = u.user_id
     WHERE s.token = $1`,
    [token]
  );
  return res.rows[0];
}

export async function deleteSessionByToken(token: string) {
  await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

export async function deleteExpiredSessions() {
  await pool.query(`DELETE FROM sessions WHERE expires_at < NOW()`);
}

export async function deleteSessionsByUserId(userId: number) {
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}
