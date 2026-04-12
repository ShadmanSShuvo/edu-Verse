import Mux from "@mux/mux-node";
import { NextRequest, NextResponse } from "next/server";
import { createMaterial } from "@/db/material";
import { getSession } from "@/lib/session";
import { getInstructorByUserId } from "@/db/instructor";

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/video/upload-url - start");
    const session = await getSession();
    if (!session) {
      console.error("Unauthorized: no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructor = await getInstructorByUserId(session.user_id);
    if (!instructor) {
      console.error("Forbidden: instructor profile not found", session.user_id);
      return NextResponse.json({ error: "Instructor profile not found" }, { status: 403 });
    }

    const { name, moduleId, typeId } = await req.json();
    console.log("Request payload:", { name, moduleId, typeId });

    if (!name || !moduleId || !typeId) {
      console.error("Bad Request: missing fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate Mux env vars are present at runtime
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
    console.log("Mux env check:", { tokenId: tokenId ? "SET" : "MISSING", tokenSecret: tokenSecret ? "SET" : "MISSING" });

    if (!tokenId || !tokenSecret) {
      console.error("Mux credentials missing from environment");
      return NextResponse.json({ error: "Mux not configured", detail: "MUX_TOKEN_ID or MUX_TOKEN_SECRET is missing" }, { status: 500 });
    }

    // Instantiate Mux client per-request (ensures env vars are available)
    const mux = new Mux({ tokenId, tokenSecret });

    console.log("Creating Mux Direct Upload...");
    // 1. Create a Direct Upload with Mux
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
      },
      cors_origin: "*",
    });
    console.log("Mux Upload Created:", upload.id);

    // 2. Create the material record in 'pending' status
    console.log("Inserting material into DB...");
    const material = await createMaterial(
      moduleId,
      typeId,
      name,
      "pending-upload",
      instructor.instructor_id,
      undefined, // playbackId
      undefined, // assetId
      upload.id, // muxUploadId
      "pending"
    );
    console.log("Material created in DB:", material.material_id);

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
      materialId: material.material_id,
    });

  } catch (error: any) {
    console.error("Mux upload URL error:", error?.message ?? error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      detail: error?.message ?? String(error) 
    }, { status: 500 });
  }
}
