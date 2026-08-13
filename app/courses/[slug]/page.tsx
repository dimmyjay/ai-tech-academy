"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  Users,
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { getCourseBySlug } from "@/services/course";
import { useAuth } from "@/context/AuthContext";
import { useCourseContext } from "@/context/CourseContext";
import type { Course } from "@/types/course";
import Loader from "@/components/Loader";

import { db } from "@/lib/firebase";
import { ref as dbRef, runTransaction } from "firebase/database";

export default function CourseOverviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { user } = useAuth();
  const { isEnrolled, enrollCourse } = (useCourseContext() as any) || {};

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const courseId = course?.id;
  const enrolled = user && courseId ? isEnrolled?.(courseId) : false;

  // Atomic increment for enrolled student count
  const incrementEnrolledCount = async (cId: string) => {
    const courseRef = dbRef(db, `courses/${cId}`);
    try {
      await runTransaction(courseRef, (courseData) => {
        if (courseData) {
          const currentCount = Number(
            courseData.enrolledStudents || courseData.studentsEnrolled || courseData.enrolledCount || courseData.students || 0
          );
          const newCount = currentCount + 1;
          // ✅ Update all possible variations to keep DB consistent
          courseData.enrolledStudents = newCount;
          courseData.studentsEnrolled = newCount;
          courseData.enrolledCount = newCount;
          courseData.students = newCount;
        }
        return courseData;
      });
    } catch (error) {
      console.error("Failed to increment enrolled count:", error);
    }
  };

  const handleEnroll = async () => {
    if (!courseId) return;
    setActionLoading(true);
    try {
      if (!enrolled && enrollCourse) {
        await enrollCourse(courseId);
        await incrementEnrolledCount(courseId);
      }
    } catch (err) {
      console.error("Failed to enroll:", err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCourse() {
      if (!slug) return;
      try {
        const data = await getCourseBySlug(slug);
        if (data) setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [slug]);

  // Auto-expand first module on load
  useEffect(() => {
    if (course?.modules && course.modules.length > 0 && !expandedModule) {
      setExpandedModule(course.modules[0].id || "module-0");
    }
  }, [course, expandedModule]);

  const totalLessons = course?.modules?.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0),
    0
  ) || 0;

  // ✅ FIX: Use the correct property name `enrolledStudents` with safe fallbacks
  const studentCount = course?.enrolledStudents || (course as any)?.studentsEnrolled || (course as any)?.enrolledCount || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={48} message="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <BookOpen className="text-gray-400" size={48} />
        <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
        <p className="text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
        <Link href="/courses" className="text-orange-600 hover:underline font-semibold">
          Browse All Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-6">
              {course.category && (
                <span className="inline-block px-3 py-1 bg-orange-600/20 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full border border-orange-600/30">
                  {course.category}
                </span>
              )}
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight">{course.title}</h1>
              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 pt-2">
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-orange-500" />
                  <strong className="text-white">{studentCount.toLocaleString()}</strong> students enrolled
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-orange-500" />
                  <strong className="text-white">{totalLessons}</strong> lessons
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-500" />
                  <strong className="text-white">{course.duration || "Self-paced"}</strong>
                </span>
                <span className="flex items-center gap-2">
                  <Award size={16} className="text-orange-500" />
                  Certificate included
                </span>
              </div>
            </div>

            {/* Enrollment Card (Sticky on Desktop) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-900 sticky top-24">
                {course.thumbnail && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-100 relative group">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle size={48} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}

                {enrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 font-medium mb-4">
                      <CheckCircle2 size={20} /> You are enrolled in this course
                    </div>
                    <Link
                      href={`/courses/${slug}/lesson`}
                      className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <PlayCircle size={20} /> Continue Learning
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleEnroll}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} /> Enrolling...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} /> Enroll Now & Start Learning
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      Free access • No credit card required
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <BookOpen className="text-orange-600" size={28} />
          Course Curriculum
        </h2>

        <div className="space-y-3">
          {course.modules?.map((module, mIdx) => {
            const moduleId = module.id || `module-${mIdx}`;
            const isExpanded = expandedModule === moduleId;
            const lessonCount = module.lessons?.length || 0;

            return (
              <div key={moduleId} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : moduleId)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center text-sm font-bold">
                      {mIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{lessonCount} lessons</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {isExpanded && module.lessons && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {module.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id || `lesson-${lIdx}`}
                        className="flex items-center gap-3 px-6 py-3.5 pl-16 text-sm text-gray-600 border-b border-gray-100 last:border-0"
                      >
                        <PlayCircle size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="flex-1">{lesson.title || `Lesson ${lIdx + 1}`}</span>
                        {lesson.duration && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> {lesson.duration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
