// data/courses.ts

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Emoji or icon name
  description: string;
}

export interface SeedCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: string;
  price: number;
  currency: string;
  thumbnail: string;
  instructor: string;
  enrolledStudents: number;
  rating: number;
  createdAt: number;
}

// ==========================================
// CATEGORIES
// ==========================================

export const categories: Category[] = [
  {
    id: "web-dev",
    name: "Web Development",
    slug: "web-development",
    icon: "💻",
    description: "Build modern websites and web applications.",
  },
  {
    id: "data-science",
    name: "Data Science",
    slug: "data-science",
    icon: "📊",
    description: "Analyze data and build machine learning models.",
  },
  {
    id: "mobile-dev",
    name: "Mobile Development",
    slug: "mobile-development",
    icon: "📱",
    description: "Create iOS and Android apps from scratch.",
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    slug: "ui-ux-design",
    icon: "🎨",
    description: "Design beautiful and user-friendly interfaces.",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    slug: "cybersecurity",
    icon: "🔒",
    description: "Protect systems and networks from digital attacks.",
  },
  {
    id: "cloud",
    name: "Cloud Computing",
    slug: "cloud-computing",
    icon: "☁️",
    description: "Master AWS, Azure, and cloud infrastructure.",
  },
];

// ==========================================
// SEED COURSES (Initial Mock Data)
// ==========================================

export const seedCourses: SeedCourse[] = [
  {
    id: "seed_react_nextjs",
    title: "Complete React.js & Next.js Masterclass",
    slug: "complete-react-nextjs-masterclass",
    description: "Build modern, fast, and scalable web applications using React 18, Next.js 14, and Tailwind CSS. Master server components and API routes.",
    category: "Web Development",
    level: "Intermediate",
    duration: "12 Weeks",
    price: 1000,
    currency: "NGN",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
    instructor: "AI Tech Academy",
    enrolledStudents: 1240,
    rating: 4.9,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: "seed_python_ds",
    title: "Python for Data Science & Machine Learning",
    slug: "python-data-science-ml",
    description: "Analyze complex datasets and build predictive models. Learn Pandas, NumPy, Scikit-Learn, and TensorFlow from the ground up.",
    category: "Data Science",
    level: "Beginner",
    duration: "10 Weeks",
    price: 1000,
    currency: "NGN",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
    instructor: "AI Tech Academy",
    enrolledStudents: 890,
    rating: 4.8,
    createdAt: Date.now() - 86400000 * 25,
  },
  {
    id: "seed_uiux",
    title: "UI/UX Design: From Wireframe to Prototype",
    slug: "ui-ux-design-wireframe-prototype",
    description: "Design beautiful, user-centric interfaces in Figma. Learn design thinking, user research, and how to build interactive prototypes.",
    category: "UI/UX Design",
    level: "Beginner",
    duration: "8 Weeks",
    price: 1000,
    currency: "NGN",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    instructor: "AI Tech Academy",
    enrolledStudents: 650,
    rating: 4.7,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: "seed_flutter",
    title: "Flutter & Dart: Build Beautiful Mobile Apps",
    slug: "flutter-dart-build-mobile-apps",
    description: "Create stunning, natively compiled mobile applications for iOS and Android from a single codebase using Flutter and Dart.",
    category: "Mobile Development",
    level: "Beginner",
    duration: "9 Weeks",
    price: 1000,
    currency: "NGN",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    instructor: "AI Tech Academy",
    enrolledStudents: 430,
    rating: 4.8,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: "seed_cybersec",
    title: "Ethical Hacking & Penetration Testing",
    slug: "ethical-hacking-penetration-testing",
    description: "Learn how to think like a hacker to defend like a pro. Master network scanning, vulnerability assessment, and penetration testing.",
    category: "Cybersecurity",
    level: "Advanced",
    duration: "14 Weeks",
    price: 1000,
    currency: "NGN",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    instructor: "AI Tech Academy",
    enrolledStudents: 310,
    rating: 4.9,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "seed_aws",
    title: "AWS Certified Cloud Practitioner",
    slug: "aws-certified-cloud-practitioner",
    description: "Prepare for the AWS CLF-C02 exam. Master cloud concepts, security, architecture, pricing, and support in the AWS ecosystem.",
    category: "Cloud Computing",
    level: "Intermediate",
    duration: "6 Weeks",
    price: 1000,
    currency: "NGN",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    instructor: "AI Tech Academy",
    enrolledStudents: 520,
    rating: 4.6,
    createdAt: Date.now() - 86400000 * 5,
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get all available categories
 */
export function getCategories(): Category[] {
  return categories;
}

/**
 * Get a specific category by its slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

/**
 * Get all seed courses
 */
export function getSeedCourses(): SeedCourse[] {
  return seedCourses;
}

/**
 * Get a specific seed course by its slug
 */
export function getSeedCourseBySlug(slug: string): SeedCourse | undefined {
  return seedCourses.find((course) => course.slug === slug);
}

/**
 * Get seed courses filtered by category
 */
export function getSeedCoursesByCategory(categoryName: string): SeedCourse[] {
  return seedCourses.filter((course) => course.category === categoryName);
}

/**
 * Format seed courses for Firebase Realtime Database seeding.
 * Converts the array into an object keyed by the course ID, 
 * which is the required structure for Firebase `set()` or `update()`.
 */
// ✅ FIX: Changed return type and object type to `Record<string, any>` to allow extra Firebase fields
export function formatCoursesForFirebase(): Record<string, any> {
  const formattedCourses: Record<string, any> = {};
  
  seedCourses.forEach((course) => {
    formattedCourses[course.id] = {
      ...course,
      modules: [], // Initialize empty modules array (matches your Course type)
      lessons: [], // Fallback for legacy references
      finalExamId: null,
      isPublished: false,
      processing: true,
    };
  });

  return formattedCourses;
}
