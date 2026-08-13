// app/api/courses/[courseId]/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

// ✅ UPDATED: params is now typed as a Promise in Next.js 15
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } 
) {
  try {
    // ✅ FIX: Await the params object before accessing its properties
    const { courseId } = await params;

    // 1. Verify Authentication using the newly fixed adminAuth
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
    // First, try direct path (in case the DB key matches the ID exactly)
    let courseRef = adminDb.ref(`courses/${courseId}`);
    let courseSnap = await courseRef.once("value");
    let courseData = courseSnap.val();
    let dbKey = courseId;

    // 🔥 FALLBACK: If not found at direct path, search all courses for a matching 'id' property
    if (!courseData) {
      const allCoursesSnap = await adminDb.ref("courses").once("value");
      const allCourses = allCoursesSnap.val() || {};

      for (const [key, value] of Object.entries(allCourses)) {
        const course = value as any;
        if (course && course.id === courseId) {
          courseData = course;
          dbKey = key; // This is the actual Firebase push key
          courseRef = adminDb.ref(`courses/${key}`);
          break;
        }
      }
    }

    // If still not found after searching, it truly doesn't exist
    if (!courseData) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 3. Check if user is already enrolled
    const enrollmentsSnap = await adminDb.ref(`users/${uid}/enrollments`).once("value");
    const userEnrollments = enrollmentsSnap.val() || {};
    
    if (userEnrollments[courseId] || userEnrollments[dbKey]) {
      return NextResponse.json({ 
        message: "Already enrolled", 
        enrollment: userEnrollments[courseId] || userEnrollments[dbKey]
      });
    }

    // Also check top-level enrollments node just in case
    const topEnrollmentsSnap = await adminDb.ref("enrollments").orderByChild("userId").equalTo(uid).once("value");
    const topEnrollments = topEnrollmentsSnap.val() || {};
    for (const [key, value] of Object.entries(topEnrollments)) {
      const enr = value as any;
      if (enr.courseId === courseId || enr.courseId === dbKey) {
         return NextResponse.json({ 
           message: "Already enrolled", 
           enrollment: enr 
         });
      }
    }

    // 4. Create the Enrollment Record
    const totalLessons = (courseData.modules || []).reduce(
      (acc: number, mod: any) => acc + ((mod.lessons || []).length),
      0
    );

    const newEnrollment = {
      courseId: courseId, // Keep the logical ID for frontend matching
      courseTitle: courseData.title || "Untitled Course",
      courseSlug: courseData.slug || "",
      userId: uid,
      progress: 0,
      completedLessons: [],
      totalLessons: totalLessons,
      status: "active",
      enrolledAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Push to top-level enrollments node (needed for your Progress Page query)
    const newEnrollmentRef = await adminDb.ref("enrollments").push(newEnrollment);
    const finalEnrollment = { ...newEnrollment, id: newEnrollmentRef.key };
    
    // Mirror to user's sub-node for fast, direct fetching
    await adminDb.ref(`users/${uid}/enrollments/${courseId}`).set(finalEnrollment);

    return NextResponse.json({ 
      message: "Enrolled successfully", 
      enrollment: finalEnrollment 
    });

  } catch (error: any) {
    console.error("Enrollment API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}