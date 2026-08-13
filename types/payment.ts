// types/payment.ts

// ==========================================
// ENUMS & BASIC TYPES
// ==========================================

/**
 * Defines the possible statuses of a payment transaction.
 */
export type PaymentStatus = "pending" | "success" | "failed" | "abandoned";

/**
 * Defines the currency used for payments.
 */
export type Currency = "NGN"; // Nigerian Naira

/**
 * Defines the purpose of the payment.
 */
export type PaymentType = "course_certificate" | "premium_subscription";

// ==========================================
// PAYSTACK API RESPONSE TYPES
// ==========================================

/**
 * Represents the response from Paystack's /transaction/initialize endpoint.
 */
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Represents the response from Paystack's /transaction/verify/{reference} endpoint.
 */
export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: PaymentStatus;
    reference: string;
    receipt_number: number;
    amount: number; // Amount in kobo (multiply by 100 for Naira)
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string; // e.g., "card", "bank_transfer"
    currency: Currency;
    ip_address: string;
    metadata: {
      userId: string;
      courseId: string;
      type: PaymentType;
      [key: string]: any;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
  };
}

// ==========================================
// INTERNAL DATABASE TYPES
// ==========================================

/**
 * Represents a payment record stored in the Firebase Realtime Database.
 */
export interface PaymentRecord {
  id: string; // Unique ID for this record in Firebase
  userId: string;
  courseId: string;
  
  amount: number; // Amount in Naira
  currency: Currency;
  type: PaymentType;
  
  status: PaymentStatus;
  reference: string; // Paystack reference
  
  // Timestamps
  initiatedAt: number;
  paidAt?: number;
  
  // Metadata from Paystack (stored for auditing)
  gatewayResponse?: string;
  channel?: string;
  customerEmail?: string;
}

// ==========================================
// API PAYLOADS
// ==========================================

/**
 * Payload sent from the frontend to initialize a payment.
 */
export interface InitializePaymentPayload {
  userId: string;
  courseId: string;
  email: string;
  amount: number; // In Naira
}

/**
 * Response returned to the frontend after initializing a payment.
 */
export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}

/**
 * Response returned to the frontend after verifying a payment.
 */
export interface VerifyPaymentResponse {
  success: boolean;
  status?: PaymentStatus;
  amount?: number;
  certificateId?: string; // Populated if payment was for a certificate and successful
  error?: string;
}

/**
 * Payload received by your Webhook API route from Paystack.
 */
export interface PaystackWebhookEvent {
  event: string; // e.g., "charge.success"
  data: {
    id: number;
    status: PaymentStatus;
    reference: string;
    amount: number;
    currency: Currency;
    metadata: {
      userId: string;
      courseId: string;
      type: PaymentType;
    };
    customer: {
      email: string;
    };
  };
}