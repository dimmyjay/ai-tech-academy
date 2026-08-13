// components/Testimonials.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  Briefcase,
  Award,
  ArrowRight // 👈 Moved to the top with other imports
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Chukwuemeka Okafor",
    role: "Frontend Developer",
    company: "Andela",
    image: "https://i.pravatar.cc/150?img=11",
    course: "Complete React.js & Next.js Masterclass",
    rating: 5,
    testimonial: "The AI-powered explanations made complex React concepts so much easier to understand. I landed my dream job at Andela just 3 months after getting certified. Best ₦1,000 I've ever spent!",
    outcome: "Landed job at Andela",
  },
  {
    id: 2,
    name: "Amara Nwosu",
    role: "Data Analyst",
    company: "Flutterwave",
    image: "https://i.pravatar.cc/150?img=5",
    course: "Python for Data Science & Machine Learning",
    rating: 5,
    testimonial: "I was skeptical about online learning, but the interactive quizzes and AI assistant kept me engaged. The certificate helped me transition from teaching to tech. I'm now a Data Analyst at Flutterwave!",
    outcome: "Career switch to tech",
  },
  {
    id: 3,
    name: "Ibrahim Yusuf",
    role: "Full Stack Developer",
    company: "Self-Employed",
    image: "https://i.pravatar.cc/150?img=3",
    course: "Complete Web Development Bootcamp",
    rating: 5,
    testimonial: "The quality of content is incredible for the price. I learned everything I needed to start freelancing. I've already completed 5 client projects and earned back the certification fee 100 times over!",
    outcome: "Started freelancing career",
  },
  {
    id: 4,
    name: "Blessing Adeyemi",
    role: "UI/UX Designer",
    company: "Paystack",
    image: "https://i.pravatar.cc/150?img=9",
    course: "UI/UX Design: From Wireframe to Prototype",
    rating: 5,
    testimonial: "The AI-generated feedback on my design projects was incredibly helpful. The certificate gave me the confidence to apply for jobs, and I got hired at Paystack within 2 months of completing the course.",
    outcome: "Hired at Paystack",
  },
  {
    id: 5,
    name: "Tunde Bakare",
    role: "DevOps Engineer",
    company: "MTN Nigeria",
    image: "https://i.pravatar.cc/150?img=13",
    course: "Cloud Computing & DevOps Fundamentals",
    rating: 5,
    testimonial: "As someone working full-time, the self-paced learning was perfect. The AI assistant answered my questions at 2 AM when I was studying after work. Got promoted to DevOps Engineer 6 months later!",
    outcome: "Promotion to DevOps",
  },
  {
    id: 6,
    name: "Fatima Hassan",
    role: "Mobile Developer",
    company: "Tech Startup",
    image: "https://i.pravatar.cc/150?img=10",
    course: "Mobile Development with Flutter",
    rating: 5,
    testimonial: "I never thought I could build mobile apps, but the step-by-step lessons made it possible. The certificate is verified and recognized. I'm now building apps for a Lagos-based startup!",
    outcome: "Building apps professionally",
  },
];

const stats = [
  {
    icon: TrendingUp,
    value: "10,000+",
    label: "Students Enrolled",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Briefcase,
    value: "85%",
    label: "Career Advancement",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Award,
    value: "4.9/5",
    label: "Average Rating",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3); // Renamed to camelCase for consistency

  const nextTestimonials = () => {
    setCurrentIndex((prev) => 
      prev + visibleCount >= testimonials.length ? 0 : prev + visibleCount
    );
  };

  const prevTestimonials = () => {
    setCurrentIndex((prev) => 
      prev - visibleCount < 0 ? Math.max(0, testimonials.length - visibleCount) : prev - visibleCount
    );
  };

  // 👈 FIXED: Use useEffect for window resize listeners (useState here was an anti-pattern)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setVisibleCount(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
      }
    };

    // Set initial count
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#f9731610_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6">
            <Star size={16} className="fill-orange-600 text-orange-600" />
            <span>Student Success Stories</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Join thousands of students who have transformed their careers with our 
            AI-powered courses. Here's what they have to say.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} ${stat.color} mb-4`}>
                  <Icon size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonials}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all hidden lg:block"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          
          <button
            onClick={nextTestimonials}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all hidden lg:block"
            aria-label="Next testimonials"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>

          {/* Testimonials Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote size={32} className="text-orange-200" />
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
                  "{testimonial.testimonial}"
                </p>

                {/* Outcome Badge */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-xs font-semibold text-green-700">
                    <TrendingUp size={12} />
                    {testimonial.outcome}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-orange-600 font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Course Tag */}
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-500">
                    Completed: <span className="font-medium text-gray-700">{testimonial.course}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Ready to write your success story?
          </p>
          <a
            href="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Learning Today
            <ArrowRight size={20} />
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Join 10,000+ students already learning
          </p>
        </div>

      </div>
    </section>
  );
}