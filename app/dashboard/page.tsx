"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  User,
  ChevronRight,
  Play,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourseContext } from "@/context/CourseContext";
import { getAllCourses } from "@/services/course";
import ProgressCard from "@/components/ProgressCard";
import CourseCard from "@/components/CourseCard";
import Loader from "@/components/Loader";
import type { Course, Enrollment } from "@/types/course";
import { db } from "@/lib/firebase";
import { ref as dbRef, get as dbGet, update as dbUpdate, onValue } from "firebase/database";

// ==========================================
// TYPES
// ==========================================
interface UserAchievements {
  totalHoursLearned: number;
  currentStreak: number;
  longestStreak: number;
  certificatesEarned: number;
  coursesInProgress: number;
  lastActiveDate: string;
  learningDays: string[];
  totalLessonsCompleted: number;
  updatedAt: number;
}

const DEFAULT_ACHIEVEMENTS: UserAchievements = {
  totalHoursLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  certificatesEarned: 0,
  coursesInProgress: 0,
  lastActiveDate: "",
  learningDays: [],
  totalLessonsCompleted: 0,
  updatedAt: 0,
};

// ==========================================
// UTILITIES
// ==========================================
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateStreak(learningDays: string[]): number {
  if (learningDays.length === 0) return 0;

  const sortedDays = [...new Set(learningDays)].sort().reverse();
  const today = getTodayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < sortedDays.length - 1; i++) {
    const curr = new Date(sortedDays[i]);
    const prev = new Date(sortedDays[i + 1]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateHoursLearned(enrollments: Enrollment[]): number {
  const AVG_MINUTES_PER_LESSON = 20;
  let totalMinutes = 0;

  enrollments.forEach((e) => {
    const cl = e.completedLessons;
    let completedCount = 0;

    if (Array.isArray(cl)) {
      completedCount = cl.filter(Boolean).length;
    } else if (cl && typeof cl === "object") {
      completedCount = Object.keys(cl).length;
    }

    const lp = (e as any).lessonProgress || {};
    const progressCompleted = Object.values(lp).filter((v: any) => Number(v) >= 100).length;
    completedCount = Math.max(completedCount, progressCompleted);

    totalMinutes += completedCount * AVG_MINUTES_PER_LESSON;
  });

  return Math.round(totalMinutes / 60);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { enrollments: rawEnrollments = [], loading: enrollmentsLoading } = useCourseContext();

  // ✅ Normalize enrollments to ALWAYS be an array
  const enrollments: Enrollment[] = useMemo(() => {
    if (Array.isArray(rawEnrollments)) return rawEnrollments as Enrollment[];
    if (rawEnrollments && typeof rawEnrollments === "object") {
      return Object.values(rawEnrollments) as Enrollment[];
    }
    return [];
  }, [rawEnrollments]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<UserAchievements>(DEFAULT_ACHIEVEMENTS);

  const avatar = useMemo(() => {
    const name = profile?.name || profile?.displayName || user?.email || "";
    const initial = name ? name.trim()[0].toUpperCase() : "S";
    return initial;
  }, [profile, user]);

  // ==========================================
  // FETCH COURSES
  // ==========================================
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getAllCourses();
        setCourses(Array.isArray(data) ? (data as Course[]) : []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // ==========================================
  // AUTH REDIRECT
  // ==========================================
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  // ==========================================
  // 🔥 FIREBASE: FETCH + SYNC ACHIEVEMENTS
  // ==========================================
  const syncAchievements = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const achRef = dbRef(db, `users/${user.uid}/achievements`);
      const snap = await dbGet(achRef);
      const existing = snap.exists() ? (snap.val() as UserAchievements) : null;

      const today = getTodayString();
      const existingDays = existing?.learningDays || [];

      // ✅ Fetch certificates directly from Firebase
      let certificatesEarned = 0;
      try {
        const certsRef = dbRef(db, `users/${user.uid}/certificates`);
        const certsSnap = await dbGet(certsRef);
        if (certsSnap.exists()) {
          const certsData = certsSnap.val();
          certificatesEarned = Array.isArray(certsData) 
            ? certsData.length 
            : Object.keys(certsData).length;
        }
      } catch (err) {
        console.warn("Failed to fetch certificates:", err);
      }

      // Fallback: count from enrollments with certified status
      if (certificatesEarned === 0) {
        certificatesEarned = enrollments.filter((e) => e.status === "certified").length;
      }

      // Check for today's activity
      const hasTodayActivity = enrollments.some((e) => {
        const lastAccessed = e.lastAccessed || 0;
        const activityDate = new Date(lastAccessed).toISOString().split("T")[0];
        return activityDate === today;
      });

      const newLearningDays = hasTodayActivity && !existingDays.includes(today)
        ? [...existingDays, today]
        : existingDays;

      const currentStreak = calculateStreak(newLearningDays);
      const longestStreak = Math.max(existing?.longestStreak || 0, currentStreak);
      
      const coursesInProgress = enrollments.filter(
        (e) => e.status === "active" && (e.progress ?? 0) < 100
      ).length;
      
      const totalHoursLearned = calculateHoursLearned(enrollments);

      const totalLessonsCompleted = enrollments.reduce((acc, e) => {
        const cl = e.completedLessons;
        let count = 0;
        if (Array.isArray(cl)) count = cl.filter(Boolean).length;
        else if (cl && typeof cl === "object") count = Object.keys(cl).length;
        const lp = (e as any).lessonProgress || {};
        const progressCount = Object.values(lp).filter((v: any) => Number(v) >= 100).length;
        return acc + Math.max(count, progressCount);
      }, 0);

      const updatedAchievements: UserAchievements = {
        totalHoursLearned,
        currentStreak,
        longestStreak,
        certificatesEarned,
        coursesInProgress,
        lastActiveDate: hasTodayActivity ? today : (existing?.lastActiveDate || ""),
        learningDays: newLearningDays,
        totalLessonsCompleted,
        updatedAt: Date.now(),
      };

      setAchievements(updatedAchievements);

      const shouldUpdate = !existing ||
        existing.totalHoursLearned !== totalHoursLearned ||
        existing.currentStreak !== currentStreak ||
        existing.certificatesEarned !== certificatesEarned ||
        existing.coursesInProgress !== coursesInProgress ||
        existing.totalLessonsCompleted !== totalLessonsCompleted ||
        (hasTodayActivity && existing.lastActiveDate !== today);

      if (shouldUpdate) {
        await dbUpdate(achRef, updatedAchievements);
      }
    } catch (error) {
      console.error("Failed to sync achievements:", error);
    }
  }, [user?.uid, enrollments]);

  useEffect(() => {
    syncAchievements();
  }, [syncAchievements]);

  useEffect(() => {
    if (!user?.uid) return;
    const achRef = dbRef(db, `users/${user.uid}/achievements`);
    const unsubscribe = onValue(achRef, (snap) => {
      if (snap.exists()) {
        setAchievements(snap.val() as UserAchievements);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  if (authLoading || enrollmentsLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} message="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) return null;

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const activeEnrollments = enrollments.filter(
    (e: Enrollment) => e.status === "active" && (e.progress ?? 0) < 100
  );

  const recentEnrollment = activeEnrollments
    .slice()
    .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))[0];

  const recentCourse = recentEnrollment
    ? courses.find((c) => c.id === recentEnrollment.courseId)
    : null;

  const enrolledCourseIds = enrollments.map((e: Enrollment) => e.courseId);
  const recommendedCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id)).slice(0, 6);

  const firstName = profile?.name?.split(" ")[0] || "Student";

  const coursesInProgress = achievements.coursesInProgress;
  const certificatesEarned = achievements.certificatesEarned;
  const totalHoursLearned = achievements.totalHoursLearned;
  const currentStreak = achievements.currentStreak;

  const coursesProgress = Math.min(100, (coursesInProgress / 5) * 100);
  const certificatesProgress = Math.min(100, (certificatesEarned / 3) * 100);
  const hoursProgress = Math.min(100, (totalHoursLearned / 50) * 100);
  const streakProgress = Math.min(100, (currentStreak / 7) * 100);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {firstName} 👋</h1>
          <p className="text-gray-600 mt-2 max-w-xl">
            Progress your skills with AI-guided lessons. Continue where you left off or explore recommended learning paths.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900">{profile?.email || user?.email}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-semibold shadow">
            {profile?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="text-lg">{avatar}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          label="Courses in Progress"
          value={coursesInProgress.toString()}
          accent="from-blue-400 to-blue-600"
          progress={coursesProgress}
          subtitle={`${achievements.totalLessonsCompleted} lessons done`}
        />
        <StatCard
          icon={Award}
          label="Certificates Earned"
          value={certificatesEarned.toString()}
          accent="from-amber-400 to-amber-600"
          progress={certificatesProgress}
          subtitle={certificatesEarned > 0 ? "Keep earning more!" : "Complete a course"}
        />
        <StatCard
          icon={Clock}
          label="Hours Learned"
          value={`${totalHoursLearned}h`}
          accent="from-purple-400 to-purple-600"
          progress={hoursProgress}
          subtitle="Goal: 50 hours"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${currentStreak}d`}
          accent="from-green-400 to-green-600"
          progress={streakProgress}
          subtitle={currentStreak > 0 ? `Best: ${achievements.longestStreak}d` : "Start learning today!"}
        />
      </div>

      {/* Continue Learning (Hero) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-orange-500" size={20} />
                Continue Learning
              </h2>
              <p className="text-gray-500 mt-1">
                Pick up where you left off or jump into a recommended lesson.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/progress" className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                View All Courses <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-6">
            {recentCourse && recentEnrollment ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <ProgressCard
                    courseId={recentCourse.id}
                    slug={recentCourse.slug}
                    title={recentCourse.title}
                    thumbnail={recentCourse.thumbnail}
                    category={recentCourse.category}
                    progress={recentEnrollment.progress ?? 0}
                    totalLessons={recentCourse.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0}
                    completedLessons={recentEnrollment.completedLessons?.length ?? 0}
                    status={recentEnrollment.status}
                    lastAccessed={recentEnrollment.lastAccessed ?? 0}
                  />
                </div>

                <div className="w-full md:w-40 flex flex-col gap-3">
                  <Link
                    href={`/courses/${recentCourse.slug}`}
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition"
                  >
                    <Play size={16} /> Continue
                  </Link>

                  <Link
                    href={`/courses/${recentCourse.slug}`}
                    className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    View Course
                  </Link>

                  <Link
                    href="/dashboard/progress"
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition border border-transparent"
                  >
                    Review Progress
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl text-center border border-dashed border-gray-200">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 mx-auto">
                  <BookOpen className="text-orange-600" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-4">No active courses</h3>
                <p className="text-gray-500 mt-2">Browse our catalog and start your first course today.</p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition"
                  >
                    Browse Courses <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-xs text-gray-500 mt-1">Shortcuts to help you move faster</p>

          <div className="mt-4 space-y-3">
            <Link
              href="/courses"
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="text-orange-500" size={18} />
                <div>
                  <p className="text-sm font-medium">Browse Courses</p>
                  <p className="text-xs text-gray-500">Explore new paths</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              href="/dashboard/progress"
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-500" size={18} />
                <div>
                  <p className="text-sm font-medium">Your Progress</p>
                  <p className="text-xs text-gray-500">See completed lessons</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent"
            >
              <div className="flex items-center gap-3">
                <User className="text-blue-500" size={18} />
                <div>
                  <p className="text-sm font-medium">Profile</p>
                  <p className="text-xs text-gray-500">Update your details</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              href="/dashboard/certificates"
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent"
            >
              <div className="flex items-center gap-3">
                <Award className="text-amber-500" size={18} />
                <div>
                  <p className="text-sm font-medium">My Certificates</p>
                  <p className="text-xs text-gray-500">{certificatesEarned} earned</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </aside>
      </section>

      {/* Recommended Courses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
          <Link href="/courses" className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {recommendedCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-2xl bg-white border border-gray-100">
            <p className="text-gray-500">No recommendations right now — check back soon or explore the catalog.</p>
            <Link href="/courses" className="mt-4 inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-700 transition">
              Browse Courses
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------
   Stat Card Component
   ------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  progress = 0,
  subtitle = "",
}: {
  icon: any;
  label: string;
  value: string;
  accent: string;
  progress?: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold bg-gradient-to-br ${accent}`}>
        <Icon size={20} />
      </div>

      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-extrabold text-gray-900 leading-none">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}