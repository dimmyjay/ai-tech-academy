import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 1. Tailwind CSS Class Merger
 * Safely merges Tailwind classes, resolving conflicts (e.g., p-4 and p-2).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 2. Currency Formatter (Nigerian Naira)
 * Formats numbers into standard NGN currency format (e.g., ₦1,000).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 3. Date Formatter
 * Converts timestamps or Date objects into readable strings.
 */
export function formatDate(
  timestamp: number | Date, 
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", options || defaultOptions).format(date);
}

/**
 * 4. URL Slug Generator
 * Converts course titles into SEO-friendly URL slugs.
 * Example: "Complete React.js Course!" -> "complete-reactjs-course"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-")     // Replace spaces with hyphens
    .replace(/--+/g, "-")     // Replace multiple hyphens with a single one
    .trim();
}

/**
 * 5. Text Truncator
 * Cuts off long text and adds an ellipsis (...) for card descriptions.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * 6. Certificate Number Generator
 * Creates unique, professional-looking certificate IDs.
 * Example: "CERT-2024-X8F9A2"
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${randomString}`;
}

/**
 * 7. Percentage Calculator
 * Safely calculates progress percentages without dividing by zero.
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100); // Caps at 100%
}

/**
 * 8. Relative Time Formatter
 * Converts timestamps into "time ago" format (e.g., "2 hours ago").
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * 9. Delay Utility (for testing loading states or animations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}