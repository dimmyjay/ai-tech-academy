"use client";

import Link from "next/link";
import { 
  Award, 
  Clock, 
  HelpCircle, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Lock,
  CreditCard,
  FileCheck,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface ExamCardProps {
  examId: string;
  title: string;
  courseTitle: string;
  courseSlug: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  status: "locked" | "not_taken" | "failed" | "passed";
  score?: number;
  certificateId?: string;
  price?: number; // Default 1000
}

export default function ExamCard({
  examId,
  title,
  courseTitle,
  courseSlug,
  totalQuestions,
  durationMinutes,
  passingScore,
  status,
  score,
  certificateId,
  price = 1000,
}: ExamCardProps) {
  
  // Determine Status Badge
  const getStatusBadge = () => {
    switch (status) {
      case "passed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <ShieldCheck size={14} /> Certified
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <XCircle size={14} /> Failed
          </span>
        );
      case "not_taken":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <Sparkles size={14} /> Ready
          </span>
        );
      default: // locked
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
            <Lock size={14} /> Locked
          </span>
        );
    }
  };

  // Determine CTA Button Config
  const getButtonConfig = () => {
    if (status === "locked") {
      return { 
        text: "Complete Course to Unlock", 
        icon: <Lock size={18} />, 
        style: "bg-gray-100 text-gray-400 cursor-not-allowed", 
        href: "#" 
      };
    }
    if (status === "passed") {
      return { 
        text: "View Certificate", 
        icon: <Award size={18} />, 
        style: "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20", 
        href: `/dashboard/certificates/${certificateId}` 
      };
    }
    if (status === "failed") {
      return { 
        text: "Review & Retake Exam", 
        icon: <FileCheck size={18} />, 
        style: "bg-red-600 hover:bg-red-700 text-white", 
        href: `/courses/${courseSlug}/exam/${examId}` 
      };
    }
    // not_taken
    return { 
      text: `Pay ₦${price.toLocaleString()} & Take Exam`, 
      icon: <CreditCard size={18} />, 
      style: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-600/20", 
      href: `/courses/${courseSlug}/exam/${examId}/checkout` 
    };
  };

  const buttonConfig = getButtonConfig();
  const isLocked = status === "locked";

  return (
    <div className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
      isLocked 
        ? "border-gray-200 opacity-80" 
        : status === "passed" 
          ? "border-green-200 shadow-lg shadow-green-100/50" 
          : "border-amber-200 shadow-lg shadow-amber-100/50 hover:shadow-xl"
    }`}>
      
      {/* Premium Header Background for Unlocked State */}
      {!isLocked && (
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-amber-50 via-orange-50 to-transparent pointer-events-none"></div>
      )}

      <div className="relative p-6">
        {/* Top Row: Title & Badge */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
              isLocked 
                ? "bg-gray-100" 
                : status === "passed" 
                  ? "bg-green-100" 
                  : "bg-gradient-to-br from-amber-400 to-orange-500"
            }`}>
              <Award className={isLocked ? "text-gray-400" : "text-white"} size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {courseTitle}
              </p>
              <h3 className={`text-xl font-bold leading-tight ${isLocked ? "text-gray-500" : "text-gray-900"}`}>
                {title}
              </h3>
            </div>
          </div>
          
          <div className="flex-shrink-0 mt-1">
            {getStatusBadge()}
          </div>
        </div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-100 mb-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <HelpCircle size={18} className="text-gray-400" />
            <p className="text-xs text-gray-500">Questions</p>
            <p className="text-sm font-bold text-gray-900">{totalQuestions}</p>
          </div>
          <div className="flex flex-col items-center gap-1 text-center border-x border-gray-100">
            <Clock size={18} className="text-gray-400" />
            <p className="text-xs text-gray-500">Time Limit</p>
            <p className="text-sm font-bold text-gray-900">{durationMinutes} Mins</p>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Target size={18} className="text-gray-400" />
            <p className="text-xs text-gray-500">Passing Score</p>
            <p className="text-sm font-bold text-gray-900">{passingScore}%</p>
          </div>
        </div>

        {/* Score Display (If taken) */}
        {(status === "passed" || status === "failed") && score !== undefined && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
            status === "passed" 
              ? "bg-green-50 border-green-100" 
              : "bg-red-50 border-red-100"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-black ${status === "passed" ? "text-green-600" : "text-red-600"}`}>
                {score}%
              </div>
              <div>
                <p className={`font-bold ${status === "passed" ? "text-green-800" : "text-red-800"}`}>
                  {status === "passed" ? "Exam Passed!" : "Exam Failed"}
                </p>
                <p className="text-xs text-gray-600">
                  {status === "passed" 
                    ? "Congratulations! You are certified." 
                    : `You needed ${passingScore}% to pass.`}
                </p>
              </div>
            </div>
            {status === "passed" && (
              <CheckCircle2 size={32} className="text-green-500" />
            )}
          </div>
        )}

        {/* Locked Message */}
        {isLocked && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <p className="text-sm text-gray-600">
              Complete 100% of the course lessons to unlock the final certification exam.
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={buttonConfig.href}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200 ${buttonConfig.style} ${
            !isLocked ? "hover:-translate-y-0.5" : ""
          }`}
        >
          {buttonConfig.icon}
          {buttonConfig.text}
          {!isLocked && status !== "passed" && <ArrowRight size={18} className="ml-1" />}
        </Link>
      </div>
    </div>
  );
}