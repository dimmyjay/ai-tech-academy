// hooks/useCourse.ts
"use client";

import { useState, useEffect } from "react";
import { getCourseBySlug, getAllCourses } from "@/services/course"; // Ensure these services exist
import type { Course } from "@/types/course";

export function useCourse(slug?: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        if (slug) {
          const data = await getCourseBySlug(slug);
          setCourse(data);
        } else {
          const data = await getAllCourses();
          setCourses(data as unknown as Course[]);
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  return { course, courses, loading };
}