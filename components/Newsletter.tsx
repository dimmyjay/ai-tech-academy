"use client";

import { useState, FormEvent } from "react";
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  BookOpen,
  Bell
} from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      // TODO: Replace with your actual API call (e.g., Mailchimp, ConvertKit, Resend, or your own Firebase function)
      // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        
        {/* Newsletter Card */}
        <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Decorative Gradient Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative grid lg:grid-cols-2 gap-10 p-8 md:p-12 lg:p-16">
            
            {/* Left Side: Content & Benefits */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6 w-fit">
                <Sparkles size={14} className="text-orange-500" />
                <span>Stay Ahead in Tech</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Get Free Tech Resources &{" "}
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Course Updates
                </span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join 10,000+ learners receiving weekly coding tips, industry insights, 
                and early access to new AI-powered courses.
              </p>

              {/* Perks List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BookOpen size={16} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Free weekly coding cheat sheets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Bell size={16} className="text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Be the first to know about new courses</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <Sparkles size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Exclusive discounts on certification fees</span>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center">
              <div className="w-full bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                
                {status === "success" ? (
                  /* Success State */
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You're subscribed!</h3>
                    <p className="text-gray-600">
                      Check your inbox for a welcome email with your first free resource.
                    </p>
                    <button 
                      onClick={() => setStatus("idle")}
                      className="mt-6 text-sm font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-4"
                    >
                      Subscribe another email
                    </button>
                  </div>
                ) : (
                  /* Form State */
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Newsletter</h3>
                    <p className="text-sm text-gray-500 mb-6">Enter your email to get started. No spam, ever.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          placeholder="you@example.com"
                          required
                          className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-4 ${
                            status === "error"
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                          }`}
                        />
                      </div>

                      {status === "error" && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> {errorMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            Subscribe Now
                            <Send size={16} />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="mt-4 text-xs text-center text-gray-400">
                      By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}