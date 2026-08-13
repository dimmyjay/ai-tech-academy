"use client";

import Link from "next/link";
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Clock, 
  FileText,
  Star
} from "lucide-react";

interface LessonCardProps {
  id: string;
  title: string;
  duration: string; // e.g., "15 mins"
  type?: "video" | "article" | "quiz";
  isCompleted: boolean;
  isLocked: boolean;
  isActive?: boolean; // Is this the current lesson being viewed?
  lessonNumber: number;
  slug: string; // Course slug for linking
}

export default function LessonCard({
  id,
  title,
  duration,
  type = "video",
  isCompleted,
  isLocked,
  isActive = false,
  lessonNumber,
  slug,
}: LessonCardProps) {
  
  // Determine Icon based on type
  const getTypeIcon = () => {
    if (isCompleted) return <CheckCircle2 className="text-green-500" size={20} />;
    if (isLocked) return <Lock className="text-gray-400" size={20} />;
    
    switch (type) {
      case "video": return <PlayCircle className="text-orange-500" size={20} />;
      case "quiz": return <Star className="text-purple-500" size={20} />;
      case "article": return <FileText className="text-blue-500" size={20} />;
      default: return <PlayCircle className="text-orange-500" size={20} />;
    }
  };

  // Determine Card Styles
  const getCardStyles = () => {
    if (isActive) return "bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-200";
    if (isLocked) return "bg-gray-50 border-gray-100 opacity-75 cursor-not-allowed";
    return "bg-white border-gray-100 hover:border-orange-200 hover:shadow-md cursor-pointer";
  };

  // Determine Link Destination
  const href = isLocked ? "#" : `/courses/${slug}/lesson/${id}`;

  return (
    <Link 
      href={href} 
      className={`group block rounded-xl border p-4 transition-all duration-200 ${getCardStyles()}`}
    >
      <div className="flex items-start gap-4">
        
        {/* Left: Number & Icon */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            isCompleted 
              ? "bg-green-100 text-green-700" 
              : isActive 
                ? "bg-orange-100 text-orange-700" 
                : "bg-gray-100 text-gray-500"
          }`}>
            {isCompleted ? <CheckCircle2 size={16} /> : lessonNumber}
          </div>
          
          {/* Type Indicator Icon */}
          <div className="mt-1">
            {getTypeIcon()}
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base mb-1 line-clamp-2 ${
            isActive ? "text-orange-700" : isLocked ? "text-gray-500" : "text-gray-900 group-hover:text-orange-600"
          }`}>
            {title}
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{duration}</span>
            </div>
            
            {type === "quiz" && (
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium border border-purple-100">
                Quiz
              </span>
            )}
            
            {isCompleted && (
              <span className="text-green-600 font-medium flex items-center gap-1">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Right: Status/Action Arrow */}
        <div className="pt-2">
          {!isLocked && (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
              isActive ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600"
            }`}>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.5 9.5L8 6L4.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}