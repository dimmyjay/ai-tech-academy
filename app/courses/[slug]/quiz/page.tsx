// app/courses/[slug]/quiz/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Loader2, 
  ArrowRight,
  BookOpen,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import type { QuizQuestion } from "@/types/lesson";

// ==========================================
// MOCK DATA (Replace with your actual API call)
// ==========================================
// In a real app, you would fetch this from Firebase based on the quizId in the URL
const mockQuizData = {
  id: "quiz_123",
  title: "React Basics Assessment",
  totalQuestions: 5,
  passingScore: 70,
  timeLimitMinutes: 5, // 5 minutes for demo purposes
  questions: [
    {
      id: "q1",
      text: "What hook is used to manage state in a functional React component?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctOptionIndex: 1,
      explanation: "The useState hook is the primary way to declare state variables in functional components.",
      difficulty: "easy",
      points: 10,
    },
    {
      id: "q2",
      text: "Which of the following is true about React's Virtual DOM?",
      options: [
        "It is a direct copy of the browser's DOM.",
        "It updates the browser DOM directly on every state change.",
        "It is a lightweight JavaScript representation of the actual DOM.",
        "It is only used in class components."
      ],
      correctOptionIndex: 2,
      explanation: "The Virtual DOM is a lightweight JS object that is a copy of the Real DOM. It allows React to batch updates and minimize direct DOM manipulations.",
      difficulty: "medium",
      points: 10,
    },
    {
      id: "q3",
      text: "What is the correct way to pass data from a parent to a child component?",
      options: ["State", "Props", "Context API", "Redux"],
      correctOptionIndex: 1,
      explanation: "Props (short for properties) are used to pass data from parent components to child components.",
      difficulty: "easy",
      points: 10,
    },
    {
      id: "q4",
      text: "Which lifecycle method is equivalent to useEffect with an empty dependency array?",
      options: ["componentWillMount", "componentDidMount", "componentDidUpdate", "componentWillUnmount"],
      correctOptionIndex: 1,
      explanation: "useEffect(() => { ... }, []) runs only once after the initial render, similar to componentDidMount.",
      difficulty: "medium",
      points: 10,
    },
    {
      id: "q5",
      text: "How do you prevent a form from reloading the page on submit in React?",
      options: [
        "return false",
        "e.preventDefault()",
        "e.stopPropagation()",
        "window.reload(false)"
      ],
      correctOptionIndex: 1,
      explanation: "Calling e.preventDefault() inside the submit handler prevents the default browser form submission behavior (page reload).",
      difficulty: "easy",
      points: 10,
    }
  ]
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const quizId = searchParams.get("id") || "quiz_123"; // Get quiz ID from URL params
  
  const { user } = useAuth();

  // Quiz State
  const [quiz, setQuiz] = useState<typeof mockQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0); 

  // 1. Fetch Quiz Data (Simulated)
  useEffect(() => {
    // TODO: Replace with actual API call: const data = await getQuizById(quizId);
    setTimeout(() => {
      setQuiz(mockQuizData);
      setTimeLeft(mockQuizData.timeLimitMinutes * 60); // Convert to seconds
      setLoading(false);
    }, 1000);
  }, [quizId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft, quiz]);

  // 3. Handle Option Selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return; // Prevent changing answers after submission
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // 4. Calculate & Submit Quiz
  const handleSubmit = useCallback(() => {
    if (!quiz) return;
    
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / quiz.totalQuestions) * 100);
    setScore(calculatedScore);
    setPassed(calculatedScore >= quiz.passingScore);
    setIsSubmitted(true);

    // TODO: Save results to Firebase
    // await submitLessonQuiz(user.uid, slug, quiz.id, calculatedScore, calculatedScore >= quiz.passingScore);
  }, [quiz, answers, slug, user]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={48} message="Loading assessment..." />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === quiz.totalQuestions;

  // ==========================================
  // RESULTS SCREEN
  // ==========================================
  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Result Header */}
          <div className={`text-center p-8 rounded-3xl shadow-xl mb-8 ${
            passed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-rose-600"
          } text-white`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              {passed ? <Award size={40} /> : <XCircle size={40} />}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {passed ? "Congratulations! You Passed!" : "Keep Practicing!"}
            </h1>
            <p className="text-lg opacity-90 mb-6">
              {passed 
                ? "You've successfully completed this assessment." 
                : `You need ${quiz.passingScore}% to pass. Review the explanations below.`}
            </p>
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div>
                <p className="text-4xl font-black">{score}%</p>
                <p className="text-xs opacity-80 uppercase tracking-wide">Score</p>
              </div>
              <div className="h-10 w-px bg-white/30"></div>
              <div>
                <p className="text-4xl font-black">{quiz.passingScore}%</p>
                <p className="text-xs opacity-80 uppercase tracking-wide">Passing</p>
              </div>
            </div>
          </div>

          {/* Question Review (Accordions) */}
          <div className="space-y-4 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Answers</h2>
            {quiz.questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctOptionIndex;
              
              return (
                <div key={q.id} className={`bg-white rounded-xl border p-6 ${
                  isCorrect ? "border-green-200" : "border-red-200"
                }`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`mt-1 ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                      {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <p className="font-semibold text-gray-900">
                      {index + 1}. {q.text}
                    </p>
                  </div>
                  
                  <div className="ml-8 space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAnswer === optIdx;
                      const isCorrectOpt = q.correctOptionIndex === optIdx;
                      
                      let optClass = "bg-gray-50 border-gray-100 text-gray-600";
                      if (isCorrectOpt) optClass = "bg-green-50 border-green-200 text-green-800 font-semibold";
                      else if (isUserChoice && !isCorrectOpt) optClass = "bg-red-50 border-red-200 text-red-800 line-through";

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border text-sm ${optClass}`}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div className="ml-8 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                    <span className="font-bold">Explanation:</span> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {passed ? (
              <button
                onClick={() => router.push(`/courses/${slug}`)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Continue Course <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => router.refresh()} // Or reset state to retake
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                <RotateCcw size={20} /> Retake Quiz
              </button>
            )}
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Back to Course
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // QUIZ TAKING SCREEN
  // ==========================================
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Top Bar: Progress & Timer */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} />
              </button>
              <div>
                <h1 className="text-sm font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-xs text-gray-500">Question {currentIndex + 1} of {quiz.totalQuestions}</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
              timeLeft < 60 ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-100 text-gray-700"
            }`}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentIndex + 1) / quiz.totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          
          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-12">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(currentQuestion.id, index)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                    isSelected 
                      ? "bg-orange-50 border-orange-500 shadow-md" 
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Radio Circle */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? "border-orange-500 bg-orange-500" : "border-gray-300 group-hover:border-gray-400"
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                  </div>
                  
                  {/* Option Text */}
                  <span className={`text-lg font-medium ${
                    isSelected ? "text-orange-900" : "text-gray-700"
                  }`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-100 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
              currentIndex === 0 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={20} /> Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
                allAnswered
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              Submit Quiz <CheckCircle2 size={20} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(quiz.totalQuestions - 1, prev + 1))}
              disabled={answers[currentQuestion.id] === undefined}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
                answers[currentQuestion.id] !== undefined
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}