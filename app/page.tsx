// app/page.tsx
import type { Metadata } from "next";

// 🔥 Import the auto-seeder that talks to Groq AI
import { seedInitialCourses } from "@/lib/seed-courses";

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CourseSection from "@/components/CourseSection";
import AISection from "@/components/AISection";
import LearningSteps from "@/components/LearningSteps";
import CertificateSection from "@/components/CertificateSection";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";

// ==========================================
// SEO METADATA
// ==========================================

export const metadata: Metadata = {
  title: "AI Tech Academy | Master Tech Skills & Get Certified for ₦1,000",
  description: "Learn Web Development, Data Science, UI/UX, and more with our AI-powered courses. Learn for free, and pay just ₦1,000 only when you're ready to get your verified certificate.",
  keywords: ["tech courses nigeria", "learn coding online", "AI tech academy", "affordable tech certificates", "web development course", "data science nigeria"],
  openGraph: {
    title: "AI Tech Academy | Master Tech Skills & Get Certified",
    description: "Learn for free. Get verified for ₦1,000. Master in-demand tech skills with AI-powered courses.",
    type: "website",
    locale: "en_NG",
    siteName: "AI Tech Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tech Academy | Master Tech Skills & Get Certified",
    description: "Learn for free. Get verified for ₦1,000. Master in-demand tech skills with AI-powered courses.",
  },
};

// ==========================================
// MAIN LANDING PAGE COMPONENT
// ==========================================

// Made async so we can await the AI seeder
export default async function HomePage() {
  
  // 🔥 MAGIC: Automatically generate AI courses if the database is empty.
  // This runs on the server before the page renders.
  await seedInitialCourses();

  return (
    <main className="flex flex-col min-h-screen bg-white text-gray-900 overflow-x-hidden">
      
      {/* 1. Hero Section: Hook the user immediately */}
      <Hero />

      {/* 2. Features: Why choose us? */}
      <Features />

      {/* 3. Courses: Show them what they can learn */}
      <CourseSection />

      {/* 4. AI Section: Highlight the unique AI advantage */}
      <AISection />

      {/* 5. Learning Steps: Simplify the process (How it works) */}
      <LearningSteps />

      {/* 6. Certificate Section: Show the reward (The ₦1,000 value prop) */}
      <CertificateSection />

      {/* 7. Pricing: Reiterate the Free vs Paid model clearly */}
      <Pricing />

      {/* 8. Testimonials: Build massive trust and social proof */}
      <Testimonials />

      {/* 9. FAQ: Handle final objections and questions */}
      <FAQ />

      {/* 10. Newsletter: Capture emails before they leave */}
      <Newsletter />

    </main>
  );
}