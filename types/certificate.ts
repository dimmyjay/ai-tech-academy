// types/certificate.ts

// ==========================================
// ENUMS & BASIC TYPES
// ==========================================

/**
 * Defines the grade a student achieved on the final exam.
 */
export type CertificateGrade = "Distinction" | "Merit" | "Pass";

/**
 * Defines the current status of a certificate.
 */
export type CertificateStatus = "active" | "revoked" | "expired";

/**
 * Defines the format for certificate downloads.
 */
export type CertificateFormat = "pdf" | "png" | "svg";

// ==========================================
// CORE CERTIFICATE INTERFACES
// ==========================================

/**
 * Represents a verified digital certificate stored in the Firebase Realtime Database.
 * Created automatically when a user passes the final exam and pays the ₦1,000 fee.
 */
export interface Certificate {
  id: string; // Unique Firebase key
  userId: string; // Owner of the certificate
  courseId: string; // Course that was completed
  examAttemptId: string; // The specific exam attempt that earned this certificate
  
  // Certificate Details
  certificateNumber: string; // Unique public ID (e.g., "CERT-2024-X8F9A2")
  studentName: string; // Full name as it appears on the certificate
  courseName: string; // Full course title as it appears on the certificate
  grade: CertificateGrade;
  score: number; // Final exam score percentage (0-100)
  
  // Status & Verification
  status: CertificateStatus;
  verified: boolean;
  
  // Timestamps
  issuedAt: number;
  expiresAt?: number; // Optional expiration (undefined = lifetime)
  revokedAt?: number;
  revocationReason?: string;
  
  // File References
  pdfUrl?: string; // URL to the generated PDF in Firebase Storage
  shareUrl: string; // Public verification URL (e.g., /verify/CERT-2024-X8F9A2)
}

// ==========================================
// CERTIFICATE GENERATION TYPES
// ==========================================

/**
 * Payload required to generate a new certificate.
 * Typically assembled by the backend after a successful exam submission + payment.
 */
export interface GenerateCertificatePayload {
  userId: string;
  courseId: string;
  examAttemptId: string;
  studentName: string;
  courseName: string;
  grade: CertificateGrade;
  score: number;
}

/**
 * The result returned after successfully generating a certificate.
 */
export interface GenerateCertificateResult {
  certificateId: string;
  certificateNumber: string;
  pdfUrl: string;
  shareUrl: string;
  issuedAt: number;
}

// ==========================================
// CERTIFICATE VERIFICATION TYPES
// ==========================================

/**
 * The public-facing data returned when someone verifies a certificate
 * via the /verify/[certificateId] page or API.
 * Does NOT include sensitive data like userId or examAttemptId.
 */
export interface CertificateVerificationResult {
  isValid: boolean;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  grade: CertificateGrade;
  score: number;
  issuedAt: number;
  status: CertificateStatus;
  verifiedBy: string; // "AI Tech Academy"
  verificationTimestamp: number;
}

/**
 * Payload for the public verification API endpoint.
 */
export interface VerifyCertificatePayload {
  certificateNumber: string; // The public-facing ID (e.g., "CERT-2024-X8F9A2")
}

// ==========================================
// PDF GENERATION TYPES
// ==========================================

/**
 * Configuration for generating the certificate PDF using pdf-lib.
 */
export interface CertificatePDFConfig {
  width: number; // Page width in points (e.g., 842 for A4 landscape)
  height: number; // Page height in points (e.g., 595 for A4 landscape)
  
  // Branding
  academyName: string;
  academyLogoUrl?: string;
  accentColor: { r: number; g: number; b: number }; // RGB values
  
  // Content
  title: string; // "Certificate of Completion"
  recipientName: string;
  courseName: string;
  grade: CertificateGrade;
  certificateNumber: string;
  issuedDate: string; // Formatted date string
  
  // Signatures
  instructorName?: string;
  instructorTitle?: string;
}

/**
 * The output of the PDF generation process.
 */
export interface CertificatePDFOutput {
  pdfBytes: Uint8Array;
  fileName: string; // e.g., "CERT-2024-X8F9A2_Chukwuemeka_Okafor.pdf"
  fileSize: number; // In bytes
}

// ==========================================
// HELPER TYPES FOR UI
// ==========================================

/**
 * A simplified certificate object for displaying in the dashboard grid.
 * Excludes heavy fields like PDF bytes or full verification data.
 */
export interface CertificateSummary {
  id: string;
  certificateNumber: string;
  courseName: string;
  courseSlug: string; // For linking back to the course
  studentName: string;
  grade: CertificateGrade;
  issuedAt: number;
  status: CertificateStatus;
  pdfUrl?: string;
  shareUrl: string;
}

/**
 * Represents a certificate as displayed on the public verification page.
 */
export interface PublicCertificateView {
  certificateNumber: string;
  studentName: string;
  courseName: string;
  grade: CertificateGrade;
  score: number;
  issuedAt: number;
  isValid: boolean;
  academyName: string;
}

// ==========================================
// UTILITY FUNCTIONS (Type Helpers)
// ==========================================

/**
 * Determines the grade based on the exam score.
 * Use this to ensure consistent grading across the app.
 */
export function calculateGrade(score: number): CertificateGrade {
  if (score >= 90) return "Distinction";
  if (score >= 80) return "Merit";
  return "Pass";
}

/**
 * Generates a unique certificate number.
 * Format: CERT-YYYY-XXXXXX (e.g., "CERT-2024-A3F8K2")
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const randomString = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
  return `CERT-${year}-${randomString}`;
}

/**
 * Formats the certificate file name for download.
 */
export function formatCertificateFileName(
  certificateNumber: string,
  studentName: string
): string {
  const sanitizedName = studentName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_");
  return `${certificateNumber}_${sanitizedName}.pdf`;
}