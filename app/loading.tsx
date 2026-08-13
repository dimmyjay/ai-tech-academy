// app/loading.tsx
import { GraduationCap, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Background Tech Grid Pattern (Matches Hero) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Floating Branded Loading Badge (Center Screen) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 bg-white/80 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border border-gray-100">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
            <GraduationCap className="text-white" size={32} />
          </div>
          {/* Spinning Ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-orange-600 border-r-amber-500 animate-spin"></div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 size={14} className="animate-spin text-orange-600" />
          <span className="text-sm font-semibold tracking-wide">Loading your journey...</span>
        </div>
      </div>

      {/* Skeleton UI (Mimics the actual page layout to prevent CLS) */}
      <div className="relative z-0 mx-auto max-w-7xl px-6 pt-28 pb-20">
        
        {/* 1. Navbar Skeleton */}
        <div className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* 2. Hero Section Skeleton */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-6">
            <div className="h-6 w-40 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-16 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-16 w-4/5 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-6 w-full bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-6 w-3/4 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="flex gap-4 pt-4">
              <div className="h-14 w-44 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-14 w-44 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          </div>
          <div className="hidden lg:block h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
        </div>

        {/* 3. Course Section Skeleton (Grid of 6 cards) */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-80 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Image Skeleton */}
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                {/* Content Skeleton */}
                <div className="p-6 space-y-4">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex gap-4 pt-2">
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}