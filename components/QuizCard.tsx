"use client";

import Link from "next/link";
import { 
  ClipboardCheck, 
  Clock, 
  HelpCircle, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Play,
  RotateCcw,
  Eye,
  Trophy,
  Lock
} from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  totalQuestions: number;
  durationMinutes?: number;
  passingScore: number;
  status: "not_started" | "in_progress" | "passed" | "failed";
  score?: number; // 0-100
  bestScore?: number; // 0-100 (for retakes)
  lessonTitle?: string; // Context, e.g., "Module 1: React Basics"
  courseSlug: string;
  lessonId?: string;
  isLocked?: boolean;
}

export default function QuizCard({
  id,
  title,
  totalQuestions,
  durationMinutes,
  passingScore,
  status,
  score,
  bestScore,
  lessonTitle,
  courseSlug,
  lessonId,
  isLocked = false,
}: QuizCardProps) {
  
  // Determine Status Badge Styles
  const getStatusBadge = () => {
    switch (status) {
      case "passed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 size={12} /> Passed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <XCircle size={12} /> Failed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <Clock size={12} /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            Not Started
          </span>
        );
    }
  };

  // Determine CTA Button Config
  const getButtonConfig = () => {
    if (isLocked) {
      return { text: "Locked", icon: <Lock size={16} />, style: "bg-gray-100 text-gray-400 cursor-not-allowed", href: "#" };
    }
    if (status === "passed") {
      return { text: "View Results", icon: <Eye size={16} />, style: "bg-green-600 hover:bg-green-700 text-white", href: `/courses/${courseSlug}/quiz/${id}/results` };
    }
    if (status === "failed") {
      return { text: "Retry Quiz", icon: <RotateCcw size={16} />, style: "bg-red-600 hover:bg-red-700 text-white", href: `/courses/${courseSlug}/quiz/${id}` };
    }
    if (status === "in_progress") {
      return { text: "Continue Quiz", icon: <Play size={16} />, style: "bg-blue-600 hover:bg-blue-700 text-white", href: `/courses/${courseSlug}/quiz/${id}` };
    }
    return { text: "Start Quiz", icon: <Play size={16} />, style: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20", href: `/courses/${courseSlug}/quiz/${id}` };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className={`group bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${
      isLocked ? "border-gray-100 opacity-75" : "border-gray-100 hover:border-purple-200 hover:shadow-md"
    }`}>
      
      {/* Header Section */}
      <div className="p-5 pb-0 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
            isLocked ? "bg-gray-100" : "bg-purple-100"
          }`}>
            <ClipboardCheck className={isLocked ? "text-gray-400" : "text-purple-600"} size={22} />
          </div>
          <div className="min-w-0">
            {lessonTitle && (
              <p className="text-xs text-gray-500 font-medium truncate mb-0.5">{lessonTitle}</p>
            )}
            <h3 className={`font-bold text-gray-900 text-lg leading-tight truncate ${isLocked ? "text-gray-500" : ""}`}>
              {title}
            </h3>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex-shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* Meta Info Grid */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4 text-center border-b border-gray-50">
        <div className="flex flex-col items-center gap-1">
          <HelpCircle size={16} className="text-gray-400" />
          <p className="text-xs text-gray-500">Questions</p>
          <p className="text-sm font-bold text-gray-900">{totalQuestions}</p>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-gray-100">
          <Clock size={16} className="text-gray-400" />
          <p className="text-xs text-gray-500">Time Limit</p>
          <p className="text-sm font-bold text-gray-900">{durationMinutes ? `${durationMinutes}m` : "None"}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Target size={16} className="text-gray-400" />
          <p className="text-xs text-gray-500">Passing</p>
          <p className="text-sm font-bold text-gray-900">{passingScore}%</p>
        </div>
      </div>

      {/* Score Section (Visible if completed) */}
      {(status === "passed" || status === "failed") && score !== undefined && (
        <div className="px-5 py-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${status === "passed" ? "text-green-600" : "text-red-600"}`}>
              {score}%
            </div>
            <div>
              <p className={`text-sm font-bold ${status === "passed" ? "text-green-700" : "text-red-700"}`}>
                {status === "passed" ? "Congratulations!" : "Keep Practicing!"}
              </p>
              <p className="text-xs text-gray-500">
                {status === "passed" ? "You successfully passed this quiz." : `You need ${passingScore}% to pass.`}
              </p>
            </div>
          </div>
          
          {/* Best Score Badge (For retakes) */}
          {bestScore && bestScore > score && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
              <Trophy size={12} /> Best: {bestScore}%
            </div>
          )}
        </div>
      )}

      {/* Footer / CTA Button */}
      <div className="p-5 pt-4">
        <Link
          href={buttonConfig.href}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${buttonConfig.style} ${
            !isLocked ? "hover:-translate-y-0.5" : ""
          }`}
        >
          {buttonConfig.icon}
          {buttonConfig.text}
        </Link>
      </div>

    </div>
  );
}