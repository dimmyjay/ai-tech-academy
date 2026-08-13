// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, userId, courseId, courseSlug, callbackUrl } = body;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is missing in .env.local");
    }

    console.log("🔄 Initializing Paystack transaction for:", email);

    // Create an AbortController to force a timeout after 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        callback_url: callbackUrl,
        metadata: {
          userId,
          courseId,
          courseSlug,
        },
      }),
      signal: controller.signal, // Attach the timeout signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Paystack API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Paystack transaction initialized successfully");
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ Paystack initialization error:", error.message || error);
    
    // Return a specific error message to the frontend
    return NextResponse.json(
      { 
        error: "Failed to connect to payment gateway. Please check your internet connection or try again later.",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}