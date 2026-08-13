"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Award,
  Lock,
  PlayCircle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourseContext } from "@/context/CourseContext";
import { getAllCourses } from "@/services/course";
import ExamCard from "@/components/ExamCard";
import Loader from "@/components/Loader";
import type { Course } from "@/types/course";
import type { ExamAttempt, ExamSummary } from "@/types/exam";

interface MyExamData extends ExamSummary {
  courseTitle: string;
  isAvailable: boolean;
  isLocked: boolean;
  isGenerating?: boolean;
}

function slugify(text = "") {
  return text.toString().trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

export default function ExamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const ctx = useCourseContext();
  const rawEnrollments = ctx?.enrollments;

  const enrollments: any[] = useMemo(() => {
    if (Array.isArray(rawEnrollments)) return rawEnrollments as any[];
    if (rawEnrollments && typeof rawEnrollments === "object") {
      return Object.values(rawEnrollments) as any[];
    }
    return [];
  }, [rawEnrollments]);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [myExams, setMyExams] = useState<MyExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const generatingRef = useRef<Set<string>>(new Set());

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
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  const generateExamForCourse = async (course: Course) => {
    if (generatingRef.current.has(course.id)) return;
    generatingRef.current.add(course.id);

    setMyExams((prev) => prev.map((e) =>
      e.courseId === course.id ? { ...e, isGenerating: true } : e
    ));

    try {
      const res = await fetch(`/api/courses/${course.id}/exam/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: course.title,
          courseSlug: course.slug,
          modules: course.modules?.map((m) => ({
            title: m.title,
            lessonTitles: m.lessons?.map((l) => l.title) || [],
          })) || [],
        }),
      });

      if (!res.ok) throw new Error(`Exam generation failed: ${res.status}`);
      console.info(`✅ Exam generated for course: ${course.title}`);
    } catch (err) {
      console.error(`❌ Failed to generate exam for ${course.title}:`, err);
    } finally {
      generatingRef.current.delete(course.id);
      setMyExams((prev) => prev.map((e) =>
        e.courseId === course.id ? { ...e, isGenerating: false } : e
      ));
    }
  };

  useEffect(() => {
    async function buildExamList() {
      if (!user?.uid || courses.length === 0) {
        if (!user?.uid) setLoading(false);
        return;
      }

      try {
        const attemptsRef = ref(db, "examAttempts");
        const userQuery = query(attemptsRef, orderByChild("userId"), equalTo(user.uid));
        const snapshot = await get(userQuery);

        const attemptsByCourse = new Map<string, { bestScore: number; latestAttempt: ExamAttempt }>();
        
        if (snapshot.exists()) {
          const attemptsData = snapshot.val();
          Object.values(attemptsData).forEach((attempt: any) => {
            const courseId = attempt.courseId;
            if (!courseId) return;
            const existing = attemptsByCourse.get(courseId);
            if (!existing || attempt.score > existing.bestScore) {
              attemptsByCourse.set(courseId, {
                bestScore: Math.max(existing?.bestScore || 0, attempt.score),
                latestAttempt: attempt as ExamAttempt,
              });
            }
          });
        }

        const completedCourseIds = new Set<string>();
        const safeEnrollments: any[] = Array.isArray(enrollments) ? enrollments : [];

        safeEnrollments.forEach((enrollment: any) => {
          const cid = enrollment.courseId || enrollment.course_id;
          if (!cid) return;

          const isStatusCompleted = enrollment.status === "completed" || enrollment.status === "certified";
          let allLessonsDone = false;
          
          const matchedCourse = courses.find((c) => String(c.id) === String(cid));
          const totalLessons = matchedCourse?.modules?.reduce(
            (acc: number, m: any) => acc + (m.lessons?.length || 0), 0
          ) || 0;

          if (totalLessons > 0) {
            const lessonProgress = enrollment.lessonProgress || {};
            const completedLessons = enrollment.completedLessons;
            
            let completedCount = 0;
            if (Array.isArray(completedLessons)) {
              completedCount = completedLessons.filter(Boolean).length;
            } else if (completedLessons && typeof completedLessons === "object") {
              completedCount = Object.keys(completedLessons).length;
            }
            
            const progressValues = Object.values(lessonProgress) as number[];
            const progressCompleted = progressValues.filter((v) => v >= 100).length;
            completedCount = Math.max(completedCount, progressCompleted);

            if (completedCount >= totalLessons) allLessonsDone = true;
          }

          if (isStatusCompleted || allLessonsDone) {
            completedCourseIds.add(String(cid));
          }
        });

        const examMap = new Map<string, MyExamData>();
        const getCourseDetails = (cid: string) => {
          return courses.find((c) => String(c.id) === String(cid));
        };

        completedCourseIds.forEach((cid) => {
          const course = getCourseDetails(cid);
          if (!course) return;

          const attemptData = attemptsByCourse.get(cid);
          
          examMap.set(cid, {
            id: attemptData?.latestAttempt?.examId || `exam_${cid}`,
            title: `${course.title} - Final Exam`,
            courseId: course.id,
            courseSlug: course.slug,
            courseTitle: course.title,
            totalQuestions: 50,
            durationMinutes: 60,
            passingScore: 70,
            status: attemptData?.latestAttempt?.passed ? "passed" : attemptData ? "failed" : "not_taken",
            bestScore: attemptData?.bestScore ?? 0,
            certificateId: attemptData?.latestAttempt?.passed ? `cert_${attemptData.latestAttempt.id}` : undefined,
            isAvailable: true,
            isLocked: false,
            isGenerating: generatingRef.current.has(cid),
          });
        });

        attemptsByCourse.forEach(({ bestScore, latestAttempt }, courseId) => {
          if (examMap.has(courseId)) return;
          const course = getCourseDetails(courseId);
          if (!course) return;

          examMap.set(courseId, {
            id: latestAttempt.examId || `exam_${courseId}`,
            title: `${course.title} - Final Exam`,
            courseId: course.id,
            courseSlug: course.slug,
            courseTitle: course.title,
            totalQuestions: 50,
            durationMinutes: 60,
            passingScore: 70,
            status: latestAttempt.passed ? "passed" : "failed",
            bestScore,
            certificateId: latestAttempt.passed ? `cert_${latestAttempt.id}` : undefined,
            isAvailable: true,
            isLocked: false,
          });
        });

        const sortedExams = Array.from(examMap.values()).sort((a, b) => {
          if (a.isGenerating && !b.isGenerating) return -1;
          if (!a.isGenerating && b.isGenerating) return 1;
          if (a.status === "not_taken" && b.status !== "not_taken") return -1;
          if (b.status === "not_taken" && a.status !== "not_taken") return 1;
          const aTime = attemptsByCourse.get(a.courseId)?.latestAttempt?.submittedAt || 0;
          const bTime = attemptsByCourse.get(b.courseId)?.latestAttempt?.submittedAt || 0;
          return bTime - aTime;
        });

        setMyExams(sortedExams);

        sortedExams.forEach((exam) => {
          if (
            exam.status === "not_taken" &&
            !exam.isGenerating &&
            !generatingRef.current.has(exam.courseId)
          ) {
            const course = getCourseDetails(exam.courseId);
            if (course) generateExamForCourse(course);
          }
        });

      } catch (error) {
        console.error("Error building exam list:", error);
      } finally {
        setLoading(false);
      }
    }

    buildExamList();
  }, [user, courses, enrollments]);

  const stats = useMemo(() => {
    const taken = myExams.filter((e) => e.status !== "not_taken");
    const passed = taken.filter((e) => e.status === "passed").length;
    const failed = taken.filter((e) => e.status === "failed").length;
    const available = myExams.filter((e) => e.status === "not_taken" && !e.isGenerating).length;
    const generating = myExams.filter((e) => e.isGenerating).length;
    const avgScore = taken.length > 0 
      ? Math.round(taken.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / taken.length) 
      : 0;

    return { total: taken.length, passed, failed, available, generating, avgScore };
  }, [myExams]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} message="Loading your exam history..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="text-orange-600" size={28} />
            Exams & Certifications
          </h1>
          <p className="text-gray-600 mt-1">
            Complete all lessons to unlock your final exam and earn your certificate.
          </p>
        </div>
        
        <Link 
          href="/dashboard/progress" 
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm w-fit"
        >
          <Sparkles size={16} className="text-orange-500" />
          Continue Learning
        </Link>
      </div>

      {myExams.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatBox icon={FileCheck} label="Available Exams" value={stats.available} color="text-blue-600" bg="bg-blue-50" />
          <StatBox icon={PlayCircle} label="Exams Taken" value={stats.total} color="text-indigo-600" bg="bg-indigo-50" />
          <StatBox icon={CheckCircle2} label="Passed" value={stats.passed} color="text-green-600" bg="bg-green-50" />
          <StatBox icon={XCircle} label="Failed" value={stats.failed} color="text-red-600" bg="bg-red-50" />
          <StatBox icon={TrendingUp} label="Avg Score" value={`${stats.avgScore}%`} color="text-purple-600" bg="bg-purple-50" />
        </div>
      )}

      {stats.generating > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <RefreshCw className="text-blue-600 animate-spin" size={20} />
          <div>
            <p className="font-semibold text-blue-900">AI is generating {stats.generating} exam{stats.generating > 1 ? "s" : ""}...</p>
            <p className="text-sm text-blue-700">Groq is crafting personalized questions based on your completed lessons. This takes 10–30 seconds.</p>
          </div>
        </div>
      )}

      {myExams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {myExams.map((exam) => (
            // ✅ FIX: Explicitly pass examId={exam.id} to satisfy ExamCardProps
            <ExamCard 
              key={`${exam.courseId}-${exam.id}`} 
              {...exam} 
              examId={exam.id}
            />
          ))}
        </div>
      ) : (
        <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <Lock className="text-blue-600" size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No exams available yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Complete 100% of any course&apos;s lessons to unlock its final certification exam. 
              Your progress is tracked automatically as you read.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/progress" 
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                View My Courses
                <ArrowRight size={18} />
              </Link>
              <Link 
                href="/courses" 
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatBox({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bg 
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  color: string; 
  bg: string; 
}) {
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
