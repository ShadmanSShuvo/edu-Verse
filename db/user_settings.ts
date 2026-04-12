import { pool } from "@/lib/db";

export async function getUserSettings(userId: number) {
  const result = await pool.query(
    "SELECT * FROM user_settings WHERE user_id = $1",
    [userId]
  );
  return result.rows[0];
}

export async function updateUserSettings(userId: number, fields: {
  theme?: string;
  notifications_enabled?: boolean;
  language?: string;
}) {
  const setParts: string[] = [];
  const values: any[] = [userId];
  let paramIdx = 2;

  if (fields.theme !== undefined) {
    setParts.push(`theme = $${paramIdx++}`);
    values.push(fields.theme);
  }
  if (fields.notifications_enabled !== undefined) {
    setParts.push(`notifications_enabled = $${paramIdx++}`);
    values.push(fields.notifications_enabled);
  }
  if (fields.language !== undefined) {
    setParts.push(`language = $${paramIdx++}`);
    values.push(fields.language);
  }

  if (setParts.length === 0) return null;

  const query = `
    UPDATE user_settings 
    SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = $1 
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
}
