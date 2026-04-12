import { pool } from "@/lib/db";
import { unstable_cache } from "next/cache";


/**
 * Single-query dashboard stats for a student.
 */
export const getStudentDashboardStats = unstable_cache(
    async function (userId: number) {
        const res = await pool.query(
            `SELECT
           (SELECT COUNT(*) FROM enrollment e JOIN student s ON e.student_id=s.student_id WHERE s.user_id=$1) AS enrolled_count,
           (SELECT COUNT(*) FROM attempt a JOIN student s ON a.student_id=s.student_id WHERE s.user_id=$1) AS exams_taken,
           (SELECT get_student_average_score(s.student_id) FROM student s WHERE s.user_id=$1) AS avg_score,
           (SELECT MAX(a.score) FROM attempt a JOIN student s ON a.student_id=s.student_id WHERE s.user_id=$1) AS best_score,
           (SELECT COUNT(*) FROM response r JOIN attempt a ON r.attempt_id=a.attempt_id JOIN student s ON a.student_id=s.student_id WHERE s.user_id=$1) AS questions_answered`,
            [userId]
        );
        return res.rows[0] || null;
    },
    ["student-dashboard-stats"],
    { revalidate: 60, tags: ["attempts", "enrollments"] }
);

/**
 * Gets the most recently active course for the student based on last exam attempt.
 * Cached for 60 s — changes infrequently and is not security-sensitive.
 */
export const getRecentlyActiveCourse = unstable_cache(
    async function (userId: number) {
        const res = await pool.query(
            `SELECT 
                c.course_id, 
                c.title AS course_title,
                e.exam_id,
                e.title AS exam_title,
                m.module_id,
                m.title AS module_title,
                a.submitted_at AS last_active
             FROM attempt a
             JOIN student s ON a.student_id = s.student_id
             JOIN exam e ON a.exam_id = e.exam_id
             JOIN module m ON e.module_id = m.module_id
             JOIN course c ON m.course_id = c.course_id
             WHERE s.user_id = $1
             ORDER BY a.submitted_at DESC NULLS LAST
             LIMIT 1`,
            [userId]
        );
        return res.rows[0] || null;
    },
    ["student-recently-active-course"],
    { revalidate: 60, tags: ["attempts"] }
);

/**
 * Per-course progress for student.
 */
export const getCourseProgress = unstable_cache(
    async function (userId: number) {
        const res = await pool.query(
            `SELECT
           c.course_id,
           c.title AS course_title,
           COUNT(DISTINCT e.exam_id)::int AS total_exams,
           COUNT(DISTINCT CASE WHEN a.student_id IS NOT NULL THEN e.exam_id END)::int AS attempted_exams,
           ROUND(AVG(best.score),1) AS avg_best_score
         FROM enrollment en
         JOIN student s ON en.student_id=s.student_id
         JOIN course c ON en.course_id=c.course_id
         LEFT JOIN module m ON m.course_id=c.course_id
         LEFT JOIN exam e ON e.module_id=m.module_id
         LEFT JOIN LATERAL (
           SELECT a.student_id, a.score
           FROM attempt a
           WHERE a.exam_id=e.exam_id AND a.student_id=s.student_id
           ORDER BY a.score DESC
           LIMIT 1
         ) best ON TRUE
         LEFT JOIN attempt a ON a.exam_id=e.exam_id AND a.student_id=s.student_id
         WHERE s.user_id=$1
         GROUP BY c.course_id, c.title
         ORDER BY c.course_id`,
            [userId]
        );
        return res.rows;
    },
    ["student-course-progress"],
    { revalidate: 60, tags: ["attempts"] }
);

/**
 * Recent exam attempts (last 10) with course context.
 */
