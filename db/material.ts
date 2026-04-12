import { pool } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function createMaterialType(typeName: string) {
  const res = await pool.query(
    `INSERT INTO material_type(type_name) VALUES($1) RETURNING *`,
    [typeName],
  );
  return res.rows[0];
}

export const getMaterialTypes = unstable_cache(
  async function () {
    const res = await pool.query(`SELECT * FROM material_type ORDER BY type_id`);
    return res.rows;
  },
  ["material-types"],
  { revalidate: 3600, tags: ["materials"] }
);

/** Create a material, recording which instructor uploaded it. */
export async function createMaterial(
  moduleId: number,
  typeId: number,
  name: string,
  url: string,
  instructorId?: number,
  muxPlaybackId?: string,
  muxAssetId?: string,
  muxUploadId?: string,
  muxStatus?: string,
) {
  const res = await pool.query(
    `INSERT INTO material(module_id, type_id, name, url, uploaded_by, mux_playback_id, mux_asset_id, mux_upload_id, mux_status)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      moduleId,
      typeId,
      name,
      url,
      instructorId ?? null,
      muxPlaybackId ?? null,
      muxAssetId ?? null,
      muxUploadId ?? null,
      muxStatus ?? 'pending'
    ],
  );
  return res.rows[0];
}

export async function updateMaterialStatusByAssetId(
  assetId: string,
  status: string,
  playbackId?: string
) {
  const query = playbackId 
    ? `UPDATE material SET mux_status = $1, mux_playback_id = $2 WHERE mux_asset_id = $3 RETURNING *`
    : `UPDATE material SET mux_status = $1 WHERE mux_asset_id = $2 RETURNING *`;
  
  const params = playbackId ? [status, playbackId, assetId] : [status, assetId];
  
  const res = await pool.query(query, params);
  return res.rows[0];
}

export async function updateMaterialAssetIdByUploadId(
  uploadId: string,
  assetId: string,
) {
  const res = await pool.query(
    `UPDATE material SET mux_asset_id = $1 WHERE mux_upload_id = $2 RETURNING *`,
    [assetId, uploadId]
  );
  return res.rows[0];
}

export async function getMaterials(moduleId?: number) {
  const cacheKey = moduleId ? `materials-for-module-${moduleId}` : 'all-materials';

  return unstable_cache(
    async () => {
      if (moduleId) {
        const res = await pool.query(
          `SELECT m.*, mt.type_name,
                  i.instructor_id,
                  u.name AS uploader_name
           FROM material m
           JOIN material_type mt ON m.type_id = mt.type_id
           LEFT JOIN instructor i ON m.uploaded_by = i.instructor_id
           LEFT JOIN users u ON i.user_id = u.user_id
           WHERE m.module_id = $1`,
          [moduleId],
        );
        return res.rows;
      }
      const res = await pool.query(`
        SELECT m.*, mt.type_name,
               i.instructor_id,
               u.name AS uploader_name
        FROM material m
        JOIN material_type mt ON m.type_id = mt.type_id
        LEFT JOIN instructor i ON m.uploaded_by = i.instructor_id
        LEFT JOIN users u ON i.user_id = u.user_id
      `);
      return res.rows;
    },
    [cacheKey],
    { revalidate: 3600, tags: ["materials", ...(moduleId ? [`module-${moduleId}-materials`] : [])] }
  )();
}

export async function deleteMaterial(materialId: number) {
  const res = await pool.query(
    `DELETE FROM material WHERE material_id=$1 RETURNING *`,
    [materialId],
  );
  return res.rows[0];
}
