// components/CourseCard.tsx
"use client";

import Link from "next/link";
import { Clock, Users, Star } from "lucide-react";
import { Course } from "@/types/course"; // Ensure this points to your correct types file

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "horizontal";
  learnerCount?: number; // ✅ Added to accept the live count from the parent page
}

export default function CourseCard({ course, variant = "default", learnerCount }: CourseCardProps) {
  // ✅ Calculate the final count to display
  // Prioritizes the fetched learnerCount prop, falls back to course properties
  const resolvedCount = learnerCount ?? course.enrolledStudents ?? (course as any).studentsEnrolled ?? (course as any).students ?? 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Advanced":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Web Development": "💻",
      "Data Science": "📊",
      "Mobile Development": "📱",
      "UI/UX Design": "🎨",
      "Cybersecurity": "🔒",
      "Cloud Computing": "☁️",
      "Blockchain": "⛓️",
      "Game Development": "🎮",
      "Digital Marketing": "📢",
      "Product Management": "📋",
    };
    return icons[category] || "📚";
  };

  // Horizontal variant (for sidebars or lists)
  if (variant === "horizontal") {
    return (
      <Link
        href={`/courses/${course.slug}`}
        className="group flex gap-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200"
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-orange-600 mb-1">{course.category}</p>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {course.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant (for grids with less detail)
  if (variant === "compact") {
    return (
      <Link
        href={`/courses/${course.slug}`}
        className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
      >
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <img
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {course.title}
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">{course.duration}</span>
            <span className="text-sm font-bold text-orange-600">₦{course.price.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant (full-featured card)
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Level Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>

        {/* Category Badge with Icon */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-800 shadow-sm">
            {getCategoryIcon(course.category)} {course.category}
          </span>
        </div>

        {/* Quick View Badge (shows on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-lg">
            View Course
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            {/* ✅ UPDATED: Uses resolvedCount instead of course.enrolledStudents */}
            <span>{resolvedCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-700">{course.rating || "4.8"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {/* Placeholder avatars for enrolled students */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-amber-400"
                ></div>
              ))}
            </div>
            {/* ✅ UPDATED: Uses resolvedCount instead of course.enrolledStudents */}
            <span className="text-xs text-gray-500">
              +{Math.max(0, resolvedCount - 3)} learning
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Certificate</p>
            <p className="text-lg font-bold text-orange-600">₦{course.price.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}