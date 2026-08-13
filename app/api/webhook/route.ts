import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.event;

    // Verify webhook signature (recommended for production)
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== request.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (event === "charge.success") {
      const data = body.data;
      const { userId, courseId } = data.metadata;

      // Update payment status
      const paymentsRef = adminDb.ref("payments");
      const snapshot = await paymentsRef
        .orderByChild("reference")
        .equalTo(data.reference)
        .once("value");

      if (snapshot.exists()) {
        const paymentKey = Object.keys(snapshot.val())[0];
        await paymentsRef.child(paymentKey).update({
          status: "success",
          paidAt: Date.now(),
        });

        // Create enrollment
        const enrollmentRef = adminDb.ref("enrollments").push();
        await enrollmentRef.set({
          id: enrollmentRef.key,
          userId,
          courseId,
          status: "active",
          progress: 0,
          completedLessons: [],
          quizScores: {},
          examTaken: false,
          examScore: null,
          certificateId: null,
          enrolledAt: Date.now(),
          lastAccessed: Date.now(),
        });

        // Add to user's enrolled courses
        await adminDb
          .ref(`users/${userId}/enrolledCourses`)
          .push(courseId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}