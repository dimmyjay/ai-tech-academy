// types/user.ts

// ==========================================
// ENUMS & BASIC TYPES
// ==========================================

/**
 * Defines the possible roles a user can have in the system.
 */
export type UserRole = "student" | "admin" | "instructor";

/**
 * Defines the authentication status of the user.
 */
export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

// ==========================================
// CORE USER INTERFACES
// ==========================================

/**
 * Represents the extended user profile stored in the Firebase Realtime Database.
 * This goes beyond the basic Firebase Auth user object.
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  
  // Learning Progress Tracking
  enrolledCourses: string[];      // Array of Course IDs
  completedCourses: string[];     // Array of Course IDs
  certificates: string[];         // Array of Certificate IDs
  
  // Metadata
  phone?: string;
  bio?: string;
  location?: string;
  createdAt: number;              // Timestamp
  lastLogin: number;              // Timestamp
  updatedAt?: number;             // Timestamp
  
  // Allow additional dynamic fields if needed
  [key: string]: any; 
}

/**
 * Represents the basic Firebase Auth user object.
 * (Usually provided by `firebase/auth`, but defined here for custom mock/testing).
 */
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// ==========================================
// AUTHENTICATION PAYLOADS
// ==========================================

/**
 * The data required from the frontend to register a new user.
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string; // Optional during signup
}

/**
 * The data required from the frontend to log in a user.
 */
export interface LoginData {
  email: string;
  password: string;
}

// ==========================================
// CONTEXT & STATE TYPES
// ==========================================

/**
 * The shape of the authentication context provided to the app.
 */
export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

/**
 * The shape of the user settings/preferences state.
 */
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: "en" | "fr" | "es"; // Expand as needed
}

// ==========================================
// HELPER TYPES FOR UI
// ==========================================

/**
 * A simplified user object used for displaying in lists, 
 * comments, or instructor profiles without exposing sensitive data.
 */
export interface PublicUser {
  uid: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  bio?: string;
}

/**
 * Represents a user's enrollment record in a specific course.
 * (Often nested inside the course or user document, but typed here for clarity).
 */
export interface UserEnrollment {
  courseId: string;
  enrolledAt: number;
  progress: number; // 0 to 100
  status: "active" | "completed" | "dropped";
}