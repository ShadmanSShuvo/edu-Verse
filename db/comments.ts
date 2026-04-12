import { pool } from "@/lib/db";

export async function createComment(
  userId: number,
  moduleId: number,
  commentText: string,
) {
  const res = await pool.query(
    `INSERT INTO comment(user_id, module_id, comment_text, time)
     VALUES($1, $2, $3, NOW()) RETURNING *`,
    [userId, moduleId, commentText],
  );
  return res.rows[0];
}

export async function getComments(moduleId?: number) {
  if (moduleId) {
    const res = await pool.query(
      `SELECT c.*, u.name as user_name
       FROM comment c
       JOIN users u ON c.user_id=u.user_id
       WHERE c.module_id=$1
       ORDER BY c.time DESC`,
      [moduleId],
    );
    return res.rows;
  }
  const res = await pool.query(`
    SELECT c.*, u.name as user_name, m.title as module_title
    FROM comment c
    JOIN users u ON c.user_id=u.user_id
    JOIN module m ON c.module_id=m.module_id
    ORDER BY c.time DESC
  `);
  return res.rows;
}

/**
 * Fetch all comments for a module, each with a `replies` array.
 * Replies include the replier's name via the `instructor` → `users` join
 * (falls back gracefully if the reply is not from an instructor).
 */
export async function getCommentsWithReplies(moduleId: number) {
  const comments = await pool.query(
    `SELECT c.comment_id, c.user_id, c.comment_text, c.time,
            u.name AS user_name
     FROM comment c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.module_id = $1
     ORDER BY c.time ASC`,
    [moduleId]
  );

  if (comments.rowCount === 0) return [];

  const commentIds = comments.rows.map((r) => r.comment_id);
  const replies = await pool.query(
    `SELECT r.reply_id, r.comment_id, r.reply_text, r.replier_user_id,
            COALESCE(u.name, 'Instructor') AS replier_name
     FROM reply r
     LEFT JOIN users u ON r.replier_user_id = u.user_id
     WHERE r.comment_id = ANY($1::int[])
     ORDER BY r.reply_id ASC`,
    [commentIds]
  );

  const replyMap = new Map<number, typeof replies.rows>();
  for (const reply of replies.rows) {
    if (!replyMap.has(reply.comment_id)) replyMap.set(reply.comment_id, []);
    replyMap.get(reply.comment_id)!.push(reply);
  }

  return comments.rows.map((c) => ({
    ...c,
    replies: replyMap.get(c.comment_id) ?? [],
  }));
}

export async function deleteComment(commentId: number) {
  const res = await pool.query(
    `DELETE FROM comment WHERE comment_id=$1 RETURNING *`,
    [commentId],
  );
  return res.rows[0];
}

/** Create a reply; replier_user_id is optional (for instructors who are users). */
export async function createReply(
  commentId: number,
  replyText: string,
  replierUserId?: number,
) {
  const res = await pool.query(
    `INSERT INTO reply(comment_id, reply_text, replier_user_id)
     VALUES($1, $2, $3) RETURNING *`,
    [commentId, replyText, replierUserId ?? null],
  );
  return res.rows[0];
}

export async function getReplies(commentId: number) {
  const res = await pool.query(
    `SELECT r.*, COALESCE(u.name, 'Instructor') AS replier_name
     FROM reply r
     LEFT JOIN users u ON r.replier_user_id = u.user_id
     WHERE r.comment_id=$1 ORDER BY r.reply_id`,
    [commentId],
  );
  return res.rows;
}

export async function deleteReply(replyId: number) {
  const res = await pool.query(
    `DELETE FROM reply WHERE reply_id=$1 RETURNING *`,
    [replyId],
  );
  return res.rows[0];
}