export const getRecentAttempts = unstable_cache(
    async function (userId: number, limit = 10) {
        const res = await pool.query(
            `SELECT a.attempt_id, a.score, a.submitted_at AS time,
             e.title AS exam_title, e.marks,
             m.title AS module_title,
             c.title AS course_title
     FROM attempt a
     JOIN student s ON a.student_id=s.student_id
     JOIN exam e ON a.exam_id=e.exam_id
     JOIN module m ON e.module_id=m.module_id
     JOIN course c ON m.course_id=c.course_id
     WHERE s.user_id=$1
     ORDER BY a.submitted_at DESC
     LIMIT $2`,
            [userId, limit]
        );
        return res.rows;
    },
    ["student-recent-attempts"],
    { revalidate: 30, tags: ["attempts"] }
);

/**
 * Instructor dashboard overview stats.
 */
export const getInstructorDashboardStats = unstable_cache(
    async function (instructorId: number) {
        // We still need some JOINs to filter by instructorId, but we use functions for metric calculations
        const res = await pool.query(
            `SELECT
                COUNT(DISTINCT ins.course_id)::int AS course_count,
                SUM(fn_course_enrollment_count(ins.course_id))::int AS student_count,
                (SELECT COUNT(*) FROM module m JOIN instructs i ON m.course_id = i.course_id WHERE i.instructor_id = $1)::int AS module_count,
                (SELECT COUNT(*) FROM exam e JOIN module m ON e.module_id = m.module_id JOIN instructs i ON m.course_id = i.course_id WHERE i.instructor_id = $1)::int AS exam_count,
                (SELECT COUNT(*) FROM material mat JOIN module m ON mat.module_id = m.module_id JOIN instructs i ON m.course_id = i.course_id WHERE i.instructor_id = $1)::int AS material_count,
                SUM(fn_course_exam_attempts_count(ins.course_id))::int AS total_attempts,
                ROUND(AVG(a.score)::numeric, 1) AS avg_student_score
             FROM instructs ins
             LEFT JOIN module m ON m.course_id = ins.course_id
             LEFT JOIN exam e ON e.module_id = m.module_id
             LEFT JOIN attempt a ON a.exam_id = e.exam_id
             WHERE ins.instructor_id = $1`,
            [instructorId]
        );
        return res.rows[0] || null;
    },
    ["instructor-dashboard-stats"],
    { revalidate: 60, tags: ["attempts", "enrollments"] }
);

/**
 * Per-course breakdown for an instructor.
 * Upgraded from React.cache() to unstable_cache for cross-request server caching.
 */
export const getInstructorCourseDetails = unstable_cache(
    async function (instructorId: number) {
        const res = await pool.query(
            `SELECT
                c.course_id, c.title, c.description, c.price,
                (SELECT COUNT(*) FROM module WHERE course_id = c.course_id)::int AS module_count,
                (SELECT COUNT(*) FROM exam ex JOIN module mo ON ex.module_id = mo.module_id WHERE mo.course_id = c.course_id)::int AS exam_count,
                (SELECT COUNT(*) FROM material ma JOIN module mo ON ma.module_id = mo.module_id WHERE mo.course_id = c.course_id)::int AS material_count,
                fn_course_enrollment_count(c.course_id) AS student_count,
                (
                    SELECT ROUND(AVG(score)::numeric, 1)
                    FROM attempt a
                    JOIN exam ex ON a.exam_id = ex.exam_id
                    JOIN module mo ON ex.module_id = mo.module_id
                    WHERE mo.course_id = c.course_id
                ) AS avg_score
             FROM instructs ins
             JOIN course c ON ins.course_id = c.course_id
             WHERE ins.instructor_id = $1
             ORDER BY c.course_id`,
            [instructorId]
        );
        return res.rows;
    },
    ["instructor-course-details"],
    { revalidate: 60, tags: ["courses", "enrollments"] }
);

/**
 * Recent student attempts on instructor's exams.
 * Upgraded from React.cache() to unstable_cache for cross-request server caching.
 */
