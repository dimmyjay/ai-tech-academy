// types/exam.ts

// ==========================================
// EXAM QUESTION INTERFACES
// ==========================================

/**
 * Represents a single question in the Final Certification Exam.
 * Designed to match the JSON output from your Groq AI service.
 */
export interface ExamQuestion {
  id: string;
  questionText: string;
  options: string[]; // Array of exactly 4 possible answers
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation: string; // Shown to the user after the exam is submitted
  difficulty?: "easy" | "medium" | "hard"; // Optional tag for analytics
}

// ==========================================
// CORE EXAM INTERFACES
// ==========================================

/**
 * Represents the Final Certification Exam for a course.
 * Stored in the 'exams' node in Firebase Realtime Database.
 */
export interface FinalExam {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  
  // Exam Rules & Constraints
  passingScore: number; // Percentage required to pass (e.g., 70)
  durationMinutes: number; // Time limit for the exam
  totalQuestions: number;
  maxAttempts?: number; // Optional: limit retakes (undefined = unlimited)
  
  // Content
  questions: ExamQuestion[];
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// EXAM ATTEMPT & SUBMISSION TYPES
// ==========================================

/**
 * Represents a user's selected answers during an exam attempt.
 * Maps the question ID to the selected option index (0-3).
 */
export interface ExamAttemptAnswers {
  [questionId: string]: number; 
}

/**
 * Tracks a specific attempt at the final exam by a user.
 * Stored in the 'examAttempts' node in Firebase.
 */
export interface ExamAttempt {
  id: string; // Unique ID for this specific attempt
  examId: string;
  userId: string;
  courseId: string;
  
  // Submission Data
  answers: ExamAttemptAnswers;
  
  // Calculated Results
  score: number; // Percentage (0-100)
  passed: boolean;
  correctAnswersCount: number;
  
  // Timestamps & Metrics
  startedAt: number;
  submittedAt: number;
  durationTakenSeconds: number;
}

/**
 * The payload sent from the frontend to the API when submitting an exam.
 */
export interface SubmitExamPayload {
  examId: string;
  courseId: string;
  answers: ExamAttemptAnswers;
  startedAt: number; // Used to calculate how long the user took
}

/**
 * The response returned from the API after successfully submitting an exam.
 */
export interface ExamSubmissionResult {
  attemptId: string;
  score: number;
  passed: boolean;
  correctAnswersCount: number;
  totalQuestions: number;
  certificateId?: string; // Populated only if the user passed
}

// ==========================================
// HELPER TYPES FOR UI
// ==========================================

/**
 * A simplified exam object used for displaying in ExamCards or lists.
 * Prevents sending the heavy 'questions' array to the client unnecessarily.
 */
export interface ExamSummary {
  id: string;
  title: string;
  courseId: string;
  courseSlug: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  
  // User-specific status
  status: "locked" | "not_taken" | "failed" | "passed";
  bestScore?: number; // Their highest score if they retake it
  certificateId?: string;
}