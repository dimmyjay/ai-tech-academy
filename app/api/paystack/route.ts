import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, amount, email } = await request.json();

    // Initialize payment
    const paymentData = await initializePayment(email, amount, {
      userId,
      courseId,
      type: "course_certificate",
    });

    // Store pending payment in database
    const paymentRef = adminDb.ref("payments").push();
    await paymentRef.set({
      id: paymentRef.key,
      userId,
      courseId,
      amount,
      currency: "NGN",
      status: "pending",
      reference: paymentData.data.reference,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paymentData.data.authorization_url,
      reference: paymentData.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}