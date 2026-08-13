// app/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPayment } from "@/services/payment";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    // ✅ FIX: Pass reference as an explicitly typed string argument
    async function checkPayment(ref: string) {
      const result = await verifyPayment(ref);
      
      if (result.success && result.status === "success") {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    }

    checkPayment(reference);
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="animate-spin text-orange-600 mb-4" size={48} />
        <p className="text-xl text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {status === "success" ? (
        <>
          <CheckCircle className="text-green-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            Thank you! Your payment was successful. You are now enrolled and can access the course and final exam.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700"
          >
            Go to Dashboard
          </Link>
        </>
      ) : (
        <>
          <XCircle className="text-red-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            We couldn't process your payment. Please try again or contact support.
          </p>
          <button 
            onClick={() => router.back()}
            className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
