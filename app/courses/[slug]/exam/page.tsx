"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourseExam, submitExam } from "@/services/exam";
import { getCourseBySlug } from "@/services/course";
import { useAuth } from "@/hooks/useAuth";
import { 
  Loader, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  FileCheck,
  Clock,
  BookOpen,
  Award,
  ShieldCheck
} from "lucide-react";

// ✅ Paystack Public Key - Replace with your actual key or env variable
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxx";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const slug = params.slug as string;
  
  const [exam, setExam] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  
  const generatingRef = useRef(false);

  // ✅ Wait for auth to be FULLY ready (user + token attached)
  useEffect(() => {
    if (!authLoading && user) {
      const timer = setTimeout(() => setAuthReady(true), 100);
      return () => clearTimeout(timer);
    }
    setAuthReady(false);
  }, [authLoading, user]);

  // ✅ Step 1: Resolve slug → courseId, then load or generate exam
  useEffect(() => {
    async function init() {
      if (!slug || !authReady || !user) return;

      try {
        const course = await getCourseBySlug(slug);
        if (!course?.id) {
          setError("Course not found.");
          setLoading(false);
          return;
        }

        setCourseId(course.id);
        setCourseTitle(course.title || "");

        // Try to load existing exam
        const existingExam = await getCourseExam(course.id);
        if (existingExam && existingExam.questions && existingExam.questions.length > 0) {
          setExam(existingExam);
          setLoading(false);
          return;
        }

        // No exam found → Auto-generate via Groq
        if (generatingRef.current) return;
        generatingRef.current = true;
        setGenerating(true);
        setError(null);

        console.info(`No exam found for "${course.title}", triggering Groq generation...`);

        const res = await fetch(`/api/courses/${course.id}/exam/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseTitle: course.title,
            courseSlug: course.slug,
            modules: course.modules?.map((m: any) => ({
              title: m.title,
              lessonTitles: m.lessons?.map((l: any) => l.title) || [],
            })) || [],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Generation failed (${res.status})`);
        }

        const genResult = await res.json();
        console.info(`✅ Exam generated: ${genResult.examId} (${genResult.questionCount} questions)`);

        // Re-fetch the newly created exam
        const newExam = await getCourseExam(course.id);
        if (newExam && newExam.questions && newExam.questions.length > 0) {
          setExam(newExam);
        } else {
          throw new Error("Exam was generated but could not be retrieved. Please try again.");
        }

      } catch (err: any) {
        console.error("Exam init error:", err);
        setError(err.message || "Failed to load or generate exam.");
      } finally {
        generatingRef.current = false;
        setGenerating(false);
        setLoading(false);
      }
    }

    init();
  }, [slug, authReady, user]);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!user || !exam || !courseId) return;
    setSubmitting(true);

    try {
      const res = await submitExam(user.uid, courseId, exam.id, answers);
      setResult({ score: res.score, passed: res.passed });
    } catch (err) {
      console.error("Submit exam error:", err);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Paystack Payment Handler for Certificate
  const handleCertificatePayment = async () => {
    if (!user?.email || !courseId || !result) return;

    setPaying(true);

    try {
      // Dynamically load Paystack script if not already loaded
      if (!(window as any).PaystackPop) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://js.paystack.co/v2/inline.js";
          script.onload = () => resolve();
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const paystack = new (window as any).PaystackPop();

      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: 1000 * 100, // ₦1,000 in kobo
        currency: "NGN",
        label: `Certificate: ${courseTitle}`,
        metadata: {
          courseId,
          userId: user.uid,
          examScore: result.score,
          courseName: courseTitle,
        },
        onSuccess: async (transaction: any) => {
          console.info("✅ Certificate payment successful:", transaction);

          try {
            // Call API to generate/unlock certificate after payment
            const res = await fetch("/api/certificates/generate-after-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.uid,
                courseId,
                examScore: result.score,
                transactionReference: transaction.reference,
              }),
            });

            if (res.ok) {
              alert("🎉 Payment successful! Your certificate has been generated.");
              router.push("/dashboard/certificates");
            } else {
              const errData = await res.json().catch(() => ({}));
              alert(`Payment received but certificate generation failed: ${errData.error || "Please contact support."}`);
            }
          } catch (err) {
            console.error("Certificate generation error:", err);
            alert("Payment received! Please visit your certificates page or contact support.");
            router.push("/dashboard/certificates");
          }
        },
        onCancel: () => {
          console.info("Payment cancelled");
          setPaying(false);
        },
      });
    } catch (err) {
      console.error("Paystack init error:", err);
      alert("Unable to initialize payment. Please try again.");
      setPaying(false);
    }
  };

  const handleRetry = () => {
    setExam(null);
    setError(null);
    setLoading(true);
    generatingRef.current = false;
    setCourseId(null);
  };

  // ─── LOADING STATE ───
  if ((loading || !authReady) && !generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-orange-600" size={48} />
          <p className="text-gray-500 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ─── GENERATING STATE ───
  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-12 text-center max-w-lg w-full">
          <RefreshCw className="text-blue-600 animate-spin mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            AI is Generating Your Exam
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Groq is analyzing your completed lessons and crafting personalized questions for{" "}
            <strong>{courseTitle || "this course"}</strong>.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium">
            <Sparkles size={14} />
            This typically takes 10–30 seconds
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR STATE ───
  if (error && !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 text-center max-w-lg w-full">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Could Not Load Exam
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <Link
              href={`/courses/${slug}`}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS STATE WITH PAYSTACK PAYMENT ───
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-lg text-center">
          {result.passed ? (
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          ) : (
            <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          )}

          <h2 className="text-3xl font-bold mb-2">
            {result.passed ? "Congratulations! You Passed!" : "Exam Failed"}
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Your Score: <span className="font-bold">{result.score}%</span>
          </p>

          {result.passed ? (
            /* ✅ PASSED: Show Payment CTA instead of auto-generating */
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-6">
              <Award className="mx-auto text-orange-600 mb-3" size={32} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Claim Your Certificate</h3>
              <p className="text-sm text-gray-600 mb-4">
                You passed! Pay a one-time fee of <span className="font-bold text-orange-600">₦1,000</span> to 
                generate your verified digital certificate, download the PDF, and share on LinkedIn.
              </p>
              <button
                onClick={handleCertificatePayment}
                disabled={paying}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? (
                  <><Loader className="animate-spin" size={20} /> Processing Payment...</>
                ) : (
                  <><ShieldCheck size={20} /> Pay ₦1,000 & Get Certificate</>
                )}
              </button>
              <p className="text-[11px] text-gray-400 mt-3">🔒 Secured by Paystack • Instant certificate generation</p>
            </div>
          ) : (
            /* FAILED: Show retake option */
            <div className="mb-6">
              <p className="text-red-600 mb-4">
                You need {exam?.passingScore || 70}% to pass. Review the lessons and try again.
              </p>
              <Link
                href={`/courses/${slug}`}
                className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700"
              >
                <ArrowLeft size={16} /> Review Lessons
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => router.push("/dashboard/certificates")}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
            {!result.passed && (
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
                className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Retake Exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── EXAM QUESTIONS STATE ───
  if (!exam) return null;

  const totalQuestions = exam.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= totalQuestions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Course
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:flex items-center gap-1.5 text-gray-500">
              <Clock size={14} />
              {exam.durationMinutes || 60} mins
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-gray-500">
              <FileCheck size={14} />
              {exam.passingScore || 70}% to pass
            </span>
            <span className={`font-semibold ${allAnswered ? "text-green-600" : "text-orange-600"}`}>
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {exam.title || `${courseTitle} - Final Exam`}
          </h1>
          <p className="text-gray-500">
            Answer all {totalQuestions} questions. You cannot pause once started.
          </p>
        </div>

        <div className="space-y-6">
          {exam.questions.map((q: any, idx: number) => (
            <div
              key={q.id}
              className={`bg-white p-6 rounded-xl border transition-colors ${
                answers[q.id] !== undefined ? "border-orange-200 bg-orange-50/30" : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span className="text-orange-600 mr-2">{idx + 1}.</span>
                {q.question}
              </h3>
              <div className="space-y-2">
                {q.options.map((opt: string, optIdx: number) => (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                      answers[q.id] === optIdx
                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      onChange={() => handleOptionSelect(q.id, optIdx)}
                      checked={answers[q.id] === optIdx}
                      className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sticky Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 hidden sm:block">
            {allAnswered
              ? "All questions answered — ready to submit!"
              : `${totalQuestions - answeredCount} question${totalQuestions - answeredCount !== 1 ? "s" : ""} remaining`}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered || !user}
            className="w-full sm:w-auto bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <FileCheck size={20} />
                Submit Exam
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}