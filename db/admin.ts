import { pool } from "@/lib/db";

/** Admin Dashboard Overview Stats */
export async function getAdminDashboardStats() {
    const res = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM course) AS total_courses,
            (SELECT COUNT(*) FROM module) AS total_modules,
            (SELECT COUNT(*) FROM exam) AS total_exams,
            (SELECT SUM(fn_course_enrollment_count(course_id)) FROM course) AS total_enrollments,
            (SELECT ROUND(COALESCE(SUM(amount), 0)::numeric, 2) FROM payment WHERE status IN ('Completed', 'COMPLETED')) AS total_revenue
    `);
    return res.rows[0];
}

/** Get all users with their roles for Admin Management */
export async function getAllUsersForAdmin() {
    const res = await pool.query(`
        SELECT 
            u.user_id, u.name, u.email, u.created_at,
            (SELECT r.name FROM user_role ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = u.user_id LIMIT 1) as role
        FROM users u
        ORDER BY u.created_at DESC
    `);
    return res.rows;
}

/** Get all courses for Admin Management */
export async function getAllCoursesForAdmin() {
    const res = await pool.query(`
        SELECT 
            c.course_id, c.title, c.price,
            (SELECT u.name FROM instructs i JOIN instructor inst ON i.instructor_id = inst.instructor_id JOIN users u ON inst.user_id = u.user_id WHERE i.course_id = c.course_id LIMIT 1) as instructor_name,
            fn_course_enrollment_count(c.course_id) as enrolled_count
        FROM course c
        ORDER BY c.course_id DESC
    `);
    return res.rows;
}

/** Delete a user by ID */
export async function deleteUser(userId: number) {
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
}

/** Top Courses Analytics — joined across course, enrollment, and review tables */
export async function getTopCourses(limit = 20) {
    const res = await pool.query(`
        SELECT
            c.course_id,
            c.title,
            c.description,
            c.price,
            -- Use subqueries for many-to-many aggregations to avoid join bloat, 
            -- and use fn_* for analytics
            (
                SELECT COALESCE(STRING_AGG(u.name, ', ' ORDER BY u.name), 'Unassigned')
                FROM instructs ins
                JOIN instructor i ON ins.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE ins.course_id = c.course_id
            ) AS instructors,
            (
                SELECT COALESCE(STRING_AGG(s.subject_name, ', ' ORDER BY s.subject_name), 'General')
                FROM course_sub cs
                JOIN subject s ON cs.subject_id = s.subject_id
                WHERE cs.course_id = c.course_id
            ) AS subjects,
            fn_course_enrollment_count(c.course_id) AS enrollment_count,
            fn_course_average_rating(c.course_id) AS avg_rating,
            (SELECT COUNT(*) FROM review WHERE course_id = c.course_id)::int AS review_count,
            (SELECT ROUND(AVG(progress)::numeric, 1) FROM enrollment WHERE course_id = c.course_id) AS avg_progress
        FROM course c
        ORDER BY enrollment_count DESC, avg_rating DESC NULLS LAST
        LIMIT $1
    `, [limit]);
    return res.rows;
}

/** Delete a course by ID */
export async function deleteCourse(courseId: number) {
    await pool.query('DELETE FROM course WHERE course_id = $1', [courseId]);
}

/** 
 * Complex Query 1: Top Performing Students
 * Ranks students based on their average exam scores and total courses completed.
 * Satisfies the "Complex Queries" requirement (using Subqueries/Grouping/Aggregation).
 */
export async function getTopPerformingStudents(minScore = 80) {
    const res = await pool.query(`
        SELECT u.name, 
               COUNT(e.enrollment_id) AS courses_joined, 
               ROUND(AVG(a.score)::numeric, 1) AS avg_grade
        FROM users u
        JOIN student s ON u.user_id = s.user_id 
        JOIN enrollment e ON s.student_id = e.student_id 
        LEFT JOIN attempt a ON s.student_id = a.student_id 
        GROUP BY u.user_id, u.name
        HAVING AVG(a.score) > $1
        ORDER BY avg_grade DESC;
    `, [minScore]);
    return res.rows;
}

/**
 * Complex Query 2: Course Revenue & Popularity Report
 * Generates an aggregated report of course success and total revenue earned.
 * Satisfies the "Complex Queries" requirement (using JOINs across 4 tables and Aggregation).
 */
export async function getCourseRevenueReport() {
    const res = await pool.query(`
        SELECT c.title, 
               fn_course_enrollment_count(c.course_id) AS total_students, 
               COALESCE(
                    (SELECT SUM(p.amount) 
                     FROM enrollment e 
                     JOIN orders o ON e.order_id = o.order_id 
                     JOIN payment p ON o.order_id = p.order_id AND p.status IN ('Completed', 'COMPLETED')
                     WHERE e.course_id = c.course_id), 
                    0
               ) AS total_revenue
        FROM course c
        ORDER BY total_revenue DESC, total_students DESC;
    `);
    return res.rows;
}

/** Get courses sorted by popularity (enrollment) from the view */
export async function getCoursePopularityByEnrollment() {
    const res = await pool.query('SELECT * FROM vw_course_popularity_by_enrollment LIMIT 10');
    return res.rows;
}

/** Get courses sorted by rating from the view */
export async function getCoursePopularityByRating() {
    const res = await pool.query('SELECT * FROM vw_course_popularity_by_rating LIMIT 10');
    return res.rows;
}
