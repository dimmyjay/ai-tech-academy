// services/payment.ts

export interface PaymentInitResponse {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status?: "success" | "failed" | "abandoned";
  amount?: number;
  gatewayResponse?: string;
  error?: string;
}

/**
 * 1. Initialize Payment
 * Calls your Next.js API to create a Paystack transaction and returns the payment URL.
 */
export async function initializePayment(
  userId: string,
  courseId: string,
  email: string,
  amount: number = 1000 // Default 1000 Naira for certificate
): Promise<PaymentInitResponse> {
  try {
    const response = await fetch("/api/paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        courseId,
        email,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to initialize payment" };
    }

    return {
      success: true,
      authorizationUrl: data.authorizationUrl,
      reference: data.reference,
    };
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

/**
 * 2. Verify Payment
 * Calls your Next.js API to check if the Paystack transaction was successful.
 * Used after the user is redirected back to your site from Paystack.
 */
export async function verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
  try {
    const response = await fetch(`/api/verify-payment?reference=${reference}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to verify payment" };
    }

    return {
      success: true,
      status: data.status,
      amount: data.amount,
      gatewayResponse: data.gatewayResponse,
    };
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}