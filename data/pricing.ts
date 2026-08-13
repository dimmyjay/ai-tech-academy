// data/pricing.ts

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  icon: string; // Corresponds to Lucide icon names (e.g., "BookOpen", "Award")
  features: PricingFeature[];
  cta: string;
  popular: boolean;
  highlightColor?: string; // Tailwind color class for the icon background
}

// ==========================================
// PRICING DATA
// ==========================================

export const pricingTiers: PricingTier[] = [
  {
    id: "free_learning",
    name: "Free Learning",
    price: 0,
    currency: "NGN",
    period: "forever",
    description: "Access all course materials and learn at your own pace",
    icon: "BookOpen",
    highlightColor: "bg-blue-500",
    features: [
      { text: "Full access to all course lessons", included: true },
      { text: "AI-powered explanations & tutor", included: true },
      { text: "Interactive quizzes & exercises", included: true },
      { text: "Community forum access", included: true },
      { text: "Mobile & desktop access", included: true },
      { text: "Course completion badge", included: true },
      { text: "Verified digital certificate", included: false },
      { text: "LinkedIn credential badge", included: false },
      { text: "Final certification exam", included: false },
    ],
    cta: "Start Learning Free",
    popular: false,
  },
  {
    id: "certified_pro",
    name: "Certified Professional",
    price: 1000,
    currency: "NGN",
    period: "one-time",
    description: "Get verified and boost your career with official certification",
    icon: "Award",
    highlightColor: "bg-orange-500",
    features: [
      { text: "Everything in Free Learning", included: true },
      { text: "AI-generated final proctored exam", included: true },
      { text: "Verified digital certificate (PDF)", included: true },
      { text: "Unique certificate ID & verification link", included: true },
      { text: "LinkedIn credential badge integration", included: true },
      { text: "Employer verification portal access", included: true },
      { text: "Downloadable portfolio assets", included: true },
      { text: "Priority email support", included: true },
      { text: "Exclusive career resources & templates", included: true },
    ],
    cta: "Get Certified Now",
    popular: true,
  },
  // Future-proofing: You can easily add a Team/Enterprise tier later
  {
    id: "enterprise_team",
    name: "Enterprise & Teams",
    price: 0, // Custom pricing
    currency: "NGN",
    period: "custom",
    description: "Upskill your entire engineering or design team",
    icon: "Users",
    highlightColor: "bg-purple-500",
    features: [
      { text: "Everything in Certified Professional", included: true },
      { text: "Bulk enrollment discounts", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom learning paths & tracking", included: true },
      { text: "API access for HR integrations", included: true },
      { text: "Custom branded certificates", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get all available pricing tiers
 */
export function getPricingTiers(): PricingTier[] {
  return pricingTiers;
}

/**
 * Get a specific pricing tier by its ID
 */
export function getPricingTierById(id: string): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id);
}

/**
 * Get the most popular/recommended tier
 */
export function getPopularTier(): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.popular);
}

/**
 * Format the price for display (e.g., 1000 -> "₦1,000")
 */
export function formatPrice(price: number, currency: string = "NGN"): string {
  if (price === 0) return "Free";
  
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}