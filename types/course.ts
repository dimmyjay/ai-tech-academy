// types/course.ts

// ==========================================
// ENUMS & BASIC TYPES
// ==========================================

/**
 * Defines the difficulty levels for courses.
 */
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

/**
 * Defines the status of a user's enrollment in a course.
 */
export type EnrollmentStatus = "active" | "completed" | "certified" | "dropped";

/**
 * Defines the type of content for a lesson.
 */
export type LessonType = "video" | "article" | "code-along" | "quiz";

/**
 * Defines the status of a quiz/exam attempt.
 */
export type AssessmentStatus = "not_started" | "in_progress" | "passed" | "failed";

// ==========================================
// CORE COURSE INTERFACES
// ==========================================

/**
 * Represents a single question within a Quiz or Final Exam.
 */
export interface Question {
  id: string;
  questionText: string;
  options: string[]; // Array of 4 possible answers
  correctOptionIndex: number; // 0-3
  explanation: string; // Shown after answering
}

/**
 * Represents a Quiz associated with a specific lesson/module.
 */
export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number; // Percentage (e.g., 70)
}

/**
 * Represents a single lesson within a course module.
 */
export interface Lesson {
  id: string;
  title: string;
  slug: string;
  type: LessonType;
  content: string; // Markdown or HTML content
  videoUrl?: string; // Optional for video lessons
  duration: string; // e.g., "15 mins"
  order: number; // Position in the module
  quizId?: string; // Link to an optional lesson quiz
}

/**
 * Represents a Module (a collection of lessons).
 */
export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

/**
 * The main Course object stored in Firebase.
 */
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: string; // e.g., "12 Weeks"
  price: number;
  currency: string; // "NGN"
  thumbnail: string;
  instructor: string; // Name or ID
  
  // Structure
  modules: Module[];
  finalExamId?: string; // Link to the final certification exam
  
  // Stats
  enrolledStudents: number;
  rating: number; // 1-5
  reviewCount: number;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
}

/**
 * Represents the Final Certification Exam for a course.
 */
export interface FinalExam {
  id: string;
  courseId: string;
  title: string;
  questions: Question[];
  passingScore: number;
  durationMinutes: number;
  totalQuestions: number;
}

// ==========================================
// USER PROGRESS & ENROLLMENT TYPES
// ==========================================

/**
 * Tracks a user's progress in a specific course.
 * Stored in the 'enrollments' node in Firebase.
 */
export interface Enrollment {
  id: string; // Unique ID for this enrollment record
  userId: string;
  courseId: string;
  
  status: EnrollmentStatus;
  progress: number; // 0 to 100
  
  completedLessons: string[]; // Array of Lesson IDs
  quizScores: Record<string, number>; // { quizId: scorePercentage }
  
  examTaken: boolean;
  examScore: number | null;
  certificateId: string | null;
  
  enrolledAt: number;
  lastAccessed: number;
}

// ==========================================
// HELPER TYPES FOR UI & API
// ==========================================

/**
 * A simplified course object used for displaying in lists/cards 
 * without loading all modules/lessons.
 */
export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  level: CourseLevel;
  price: number;
  rating: number;
  enrolledStudents: number;
}

/**
 * Payload for creating/updating a course via Admin API.
 */
export interface CreateCoursePayload {
  title: string;
  category: string;
  level: CourseLevel;
  description: string;
  price: number;
}