import { pool } from "@/lib/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export async function createCourse(
  title: string,
  description: string,
  price: number
) {
  const result = await pool.query(
    `INSERT INTO course(title, description, price)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [title, description, price]
  );

  return result.rows[0];
}

export const getCourses = unstable_cache(
  async function () {
    const result = await pool.query("SELECT course_id, title, description, price FROM course ORDER BY course_id");
    return result.rows;
  },
  ["all-courses"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCoursesBySubject = cache(async function (subjectId: number) {
  const result = await pool.query(
    `SELECT c.* 
     FROM course c
     JOIN course_sub cs ON c.course_id = cs.course_id
     WHERE cs.subject_id = $1`,
    [subjectId]
  );
  return result.rows;
});

/** All courses with instructor names, subject tags, module count,
 *  student (enrollment) count, and average rating — used by the catalog page.
 *
 *  NOTE: unstable_cache is invoked eagerly (IIFE pattern) with a deterministic
 *  key so Next.js can actually deduplicate and persist the result.  Creating a
 *  new closure on every call was previously preventing cache hits.
 */
export async function getCoursesWithDetails(options: {
  q?: string;
  subject?: string;
  sort?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { q, subject, sort, limit, offset } = options;

  // Build a deterministic, stable cache key from the options.
  const cacheKey = `courses-catalog-${q ?? "none"}-${subject ?? "none"}-${sort ?? "none"}-${limit ?? "none"}-${offset ?? "none"}`;

  const fetchFn = async () => {
    const values: any[] = [];
    const whereClauses: string[] = [];

    if (q) {
      values.push(`%${q}%`);
      whereClauses.push(`(c.title ILIKE $${values.length} OR c.description ILIKE $${values.length})`);
    }

    if (subject && subject !== "all") {
      values.push(subject);
      whereClauses.push(`s.subject_name = $${values.length}`);
    }

    let orderBy = "c.course_id";
    if (sort === "price-low") orderBy = "c.price ASC";
    else if (sort === "price-high") orderBy = "c.price DESC";
    else if (sort === "rating") orderBy = "avg_rating DESC NULLS LAST";
    else if (sort === "students") orderBy = "student_count DESC, avg_rating DESC NULLS LAST";
    else if (sort === "popular") orderBy = "student_count DESC, avg_rating DESC NULLS LAST";

    const whereSection = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT
        c.course_id,
        c.title,
        c.description,
        c.price,
        COALESCE(STRING_AGG(DISTINCT u.name, ', ' ORDER BY u.name), '') AS instructors,
        COALESCE(STRING_AGG(DISTINCT s.subject_name, ', ' ORDER BY s.subject_name), '') AS subjects,
        COUNT(DISTINCT m.module_id)::int AS module_count,
        COUNT(DISTINCT en.enrollment_id)::int AS student_count,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
        COUNT(DISTINCT r.review_id)::int AS review_count
      FROM course c
      LEFT JOIN instructs ins ON c.course_id = ins.course_id
      LEFT JOIN instructor i   ON ins.instructor_id = i.instructor_id
      LEFT JOIN users u        ON i.user_id = u.user_id
      LEFT JOIN course_sub cs  ON c.course_id = cs.course_id
      LEFT JOIN subject s      ON cs.subject_id = s.subject_id
      LEFT JOIN module m       ON c.course_id = m.course_id
      LEFT JOIN enrollment en  ON c.course_id = en.course_id
      LEFT JOIN review r       ON c.course_id = r.course_id
      ${whereSection}
      GROUP BY c.course_id
      ORDER BY ${orderBy}
      ${limit !== undefined ? `LIMIT ${limit}` : ""}
      ${offset !== undefined ? `OFFSET ${offset}` : ""}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  };

  // unstable_cache is tagged so revalidatePath/revalidateTag can invalidate it.
  return unstable_cache(fetchFn, [cacheKey], {
    revalidate: 60,
    tags: ["courses"],
  })();
}


export async function getCoursesCount(q?: string, subject?: string) {
  const cacheKey = `courses-count-${q ?? 'none'}-${subject ?? 'none'}`;
  
  return unstable_cache(
    async () => {
      const values: any[] = [];
      let whereClauses = [];
      
      if (q) {
        values.push(`%${q}%`);
        whereClauses.push(`(c.title ILIKE $${values.length} OR c.description ILIKE $${values.length})`);
      }
      
      if (subject && subject !== 'all') {
        values.push(subject);
        whereClauses.push(`s.subject_name = $${values.length}`);
      }
      
      const whereSection = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const query = `
        SELECT COUNT(DISTINCT c.course_id)::int as count
        FROM course c
        LEFT JOIN course_sub cs ON c.course_id = cs.course_id
        LEFT JOIN subject s ON cs.subject_id = s.subject_id
        ${whereSection}
      `;
      
      const result = await pool.query(query, values);
      return result.rows[0].count;
    },
    [cacheKey],
    { revalidate: 60, tags: ["courses"] }
  )();
}

/** Single course full details — used by the course detail page. */
export const getCourseById = unstable_cache(
  async function (courseId: number) {
    const result = await pool.query(
      `SELECT
         c.course_id,
         c.title,
         c.description,
         c.price,
         COALESCE(STRING_AGG(DISTINCT u.name, ', ' ORDER BY u.name), '') AS instructors,
         COALESCE(STRING_AGG(DISTINCT s.subject_name, ', ' ORDER BY s.subject_name), '') AS subjects,
         COUNT(DISTINCT m.module_id)::int AS module_count,
         COUNT(DISTINCT en.enrollment_id)::int AS student_count,
         ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
         COUNT(DISTINCT r.review_id)::int AS review_count
       FROM course c
       LEFT JOIN instructs ins ON c.course_id = ins.course_id
       LEFT JOIN instructor i   ON ins.instructor_id = i.instructor_id
       LEFT JOIN users u        ON i.user_id = u.user_id
       LEFT JOIN course_sub cs  ON c.course_id = cs.course_id
       LEFT JOIN subject s      ON cs.subject_id = s.subject_id
       LEFT JOIN module m       ON c.course_id = m.course_id
       LEFT JOIN enrollment en  ON c.course_id = en.course_id
       LEFT JOIN review r       ON c.course_id = r.course_id
       WHERE c.course_id = $1
       GROUP BY c.course_id`,
      [courseId]
    );
    return result.rows[0] ?? null;
  },
  ["course-by-id"],
  { revalidate: 600, tags: ["courses"] }
);


export async function getCourseRating(courseId: number): Promise<number> {
  const res = await pool.query("SELECT get_course_average_rating($1) as rating", [courseId]);
  return res.rows[0].rating ?? 0;
}

export async function getCourseEnrollment(courseId: number): Promise<number> {
  const res = await pool.query("SELECT get_course_enrollment_count($1) as count", [courseId]);
  return res.rows[0].count ?? 0;
}

export async function getCourseSuggestions(query: string) {
  const result = await pool.query(
    `SELECT DISTINCT title as suggestion FROM course WHERE title ILIKE $1
     UNION
     SELECT DISTINCT u.name as suggestion FROM users u 
     JOIN instructor i ON u.user_id = i.user_id 
     WHERE u.name ILIKE $1
     LIMIT 10`,
    [`%${query}%`]
  );
  return result.rows.map((row) => row.suggestion);
}
