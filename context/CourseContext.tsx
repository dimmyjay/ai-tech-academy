"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
// ✅ FIX: Import getAuth and getIdToken directly from Firebase Auth SDK
import { getAuth, getIdToken as getFirebaseIdToken } from "firebase/auth";

type Enrollment = {
  courseId: string;
  userId?: string;
  progress: number;
  completedLessons: string[];
  totalLessons: number;
  enrolledAt: number;
  updatedAt: number;
};

type CourseContextType = {
  enrollments: Record<string, Enrollment | undefined>;
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  enrollCourse: (courseId: string) => Promise<Enrollment>;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<Enrollment>;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  // Removed getIdToken from useAuth() since we are using the SDK directly now
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment | undefined>>({});

  const apiPost = useCallback(
    async (path: string, body?: any) => {
      let token: string | null = null;
      
      try {
        // ✅ FIX: Safely get the token using the Firebase Auth SDK directly
        const auth = getAuth();
        const currentUser = auth.currentUser || user;
        if (currentUser) {
          token = await getFirebaseIdToken(currentUser as any);
        }
      } catch (err) {
        console.error("Failed to get ID token in CourseContext:", err);
      }

      const res = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `API error: ${res.status}`);
      }
      return data;
    },
    [user] // ✅ Updated dependencies
  );

  const isEnrolled = (courseId: string) => !!enrollments[courseId];
  const getEnrollment = (courseId: string) => enrollments[courseId];

  const enrollCourse = async (courseId: string) => {
    if (!user) throw new Error("Not authenticated");
    const data = await apiPost(`/api/courses/${courseId}/enroll`);
    const enrollment: Enrollment = data.enrollment;
    setEnrollments((s) => ({ ...s, [courseId]: enrollment }));
    return enrollment;
  };

  const markLessonComplete = async (courseId: string, lessonId: string) => {
    if (!user) throw new Error("Not authenticated");
    const data = await apiPost(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
    const enrollment: Enrollment = data.enrollment;
    setEnrollments((s) => ({ ...s, [courseId]: enrollment }));
    return enrollment;
  };

  useEffect(() => {
    if (!user) {
      setEnrollments({});
      return;
    }
    // Optionally fetch enrollments for the user on sign-in if you have a GET endpoint.
  }, [user]);

  return (
    <CourseContext.Provider value={{ enrollments, isEnrolled, getEnrollment, enrollCourse, markLessonComplete }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourseContext must be used within CourseProvider");
  }
  return ctx;
};