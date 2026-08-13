// services/exam.ts
import { db } from "@/lib/firebase";
import { ref, get, update, set, push, query, orderByChild, equalTo } from "firebase/database";
import { generateCertificateNumber } from "@/lib/utils";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  passingScore: number;
  totalQuestions: number;
  durationMinutes: number;
  questions: ExamQuestion[];
}

export interface ExamSubmission {
  examId: string;
  userId: string;
  answers: Record<string, number>;
  score: number;
  passed: boolean;
  submittedAt: number;
}

// ==========================================
// 1. GET COURSE EXAM
// ==========================================
// ==========================================
// 1. GET COURSE EXAM
// ==========================================
export async function getCourseExam(courseId: string): Promise<Exam | null> {
  try {
    // ✅ ONLY read from the nested path that matches your RTDB rules
    const nestedRef = ref(db, `exams/${courseId}`);
    const nestedSnap = await get(nestedRef);

    if (nestedSnap.exists()) {
      const exams = Object.values(nestedSnap.val()) as any[];
      exams.sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
      const latest = exams[0];
      return {
        id: latest.id || Object.keys(nestedSnap.val())[0],
        title: latest.title || latest.courseTitle || "Final Exam",
        ...latest,
      } as Exam;
    }

    // ✅ DO NOT fallback to ref(db, "exams") — it violates rules and causes Permission Denied!
    return null;
  } catch (error: any) {
    // ✅ Catch both v8 and v9/modular Firebase permission denied errors
    const isPermissionDenied = 
      error?.code === 'PERMISSION_DENIED' || 
      error?.message?.includes('Permission denied') ||
      error?.message?.includes('PERMISSION_DENIED');

    if (isPermissionDenied) {
      console.warn("Permission denied reading exam. Auth token might not be attached yet.");
      return null;
    }
    console.error("Error fetching exam:", error);
    return null;
  }
}

// ==========================================
// 2. SUBMIT EXAM 
// ==========================================
export async function submitExam(
  userId: string,
  courseId: string,
  examId: string,
  userAnswers: Record<string, number>
): Promise<{ score: number; passed: boolean }> { // ✅ Removed certificateId from return type
  try {
    // 1. Fetch the exam data
    let examData: Exam | null = null;
    
    const nestedRef = ref(db, `exams/${courseId}/${examId}`);
    const nestedSnap = await get(nestedRef);
    if (nestedSnap.exists()) {
      examData = { id: examId, ...nestedSnap.val() } as Exam;
    }
    
    if (!examData) {
      const directRef = ref(db, `exams/${examId}`);
      const directSnap = await get(directRef);
      if (directSnap.exists()) {
        examData = { id: examId, ...directSnap.val() } as Exam;
      }
    }

    if (!examData) {
      throw new Error("Exam not found.");
    }

    // 2. Calculate Score
    let correctCount = 0;
    examData.questions.forEach((q) => {
      const correctIdx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q as any).correctAnswer;
      if (userAnswers[q.id] === correctIdx) {
        correctCount++;
      }
    });

    const totalQuestions = examData.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= examData.passingScore;

    // 3. Find enrollment ID
    let enrollmentId = "";
    const userEnrollRef = ref(db, `users/${userId}/enrollments`);
    const userEnrollSnap = await get(userEnrollRef);
    
    if (userEnrollSnap.exists()) {
      const userEnrollments = userEnrollSnap.val();
      const key = Object.keys(userEnrollments).find(
        (k) => userEnrollments[k].courseId === courseId
      );
      if (key) enrollmentId = key;
    }

    if (!enrollmentId) {
      const enrollmentsRef = ref(db, "enrollments");
      const q = query(enrollmentsRef, orderByChild("userId"), equalTo(userId));
      const snap = await get(q);
      if (snap.exists()) {
        const entries = Object.entries(snap.val());
        const match = entries.find(([_, val]: [string, any]) => val.courseId === courseId);
        if (match) enrollmentId = match[0];
      }
    }

    if (!enrollmentId) {
      throw new Error("User enrollment not found.");
    }

    // ✅ 4. ONLY save exam score and attempt — NO certificate generation here
    const userEnrollmentUpdates: Record<string, any> = {
      examTaken: true,
      examScore: scorePercentage,
      lastAccessed: Date.now(),
      // ❌ DO NOT set certificateId or status = "certified" here
    };
    
    await update(ref(db, `users/${userId}/enrollments/${enrollmentId}`), userEnrollmentUpdates);

    // Best effort top-level update
    try {
      await update(ref(db, `enrollments/${enrollmentId}`), userEnrollmentUpdates);
    } catch (err) {
      console.warn("Could not update top-level enrollment:", err);
    }

    // 5. Save exam attempt record
    const attemptRef = push(ref(db, `examAttempts/${userId}`));
    await set(attemptRef, {
      id: attemptRef.key!,
      examId,
      courseId,
      userId,
      answers: userAnswers,
      score: scorePercentage,
      passed,
      submittedAt: Date.now(),
    });

    // ✅ Return ONLY score and passed — no certificateId
    return {
      score: scorePercentage,
      passed,
    };
  } catch (error) {
    console.error("Error submitting exam:", error);
    throw error;
  }
}

// ==========================================
// 3. CHECK IF USER HAS TAKEN EXAM
// ==========================================
export async function hasUserTakenExam(userId: string, courseId: string): Promise<boolean> {
  try {
    const userEnrollRef = ref(db, `users/${userId}/enrollments`);
    const snap = await get(userEnrollRef);

    if (snap.exists()) {
      const enrollments = snap.val();
      return Object.values(enrollments).some(
        (e: any) => e.courseId === courseId && e.examTaken === true
      );
    }

    const enrollmentsRef = ref(db, "enrollments");
    const q = query(enrollmentsRef, orderByChild("userId"), equalTo(userId));
    const topSnap = await get(q);

    if (topSnap.exists()) {
      return Object.values(topSnap.val()).some(
        (e: any) => e.courseId === courseId && e.examTaken === true
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking exam status:", error);
    return false;
  }
}