export const getInstructorRecentActivity = unstable_cache(
    async function (instructorId: number, limit = 8) {
        const res = await pool.query(
            `SELECT a.attempt_id, a.score, a.submitted_at AS time,
                u.name AS student_name,
                e.title AS exam_title,
                c.title AS course_title
         FROM attempt a
         JOIN student s     ON a.student_id  = s.student_id
         JOIN users u       ON s.user_id     = u.user_id
         JOIN exam e        ON a.exam_id     = e.exam_id
         JOIN module m      ON e.module_id   = m.module_id
         JOIN course c      ON m.course_id   = c.course_id
         JOIN instructs ins ON ins.course_id = c.course_id
         WHERE ins.instructor_id = $1
         ORDER BY a.submitted_at DESC NULLS LAST
         LIMIT $2`,
            [instructorId, limit]
        );
        return res.rows;
    },
    ["instructor-recent-activity"],
    { revalidate: 30, tags: ["attempts"] }
);

/**
 * Score history per exam for the student.
 * Upgraded from React.cache() to unstable_cache for cross-request server caching.
 */
export const getScoreHistory = unstable_cache(
    async function (userId: number) {
        const res = await pool.query(
            `SELECT a.attempt_id, a.score, a.submitted_at AS time,
                e.title AS exam_title
         FROM attempt a
         JOIN student s ON a.student_id=s.student_id
         JOIN exam e ON a.exam_id=e.exam_id
         WHERE s.user_id=$1
         ORDER BY a.submitted_at ASC
         LIMIT 20`,
            [userId]
        );
        return res.rows;
    },
    ["student-score-history"],
    { revalidate: 30, tags: ["attempts"] }
);

/**
 * Total revenue generated by course for an instructor.
 */
export const getInstructorRevenueReport = unstable_cache(
    async function (instructorId: number) {
        const res = await pool.query(
            `SELECT c.title, 
                    COUNT(DISTINCT e.enrollment_id)::int AS total_students, 
                    ROUND(COALESCE(SUM(p.amount), 0)::numeric, 2) AS total_revenue
             FROM instructs ins
             JOIN course c ON ins.course_id = c.course_id
             LEFT JOIN enrollment e ON c.course_id = e.course_id 
             LEFT JOIN orders o ON e.order_id = o.order_id 
             LEFT JOIN payment p ON o.order_id = p.order_id AND p.status IN ('Completed', 'COMPLETED')
             WHERE ins.instructor_id = $1
             GROUP BY c.course_id, c.title
             ORDER BY total_revenue DESC, total_students DESC`,
            [instructorId]
        );
        return res.rows;
    },
    ["instructor-revenue-report"],
    { revalidate: 300, tags: ["enrollments"] }
);

/**
 * Top 5 most difficult questions across an instructor's exams (based on success rate).
 */
export const getInstructorDifficultQuestions = unstable_cache(
    async function (instructorId: number) {
        const res = await pool.query(
            `SELECT q.ques_statement, e.title as exam_title, c.title as course_title,
                    COUNT(r.response_id)::int AS total_answers,
                    COUNT(CASE WHEN r.response_text = q.correct_ans THEN 1 END)::int AS correct_answers,
                    ROUND(
                        (COUNT(CASE WHEN r.response_text = q.correct_ans THEN 1 END)::numeric / 
                         NULLIF(COUNT(r.response_id), 0)::numeric) * 100, 1
                    ) AS success_rate
             FROM instructs ins
             JOIN course c ON ins.course_id = c.course_id
             JOIN module m ON c.course_id = m.course_id
             JOIN exam e ON m.module_id = e.module_id
             JOIN question q ON e.exam_id = q.exam_id
             JOIN response r ON q.ques_id = r.ques_id
             WHERE ins.instructor_id = $1
             GROUP BY q.ques_id, q.ques_statement, e.title, c.title
             HAVING COUNT(r.response_id) > 0
             ORDER BY success_rate ASC
             LIMIT 5`,
            [instructorId]
        );
        return res.rows;
    },
    ["instructor-difficult-questions"],
    { revalidate: 120, tags: ["attempts"] }
);
/**
 * Upcoming / unattempted exams from enrolled courses (up to 5).
 */
