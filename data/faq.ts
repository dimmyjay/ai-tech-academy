// data/faq.ts

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  questions: FAQItem[];
}

// ==========================================
// FAQ DATA
// ==========================================

export const faqData: FAQCategory[] = [
  {
    id: "general",
    name: "General",
    slug: "general",
    questions: [
      {
        id: "gen_1",
        question: "Is the learning really 100% free?",
        answer: "Yes! You can access all course lessons, videos, quizzes, and AI-powered explanations completely free of charge. We only charge a one-time fee of ₦1,000 when you are ready to take the final proctored exam and receive your verified digital certificate."
      },
      {
        id: "gen_2",
        question: "What is AI Tech Academy?",
        answer: "AI Tech Academy is an innovative e-learning platform that uses advanced Artificial Intelligence to generate, update, and personalize tech courses. Our goal is to make high-quality tech education accessible to everyone in Africa and beyond."
      },
      {
        id: "gen_3",
        question: "Do I need any prior tech experience to start?",
        answer: "Not at all. Our courses are designed for everyone, from absolute beginners to experienced professionals looking to upskill. The AI curriculum adapts to your pace, ensuring you never feel left behind."
      }
    ]
  },
  {
    id: "courses-learning",
    name: "Courses & Learning",
    slug: "courses-learning",
    questions: [
      {
        id: "course_1",
        question: "Are the courses actually good if they are AI-generated?",
        answer: "Absolutely. Our AI is trained on top-tier tech documentation, industry best practices, and expert curricula. Furthermore, our human tech reviewers audit all AI-generated content to ensure accuracy, relevance, and high educational quality before it goes live."
      },
      {
        id: "course_2",
        question: "How long do I have access to the courses?",
        answer: "You have lifetime access! Once you enroll in a course, you can revisit the materials, updates, and resources whenever you want, forever. Learn at your own pace, whether it takes you 2 weeks or 6 months."
      },
      {
        id: "course_3",
        question: "What device do I need to learn?",
        answer: "You can learn on any device with an internet connection—smartphone, tablet, or laptop. However, for coding and development courses, we highly recommend using a laptop or desktop computer for the best hands-on practice experience."
      },
      {
        id: "course_4",
        question: "How does the AI Learning Assistant work?",
        answer: "Our AI Assistant is available 24/7 within each lesson. You can ask it to explain complex concepts, debug your code, or provide extra examples. It acts like a personal tutor that instantly answers your questions in the context of the lesson you are studying."
      }
    ]
  },
  {
    id: "pricing-payments",
    name: "Pricing & Payments",
    slug: "pricing-payments",
    questions: [
      {
        id: "pay_1",
        question: "Why is there a ₦1,000 fee for the certificate?",
        answer: "The ₦1,000 fee is a one-time payment that covers the cost of generating your unique, verified digital certificate, maintaining our secure verification database, and processing the final certification exam. It ensures your credential holds real, verifiable value for employers."
      },
      {
        id: "pay_2",
        question: "Is the payment process secure?",
        answer: "Absolutely. We use Paystack, Nigeria's most trusted and secure payment gateway, to process all transactions. Your financial data is encrypted, and we do not store your card details on our servers."
      },
      {
        id: "pay_3",
        question: "What happens if I fail the final exam? Do I have to pay again?",
        answer: "No! If you don't pass the final exam on your first try, you can review the course materials and retake the exam for free. We want you to succeed, so take your time learning before attempting the certification."
      },
      {
        id: "pay_4",
        question: "Can I get a refund if I change my mind?",
        answer: "Since the learning portion is 100% free, the ₦1,000 fee is strictly for the certification exam and certificate generation. If you haven't taken the exam yet, please contact our support team, and we will process a full refund."
      }
    ]
  },
  {
    id: "certificates",
    name: "Certificates & Verification",
    slug: "certificates",
    questions: [
      {
        id: "cert_1",
        question: "Are your certificates recognized by employers?",
        answer: "Yes! Our certificates are verified and include a unique ID and a secure verification link. Employers can instantly verify your credentials on our website. Many of our graduates have successfully used our certificates to land jobs and promotions."
      },
      {
        id: "cert_2",
        question: "How do I add my certificate to LinkedIn?",
        answer: "Once you pass the exam and pay the certification fee, you will find a 'Share on LinkedIn' button on your certificate dashboard. Clicking it will automatically format the credential with the correct details for your LinkedIn profile's 'Licenses & Certifications' section."
      },
      {
        id: "cert_3",
        question: "How can an employer verify my certificate?",
        answer: "Every certificate has a unique ID (e.g., CERT-2024-X8F9A2). Employers can visit aitechacademy.com/verify and enter the ID to instantly see the student's name, the course completed, the date of issuance, and the grade achieved."
      }
    ]
  },
  {
    id: "technical-support",
    name: "Technical Support",
    slug: "technical-support",
    questions: [
      {
        id: "tech_1",
        question: "I forgot my password. How can I reset it?",
        answer: "Click on the 'Sign In' button, then select 'Forgot Password'. Enter the email address associated with your account, and we will send you a secure link to reset your password immediately."
      },
      {
        id: "tech_2",
        question: "The video player or AI assistant is not loading. What should I do?",
        answer: "First, try refreshing the page or clearing your browser cache. Ensure you have a stable internet connection. If the issue persists, try using a different browser (Chrome or Firefox are recommended) or contact our support team."
      },
      {
        id: "tech_3",
        question: "How can I contact customer support?",
        answer: "You can reach our support team via email at support@aitechacademy.com or by using the 'Contact Us' form on our website. We typically respond to all inquiries within 24 hours."
      }
    ]
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get all FAQ categories with their questions
 */
export function getAllFaqCategories(): FAQCategory[] {
  return faqData;
}

/**
 * Get a flat array of all FAQ questions across all categories
 */
export function getAllFaqs(): FAQItem[] {
  return faqData.flatMap((category) => category.questions);
}

/**
 * Get FAQs filtered by a specific category slug
 */
export function getFaqsByCategorySlug(slug: string): FAQCategory | undefined {
  return faqData.find((cat) => cat.slug === slug);
}

/**
 * Search FAQs by a query string (searches both questions and answers)
 */
export function searchFaqs(query: string): FAQItem[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const allFaqs = getAllFaqs();
  
  return allFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get the total number of FAQ questions
 */
export function getTotalFaqCount(): number {
  return getAllFaqs().length;
}