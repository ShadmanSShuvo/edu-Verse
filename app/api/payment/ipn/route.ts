/**
 * POST /api/payment/ipn
 *
 * Instant Payment Notification — SSLCommerz calls this endpoint in the
 * background regardless of where the user's browser ends up.  This is the
 * most reliable trigger for completing enrollment.
 *
 * Security flow (identical to /success but no browser redirect):
 *  1. Validate via val_id server-to-server.
 *  2. If VALID → run completePaymentAndEnroll() (idempotent).
 *  3. Return HTTP 200 so SSLCommerz stops retrying.
 */
import { NextRequest, NextResponse } from "next/server";
import { validatePayment } from "@/lib/sslcommerz";
import { completePaymentAndEnroll, updatePaymentStatusByTranId } from "@/db/orders";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const val_id   = formData.get("val_id")   as string | null;
    const tran_id  = formData.get("tran_id")  as string | null;
    const status   = formData.get("status")   as string | null;

    console.log(`[payment/ipn] status=${status} tran_id=${tran_id} val_id=${val_id}`);

    if (!val_id || !tran_id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Server-to-server validation
    const validation = await validatePayment(val_id);
    console.log(`[payment/ipn] SSLCommerz validation: ${validation.status}`);

    const isValid =
      validation.status === "VALID" || validation.status === "VALIDATED";

    if (isValid && validation.tran_id === tran_id) {
      // Atomic: mark Completed + enroll (idempotent — safe if success already ran)
      await completePaymentAndEnroll(tran_id, val_id, validation.bank_tran_id, validation);
      console.log(`[payment/ipn] Enrollment committed for tran_id=${tran_id}`);
    } else {
      // Mark as failed if the payment is definitively rejected
      if (
        status === "FAILED" ||
        validation.status === "INVALID_TRANSACTION" ||
        validation.status === "EXPIRED"
      ) {
        await updatePaymentStatusByTranId(tran_id, "Failed");
      }
    }

    // Always return 200 to stop SSLCommerz from retrying
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[payment/ipn] Error:", err);
    // Return 200 anyway so SSLCommerz doesn't keep retrying on transient errors
    return NextResponse.json({ received: true, error: "Internal error" });
  }
}