export const getUnattemptedExams = unstable_cache(
    async function (userId: number, limit = 5) {
        const res = await pool.query(
            `SELECT e.exam_id, e.title, e.marks, e.duration,
                m.title AS module_title,
                c.title AS course_title
         FROM exam e
         JOIN module m ON e.module_id=m.module_id
         JOIN course c ON m.course_id=c.course_id
         JOIN enrollment en ON en.course_id=c.course_id
         JOIN student s ON en.student_id=s.student_id
         WHERE s.user_id=$1
           AND NOT EXISTS (
             SELECT 1 FROM attempt a2
             WHERE a2.exam_id=e.exam_id AND a2.student_id=s.student_id
           )
         ORDER BY e.exam_id
         LIMIT $2`,
            [userId, limit]
        );
        return res.rows;
    },
    ["student-unattempted-exams"],
    { revalidate: 60, tags: ["attempts", "enrollments"] }
);

/**
 * Dashboard overview stats for a whole subject.
 */
export const getSubjectDashboardStats = unstable_cache(
    async function (subjectId: number) {
        const res = await pool.query(
            `SELECT
                COUNT(DISTINCT cs.course_id)::int AS course_count,
                SUM(fn_course_enrollment_count(cs.course_id))::int AS student_count,
                (SELECT COUNT(*) FROM module m JOIN course_sub i ON m.course_id = i.course_id WHERE i.subject_id = $1)::int AS module_count,
                (SELECT COUNT(*) FROM exam e JOIN module m ON e.module_id = m.module_id JOIN course_sub i ON m.course_id = i.course_id WHERE i.subject_id = $1)::int AS exam_count,
                (SELECT COUNT(*) FROM material mat JOIN module m ON mat.module_id = m.module_id JOIN course_sub i ON m.course_id = i.course_id WHERE i.subject_id = $1)::int AS material_count,
                SUM(fn_course_exam_attempts_count(cs.course_id))::int AS total_attempts,
                ROUND(AVG(a.score)::numeric, 1) AS avg_student_score
             FROM course_sub cs
             LEFT JOIN module m ON m.course_id = cs.course_id
             LEFT JOIN exam e ON e.module_id = m.module_id
             LEFT JOIN attempt a ON a.exam_id = e.exam_id
             WHERE cs.subject_id = $1`,
            [subjectId]
        );
        return res.rows[0] || null;
    },
    ["subject-dashboard-stats"],
    { revalidate: 120, tags: ["enrollments", "attempts"] }
);

/**
 * Per-course breakdown for a whole subject.
 */
export const getSubjectCourseDetails = unstable_cache(
    async function (subjectId: number) {
        const res = await pool.query(
            `SELECT
                c.course_id, c.title, c.description, c.price,
                (SELECT COUNT(*) FROM module WHERE course_id = c.course_id)::int AS module_count,
                (SELECT COUNT(*) FROM exam ex JOIN module mo ON ex.module_id = mo.module_id WHERE mo.course_id = c.course_id)::int AS exam_count,
                (SELECT COUNT(*) FROM material ma JOIN module mo ON ma.module_id = mo.module_id WHERE mo.course_id = c.course_id)::int AS material_count,
                fn_course_enrollment_count(c.course_id) AS student_count,
                (
                    SELECT ROUND(AVG(score)::numeric, 1)
                    FROM attempt a
                    JOIN exam ex ON a.exam_id = ex.exam_id
                    JOIN module mo ON ex.module_id = mo.module_id
                    WHERE mo.course_id = c.course_id
                ) AS avg_score
             FROM course_sub cs
             JOIN course c ON cs.course_id = c.course_id
             WHERE cs.subject_id = $1
             ORDER BY c.course_id`,
            [subjectId]
        );
        return res.rows;
    },
    ["subject-course-details"],
    { revalidate: 120, tags: ["courses", "enrollments"] }
);

