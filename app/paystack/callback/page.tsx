// app/paystack/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function PaystackCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    async function verifyAndEnroll() {
      const reference = searchParams.get("reference");
      
      if (!reference || !user) {
        setStatus("error");
        return;
      }

      try {
        // 1. Verify payment with Paystack
        const verifyRes = await fetch(`/api/paystack/verify?reference=${reference}`);
        const verifyData = await verifyRes.json();

        if (verifyData.status && verifyData.data.status === "success") {
          const { userId, courseId, courseSlug } = verifyData.data.metadata;

          // 2. Save enrollment to Firebase Realtime Database
          const enrollmentRef = ref(db, `enrollments/${userId}/${courseId}`);
          await set(enrollmentRef, {
            userId,
            courseId,
            status: "active",
            progress: 0,
            completedLessons: [],
            enrolledAt: Date.now(),
            lastAccessed: Date.now(),
            paymentReference: reference,
          });

          // 3. Redirect to the course lesson page
          setStatus("success");
          setTimeout(() => {
            router.push(`/courses/${courseSlug}/lesson`);
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    }

    verifyAndEnroll();
  }, [searchParams, user, router]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900">Verifying your payment...</h2>
        <p className="text-gray-600">Please do not close this window.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <CheckCircle2 className="text-green-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Redirecting you to your course...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <XCircle className="text-red-500 mb-4" size={64} />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We could not verify your payment. If money was deducted from your account, please contact support with your transaction reference.
      </p>
      <button 
        onClick={() => router.push("/dashboard")} 
        className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}