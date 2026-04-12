/**
 * POST /api/payment/cancel
 * SSLCommerz POSTs here when the user cancels at the gateway.
 */
import { NextRequest, NextResponse } from "next/server";
import { updatePaymentStatusByTranId } from "@/db/orders";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string | null;

    console.log(`[payment/cancel] tran_id=${tran_id}`);

    if (tran_id) {
      await updatePaymentStatusByTranId(tran_id, "Cancelled");
    }
  } catch (err) {
    console.error("[payment/cancel] Error:", err);
  }

  const cancelUrl = new URL("/payment/cancel", req.url).toString();
  return new NextResponse(
    `<html><body><script>window.location.href = "${cancelUrl}";</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