/**
 * Recent student activities for courses in a subject.
 */
export const getSubjectRecentActivity = unstable_cache(
    async function (subjectId: number, limit = 8) {
        const res = await pool.query(
            `SELECT a.attempt_id, a.score, a.submitted_at AS time,
                u.name AS student_name,
                e.title AS exam_title,
                c.title AS course_title
         FROM attempt a
         JOIN student s     ON a.student_id  = s.student_id
         JOIN users u       ON s.user_id     = u.user_id
         JOIN exam e        ON a.exam_id     = e.exam_id
         JOIN module m      ON e.module_id   = m.module_id
         JOIN course c      ON m.course_id   = c.course_id
         JOIN course_sub cs ON cs.course_id  = c.course_id
         WHERE cs.subject_id = $1
         ORDER BY a.submitted_at DESC NULLS LAST
         LIMIT $2`,
            [subjectId, limit]
        );
        return res.rows;
    },
    ["subject-recent-activity"],
    { revalidate: 30, tags: ["attempts"] }
);

/**
 * All platform-wide dashboard stats for admins.
 */
export const getAllDashboardStats = unstable_cache(
    async function () {
        const res = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM course)::int AS course_count,
                (SELECT SUM(fn_course_enrollment_count(course_id)) FROM course)::int AS student_count,
                (SELECT COUNT(*) FROM module)::int AS module_count,
                (SELECT COUNT(*) FROM exam)::int AS exam_count,
                (SELECT COUNT(*) FROM material)::int AS material_count,
                (SELECT COUNT(*) FROM attempt)::int AS total_attempts,
                ROUND(AVG(score)::numeric, 1) AS avg_student_score,
                (SELECT ROUND(AVG(rating)::numeric, 1) FROM review) AS avg_rating
             FROM attempt`
        );
        return res.rows[0] || null;
    },
    ["all-dashboard-stats"],
    { revalidate: 300 }
);

/**
 * Per-course breakdown for the entire platform.
 */
export const getAllCourseDetails = unstable_cache(
    async function () {
        const res = await pool.query(
            `SELECT
                c.course_id, c.title, c.description, c.price,
                (SELECT COUNT(*) FROM module WHERE course_id = c.course_id)::int AS module_count,
                (SELECT COUNT(*) FROM exam ex JOIN module mo ON ex.module_id = mo.module_id WHERE mo.course_id = c.course_id)::int AS exam_count,
                (SELECT COUNT(*) FROM material ma JOIN module mo ON ma.module_id = mo.module_id WHERE mo.course_id = c.course_id)::int AS material_count,
                fn_course_enrollment_count(c.course_id) AS student_count,
                (
                    SELECT ROUND(AVG(score)::numeric, 1)
                    FROM attempt a
                    JOIN exam ex ON a.exam_id = ex.exam_id
                    JOIN module mo ON ex.module_id = mo.module_id
                    WHERE mo.course_id = c.course_id
                ) AS avg_score
             FROM course c
             ORDER BY c.course_id`
        );
        return res.rows;
    },
    ["all-course-details"],
    { revalidate: 300 }
);

/**
 * All recent student activities platform-wide.
 */
export const getAllRecentActivity = unstable_cache(
    async function (limit = 8) {
        const res = await pool.query(
            `SELECT a.attempt_id, a.score, a.submitted_at AS time,
             u.name AS student_name,
             e.title AS exam_title,
             c.title AS course_title
     FROM attempt a
     JOIN student s     ON a.student_id  = s.student_id
     JOIN users u       ON s.user_id     = u.user_id
     JOIN exam e        ON a.exam_id     = e.exam_id
     JOIN module m      ON e.module_id   = m.module_id
     JOIN course c      ON m.course_id   = c.course_id
     ORDER BY a.submitted_at DESC
     LIMIT $1`,
            [limit]
        );
        return res.rows;
    },
    ["all-recent-activity"],
    { revalidate: 30, tags: ["attempts"] }
);
