// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment as verifyPaystackPayment } from "@/lib/paystack";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
    }

    // 1. Verify with Paystack
    const paystackResponse = await verifyPaystackPayment(reference);
    const paystackData = paystackResponse.data;

    if (paystackData.status !== "success") {
      return NextResponse.json({
        success: false,
        status: paystackData.status || "failed",
        error: "Payment was not successful",
      });
    }

    // 2. Extract metadata
    const { userId, courseId } = paystackData.metadata;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Invalid transaction metadata" }, { status: 400 });
    }

    // 3. Update Payment Status in Firebase (if not already updated by webhook)
    const paymentsRef = adminDb.ref("payments");
    const snapshot = await paymentsRef
      .orderByChild("reference")
      .equalTo(reference)
      .once("value");

    if (snapshot.exists()) {
      const paymentKey = Object.keys(snapshot.val())[0];
      await paymentsRef.child(paymentKey).update({
        status: "success",
        paidAt: Date.now(),
        gatewayResponse: paystackData.gateway_response,
      });
    }

    return NextResponse.json({
      success: true,
      status: "success",
      amount: paystackData.amount / 100, // Convert from kobo to Naira
      gatewayResponse: paystackData.gateway_response,
    });

  } catch (error: any) {
    console.error("Verify payment API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}