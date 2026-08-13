// app/faq/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  HelpCircle, 
  CreditCard, 
  BookOpen, 
  Award, 
  Laptop, 
  MessageCircle,
  ArrowRight,
  Search,
  Sparkles
} from "lucide-react";
import { getAllFaqCategories, searchFaqs, FAQItem } from "@/data/faq";
import SearchBar from "@/components/SearchBar";

// Map category IDs to Lucide icons
const categoryIcons: Record<string, any> = {
  "general": HelpCircle,
  "courses-learning": BookOpen,
  "pricing-payments": CreditCard,
  "certificates": Award,
  "technical-support": Laptop,
};

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  
  const allCategories = getAllFaqCategories();

  // Handle Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOpenItemId(null); // Close any open accordion when searching
  };

  // Get filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchFaqs(searchQuery);
  }, [searchQuery]);

  // Toggle Accordion
  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* ========================================== */}
      {/* 1. HERO HEADER & SEARCH */}
      {/* ========================================== */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">
            <Sparkles size={16} />
            <span>Help Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about our courses, pricing, certificates, and platform.
          </p>
          
          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch} 
            initialQuery={searchQuery}
            placeholder="Search for 'certificate', 'payment', 'refund'..." 
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. FAQ CONTENT AREA */}
      {/* ========================================== */}
      <section className="mx-auto max-w-4xl px-6 pt-12">
        
        {/* STATE A: SEARCH RESULTS */}
        {searchQuery.trim() && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Search Results for "<span className="text-orange-600">{searchQuery}</span>"
              </h2>
              <span className="text-sm text-gray-500">
                {searchResults.length} {searchResults.length === 1 ? 'answer' : 'answers'} found
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {searchResults.map((faq) => (
                  <AccordionItem 
                    key={faq.id} 
                    item={faq} 
                    isOpen={openItemId === faq.id} 
                    onToggle={toggleItem} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Search className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any answers matching your search. Try different keywords or contact our support team.
                </p>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition"
                >
                  Contact Support <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* STATE B: CATEGORIZED FAQs (Default View) */}
        {!searchQuery.trim() && (
          <div className="space-y-8">
            {allCategories.map((category) => {
              const CategoryIcon = categoryIcons[category.id] || HelpCircle;
              
              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                      <CategoryIcon size={20} className="text-orange-600" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg">{category.name}</h2>
                  </div>

                  {/* Questions List */}
                  <div className="divide-y divide-gray-100">
                    {category.questions.map((item) => (
                      <AccordionItem 
                        key={item.id} 
                        item={item} 
                        isOpen={openItemId === item.id} 
                        onToggle={toggleItem} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================== */}
        {/* 3. BOTTOM CTA: STILL NEED HELP? */}
        {/* ========================================== */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
              <MessageCircle className="text-orange-400" size={32} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Can't find the answer you're looking for? Our friendly support team is here to help. 
              We typically respond within 24 hours.
            </p>
            
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-orange-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Contact Our Support Team
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}

// ==========================================
// HELPER COMPONENT: Accordion Item
// ==========================================
function AccordionItem({ 
  item, 
  isOpen, 
  onToggle 
}: { 
  item: FAQItem; 
  isOpen: boolean; 
  onToggle: (id: string) => void;
}) {
  return (
    <div className="group">
      <button
        onClick={() => onToggle(item.id)}
        className="w-full px-6 py-5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <span className={`font-semibold text-base pr-8 transition-colors ${
          isOpen ? 'text-orange-600' : 'text-gray-900 group-hover:text-gray-700'
        }`}>
          {item.question}
        </span>
        <ChevronDown 
          size={20} 
          className={`flex-shrink-0 mt-1 text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-orange-600' : ''
          }`} 
        />
      </button>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-gray-600 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}