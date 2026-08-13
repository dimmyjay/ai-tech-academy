"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  CreditCard, 
  ShieldCheck, 
  Laptop, 
  Award, 
  Clock,
  MessageSquare
} from "lucide-react";

const faqs = [
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        question: "Is the learning really 100% free?",
        answer: "Yes! You can access all course lessons, videos, quizzes, and AI-powered explanations completely free of charge. We only charge a one-time fee of ₦1,000 when you are ready to take the final exam and receive your verified certificate."
      },
      {
        question: "Do I need any prior tech experience?",
        answer: "Not at all. Our courses are designed for everyone, from absolute beginners to experienced professionals looking to upskill. The AI curriculum adapts to your pace, ensuring you never feel left behind."
      },
      {
        question: "How long do I have access to the courses?",
        answer: "You have lifetime access! Once you enroll in a course, you can revisit the materials, updates, and resources whenever you want, forever."
      }
    ]
  },
  {
    category: "Payment & Certificate",
    icon: CreditCard,
    questions: [
      {
        question: "Why is there a ₦1,000 fee for the certificate?",
        answer: "The fee covers the cost of generating your unique, verified digital certificate, maintaining our secure verification database, and processing the proctored final exam. It ensures your credential holds real value for employers."
      },
      {
        question: "Is the payment secure?",
        answer: "Absolutely. We use Paystack, Nigeria's most trusted payment gateway, to process all transactions. Your financial data is encrypted and secure. We do not store your card details."
      },
      {
        question: "Can I get a refund if I don't pass?",
        answer: "If you don't pass the final exam, you can retake it after reviewing the materials again. We want you to succeed! However, if you feel the course didn't meet your expectations before taking the exam, please contact our support team."
      }
    ]
  },
  {
    category: "Technical & Support",
    icon: Laptop,
    questions: [
      {
        question: "What device do I need to learn?",
        answer: "You can learn on any device with an internet connection—smartphone, tablet, or laptop. However, for coding courses, we recommend using a laptop or desktop computer for the best practice experience."
      },
      {
        question: "How does the AI Assistant work?",
        answer: "Our AI Assistant is available 24/7 within each lesson. You can ask it to explain complex concepts, debug your code, or provide extra examples. It’s like having a personal tutor always by your side."
      },
      {
        question: "What if I get stuck or have issues?",
        answer: "We have a dedicated support team and a community forum where you can ask questions. Plus, our AI Assistant can help resolve most technical queries instantly."
      }
    ]
  }
];

export default function FAQ() {
  // ✅ FIX: Changed type from `number | null` to `string | null` to match uniqueIndex
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  // ✅ FIX: Changed parameter type from `number` to `string`
  const toggleFAQ = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-6">
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our AI-powered learning platform? Find answers to common questions below.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-8">
          {faqs.map((category, catIndex) => {
            const CategoryIcon = category.icon;
            return (
              <div key={catIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Category Header */}
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <CategoryIcon size={20} className="text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">{category.category}</h3>
                </div>

                {/* Questions List */}
                <div className="divide-y divide-gray-100">
                  {category.questions.map((item, qIndex) => {
                    // Create a unique ID for each question based on category and index
                    const uniqueIndex = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === uniqueIndex;

                    return (
                      <div key={qIndex} className="group">
                        <button
                          onClick={() => toggleFAQ(uniqueIndex)}
                          className="w-full px-6 py-5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className={`font-semibold text-lg pr-8 ${isOpen ? 'text-orange-600' : 'text-gray-900'} group-hover:text-orange-600 transition-colors`}>
                            {item.question}
                          </span>
                          <ChevronDown 
                            size={24} 
                            className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} 
                          />
                        </button>
                        
                        {/* Answer Content */}
                        <div 
                          className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA / Contact */}
        <div className="mt-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Still have questions?
            </h3>
            <p className="text-orange-100 mb-8 max-w-xl mx-auto">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition shadow-lg"
            >
              Get in Touch
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
