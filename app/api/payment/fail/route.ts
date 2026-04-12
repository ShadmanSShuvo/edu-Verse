/**
 * POST /api/payment/fail
 * SSLCommerz POSTs here when the payment fails at the gateway.
 */
import { NextRequest, NextResponse } from "next/server";
import { updatePaymentStatusByTranId } from "@/db/orders";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string | null;

    console.log(`[payment/fail] tran_id=${tran_id}`);

    if (tran_id) {
      await updatePaymentStatusByTranId(tran_id, "Failed");
    }
  } catch (err) {
    console.error("[payment/fail] Error:", err);
  }

  const failUrl = new URL("/payment/fail", req.url).toString();
  return new NextResponse(
    `<html><body><script>window.location.href = "${failUrl}";</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

