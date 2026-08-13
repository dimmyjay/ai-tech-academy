import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth"; // ✅ Added import for Auth

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // In Next.js, private keys in .env often have literal \n instead of newlines. 
          // This replace fixes that.
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, "\n"),
        }),
        // 🔥 UPDATED: Using your specific environment variable name
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, 
      })
    : getApps()[0];

// Export the Realtime Database instance
export const adminDb = getDatabase(app);

// ✅ Export the Auth instance to fix the missing export error
export const adminAuth = getAuth(app);