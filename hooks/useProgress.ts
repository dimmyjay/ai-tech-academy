"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, query, orderByChild, equalTo } from "firebase/database";
import { useAuth } from "./useAuth";

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "active" | "completed" | "dropped";
  progress: number; // 0 to 100
  completedLessons: string[];
  quizScores: Record<string, number>; // { quizId: score }
  examTaken: boolean;
  examScore: number | null;
  certificateId: string | null;
  enrolledAt: number;
  lastAccessed: number;
}

export function useProgress(courseId: string | undefined, totalLessons: number = 1) {
  const { user } = useAuth();
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch and listen to real-time enrollment data
  useEffect(() => {
    if (!user?.uid || !courseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query the enrollments node for this specific user
    const enrollmentsRef = ref(db, "enrollments");
    const userEnrollmentsQuery = query(enrollmentsRef, orderByChild("userId"), equalTo(user.uid));

    const unsubscribe = onValue(
      userEnrollmentsQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Find the specific enrollment for this course
          const enrollmentKey = Object.keys(data).find(
            (key) => data[key].courseId === courseId
          );

          if (enrollmentKey) {
            setEnrollment({ id: enrollmentKey, ...data[enrollmentKey] });
          } else {
            setEnrollment(null); // User is not enrolled in this course
          }
        } else {
          setEnrollment(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching progress:", err);
        setError("Failed to load progress. Please try again.");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or dependency change
    return () => unsubscribe();
  }, [user?.uid, courseId]);

  // 2. Helper: Mark a lesson as complete
  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (!enrollment || !user?.uid) return;

      // Prevent duplicates
      if (enrollment.completedLessons.includes(lessonId)) return;

      const updatedLessons = [...enrollment.completedLessons, lessonId];
      
      // Calculate new progress percentage
      const newProgress = Math.min(
        Math.round((updatedLessons.length / totalLessons) * 100), 
        100
      );

      const updates: Record<string, any> = {
        [`enrollments/${enrollment.id}/completedLessons`]: updatedLessons,
        [`enrollments/${enrollment.id}/progress`]: newProgress,
        [`enrollments/${enrollment.id}/lastAccessed`]: Date.now(),
      };

      // If they finished all lessons, mark course as completed
      if (newProgress === 100) {
        updates[`enrollments/${enrollment.id}/status`] = "completed";
      }

      try {
        await update(ref(db), updates);
      } catch (err) {
        console.error("Failed to update lesson progress:", err);
      }
    },
    [enrollment, user?.uid, totalLessons]
  );

  // 3. Helper: Save a quiz score
  const saveQuizScore = useCallback(
    async (quizId: string, score: number) => {
      if (!enrollment || !user?.uid) return;

      const updates: Record<string, any> = {
        [`enrollments/${enrollment.id}/quizScores/${quizId}`]: score,
        [`enrollments/${enrollment.id}/lastAccessed`]: Date.now(),
      };

      try {
        await update(ref(db), updates);
      } catch (err) {
        console.error("Failed to save quiz score:", err);
      }
    },
    [enrollment, user?.uid]
  );

  // 4. Helper: Save final exam score and trigger certificate logic (if passed)
  const saveExamScore = useCallback(
    async (score: number, passingScore: number) => {
      if (!enrollment || !user?.uid) return;

      const passed = score >= passingScore;

      const updates: Record<string, any> = {
        [`enrollments/${enrollment.id}/examTaken`]: true,
        [`enrollments/${enrollment.id}/examScore`]: score,
        [`enrollments/${enrollment.id}/lastAccessed`]: Date.now(),
      };

      if (passed) {
        updates[`enrollments/${enrollment.id}/status`] = "certified";
        // Note: Actual certificate generation should be triggered via an API route 
        // to securely generate the PDF and save it to the DB.
      }

      try {
        await update(ref(db), updates);
        return passed;
      } catch (err) {
        console.error("Failed to save exam score:", err);
        return false;
      }
    },
    [enrollment, user?.uid]
  );

  return {
    enrollment,
    loading,
    error,
    isEnrolled: !!enrollment,
    progress: enrollment?.progress || 0,
    completedLessons: enrollment?.completedLessons || [],
    markLessonComplete,
    saveQuizScore,
    saveExamScore,
  };
}