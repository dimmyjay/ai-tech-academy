// services/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db, googleProvider } from "@/lib/firebase";

// Define the data needed for registration
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * 1. Register a new user with Email & Password
 * Creates the user in Firebase Auth and saves their profile to the Realtime Database.
 */
export async function registerUser(data: RegisterData): Promise<User> {
  // ✅ FIX: Guard against SSR / missing Firebase initialization
  if (!auth || !db) throw new Error("Firebase is not initialized.");
  
  const { email, password, name } = data;

  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Save user profile to Realtime Database
  const userRef = ref(db, `users/${user.uid}`);
  await set(userRef, {
    uid: user.uid,
    email: user.email,
    name: name,
    photoURL: user.photoURL || "",
    role: "student",
    enrolledCourses: [],
    completedCourses: [],
    certificates: [],
    createdAt: Date.now(),
    lastLogin: Date.now(),
  });

  return user;
}

/**
 * 2. Sign in with Email & Password
 */
export async function loginUser(email: string, password: string): Promise<User> {
  // ✅ FIX: Guard against SSR / missing Firebase initialization
  if (!auth || !db) throw new Error("Firebase is not initialized.");
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update last login timestamp in the database
  const lastLoginRef = ref(db, `users/${user.uid}/lastLogin`);
  await set(lastLoginRef, Date.now());

  return user;
}

/**
 * 3. Sign in with Google
 * If the user is new, it automatically creates their profile in the database.
 */
export async function loginWithGoogle(): Promise<User> {
  // ✅ FIX: Guard against SSR / missing Firebase initialization
  if (!auth || !db || !googleProvider) throw new Error("Firebase is not initialized.");
  
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Check if user already exists in Realtime Database
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // New user via Google, create profile in DB
    await set(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "User",
      photoURL: user.photoURL || "",
      role: "student",
      enrolledCourses: [],
      completedCourses: [],
      certificates: [],
      createdAt: Date.now(),
      lastLogin: Date.now(),
    });
  } else {
    // Existing user, just update last login timestamp
    const lastLoginRef = ref(db, `users/${user.uid}/lastLogin`);
    await set(lastLoginRef, Date.now());
  }

  return user;
}

/**
 * 4. Sign out user
 */
export async function logoutUser(): Promise<void> {
  // ✅ FIX: Guard against SSR / missing Firebase initialization
  if (!auth) throw new Error("Firebase is not initialized.");
  
  await firebaseSignOut(auth);
}

/**
 * 5. Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  // ✅ FIX: Guard against SSR / missing Firebase initialization
  if (!auth) throw new Error("Firebase is not initialized.");
  
  await sendPasswordResetEmail(auth, email);
}

/**
 * 6. Update user password (User must be currently signed in)
 */
export async function changePassword(newPassword: string): Promise<void> {
  // ✅ FIX: Guard against SSR / missing Firebase initialization
  if (!auth) throw new Error("Firebase is not initialized.");
  
  if (!auth.currentUser) {
    throw new Error("No user is currently signed in.");
  }
  await firebaseUpdatePassword(auth.currentUser, newPassword);
}
