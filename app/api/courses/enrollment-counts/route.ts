// app/api/courses/enrollment-counts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/courses/enrollment-counts?ids=courseA,courseB
 * Response: { counts: { [courseId]: number } }
 *
 * NOTE: This implementation assumes a top-level `enrollments` collection where each
 * enrollment object has at least: { courseId: string, status?: string }.
 * If your enrollments live under users or another shape, see notes below.
 */
export async function GET(req: NextRequest) {
  try {
    if (!adminDb || typeof adminDb.ref !== "function") {
      return NextResponse.json({ error: "Server DB not configured" }, { status: 500 });
    }

    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");
    if (!idsParam) return NextResponse.json({ counts: {} });

    const courseIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (courseIds.length === 0) return NextResponse.json({ counts: {} });

    const counts: Record<string, number> = {};
    // For each courseId query enrollments where courseId === ...
    // WARNING: If you have many courseIds or a large enrollments table, this can be slow.
    // Consider maintaining aggregated counters in the DB (increment on enroll/unenroll).
    for (const courseId of courseIds) {
      // Query enrollments by child 'courseId' == courseId
      const snap = await adminDb
        .ref("enrollments")
        .orderByChild("courseId")
        .equalTo(courseId)
        .once("value");

      if (!snap.exists()) {
        counts[courseId] = 0;
      } else {
        const val = snap.val();
        // val is an object mapping enrollmentId -> enrollmentRecord
        // Count only active learners (optional): check status !== 'dropped'
        let c = 0;
        Object.values(val).forEach((rec: any) => {
          // treat any truthy record as a learner; optionally filter by status
          if (!rec) return;
          // Example filter: only count active or completed
          // if (rec.status === 'dropped') return;
          c += 1;
        });
        counts[courseId] = c;
      }
    }

    return NextResponse.json({ counts });
  } catch (err) {
    console.error("[GET /api/courses/enrollment-counts] error:", err);
    return NextResponse.json({ error: (err as Error).message || "Unknown" }, { status: 500 });
  }
}