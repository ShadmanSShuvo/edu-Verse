import Mux from "@mux/mux-node";
import { NextRequest, NextResponse } from "next/server";
import { updateMaterialStatusByAssetId, updateMaterialAssetIdByUploadId } from "@/db/material";
import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * GET /api/video/sync
 * 
 * Checks Mux for the status of all pending video materials and updates the DB.
 * Useful for local development where webhooks can't reach localhost.
 */
export async function GET(req: NextRequest) {
  try {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      return NextResponse.json({ error: "Mux not configured" }, { status: 500 });
    }

    const mux = new Mux({ tokenId, tokenSecret });

    // Find all pending video materials that have a mux_upload_id
    const { rows: pendingMaterials } = await pool.query(
      `SELECT material_id, mux_upload_id, mux_asset_id 
       FROM material 
       WHERE mux_status = 'pending' 
         AND (mux_upload_id IS NOT NULL OR mux_asset_id IS NOT NULL)`
    );

    if (pendingMaterials.length === 0) {
      return NextResponse.json({ message: "No pending materials to sync.", synced: 0 });
    }

    let synced = 0;
    const results: any[] = [];

    for (const mat of pendingMaterials) {
      try {
        let assetId = mat.mux_asset_id;

        // If we only have an upload_id, resolve it to an asset_id first
        if (!assetId && mat.mux_upload_id) {
          const upload = await mux.video.uploads.retrieve(mat.mux_upload_id);
          if (upload.asset_id) {
            assetId = upload.asset_id;
            await updateMaterialAssetIdByUploadId(mat.mux_upload_id, assetId);
            console.log(`Resolved upload ${mat.mux_upload_id} → asset ${assetId}`);
          } else {
            results.push({ material_id: mat.material_id, status: "upload_not_complete" });
            continue;
          }
        }

        // Check the asset status
        const asset = await mux.video.assets.retrieve(assetId);
        console.log(`Asset ${assetId} status: ${asset.status}`);

        if (asset.status === "ready") {
          const playbackId = asset.playback_ids?.[0]?.id;
          if (playbackId) {
            await updateMaterialStatusByAssetId(assetId, "Active", playbackId);
            synced++;
            results.push({ material_id: mat.material_id, status: "ready", playbackId });
          }
        } else if (asset.status === "errored") {
          await updateMaterialStatusByAssetId(assetId, "Error");
          results.push({ material_id: mat.material_id, status: "error" });
        } else {
          results.push({ material_id: mat.material_id, status: asset.status });
        }
      } catch (err: any) {
        results.push({ material_id: mat.material_id, error: err.message });
      }
    }

    revalidatePath("/instructor");
    revalidatePath("/modules");

    return NextResponse.json({ synced, total: pendingMaterials.length, results });

  } catch (error: any) {
    console.error("Sync error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
