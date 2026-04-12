import { pool } from "@/lib/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export async function createNotification(
    userId: number,
    message: string,
    link?: string
) {
    await pool.query(
        `INSERT INTO notification(user_id, message, link)
     VALUES($1, $2, $3)`,
        [userId, message, link ?? null]
    );
}

// React.cache() outer wrap deduplicates within a single render pass;
// unstable_cache inner layer caches the result for 60 s across user requests.
export const getNotifications = cache(async function (userId: number) {
    return unstable_cache(
        async () => {
            const res = await pool.query(
                `SELECT notification_id, message, link, is_read, created_at
          FROM notification
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 30`,
                [userId]
            );
            return res.rows;
        },
        [`user-notifications-${userId}`], // include userId to isolate per user
        { revalidate: 60, tags: ["notifications"] }
    )();
});

export const getUnreadCount = unstable_cache(
    async function (userId: number): Promise<number> {
        const res = await pool.query(
            `SELECT COUNT(*) AS cnt FROM notification WHERE user_id=$1 AND is_read = FALSE`,
            [userId]
        );
        return parseInt(res.rows[0].cnt, 10);
    },
    ["unread-count"],
    { revalidate: 60, tags: ["notifications"] }
);

export async function markAllRead(userId: number) {
    await pool.query(
        `UPDATE notification SET is_read = TRUE WHERE user_id=$1 AND is_read = FALSE`,
        [userId]
    );
}

export async function markOneRead(notificationId: number, userId: number) {
    await pool.query(
        `UPDATE notification SET is_read = TRUE
     WHERE notification_id=$1 AND user_id=$2`,
        [notificationId, userId]
    );
}

/**
 * Get all instructor user_ids who teach the course that contains a given module.
 */
export async function getInstructorUserIdsForModule(
    moduleId: number
): Promise<number[]> {
    const res = await pool.query(
        `SELECT u.user_id
     FROM module m
     JOIN instructs i ON m.course_id = i.course_id
     JOIN instructor inst ON i.instructor_id = inst.instructor_id
     JOIN users u ON inst.user_id = u.user_id
     WHERE m.module_id = $1`,
        [moduleId]
    );
    return res.rows.map((r: { user_id: number }) => r.user_id);
}

/**
 * Get the user_id of the student who posted a given comment.
 */
export async function getCommentOwnerUserId(
    commentId: number
): Promise<number | null> {
    const res = await pool.query(
        `SELECT user_id FROM comment WHERE comment_id=$1`,
        [commentId]
    );
    return res.rows[0]?.user_id ?? null;
}

/**
 * Get the module's course title + module title for display in notifications.
 */
export async function getModuleContext(
    moduleId: number
): Promise<{ moduleTitle: string; courseTitle: string } | null> {
    const res = await pool.query(
        `SELECT m.title AS module_title, c.title AS course_title
     FROM module m
     JOIN course c ON m.course_id = c.course_id
     WHERE m.module_id = $1`,
        [moduleId]
    );
    if (!res.rows[0]) return null;
    return {
        moduleTitle: res.rows[0].module_title,
        courseTitle: res.rows[0].course_title,
    };
}
