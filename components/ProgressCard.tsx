"use client";

import Link from "next/link";
import { PlayCircle, CheckCircle2, Clock, BookOpen } from "lucide-react";

interface ProgressCardProps {
  courseId: string;
  slug: string;
  title: string;
  thumbnail?: string;
  category?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status?: string;
  lastAccessed?: number;
}

export default function ProgressCard({
  courseId,
  slug,
  title,
  thumbnail,
  category,
  progress,
  totalLessons,
  completedLessons,
  status,
  lastAccessed,
}: ProgressCardProps) {
  // ✅ Defensive: Ensure numbers are always valid
  const safeTotal = Math.max(0, Math.round(totalLessons || 0));
  const safeCompleted = Math.min(safeTotal, Math.max(0, Math.round(completedLessons || 0)));
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const isCompleted = status === "completed" || safeProgress >= 100 || safeCompleted >= safeTotal;
  const isCertified = status === "certified";

  const lessonUrl = `/courses/${slug}/lesson`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
          <img
            src={thumbnail || "/placeholder-course.jpg"}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isCompleted && (
            <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
              <CheckCircle2 className="text-white" size={40} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {category && (
              <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-2">
                {category}
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
              {title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {/* ✅ Uses safe values - will NEVER show "0/0" or "NaN/10" */}
                {safeCompleted}/{safeTotal} lessons
              </span>
              {lastAccessed && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Last accessed {new Date(lastAccessed).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className={isCompleted ? "text-green-600" : "text-gray-600"}>
                {isCompleted ? "Completed" : `${safeProgress}% complete`}
              </span>
              {isCertified && (
                <span className="text-purple-600 font-bold">🎓 Certified</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-green-500" : "bg-orange-500"
                }`}
                style={{ width: `${safeProgress}%` }}
              />
            </div>

            <Link
              href={lessonUrl}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors w-fit"
            >
              <PlayCircle size={16} />
              {isCompleted ? "Review Course" : "Continue Learning"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}