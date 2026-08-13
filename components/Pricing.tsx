"use client";

import { 
  Check, 
  X, 
  Award, 
  BookOpen, 
  BrainCircuit, 
  FileCheck,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";
import { useState } from "react";

const pricingPlans = [
  {
    name: "Free Learning",
    price: 0,
    currency: "NGN",
    period: "forever",
    description: "Access all course materials and learn at your own pace",
    icon: BookOpen,
    color: "bg-blue-500",
    features: [
      { text: "Full access to all course lessons", included: true },
      { text: "AI-powered explanations", included: true },
      { text: "Interactive quizzes & exercises", included: true },
      { text: "Community forum access", included: true },
      { text: "Mobile & desktop access", included: true },
      { text: "Course completion badge", included: true },
      { text: "Verified certificate", included: false },
      { text: "LinkedIn credential", included: false },
      { text: "Exam attempts", included: false },
    ],
    cta: "Start Learning Free",
    popular: false,
  },
  {
    name: "Certified Professional",
    price: 1000,
    currency: "NGN",
    period: "one-time",
    description: "Get verified and boost your career with official certification",
    icon: Award,
    color: "bg-orange-500",
    features: [
      { text: "Everything in Free Learning", included: true },
      { text: "AI-generated final exam", included: true },
      { text: "Verified certificate (PDF)", included: true },
      { text: "Unique certificate ID", included: true },
      { text: "LinkedIn credential badge", included: true },
      { text: "Employer verification link", included: true },
      { text: "Downloadable portfolio", included: true },
      { text: "Priority support", included: true },
      { text: "Career resources", included: true },
    ],
    cta: "Get Certified Now",
    popular: true,
  },
];

const faqs = [
  {
    question: "Is the learning really free?",
    answer: "Yes! You can access all course materials, lessons, quizzes, and AI explanations completely free. You only pay ₦1,000 when you're ready to take the final exam and get your verified certificate."
  },
  {
    question: "What happens if I fail the exam?",
    answer: "Don't worry! You can retake the exam after reviewing the course materials again. We want you to succeed, so take your time learning before attempting the certification."
  },
  {
    question: "How long do I have access to the courses?",
    answer: "You have lifetime access to all course materials once you enroll. Learn at your own pace, whether it takes you 2 weeks or 2 months."
  },
  {
    question: "Is the certificate recognized by employers?",
    answer: "Yes! Our certificates are verified and include a unique ID that employers can verify online. Many of our graduates have successfully used our certificates to land jobs and promotions."
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6">
            <Zap size={16} />
            <span>Simple, Transparent Pricing</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Learn Free, Pay Only for{" "}
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Certification
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe education should be accessible to everyone. That's why you can learn 
            everything for free and only pay when you're ready to get certified.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 shadow-sm border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? "border-orange-500 shadow-orange-100 scale-105 lg:scale-110 z-10" 
                    : "border-gray-100"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Sparkles size={14} />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${plan.color} text-white mb-4 shadow-lg`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <p className="text-green-600 font-semibold mt-2">Free Forever</p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className={`flex items-start gap-3 ${
                        feature.included ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature.included ? (
                        <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm leading-relaxed">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:-translate-y-0.5"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <div
                    className={`w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Banner */}
        <div className="mt-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 mb-8">
              Our support team is here to help you on your learning journey. 
              Reach out anytime and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
              >
                Contact Support
              </a>
              <a
                href="/faq"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition"
              >
                View All FAQs
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}