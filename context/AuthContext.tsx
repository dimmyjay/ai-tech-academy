"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { 
  loginUser, 
  registerUser, 
  loginWithGoogle, 
  logoutUser,
  RegisterData 
} from "@/services/auth";

// ==========================================
// TYPES
// ==========================================

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: "student" | "admin";
  enrolledCourses?: string[];
  completedCourses?: string[];
  certificates?: string[];
  createdAt?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

// ==========================================
// CONTEXT CREATION
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen to Firebase Auth State & Fetch Profile from Realtime DB
  useEffect(() => {
    // ✅ FIX: Guard against SSR / missing Firebase initialization
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous DB listener to prevent memory leaks
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen to user profile in Realtime Database
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        unsubscribeProfile = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.val() as UserProfile);
          } else {
            // Fallback if DB record doesn't exist yet (e.g., right after signup)
            setProfile({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Student",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || undefined,
              role: "student",
              createdAt: Date.now(),
            });
          }
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 2. Auth Action Methods (Wrapping our services)
  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const register = async (data: RegisterData) => {
    await registerUser(data);
  };

  const googleSignIn = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  // 3. Context Value
  const value: AuthContextType = {
    user,
    profile,
    loading,
    login,
    register,
    googleSignIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================
// CUSTOM HOOK FOR CONSUMING CONTEXT
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
