// app/api/paystack/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("reference");

  // 1. Check if reference is provided
  if (!reference) {
    return NextResponse.json(
      { error: "Transaction reference is required" }, 
      { status: 400 }
    );
  }

  // 2. Check if Paystack Secret Key is configured
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("❌ Paystack Secret Key is missing in environment variables");
    return NextResponse.json(
      { error: "Server configuration error" }, 
      { status: 500 }
    );
  }

  try {
    // 3. Call Paystack Verification API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    // 4. Handle HTTP errors (e.g., 401 Unauthorized, 404 Not Found)
    if (!response.ok) {
      throw new Error(`Paystack API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // 5. Return the full Paystack response to the client
    // The client will check if data.status === true and data.data.status === "success"
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("❌ Paystack verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction", details: error.message }, 
      { status: 500 }
    );
  }
}