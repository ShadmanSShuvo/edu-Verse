import { pool } from "@/lib/db";

export async function createContactMessage(
  name: string,
  email: string,
  message: string
) {
  const result = await pool.query(
    `INSERT INTO contact_messages (name, email, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, email, message]
  );
  return result.rows[0];
}

export async function getContactMessages() {
  const result = await pool.query(
    "SELECT * FROM contact_messages ORDER BY created_at DESC"
  );
  return result.rows;
}
