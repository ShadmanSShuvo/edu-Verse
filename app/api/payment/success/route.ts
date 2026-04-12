/**
 * POST /api/payment/success
 *
 * SSLCommerz redirects the user here after a successful payment.
 * IMPORTANT: This endpoint receives form-URLencoded data (POST body), NOT JSON.
 *
 * Security flow:
 *  1. Read val_id + tran_id from the POST body.
 *  2. Call SSLCommerz server-to-server validate() — NEVER trust redirect alone.
 *  3. Only if response.status === 'VALID' || 'VALIDATED':
 *       completePaymentAndEnroll() — single atomic BEGIN/COMMIT transaction.
 *  4. Redirect user to the success page.
 */
import { NextRequest, NextResponse } from "next/server";
import { validatePayment } from "@/lib/sslcommerz";
import { completePaymentAndEnroll } from "@/db/orders";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse SSLCommerz form-encoded POST body ────────────────────────────
    const formData = await req.formData();
    const val_id = formData.get("val_id") as string | null;
    const tran_id = formData.get("tran_id") as string | null;
    const status = formData.get("status") as string | null;

    console.log(`[payment/success] status=${status} tran_id=${tran_id} val_id=${val_id}`);

    if (!val_id || !tran_id) {
      console.error("[payment/success] Missing val_id or tran_id");
      return NextResponse.redirect(
        new URL("/payment/fail?reason=missing_params", req.url)
      );
    }

    // ── 2. Server-side validation via SSLCommerz API ──────────────────────────
    const validation = await validatePayment(val_id);
    console.log("[payment/success] SSLCommerz validation:", validation.status);

    const isValid =
      validation.status === "VALID" || validation.status === "VALIDATED";

    if (!isValid) {
      console.warn(
        `[payment/success] Payment validation failed. status=${validation.status}`
      );
      return NextResponse.redirect(
        new URL(
          `/payment/fail?reason=validation_failed&tran_id=${encodeURIComponent(tran_id)}`,
          req.url
        )
      );
    }

    // Verify tran_id matches to prevent replay attacks
    if (validation.tran_id !== tran_id) {
      console.error(
        `[payment/success] tran_id mismatch: expected ${tran_id}, got ${validation.tran_id}`
      );
      return NextResponse.redirect(
        new URL("/payment/fail?reason=tran_id_mismatch", req.url)
      );
    }

    // ── 3. Atomic DB transaction: mark Completed + enroll student ─────────────
    await completePaymentAndEnroll(tran_id, val_id, validation.bank_tran_id, validation);
    console.log(`[payment/success] Enrollment committed for tran_id=${tran_id}`);

    // ── 4. Session-Restore Redirect ───────────────────────────────────────────
    // We use a client-side redirect bridge to ensure the browser clears its 
    // cross-site navigation state and correctly sends SameSite: Lax cookies.
    const successUrl = new URL(
      `/payment/success?tran_id=${encodeURIComponent(tran_id)}`,
      req.url
    ).toString();

    return new NextResponse(
      `<html><body><script>window.location.href = "${successUrl}";</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );

  } catch (err) {
    console.error("[payment/success] Unexpected error:", err);
    return NextResponse.redirect(new URL("/payment/fail?reason=server_error", req.url));
  }
}
