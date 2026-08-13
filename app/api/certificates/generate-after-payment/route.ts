import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateCertificateNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId, examScore, transactionReference } = await req.json();

    if (!userId || !courseId || !transactionReference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Optionally verify transaction with Paystack API here
    // const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${transactionReference}`, {
    //   headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    // });

    // Fetch course details
    const courseSnap = await adminDb.ref(`courses/${courseId}`).once("value");
    if (!courseSnap.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const course = courseSnap.val();

    // Fetch user details
    const userSnap = await adminDb.ref(`users/${userId}`).once("value");
    const userName = userSnap.exists() ? userSnap.val().name : "Student";

    // Generate certificate
    const certRef = adminDb.ref(`users/${userId}/certificates`).push();
    const certificateId = certRef.key!;

    const grade = examScore >= 90 ? "Distinction" : examScore >= 80 ? "Merit" : "Pass";

    const certData = {
      id: certificateId,
      userId,
      courseId,
      certificateNumber: generateCertificateNumber(),
      issuedAt: Date.now(),
      verified: true,
      isPaid: true,
      paidAt: Date.now(),
      transactionRef: transactionReference,
      studentName: userName,
      courseName: course.title || "Course Certificate",
      courseSlug: course.slug || "",
      grade,
      score: examScore,
      status: "active",
    };

    // Save to both paths
    const updates: Record<string, any> = {};
    updates[`users/${userId}/certificates/${certificateId}`] = certData;
    updates[`certificates/${userId}/${certificateId}`] = certData;
    
    // Update enrollment status
    // Find enrollment ID
    const enrollSnap = await adminDb.ref(`users/${userId}/enrollments`)
      .orderByChild("courseId")
      .equalTo(courseId)
      .once("value");
    
    if (enrollSnap.exists()) {
      const enrollKey = Object.keys(enrollSnap.val())[0];
      updates[`users/${userId}/enrollments/${enrollKey}/certificateId`] = certificateId;
      updates[`users/${userId}/enrollments/${enrollKey}/status`] = "certified";
      updates[`enrollments/${enrollKey}/certificateId`] = certificateId;
      updates[`enrollments/${enrollKey}/status`] = "certified";
    }

    await adminDb.ref().update(updates);

    return NextResponse.json({ success: true, certificateId });
  } catch (err) {
    console.error("Generate certificate after payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}