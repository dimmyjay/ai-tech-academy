// app/not-found.tsx
import Link from "next/link";
import { 
  Home, 
  BookOpen, 
  Search, 
  ArrowRight, 
  Ghost, 
  Sparkles,
  LayoutDashboard
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-white overflow-hidden px-6 py-20">
      
      {/* Background Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        
        {/* Stylized 404 Text */}
        <div className="relative inline-block mb-6">
          <h1 className="text-[10rem] md:text-[14rem] font-black leading-none bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent select-none">
            404
          </h1>
          {/* Floating Ghost/Icon */}
          <div className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-white p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce-slow">
            <Ghost className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Looks like you're lost in the code.
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto">
          The page you're looking for doesn't exist, has been moved, or you might not have access. 
          Let's get you back on track!
        </p>

        {/* Search Bar (Server-side form, no JS required) */}
        <form action="/courses" method="GET" className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="search"
            placeholder="Search for a course (e.g., React, Python)..."
            className="w-full pl-12 pr-32 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 shadow-lg shadow-gray-100 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
          >
            Search
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md w-full sm:w-auto justify-center"
          >
            <Home size={18} />
            Go to Homepage
          </Link>
          
          <Link
            href="/courses"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors w-full sm:w-auto justify-center"
          >
            <BookOpen size={18} />
            Browse Courses
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold px-4 py-3 transition-colors w-full sm:w-auto justify-center"
          >
            <LayoutDashboard size={18} />
            My Dashboard
          </Link>
        </div>

        {/* "Did you mean?" / Popular Courses Quick Links */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-orange-500" /> 
            Looking for something specific? Try these popular courses:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { name: "Web Development", slug: "web-development" },
              { name: "Data Science", slug: "data-science" },
              { name: "UI/UX Design", slug: "ui-ux" },
              { name: "Cybersecurity", slug: "cybersecurity" },
              { name: "Cloud Computing", slug: "cloud-computing" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/courses?category=${cat.slug}`}
                className="px-4 py-2 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-100 hover:border-orange-200 rounded-full text-sm font-medium text-gray-600 transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}