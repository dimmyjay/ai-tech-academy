"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialQuery?: string;
  className?: string;
}

export default function SearchBar({ 
  placeholder = "Search courses, topics, or skills...", 
  onSearch, 
  isLoading = false, 
  initialQuery = "",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  // Debounce search logic (waits 500ms after user stops typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 500);

    // Cleanup timeout on every keystroke
    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-24 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-400 shadow-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
      />

      {/* Right Side Actions (Loading, Clear, Filter Placeholder) */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Filter Icon (Optional UI placeholder for future category filters) */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden md:inline">Filters</span>
        </button>
      </div>
    </div>
  );
}