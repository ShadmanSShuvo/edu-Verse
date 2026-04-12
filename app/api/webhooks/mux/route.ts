import { NextRequest, NextResponse } from "next/server";
import { mux } from "@/lib/mux";
import { 
  updateMaterialStatusByAssetId, 
  updateMaterialAssetIdByUploadId 
} from "@/db/material";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("mux-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    // Verify the webhook signature
    // Note: You need to set MUX_WEBHOOK_SECRET in your env
    mux.webhooks.verifySignature(
      body,
      { "mux-signature": signature },
      process.env.MUX_WEBHOOK_SECRET!
    );

    const event = JSON.parse(body);
    const { type, data } = event;

    console.log(`Mux Webhook received: ${type}`, data.id);

    switch (type) {
      case "video.asset.created":
        // Link the asset ID to the material using the upload_id
        if (data.upload_id) {
          await updateMaterialAssetIdByUploadId(data.upload_id, data.id);
          console.log(`Linked asset ${data.id} to upload ${data.upload_id}`);
        }
        break;

      case "video.asset.ready":
        const playbackId = data.playback_ids?.[0]?.id;
        if (playbackId) {
          await updateMaterialStatusByAssetId(data.id, "Active", playbackId);
          console.log(`Asset ${data.id} is ready with playback ID ${playbackId}`);
          
          // Revalidate paths to show the new video
          revalidatePath("/instructor");
          revalidatePath("/courses/[id]", "page");
        }
        break;

      case "video.asset.errored":
        await updateMaterialStatusByAssetId(data.id, "Error");
        console.error(`Asset ${data.id} failed to process`);
        break;
      
      case "video.upload.errored":
        // Handle upload errors if needed
        console.error(`Upload ${data.id} failed`);
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Mux webhook error:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
