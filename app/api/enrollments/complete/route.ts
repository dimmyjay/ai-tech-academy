// app/api/enrollments/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  // Use service account via env or application default credentials in production
  const credential =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_PRIVATE_KEY
      ? admin.credential.applicationDefault()
      : admin.credential.applicationDefault();

  admin.initializeApp({
    credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const courseId = body?.courseId;
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const db = admin.database();

    const updatedKeys: string[] = [];
    const candidates: Array<{ path: string; key: string; record: any }> = [];

    // 1) /users/{uid}/enrollments (preferred shape)
    const userEnrollRef = db.ref(`users/${uid}/enrollments`);
    const userSnap = await userEnrollRef.once("value");
    if (userSnap.exists()) {
      const val = userSnap.val();
      for (const [k, rec] of Object.entries(val)) {
        const r: any = rec;
        candidates.push({ path: `users/${uid}/enrollments/${k}`, key: k, record: r });
        if (r && (String(r.courseId) === String(courseId) || String(r.course_slug) === String(courseId))) {
          await db.ref(`users/${uid}/enrollments/${k}`).update({ status: "completed", progress: 100, completedAt: Date.now() });
          updatedKeys.push(`users/${uid}/enrollments/${k}`);
        }
      }
    }

    // 2) top-level /enrollments where userId == uid (fast if indexOn userId)
    const enrollRef = db.ref("enrollments");
    const enrollSnap = await enrollRef.orderByChild("userId").equalTo(uid).once("value");
    if (enrollSnap.exists()) {
      const val2 = enrollSnap.val();
      for (const [k, rec] of Object.entries(val2)) {
        const r: any = rec;
        candidates.push({ path: `enrollments/${k}`, key: k, record: r });
        if (r && (String(r.courseId) === String(courseId) || String(r.course_slug) === String(courseId))) {
          await db.ref(`enrollments/${k}`).update({ status: "completed", progress: 100, completedAt: Date.now() });
          updatedKeys.push(`enrollments/${k}`);
        }
      }
    }

    // 3) If still nothing updated, attempt looser matches (slug/title) across user's enrollments already collected
    if (updatedKeys.length === 0) {
      // try matching by slug/title among collected candidates
      const loweredCourseId = String(courseId).toLowerCase();
      for (const c of candidates) {
        const r = c.record || {};
        const possibleTitles = [r.courseTitle, r.course_title, r.courseSlug, r.course_slug, r.title].filter(Boolean).map(String);
        for (const t of possibleTitles) {
          if (t && (t.toLowerCase() === loweredCourseId || t.toLowerCase().includes(loweredCourseId) || loweredCourseId.includes(t.toLowerCase()))) {
            await db.ref(c.path).update({ status: "completed", progress: 100, completedAt: Date.now() });
            updatedKeys.push(c.path);
            break;
          }
        }
      }
    }

    if (updatedKeys.length === 0) {
      return NextResponse.json({ updated: false, message: "No matching enrollment", candidates: candidates.slice(0, 20) }, { status: 404 });
    }

    return NextResponse.json({ updated: true, updatedKeys });
  } catch (err: any) {
    console.error("enrollments/complete error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}