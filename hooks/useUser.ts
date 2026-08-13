"use client";

import { useState, useCallback } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

// Define the shape of data you allow users to update
export interface UserUpdateData {
  name?: string;
  photoURL?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export function useUser() {
  const { user, profile, loading: authLoading } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Update specific fields in the Realtime Database
  const updateUserProfile = useCallback(
    async (data: UserUpdateData) => {
      if (!user?.uid) {
        setError("You must be logged in to update your profile.");
        return false;
      }

      setUpdating(true);
      setError(null);

      try {
        const userRef = ref(db, `users/${user.uid}`);
        
        // We use update() to only change the fields provided, keeping others intact
        await update(userRef, {
          ...data,
          updatedAt: Date.now(),
        });

        return true;
      } catch (err: any) {
        console.error("Error updating user profile:", err);
        setError(err.message || "Failed to update profile.");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [user?.uid]
  );

  // 2. Fetch fresh user data (useful if you need to force a refresh)
  const refreshUserData = useCallback(async () => {
    if (!user?.uid) return null;
    
    try {
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  }, [user?.uid]);

  // 3. Check if user has completed their profile setup
  const isProfileComplete = !!profile?.name && !!profile?.phone;

  return {
    user,           // Raw Firebase Auth user
    profile,        // Current profile data from DB (via useAuth)
    authLoading,    // Is auth still initializing?
    updating,       // Is an update request currently in progress?
    error,          // Any error from the last update attempt
    updateUserProfile, // Function to call when saving form data
    refreshUserData,   // Function to manually fetch latest data
    isProfileComplete, // Boolean helper for UI logic
  };
}