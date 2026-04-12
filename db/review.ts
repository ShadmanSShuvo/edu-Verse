import { pool } from "@/lib/db";

export async function createReview(
  userId: number,
  courseId: number,
  rating: number,
  reviewText: string,
) {
  const res = await pool.query(
    `INSERT INTO review(user_id, course_id, rating, review_text)
     VALUES($1, $2, $3, $4) RETURNING *`,
    [userId, courseId, rating, reviewText],
  );
  return res.rows[0];
}

export async function getReviews(
  options: { courseId?: number; userId?: number; limit?: number } | number = {},
  userId?: number
) {
  // Support legacy call signature: getReviews(courseId) or getReviews(courseId, userId)
  const opts: { courseId?: number; userId?: number; limit?: number } =
    typeof options === "number" ? { courseId: options } : options;
  const resolvedUserId = opts.userId ?? userId;
  const limit = opts.limit;
  const limitClause = limit ? `LIMIT ${limit}` : "";

  if (opts.courseId) {
    const res = await pool.query(
      `SELECT r.*, u.name as user_name
       FROM review r
       JOIN users u ON r.user_id=u.user_id
       WHERE r.course_id=$1
       ORDER BY r.review_id DESC ${limitClause}`,
      [opts.courseId],
    );
    return res.rows;
  } else if (resolvedUserId) {
    const res = await pool.query(
      `SELECT r.*, c.title as course_title
       FROM review r
       JOIN course c ON r.course_id=c.course_id
       WHERE r.user_id=$1
       ORDER BY r.review_id DESC ${limitClause}`,
      [resolvedUserId],
    );
    return res.rows;
  }
  const res = await pool.query(`
    SELECT r.*, u.name as user_name, c.title as course_title
    FROM review r
    JOIN users u ON r.user_id=u.user_id
    JOIN course c ON r.course_id=c.course_id
    ORDER BY r.review_id DESC
    ${limitClause}
  `);
  return res.rows;
}

export async function updateReview(
  reviewId: number,
  rating: number,
  reviewText: string,
) {
  const res = await pool.query(
    `UPDATE review SET rating=$1, review_text=$2
     WHERE review_id=$3 RETURNING *`,
    [rating, reviewText, reviewId],
  );
  return res.rows[0];
}

export async function getExistingReview(userId: number, courseId: number) {
  const res = await pool.query(
    `SELECT review_id, rating, review_text
     FROM review
     WHERE user_id=$1 AND course_id=$2
     LIMIT 1`,
    [userId, courseId]
  );
  return res.rows[0] ?? null;
}

export async function deleteReview(reviewId: number) {
  const res = await pool.query(
    `DELETE FROM review WHERE review_id=$1 RETURNING *`,
    [reviewId],
  );
  return res.rows[0];
}
