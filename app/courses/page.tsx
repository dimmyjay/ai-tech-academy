"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllCourses } from "@/services/course";
import { categories } from "@/data/courses"; // ✅ Import from single source of truth
import SearchBar from "@/components/SearchBar";
import CourseCard from "@/components/CourseCard";
import Loader from "@/components/Loader";
import type { Course } from "@/types/course";
import { BookOpen, Sparkles, X } from "lucide-react";

// ❌ Removed the hardcoded CATEGORIES array to prevent mismatches

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // learner counts: { [courseId]: number }
  const [learnersCount, setLearnersCount] = useState<Record<string, number>>({});

  // 1. Fetch courses on mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getAllCourses();
        setCourses(Array.isArray(data) ? (data as Course[]) : []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // 1.b Fetch learner counts once courses are loaded
  useEffect(() => {
    if (!courses || courses.length === 0) return;

    const ids = courses.map((c) => c.id).filter(Boolean).join(",");
    if (!ids) return;

    let mounted = true;
    (async function fetchCounts() {
      try {
        const res = await fetch(`/api/courses/enrollment-counts?ids=${encodeURIComponent(ids)}`);
        if (!res.ok) {
          console.error("Failed to load enrollment counts:", res.status);
          return;
        }
        const json = await res.json();
        if (!mounted) return;
        setLearnersCount(json.counts || {});
      } catch (err) {
        console.error("Failed to fetch enrollment counts:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [courses]);

  // 2. Handle Search Input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 3. Filter Logic (Memoized for performance)
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // ✅ Match against the exact category name from the database
      const matchesCategory = activeCategory === "All" || course.category === activeCategory;

      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (course.title || "").toLowerCase().includes(lowerQuery) ||
        (course.description && course.description.toLowerCase().includes(lowerQuery)) ||
        (course.category && course.category.toLowerCase().includes(lowerQuery));

      return matchesCategory && matchesSearch;
    });
  }, [courses, activeCategory, searchQuery]);

  // 4. Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* HERO HEADER & SEARCH */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">
            <Sparkles size={16} />
            <span>AI-Powered Curriculum</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our Course Catalog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Master in-demand tech skills with our constantly updated, AI-generated courses.
            Learn for free, and pay just ₦1,000 when you're ready to get certified.
          </p>

          <SearchBar
            onSearch={handleSearch}
            initialQuery={searchQuery}
            placeholder="Search for 'React', 'Python', 'UI/UX'..."
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* ========================================== */}
      {/* EXPLORE CATEGORIES GRID                    */}
      {/* ========================================== */}
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">Explore Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* All Courses Button */}
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
              activeCategory === "All"
                ? "bg-gray-900 border-gray-900 text-white shadow-lg scale-105"
                : "bg-white border-gray-200 hover:border-gray-400"
            }`}
          >
            <span className="text-3xl mb-2">🎓</span>
            <span className={`text-sm font-bold ${activeCategory === "All" ? "text-white" : "text-gray-700"}`}>
              All Courses
            </span>
          </button>

          {/* ✅ Dynamic Category Buttons mapped directly from data/courses.ts */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                activeCategory === cat.name
                  ? "bg-orange-50 border-orange-400 shadow-lg scale-105"
                  : "bg-white border-gray-200 hover:border-orange-300"
              }`}
            >
              <span className="text-3xl mb-2">{cat.icon}</span>
              <span className={`text-sm font-bold text-center leading-tight ${activeCategory === cat.name ? "text-orange-700" : "text-gray-700"}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FILTERS & CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        {/* Results Count & Active Filters */}
        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredCourses.length}</span> courses
              {activeCategory !== "All" && <span> in <span className="font-bold text-gray-900">{activeCategory}</span></span>}
              {searchQuery && <span> matching "<span className="font-bold text-gray-900">{searchQuery}</span>"</span>}
            </p>

            {(searchQuery || activeCategory !== "All") && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={48} message="Loading courses..." />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const count = learnersCount[course.id] ?? 0;
              return (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  learnerCount={count} 
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <BookOpen className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any courses matching your search or filter. Try adjusting your keywords or clearing the filters.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}