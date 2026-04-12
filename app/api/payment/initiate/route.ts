/**
 * POST /api/payment/initiate
 *
 * Called by the client-side PayButton component.
 * 1. Validates the session server-side.
 * 2. Fetches course details from the DB.
 * 3. Generates a unique tran_id.
 * 4. Writes an order + Pending payment record in a single atomic transaction.
 * 5. Calls SSLCommerz init() → returns { gatewayUrl } to the client.
 *
 * The client then does: window.location.href = gatewayUrl
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getCourseById } from "@/db/courses";
import { createPendingPayment, updateOrderSessionKey } from "@/db/orders";
import { initiatePayment } from "@/lib/sslcommerz";
import { getUserById } from "@/db/users";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = await getUserRoles(session.user_id);
    const role = roles[0]?.name ?? "student";
    if (role !== "student") {
      return NextResponse.json(
        { error: "Only students can initiate payments" },
        { status: 403 }
      );
    }

    // ── 2. Parse request body ─────────────────────────────────────────────────
    const body = await req.json();
    const courseIds: number[] = Array.isArray(body.courseIds)
      ? body.courseIds.map(Number).filter(Boolean)
      : [];

    if (courseIds.length === 0) {
      return NextResponse.json(
        { error: "No course IDs provided" },
        { status: 400 }
      );
    }

    // ── 3. Calculate total amount ─────────────────────────────────────────────
    let totalAmount = 0;
    const courseNames: string[] = [];
    for (const cId of courseIds) {
      const course = await getCourseById(cId);
      if (!course) {
        return NextResponse.json(
          { error: `Course ${cId} not found` },
          { status: 404 }
        );
      }
      totalAmount += Number(course.price);
      courseNames.push(course.title);
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 }
      );
    }

    // ── 4. Fetch customer info ────────────────────────────────────────────────
    const user = await getUserById(session.user_id);
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // ── 5. Generate unique tran_id ────────────────────────────────────────────
    const tranId = `EDUVRS-${session.user_id}-${Date.now()}`;

    // ── 6. Write order + Pending payment (atomic) ─────────────────────────────
    await createPendingPayment(session.user_id, courseIds, totalAmount, tranId);

    // ── 7. Call SSLCommerz init ───────────────────────────────────────────────
    const sslData = {
      total_amount: totalAmount,
      currency: "BDT" as const,
      tran_id: tranId,
      success_url: `${BASE_URL}/api/payment/success`,
      fail_url: `${BASE_URL}/api/payment/fail`,
      cancel_url: `${BASE_URL}/api/payment/cancel`,
      ipn_url: `${BASE_URL}/api/payment/ipn`,
      shipping_method: "No",
      product_name: courseNames.join(", "),
      product_category: "Online Course",
      product_profile: "non-physical-goods",
      cus_name: user?.name ?? session.name ?? "Student",
      cus_email: user?.email ?? session.email ?? "student@example.com",
      cus_add1: "Bangladesh",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: user?.phone_no ?? "01700000000",
    };

    const apiResponse = await initiatePayment(sslData);

    if (!apiResponse?.GatewayPageURL || !apiResponse?.sessionkey) {
      console.error("[payment/initiate] SSLCommerz error:", apiResponse);
      return NextResponse.json(
        {
          error:
            apiResponse?.failedreason ??
            "Failed to get payment gateway URL from SSLCommerz",
        },
        { status: 502 }
      );
    }

    // ── 8. Store the session key in the database ─────────────────────────────
    await updateOrderSessionKey(tranId, apiResponse.sessionkey);

    return NextResponse.json({ gatewayUrl: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("[payment/initiate] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
