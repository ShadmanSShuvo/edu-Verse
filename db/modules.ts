import { pool } from "@/lib/db";

export async function createModule(
  courseId: number,
  title: string,
  desc: string,
) {
  const res = await pool.query(
    `INSERT INTO module(course_id,title,description)
     VALUES($1,$2,$3) RETURNING *`,
    [courseId, title, desc],
  );

  return res.rows[0];
}

import { unstable_cache } from "next/cache";

/**
 * Fetch modules scoped to a specific course OR a set of course IDs (enrolled courses).
 * This ensures LIMIT/OFFSET operates on the exact dataset the student can see,
 * preventing page-count mismatches when filtering by enrollment.
 */
export async function getModules(
  courseId?: number,
  limit?: number,
  offset?: number,
  courseIds?: number[]
) {
  const idsKey = courseIds ? courseIds.sort((a, b) => a - b).join(',') : 'all';
  const cacheKey = `modules-${courseId ?? idsKey}-${limit ?? 'none'}-${offset ?? 'none'}`;

  return unstable_cache(
    async () => {
      const values: any[] = [];
      let whereClause = '';

      if (courseId) {
        values.push(courseId);
        whereClause = ` WHERE course_id = $${values.length}`;
      } else if (courseIds && courseIds.length > 0) {
        // ANY($1::int[]) is safe & avoids dynamic IN list building
        values.push(courseIds);
        whereClause = ` WHERE course_id = ANY($${values.length}::int[])`;
      }

      let query = `SELECT * FROM module${whereClause} ORDER BY course_id, module_id`;

      if (limit !== undefined) {
        values.push(limit);
        query += ` LIMIT $${values.length}`;
      }
      if (offset !== undefined) {
        values.push(offset);
        query += ` OFFSET $${values.length}`;
      }

      const res = await pool.query(query, values);
      return res.rows;
    },
    [cacheKey],
    {
      revalidate: 3600,
      tags: [
        'modules',
        ...(courseId ? [`course-${courseId}-modules`] : []),
        ...(courseIds ? courseIds.map(id => `course-${id}-modules`) : []),
      ],
    }
  )();
}

export async function getModulesCount(courseId?: number, courseIds?: number[]) {
  const idsKey = courseIds ? courseIds.sort((a, b) => a - b).join(',') : 'all';
  const cacheKey = `modules-count-${courseId ?? idsKey}`;

  return unstable_cache(
    async () => {
      const values: any[] = [];
      let whereClause = '';

      if (courseId) {
        values.push(courseId);
        whereClause = ` WHERE course_id = $${values.length}`;
      } else if (courseIds && courseIds.length > 0) {
        values.push(courseIds);
        whereClause = ` WHERE course_id = ANY($${values.length}::int[])`;
      }

      const res = await pool.query(
        `SELECT COUNT(*)::int as count FROM module${whereClause}`,
        values
      );
      return res.rows[0].count;
    },
    [cacheKey],
    {
      revalidate: 3600,
      tags: [
        'modules',
        ...(courseId ? [`course-${courseId}-modules`] : []),
        ...(courseIds ? courseIds.map(id => `course-${id}-modules`) : []),
      ],
    }
  )();
}

export async function updateModule(
  moduleId: number,
  title: string,
  description: string,
) {
  const res = await pool.query(
    `UPDATE module SET title=$1, description=$2 WHERE module_id=$3 RETURNING *`,
    [title, description, moduleId],
  );
  return res.rows[0];
}

export async function deleteModule(moduleId: number) {
  const res = await pool.query(
    `DELETE FROM module WHERE module_id=$1 RETURNING *`,
    [moduleId],
  );
  return res.rows[0];
}
