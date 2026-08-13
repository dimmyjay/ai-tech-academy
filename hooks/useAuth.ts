"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { ref, onValue } from "firebase/database";

// Define a type for the profile data stored in your Realtime Database
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
  [key: string]: any; // Allow additional dynamic fields
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX: Guard against SSR / missing Firebase initialization
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    // 1. Listen to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener to prevent memory leaks
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // 2. Fetch additional profile data from Realtime Database
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        unsubscribeProfile = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.val() as UserProfile);
          } else {
            // Fallback: If the user exists in Auth but not in DB yet, use Auth data
            setProfile({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || undefined,
              role: "student",
              createdAt: Date.now(),
            });
          }
        });
        
        setLoading(false);
      } else {
        // User is signed out
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function to unsubscribe from both listeners when component unmounts
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Logout function
  const logout = async () => {
    // ✅ FIX: Guard against missing auth instance
    if (!auth) return;
    
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return {
    user,       // Raw Firebase User object (contains uid, email, etc.)
    profile,    // Custom profile data from your Realtime Database
    loading,    // Boolean indicating if the initial auth check is still running
    logout,     // Function to sign the user out
  };
}
