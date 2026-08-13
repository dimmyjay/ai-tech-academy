// types/lesson.ts

// ==========================================
// ENUMS & BASIC TYPES
// ==========================================

/**
 * Defines the specific type of media or interaction for a lesson.
 */
export type LessonMediaType = 
  | "video" 
  | "article" 
  | "code-along" 
  | "interactive-demo" 
  | "audio";

/**
 * Defines the difficulty of a specific quiz question.
 */
export type QuestionDifficulty = "easy" | "medium" | "hard";

// ==========================================
// LESSON CONTENT INTERFACES
// ==========================================

/**
 * Represents a single multiple-choice question within a lesson quiz.
 * Designed to match the output format of your Groq AI service.
 */
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[]; // Exactly 4 options
  correctOptionIndex: number; // 0-3
  explanation: string; // Why this answer is correct
  difficulty: QuestionDifficulty;
  points: number; // Weight of the question
}

/**
 * Represents a small quiz attached to a specific lesson (not the final exam).
 */
export interface LessonQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // Percentage required to pass (e.g., 70)
  timeLimitMinutes?: number; // Optional time limit
}

/**
 * Represents the core content of a single lesson.
 */
export interface LessonContent {
  id: string;
  title: string;
  slug: string;
  type: LessonMediaType;
  
  // Content Data
  markdownBody?: string; // For articles/code-alongs
  videoUrl?: string; // For video lessons (YouTube/Vimeo/Cloudinary)
  videoDurationSeconds?: number;
  codeSnippet?: string; // For code-along lessons
  
  // Metadata
  orderInModule: number;
  estimatedReadTimeMinutes?: number;
  isPreviewable: boolean; // Can non-enrolled users see this?
  
  // Associated Quiz
  quiz?: LessonQuiz;
}

// ==========================================
// USER INTERACTION TYPES
// ==========================================

/**
 * Tracks a user's specific interaction with a lesson.
 * Stored in the 'userProgress' or 'enrollments' node.
 */
export interface UserLessonProgress {
  lessonId: string;
  courseId: string;
  userId: string;
  
  isCompleted: boolean;
  completedAt?: number; // Timestamp
  
  // If the lesson has a quiz
  quizAttempted: boolean;
  quizScore?: number; // Percentage
  quizPassed: boolean;
  
  // Video tracking
  lastVideoPositionSeconds?: number;
  videoWatchedPercentage?: number;
}

/**
 * Payload for marking a lesson as complete via API.
 */
export interface MarkLessonCompletePayload {
  lessonId: string;
  courseId: string;
  quizScore?: number; // If a quiz was taken
}

// ==========================================
// HELPER TYPES FOR UI
// ==========================================

/**
 * A simplified lesson object for displaying in sidebars/lists.
 */
export interface LessonSummary {
  id: string;
  title: string;
  type: LessonMediaType;
  duration: string; // e.g., "15 mins" or "10 min read"
  isCompleted: boolean;
  isLocked: boolean;
  hasQuiz: boolean;
}

/**
 * Represents a resource attached to a lesson (e.g., PDF, Zip file).
 */
export interface LessonResource {
  id: string;
  name: string;
  type: "pdf" | "zip" | "link";
  url: string;
  size?: string; // e.g., "2.5 MB"
}