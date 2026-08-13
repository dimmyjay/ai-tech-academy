// app/api/courses/[courseId]/lessons/[lessonId]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;

    // 1. Verify Authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let uid: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 2. Find the Course (Robust Lookup)
    let courseRef = adminDb.ref(`courses/${courseId}`);
    let courseSnap = await courseRef.once("value");
    let courseData = courseSnap.val();
    let dbKey = courseId;

    if (!courseData) {
      const allCoursesSnap = await adminDb.ref("courses").once("value");
      const allCourses = allCoursesSnap.val() || {};
      for (const [key, value] of Object.entries(allCourses)) {
        const course = value as any;
        if (course && course.id === courseId) {
          courseData = course;
          dbKey = key;
          courseRef = adminDb.ref(`courses/${key}`);
          break;
        }
      }
    }

    if (!courseData) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // ✅ FIX: Always recalculate totalLessons from LIVE course data
    const actualTotalLessons = (courseData.modules || []).reduce(
      (acc: number, mod: any) => acc + ((mod.lessons || []).length),
      0
    );

    // 3. Find the user's enrollment
    let enrollmentRef = adminDb.ref(`users/${uid}/enrollments/${courseId}`);
    let enrollmentSnap = await enrollmentRef.once("value");
    let enrollmentData = enrollmentSnap.val();

    if (!enrollmentData) {
      enrollmentRef = adminDb.ref(`users/${uid}/enrollments/${dbKey}`);
      enrollmentSnap = await enrollmentRef.once("value");
      enrollmentData = enrollmentSnap.val();
    }

    if (!enrollmentData) {
      const topEnrollmentsSnap = await adminDb.ref("enrollments")
        .orderByChild("userId").equalTo(uid).once("value");
      const topEnrollments = topEnrollmentsSnap.val() || {};
      for (const [key, value] of Object.entries(topEnrollments)) {
        const enr = value as any;
        if (enr.courseId === courseId || enr.courseId === dbKey) {
          enrollmentData = enr;
          enrollmentRef = adminDb.ref(`enrollments/${key}`);
          break;
        }
      }
    }

    if (!enrollmentData) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // 4. Update completed lessons
    const completedLessons: string[] = enrollmentData.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // ✅ FIX: Calculate progress using ACTUAL total lessons, not stored value
    const progress = actualTotalLessons > 0
      ? Math.round((completedLessons.length / actualTotalLessons) * 100)
      : 0;

    const isNowComplete = progress >= 100;

    const updatedEnrollment = {
      ...enrollmentData,
      completedLessons,
      totalLessons: actualTotalLessons, // ✅ Sync with live course data
      progress,
      status: isNowComplete ? "completed" : "active",
      updatedAt: Date.now(),
      ...(isNowComplete && !enrollmentData.completedAt ? { completedAt: Date.now() } : {}),
    };

    // 5. Write to BOTH locations for consistency
    await enrollmentRef.update(updatedEnrollment);

    // Sync to the other location
    if (enrollmentRef.toString().includes("/users/")) {
      const topSnap = await adminDb.ref("enrollments")
        .orderByChild("userId").equalTo(uid).once("value");
      const topEnrollments = topSnap.val() || {};
      for (const [key, value] of Object.entries(topEnrollments)) {
        const enr = value as any;
        if (enr.courseId === courseId || enr.courseId === dbKey) {
          await adminDb.ref(`enrollments/${key}`).update(updatedEnrollment);
          break;
        }
      }
    } else {
      await adminDb.ref(`users/${uid}/enrollments/${courseId}`).update(updatedEnrollment);
    }

    return NextResponse.json({
      message: "Lesson marked complete",
      enrollment: updatedEnrollment,
    });

  } catch (error: any) {
    console.error("Mark lesson complete API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}