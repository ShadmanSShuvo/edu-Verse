import { pool } from "@/lib/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export async function createRole(name: string) {
  const res = await pool.query(
    `INSERT INTO roles(name) VALUES($1) RETURNING *`,
    [name],
  );
  return res.rows[0];
}

export async function getRoles() {
  const res = await pool.query(`SELECT * FROM roles ORDER BY role_id`);
  return res.rows;
}

export async function getRoleByName(name: string) {
  const res = await pool.query(
    `SELECT * FROM roles WHERE name = $1`,
    [name],
  );
  return res.rows[0];
}

export async function assignRoleToUser(userId: number, roleId: number) {
  const res = await pool.query(
    `INSERT INTO user_role(user_id, role_id) VALUES($1, $2) RETURNING *`,
    [userId, roleId],
  );
  return res.rows[0];
}

// unstable_cache: caches the result server-side for 60 s across all requests.
// React.cache outer wrap: deduplicates calls within a single render pass
// (e.g., Navbar + dashboard page both calling getUserRoles with same userId).
export const getUserRoles = cache(async function (userId: number) {
  return unstable_cache(
    async () => {
      const res = await pool.query(
        `SELECT r.role_id, r.name
         FROM user_role ur
         JOIN roles r ON ur.role_id=r.role_id
         WHERE ur.user_id=$1`,
        [userId],
      );
      return res.rows;
    },
    [`user-roles-${userId}`], // ← include userId to avoid caching for all users
    { revalidate: 60, tags: ["roles"] }
  )();
});
