// data/testimonials.ts

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  course: string;
  courseSlug: string;
  rating: number; // 1 to 5
  testimonial: string;
  outcome: string; // e.g., "Landed job at Andela"
  featured?: boolean; // Highlight top success stories
  tags?: string[]; // e.g., ["career-switch", "freelance", "promotion"]
}

// ==========================================
// TESTIMONIALS DATA
// ==========================================

export const testimonialsData: Testimonial[] = [
  {
    id: "test_1",
    name: "Chukwuemeka Okafor",
    role: "Frontend Developer",
    company: "Andela",
    image: "https://i.pravatar.cc/150?img=11",
    course: "Complete React.js & Next.js Masterclass",
    courseSlug: "complete-react-nextjs-masterclass",
    rating: 5,
    testimonial: "The AI-powered explanations made complex React concepts so much easier to understand. I landed my dream job at Andela just 3 months after getting certified. Best ₦1,000 I've ever spent!",
    outcome: "Landed job at Andela",
    featured: true,
    tags: ["job-landing", "web-dev"],
  },
  {
    id: "test_2",
    name: "Amara Nwosu",
    role: "Data Analyst",
    company: "Flutterwave",
    image: "https://i.pravatar.cc/150?img=5",
    course: "Python for Data Science & Machine Learning",
    courseSlug: "python-data-science-ml",
    rating: 5,
    testimonial: "I was skeptical about online learning, but the interactive quizzes and AI assistant kept me engaged. The certificate helped me transition from teaching to tech. I'm now a Data Analyst at Flutterwave!",
    outcome: "Career switch to tech",
    featured: true,
    tags: ["career-switch", "data-science"],
  },
  {
    id: "test_3",
    name: "Ibrahim Yusuf",
    role: "Full Stack Developer",
    company: "Self-Employed",
    image: "https://i.pravatar.cc/150?img=3",
    course: "Complete Web Development Bootcamp",
    courseSlug: "complete-react-nextjs-masterclass", // Mapped to main web dev course
    rating: 5,
    testimonial: "The quality of content is incredible for the price. I learned everything I needed to start freelancing. I've already completed 5 client projects and earned back the certification fee 100 times over!",
    outcome: "Started freelancing career",
    featured: false,
    tags: ["freelance", "web-dev"],
  },
  {
    id: "test_4",
    name: "Blessing Adeyemi",
    role: "UI/UX Designer",
    company: "Paystack",
    image: "https://i.pravatar.cc/150?img=9",
    course: "UI/UX Design: From Wireframe to Prototype",
    courseSlug: "ui-ux-design-wireframe-prototype",
    rating: 5,
    testimonial: "The AI-generated feedback on my design projects was incredibly helpful. The certificate gave me the confidence to apply for jobs, and I got hired at Paystack within 2 months of completing the course.",
    outcome: "Hired at Paystack",
    featured: true,
    tags: ["job-landing", "design"],
  },
  {
    id: "test_5",
    name: "Tunde Bakare",
    role: "DevOps Engineer",
    company: "MTN Nigeria",
    image: "https://i.pravatar.cc/150?img=13",
    course: "AWS Certified Cloud Practitioner",
    courseSlug: "aws-certified-cloud-practitioner",
    rating: 5,
    testimonial: "As someone working full-time, the self-paced learning was perfect. The AI assistant answered my questions at 2 AM when I was studying after work. Got promoted to DevOps Engineer 6 months later!",
    outcome: "Promotion to DevOps",
    featured: false,
    tags: ["promotion", "cloud"],
  },
  {
    id: "test_6",
    name: "Fatima Hassan",
    role: "Mobile Developer",
    company: "Tech Startup",
    image: "https://i.pravatar.cc/150?img=10",
    course: "Flutter & Dart: Build Beautiful Mobile Apps",
    courseSlug: "flutter-dart-build-mobile-apps",
    rating: 5,
    testimonial: "I never thought I could build mobile apps, but the step-by-step lessons made it possible. The certificate is verified and recognized. I'm now building apps for a Lagos-based startup!",
    outcome: "Building apps professionally",
    featured: false,
    tags: ["job-landing", "mobile-dev"],
  },
  {
    id: "test_7",
    name: "David Ojo",
    role: "Cybersecurity Analyst",
    company: "Access Bank",
    image: "https://i.pravatar.cc/150?img=12",
    course: "Ethical Hacking & Penetration Testing",
    courseSlug: "ethical-hacking-penetration-testing",
    rating: 5,
    testimonial: "The hands-on labs and AI-generated scenarios were exactly what I needed to pass my industry exams. The AI Tech Academy certificate carried weight during my interview at Access Bank.",
    outcome: "Hired in Cybersecurity",
    featured: true,
    tags: ["job-landing", "cybersecurity"],
  },
  {
    id: "test_8",
    name: "Chioma Eze",
    role: "Product Manager",
    company: "Kuda Bank",
    image: "https://i.pravatar.cc/150?img=4",
    course: "UI/UX Design: From Wireframe to Prototype",
    courseSlug: "ui-ux-design-wireframe-prototype",
    rating: 4,
    testimonial: "Even as a Product Manager, understanding the technical side of design and development was crucial. This course bridged the gap between me and my engineering team perfectly.",
    outcome: "Improved team collaboration",
    featured: false,
    tags: ["upskilling", "design"],
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get all testimonials
 */
export function getAllTestimonials(): Testimonial[] {
  return testimonialsData;
}

/**
 * Get only the featured/highlighted testimonials
 */
export function getFeaturedTestimonials(): Testimonial[] {
  return testimonialsData.filter((t) => t.featured);
}

/**
 * Get testimonials filtered by a specific course slug
 */
export function getTestimonialsByCourse(courseSlug: string): Testimonial[] {
  return testimonialsData.filter((t) => t.courseSlug === courseSlug);
}

/**
 * Get testimonials filtered by a specific tag (e.g., "job-landing", "career-switch")
 */
export function getTestimonialsByTag(tag: string): Testimonial[] {
  return testimonialsData.filter((t) => t.tags?.includes(tag));
}

/**
 * Get a random selection of testimonials (useful for the homepage carousel)
 */
export function getRandomTestimonials(count: number = 3): Testimonial[] {
  const shuffled = [...testimonialsData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get the average rating across all testimonials
 */
export function getAverageRating(): number {
  if (testimonialsData.length === 0) return 0;
  const totalRating = testimonialsData.reduce((sum, t) => sum + t.rating, 0);
  return Math.round((totalRating / testimonialsData.length) * 10) / 10; // Rounds to 1 decimal place
}