import { pool } from "@/lib/db";

export async function createPermission(name: string) {
  const res = await pool.query(
    `INSERT INTO permissions(name) VALUES($1) RETURNING *`,
    [name],
  );
  return res.rows[0];
}

export async function getPermissions() {
  const res = await pool.query(`SELECT * FROM permissions ORDER BY perm_id`);
  return res.rows;
}

export async function assignPermissionToRole(roleId: number, permId: number) {
  const res = await pool.query(
    `INSERT INTO role_perm(role_id, perm_id) VALUES($1, $2) RETURNING *`,
    [roleId, permId],
  );
  return res.rows[0];
}

export async function getRolePermissions(roleId: number) {
  const res = await pool.query(
    `SELECT p.perm_id, p.name
     FROM role_perm rp
     JOIN permissions p ON rp.perm_id=p.perm_id
     WHERE rp.role_id=$1`,
    [roleId],
  );
  return res.rows;
}
