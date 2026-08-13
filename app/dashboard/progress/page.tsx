"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Award, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourseContext } from "@/context/CourseContext";
import { getAllCourses } from "@/services/course";
import ProgressCard from "@/components/ProgressCard";
import Loader from "@/components/Loader";
import type { Course, Enrollment } from "@/types/course";
import { db } from "@/lib/firebase";
import {
  ref as dbRef,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  onChildChanged,
  onChildAdded,
} from "firebase/database";

interface MyCourseData extends Enrollment {
  courseDetails: Course;
  totalLessons: number;
  normalizedCourseId?: string;
  _displayCompletedLessons: number;
}

type FilterType = "all" | "active" | "completed" | "certified";

function slugify(text = "") {
  return text.toString().trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { enrollments: ctxEnrollments, loading: enrollmentsLoading } = useCourseContext();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [localEnrollments, setLocalEnrollments] = useState<any>(ctxEnrollments ?? []);
  const [notification, setNotification] = useState<{ courseId: string; title: string } | null>(null);
  const prevEnrollmentsRef = useRef<Record<string, any> | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchCourses() {
      try {
        const data = await getAllCourses();
        if (!mounted) return;
        setCourses(Array.isArray(data) ? (data as Course[]) : []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchCourses();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setLocalEnrollments(ctxEnrollments ?? []);
  }, [ctxEnrollments]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [user, authLoading, router]);

  function findMatchingCourse(enrollment: any): Course | undefined {
    if (!enrollment || courses.length === 0) return undefined;
    const cid = enrollment.courseId || enrollment.course_id || enrollment.course || null;
    if (cid) {
      const byId = courses.find((c) => String(c.id) === String(cid));
      if (byId) return byId;
    }
    const slug = enrollment.courseSlug || enrollment.course_slug || enrollment.slug || (enrollment.courseTitle ? slugify(enrollment.courseTitle) : null);
    if (slug) {
      const bySlug = courses.find((c) => String(c.slug) === String(slug));
      if (bySlug) return bySlug;
    }
    const title = (enrollment.courseTitle || enrollment.course_title || enrollment.title || "").toString().trim();
    if (title) {
      const t = title.toLowerCase();
      const titleSlug = slugify(title);
      const byTitleExact = courses.find((c) => (c.title || "").toLowerCase() === t);
      if (byTitleExact) return byTitleExact;
      const byTitleSlug = courses.find((c) => slugify(c.title || "") === titleSlug || (c.slug && c.slug === titleSlug));
      if (byTitleSlug) return byTitleSlug;
      const byPartial = courses.find((c) => (c.title || "").toLowerCase().includes(t) || t.includes((c.title || "").toLowerCase()));
      if (byPartial) return byPartial;
    }
    if (enrollment.course || enrollment.courseName) {
      const candidate = (enrollment.course || enrollment.courseName).toString().toLowerCase();
      const byLoose = courses.find((c) => (c.title || "").toLowerCase().includes(candidate) || (c.slug || "").toLowerCase().includes(candidate));
      if (byLoose) return byLoose;
    }
    return undefined;
  }

  const refreshCourses = async () => {
    setLoading(true);
    try {
      const fresh = await getAllCourses();
      setCourses(Array.isArray(fresh) ? (fresh as Course[]) : []);
    } catch (e) {
      console.error("refresh courses failed", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: normalizeSnap now explicitly preserves lessonProgress and completedLessons
  useEffect(() => {
    if (!user?.uid) return;

    const normalizeSnap = (val: any): Record<string, any> => {
      if (!val) return {};
      if (Array.isArray(val)) {
        const obj: Record<string, any> = {};
        val.forEach((v: any) => {
          if (!v) return;
          const id = v.id || v.courseId || JSON.stringify(v);
          obj[id] = v; // Preserves all nested objects including lessonProgress
        });
        return obj;
      }
      return typeof val === "object" ? val : {};
    };

    const mergeEnrollmentData = (prev: Record<string, any>, incoming: Record<string, any>): Record<string, any> => {
      const merged = { ...prev };
      for (const [key, val] of Object.entries(incoming)) {
        if (!val) continue;
        const existing = merged[key] || {};
        merged[key] = {
          ...existing,
          ...val,
          // ✅ CRITICAL: Deep merge lessonProgress so partial updates don't wipe it
          lessonProgress: {
            ...(existing.lessonProgress || {}),
            ...(val.lessonProgress || {}),
          },
          // ✅ CRITICAL: Merge completedLessons (handle both array and object forms)
          completedLessons: Array.isArray(val.completedLessons)
            ? val.completedLessons
            : Array.isArray(existing.completedLessons)
              ? existing.completedLessons
              : val.completedLessons || existing.completedLessons || [],
        };
      }
      return merged;
    };

    const unsubscribeFns: Array<() => void> = [];
    let currentData: Record<string, any> = {};

    const updateState = (newData: Record<string, any>) => {
      currentData = newData;
      const arr = Object.values(newData) as Enrollment[];
      detectConcludedCourses(newData);
      setLocalEnrollments(arr);
      prevEnrollmentsRef.current = newData;
    };

    const userEnrollRef = dbRef(db, `users/${user.uid}/enrollments`);
    const userEnrollListener = (snap: any) => {
      const val = snap.val();
      if (val == null) return;
      const normalized = normalizeSnap(val);
      updateState(mergeEnrollmentData(currentData, normalized));
    };
    onValue(userEnrollRef, userEnrollListener);
    unsubscribeFns.push(() => off(userEnrollRef, "value", userEnrollListener));

    const enrollmentsRef = dbRef(db, "enrollments");
    const q = query(enrollmentsRef, orderByChild("userId"), equalTo(user.uid));

    const topLevelListener = (snap: any) => {
      const val = snap.val();
      if (val == null) return;
      const normalized = normalizeSnap(val);
      updateState(mergeEnrollmentData(currentData, normalized));
    };
    onValue(q, topLevelListener);
    unsubscribeFns.push(() => off(q, "value", topLevelListener));

    const childChangedHandler = (snap: any) => {
      const changed = snap.val();
      if (!changed) return;
      const key = snap.key as string;
      updateState(mergeEnrollmentData(currentData, { [key]: changed }));
    };
    onChildChanged(q, childChangedHandler);
    unsubscribeFns.push(() => off(q, "child_changed", childChangedHandler));

    const childAddedHandler = (snap: any) => {
      const added = snap.val();
      if (!added) return;
      const key = snap.key as string;
      updateState(mergeEnrollmentData(currentData, { [key]: added }));
    };
    onChildAdded(q, childAddedHandler);
    unsubscribeFns.push(() => off(q, "child_added", childAddedHandler));

    return () => {
      unsubscribeFns.forEach((fn) => { try { fn(); } catch {} });
    };
  }, [user?.uid]);

  function detectConcludedCourses(newItems: Record<string, any>) {
    try {
      const prev = prevEnrollmentsRef.current ?? {};
      const concludedIds: string[] = [];
      for (const [key, newVal] of Object.entries(newItems)) {
        const prevVal = prev[key];
        const prevProgress = prevVal ? Number(prevVal.progress ?? 0) : 0;
        const newProgress = Number(newVal.progress ?? 0);
        const prevStatus = prevVal ? String(prevVal.status ?? "") : "";
        const newStatus = String(newVal.status ?? "");
        const wasConcludedBefore = prevProgress >= 100 || prevStatus === "completed";
        const isConcludedNow = newProgress >= 100 || newStatus === "completed";
        if (!wasConcludedBefore && isConcludedNow) {
          concludedIds.push(newVal.courseId || newVal.id || key);
        }
      }
      if (concludedIds.length > 0) {
        const cid = concludedIds[0];
        const course = courses.find((c) => c.id === cid) || Object.values(newItems).find((v: any) => v.courseId === cid);
        const title = course?.title || (newItems[cid]?.courseTitle ?? "a course");
        setNotification({ courseId: cid, title });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error("detectConcludedCourses error:", e);
    }
  }

  const myCourses = useMemo((): MyCourseData[] => {
    const source = localEnrollments ?? [];
    const arr = Array.isArray(source) ? source : Object.values(source);

    return arr.map((enrollment: any) => {
      const matched = findMatchingCourse(enrollment);

      // 1. ROBUST TOTAL LESSONS COUNT
      let totalLessons = 0;
      if (matched?.modules && matched.modules.length > 0) {
        totalLessons = matched.modules.reduce(
          (acc: number, m: any) => acc + (m.lessons?.length || 0),
          0
        );
      }
      if (totalLessons === 0 && enrollment.totalLessons) {
        totalLessons = Number(enrollment.totalLessons);
      }

      // 2. ROBUST COMPLETED LESSONS COUNT
           // 2. ROBUST COMPLETED LESSONS COUNT
      let completedCount = 0;
      const cl = enrollment.completedLessons;
      const lp = enrollment.lessonProgress || {};

      // A) Count from explicitly marked completedLessons (button clicks)
      if (Array.isArray(cl)) {
        completedCount = cl.filter(Boolean).length;
      } else if (cl && typeof cl === "object") {
        completedCount = Object.keys(cl).length;
      } else if (typeof cl === "number") {
        completedCount = cl;
      }

      // ✅ B) ALSO count lessons that reached 100% via scrolling (lessonProgress map)
      const progressCompletedCount = Object.values(lp).filter((v: any) => Number(v) >= 100).length;
      
      // Take the higher of the two counts to ensure we never undercount
      completedCount = Math.max(completedCount, progressCompletedCount);

      // 3. DERIVE PROGRESS FROM GRANULAR lessonProgress MAP
      let calculatedProgress = 0;
      const lessonProgressMap = enrollment.lessonProgress || {};

      if (totalLessons > 0) {
        const totalPercent = Object.values(lessonProgressMap).reduce(
          (sum: number, val: any) => sum + (Number(val) || 0),
          0
        );

        const completedSet = new Set(
          Array.isArray(cl) ? cl.map(String) :
          cl && typeof cl === "object" ? Object.keys(cl) : []
        );
        const mapKeys = new Set(Object.keys(lessonProgressMap));
        let extraCompleted = 0;
        completedSet.forEach((id) => {
          if (!mapKeys.has(id)) extraCompleted += 100;
        });

        calculatedProgress = Math.min(100, Math.round((totalPercent + extraCompleted) / totalLessons));
      }

      // 4. DETERMINE FINAL DISPLAY VALUES
      const rawProgress = Number(enrollment.progress ?? 0);
      const isCompletedStatus = enrollment.status === "completed" || enrollment.status === "certified";

      let displayProgress = rawProgress;
      if (isCompletedStatus) {
        displayProgress = 100;
      } else if (calculatedProgress > 0) {
        displayProgress = calculatedProgress;
      }

      if (displayProgress === 0 && completedCount > 0) {
        displayProgress = Math.max(1, Math.round((completedCount / (totalLessons || 1)) * 100));
      }

      if (!isCompletedStatus && totalLessons > 0 && completedCount >= totalLessons) {
        displayProgress = 100;
      }

      const placeholder: Course = !matched ? {
        id: enrollment.courseId || `unknown-${Math.random().toString(36).slice(2, 8)}`,
        title: enrollment.courseTitle || "Untitled Course",
        slug: enrollment.courseSlug || slugify(enrollment.courseTitle || "") || `unknown-${Math.random().toString(36).slice(2, 8)}`,
        thumbnail: enrollment.thumbnail || "",
        category: enrollment.category || "Unknown",
        modules: [],
        description: enrollment.courseDescription || "",
      } : matched;

      return {
        ...enrollment,
        progress: displayProgress,
        completedLessons: cl || [],
        courseDetails: placeholder,
        totalLessons,
        normalizedCourseId: String(placeholder.id),
        _displayCompletedLessons: completedCount, // ✅ Always a number
      } as MyCourseData;
    }).filter(Boolean);
  }, [localEnrollments, courses]);

  const stats = useMemo(() => ({
    total: myCourses.length,
    active: myCourses.filter((c) =>
      c.status !== "completed" &&
      c.status !== "certified" &&
      c._displayCompletedLessons < c.totalLessons
    ).length,
    completed: myCourses.filter((c) =>
      c.status === "completed" ||
      c._displayCompletedLessons >= c.totalLessons
    ).length,
    certified: myCourses.filter((c) => c.status === "certified").length,
  }), [myCourses]);

  const filteredCourses = useMemo(() => {
    switch (activeFilter) {
      case "active":
        return myCourses.filter((c) =>
          c.status !== "completed" &&
          c.status !== "certified" &&
          c._displayCompletedLessons < c.totalLessons
        );
      case "completed":
        return myCourses.filter((c) =>
          c.status === "completed" ||
          c._displayCompletedLessons >= c.totalLessons
        );
      case "certified":
        return myCourses.filter((c) => c.status === "certified");
      default:
        return myCourses;
    }
  }, [myCourses, activeFilter]);

  const unmatchedEnrollments = useMemo(() => {
    const arr = Array.isArray(localEnrollments) ? localEnrollments : Object.values(localEnrollments || {});
    return arr.filter((e: any) => !findMatchingCourse(e));
  }, [localEnrollments, courses]);

  if (authLoading || enrollmentsLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} message="Loading your learning path..." />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="space-y-8">
      {unmatchedEnrollments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md text-sm text-yellow-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <strong>Debug:</strong> {unmatchedEnrollments.length} enrollment(s) not matching course metadata.
              <div className="mt-3 max-h-36 overflow-auto text-xs">
                <pre className="whitespace-pre-wrap">{JSON.stringify(unmatchedEnrollments, null, 2)}</pre>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2">
              <button onClick={() => console.log("localEnrollments:", localEnrollments)} className="px-3 py-1 bg-yellow-200 rounded text-xs">Log Enrollments</button>
              <button onClick={refreshCourses} className="px-3 py-1 bg-white rounded border text-xs">Refresh Courses</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 />
            <div>
              <div className="font-semibold">Course Complete</div>
              <div className="text-sm">You finished &quot;{notification.title}&quot; — congratulations!</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-orange-600" size={28} />
            My Learning Path
          </h1>
          <p className="text-gray-600 mt-1">Track your progress, continue learning, and earn certificates.</p>
        </div>
        <Link href="/courses" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm w-fit">
          <Sparkles size={16} className="text-orange-500" />
          Explore More Courses
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={BookOpen} label="Total Enrolled" value={stats.total} color="text-blue-600" bg="bg-blue-50" />
        <StatBox icon={TrendingUp} label="In Progress" value={stats.active} color="text-orange-600" bg="bg-orange-50" />
        <StatBox icon={CheckCircle2} label="Completed" value={stats.completed} color="text-green-600" bg="bg-green-50" />
        <StatBox icon={Award} label="Certified" value={stats.certified} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto pb-px" aria-label="Tabs">
          {[
            { id: "all", label: "All Courses", count: stats.total },
            { id: "active", label: "In Progress", count: stats.active },
            { id: "completed", label: "Completed", count: stats.completed },
            { id: "certified", label: "Certified", count: stats.certified },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterType)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeFilter === tab.id ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === tab.id ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="space-y-6">
          {filteredCourses.map((item, idx) => (
            <div key={`${item.normalizedCourseId || item.courseId || item.id}-${idx}`} className="relative">
              {!courses.find((c) => c.id === (item.courseId || item.courseDetails?.id)) && (
                <div className="absolute right-4 top-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">
                  Missing course metadata
                </div>
              )}
              <ProgressCard
                courseId={item.courseDetails.id}
                slug={item.courseDetails.slug}
                title={item.courseDetails.title}
                thumbnail={item.courseDetails.thumbnail}
                category={item.courseDetails.category}
                progress={item.progress}
                totalLessons={item.totalLessons}
                completedLessons={item._displayCompletedLessons}
                status={
                  item.status === "certified" ? "certified" :
                  (item.progress >= 100 || item._displayCompletedLessons >= item.totalLessons) ? "completed" :
                  item.status || "active"
                }
                lastAccessed={item.lastAccessed}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <BookOpen className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{activeFilter === "all" ? "No courses yet" : `No ${activeFilter} courses`}</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFilter === "all" ? "You haven't enrolled in any courses yet. Start your tech journey today!" : "You don't have any courses in this category right now."}
          </p>
          <Link href="/courses" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={color} size={20} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}