// app/courses/[slug]/checkout/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initializePayment } from "@/services/payment";
import { useAuth } from "@/hooks/useAuth";
import { Loader, CreditCard } from "lucide-react";

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    const courseId = "fetch_course_id_from_slug_logic"; // Get actual course ID

    const result = await initializePayment(
      user.uid,
      courseId,
      user.email!,
      1000 // ₦1,000
    );

    if (result.success && result.authorizationUrl) {
      // Redirect user to Paystack payment page
      window.location.href = result.authorizationUrl;
    } else {
      alert(result.error || "Failed to start payment.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg text-center">
      <CreditCard className="mx-auto text-orange-600 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-2">Certificate Fee</h2>
      <p className="text-4xl font-bold text-orange-600 mb-6">₦1,000</p>
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="animate-spin" /> : "Pay with Paystack"}
      </button>
    </div>
  );
}