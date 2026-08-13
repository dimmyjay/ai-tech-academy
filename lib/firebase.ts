import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

// Initialize app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database & storage are safe to initialize on server and client
const db = getDatabase(app);
const storage = getStorage(app);

// Initialize auth only on the client and set localStorage persistence
let auth: ReturnType<typeof getAuth> | null = null;
if (typeof window !== "undefined") {
  auth = getAuth(app);

  setPersistence(auth, browserLocalPersistence).catch((err) => {
    // Non-fatal — log for debugging. Auth will fall back to default persistence if this fails.
    // eslint-disable-next-line no-console
    console.warn("Failed to set Firebase auth persistence to localStorage:", err);
  });
}

// Analytics: initialize safely and opt-in via NEXT_PUBLIC_ENABLE_ANALYTICS.
// Export analytics (nullable) so other modules can use it if available.
export let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  (async () => {
    try {
      const enableAnalytics = String(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || "").toLowerCase() === "true";
      // Guard: must be explicitly enabled, measurementId must exist, and page must be served over http(s)
      if (!enableAnalytics) {
        // eslint-disable-next-line no-console
        // console.info("Analytics disabled via NEXT_PUBLIC_ENABLE_ANALYTICS.");
        return;
      }
      if (!firebaseConfig.measurementId) {
        // eslint-disable-next-line no-console
        console.warn("Skipping analytics initialization: measurementId not configured.");
        return;
      }
      if (!window.location || !/^https?:/.test(window.location.protocol)) {
        // Avoid initializing analytics on file:// or other non-http(s) schemes
        // eslint-disable-next-line no-console
        console.warn("Skipping analytics initialization: not running on an http(s) origin.");
        return;
      }

      const supported = await isSupported();
      if (!supported) {
        // eslint-disable-next-line no-console
        console.warn("Firebase analytics not supported in this environment.");
        return;
      }

      try {
        analytics = getAnalytics(app);
      } catch (e) {
        // Avoid noisy errors if the fetch fails or initialization throws
        // eslint-disable-next-line no-console
        console.warn("Analytics initialization failed:", e);
        analytics = null;
      }
    } catch (err) {
      // Catch any unexpected errors during the async initialization flow
      // eslint-disable-next-line no-console
      console.warn("Analytics setup encountered an error:", err);
      analytics = null;
    }
  })();
}

// Google provider (can be used on client)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { app, auth, db, storage, googleProvider };