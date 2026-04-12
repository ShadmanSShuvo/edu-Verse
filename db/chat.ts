import { pool } from "@/lib/db";

export async function saveChatMessage(userId: number, role: string, content: string) {
  const query = `
    INSERT INTO chat_messages (user_id, role, content) 
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [userId, role, content]);
}

export async function getChatHistory(userId: number) {
  const query = `
    SELECT role, content 
    FROM chat_messages 
    WHERE user_id = $1 
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [userId]);
  // Format the result to match what the Vercel AI SDK expects
  return result.rows.map(row => ({
    id: Math.random().toString(36).substring(7), // SDK requires an ID
    role: row.role,
    content: row.content,
  }));
}

export async function clearChatHistory(userId: number) {
  const query = `
    DELETE FROM chat_messages 
    WHERE user_id = $1
  `;
  await pool.query(query, [userId]);
}
