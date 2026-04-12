import { pool } from "@/lib/db";

export async function createUser(
  name: string,
  email: string,
  password: string,
  salt: string,
  phone_no?: string
) {
  const result = await pool.query(
    `INSERT INTO users(name, email, password, salt, phone_no)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, password, salt, phone_no ?? null]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

export async function getUsers() {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
}

export async function getUserById(userId: number) {
  const result = await pool.query(
    `SELECT user_id, name, email, phone_no, avatar_url, bio, created_at FROM users WHERE user_id=$1`,
    [userId]
  );
  return result.rows[0];
}

export async function updateUserProfile(userId: number, fields: {
  name?: string;
  phone_no?: string;
  bio?: string;
  avatar_url?: string;
}) {
  const setParts: string[] = [];
  const values: any[] = [userId];
  let paramIdx = 2;

  if (fields.name !== undefined) {
    setParts.push(`name = $${paramIdx++}`);
    values.push(fields.name);
  }
  if (fields.phone_no !== undefined) {
    setParts.push(`phone_no = $${paramIdx++}`);
    values.push(fields.phone_no);
  }
  if (fields.bio !== undefined) {
    setParts.push(`bio = $${paramIdx++}`);
    values.push(fields.bio);
  }
  if (fields.avatar_url !== undefined) {
    setParts.push(`avatar_url = $${paramIdx++}`);
    values.push(fields.avatar_url);
  }

  if (setParts.length === 0) return null;

  const query = `UPDATE users SET ${setParts.join(", ")} WHERE user_id = $1 RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateUserPhone(userId: number, phone: string) {
  const result = await pool.query(
    `UPDATE users SET phone_no=$1 WHERE user_id=$2 RETURNING *`,
    [phone, userId]
  );
  return result.rows[0];
}

export async function updateUserName(userId: number, name: string) {
  const result = await pool.query(
    `UPDATE users SET name=$1 WHERE user_id=$2 RETURNING *`,
    [name, userId]
  );
  return result.rows[0];
}

export async function updateUserPassword(userId: number, passwordHash: string, salt: string) {
  const result = await pool.query(
    `UPDATE users SET password=$1, salt=$2 WHERE user_id=$3 RETURNING *`,
    [passwordHash, salt, userId]
  );
  return result.rows[0];
}

