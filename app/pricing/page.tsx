// app/pricing/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Pricing from "@/components/Pricing";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Award, 
  ArrowRight,
  Users,
  Globe,
  Clock,
  ChevronDown,
  Sparkles,
  TrendingUp,
  BookOpen,
  GraduationCap
} from "lucide-react";

// ==========================================
// SEO METADATA
// ==========================================

export const metadata: Metadata = {
  title: "Simple, Transparent Pricing | AI Tech Academy",
  description: "Learn tech skills for free. Pay just ₦1,000 only when you're ready to get your verified, employer-recognized certificate. No hidden fees.",
  keywords: "tech courses, online learning, certificates, affordable education, AI learning",
};

// ==========================================
// FAQ DATA
// ==========================================

const faqs = [
  {
    question: "Is the learning content really free?",
    answer: "Yes, 100% free. You can access all course materials, lessons, and practice exercises without any payment. You only pay when you're ready for your certificate."
  },
  {
    question: "What does the ₦1,000 fee cover?",
    answer: "The one-time fee covers certificate generation, verification infrastructure, secure hosting, and lifetime access to your credential. It also supports our mission to keep education accessible."
  },
  {
    question: "Are the certificates recognized by employers?",
    answer: "Our certificates include unique verification codes and QR codes that employers can validate. Many of our graduates have successfully used them in job applications and LinkedIn profiles."
  },
  {
    question: "Can I get a refund if I change my mind?",
    answer: "Since the learning is free, there's nothing to refund until you pay for the certificate. If you've already paid and encounter issues, contact our support team within 7 days."
  },
  {
    question: "How long do I have access to the courses?",
    answer: "Lifetime access. Once you enroll in a course, you can revisit the materials anytime, forever. Your certificate also never expires."
  },
  {
    question: "Do I need to complete all courses to get certified?",
    answer: "Each course has its own certificate. You complete one course, pass the final assessment, and earn that specific certificate. You can take as many courses as you want."
  },
];

// ==========================================
// STATS DATA
// ==========================================

const stats = [
  { value: "10,000+", label: "Active Learners", icon: Users },
  { value: "50+", label: "Expert-Led Courses", icon: BookOpen },
  { value: "95%", label: "Completion Rate", icon: TrendingUp },
  { value: "24/7", label: "Lifetime Access", icon: Clock },
];

// ==========================================
// MAIN PRICING PAGE
// ==========================================

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      
      {/* ========================================== */}
      {/* 1. HERO HEADER */}
      {/* ========================================== */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
        {/* Sophisticated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-orange-100/40 via-amber-50/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-blue-50/40 via-transparent to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8f9fa_1px,transparent_1px),linear-gradient(to_bottom,#f8f9fa_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-full px-5 py-2 text-sm font-medium text-orange-700 mb-8 shadow-sm">
            <Sparkles size={16} className="text-orange-600" />
            <span>Transparent, Accessible Pricing</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Learn Without Limits.
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
              Certify When Ready.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
            Access our entire AI-powered curriculum at no cost. Only pay a one-time fee of 
            <span className="font-semibold text-gray-900"> ₦1,000 </span> 
            when you're ready to prove your skills with a verified, employer-recognized certificate.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/courses" 
              className="group inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
            >
              Start Learning Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#pricing" 
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              View Pricing Details
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <span>Lifetime access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. STATS SECTION */}
      {/* ========================================== */}
      <section className="py-16 border-y border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl mb-4">
                  <stat.icon className="text-orange-600" size={24} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. PRICING TIERS COMPONENT */}
      {/* ========================================== */}
      <div id="pricing">
        <Pricing />
      </div>

      {/* ========================================== */}
      {/* 4. VALUE PROPOSITION / WHY US */}
      {/* ========================================== */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 text-sm font-semibold text-purple-700 mb-4">
              <Award size={16} />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              A Model Built for Your Success
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We've reimagined online education to remove barriers and maximize your learning outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zero Risk Learning</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Explore any course without commitment. Switch between tracks, experiment with different technologies, and find your passion without financial pressure.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited course access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Switch courses anytime</span>
                </li>
              </ul>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified & Secure</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your investment is protected. Payments are processed securely via Paystack, and your certificate includes tamper-proof verification technology.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unique verification codes</span>
                </li>
              </ul>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Ready</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our certificates are designed for the modern job market. Add them to LinkedIn, share with employers, and showcase your verified skills.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>LinkedIn integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Employer-recognized credentials</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Everything You Need to Succeed
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Beyond just courses, we provide the tools and support system to help you transition into tech successfully.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Globe size={16} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-medium">Global Community</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Users size={16} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-medium">Peer Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-medium">Learn at Your Pace</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Award size={16} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-medium">Industry Certificates</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-sm text-gray-300">Free Learning</span>
                      <span className="text-2xl font-bold text-green-400">₦0</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-sm text-gray-300">Certificate Fee</span>
                      <span className="text-2xl font-bold text-orange-400">₦1,000</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Total Investment</span>
                        <span className="text-2xl font-bold text-white">₦1,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. FAQ SECTION */}
      {/* ========================================== */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-4">
              <Sparkles size={16} />
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing and certificates.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    size={20} 
                    className="text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" 
                  />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              Contact our support team
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. FINAL CTA */}
      {/* ========================================== */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-5 py-2 text-sm font-medium text-orange-300 mb-8">
            <Sparkles size={16} />
            <span>Start Your Journey Today</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Transform
            <br />
            Your Career?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Join thousands of learners who are building the future with AI Tech Academy. 
            Start learning for free and get certified when you're ready.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-1 transition-all duration-300"
            >
              Browse All Courses
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Lifetime access to lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Secure Paystack payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}