// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Global UI Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Global Context Providers
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CourseProvider } from "@/context/CourseContext";

// ==========================================
// FONT SETUP
// ==========================================

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", // Expose as CSS variable for Tailwind
  display: "swap", // Prevent layout shift during font load
});

// ==========================================
// SEO & SOCIAL METADATA
// ==========================================

export const metadata: Metadata = {
  // ✅ FIX: Add metadataBase to resolve absolute URLs for social images
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  
  title: {
    default: "AI Tech Academy | Master Tech Skills & Get Certified",
    template: "%s | AI Tech Academy", // Dynamic title template for subpages
  },
  description: "Learn Web Development, Data Science, UI/UX, and more with our AI-powered courses. Learn for free, and pay just ₦1,000 only when you're ready to get your verified certificate.",
  keywords: ["tech courses nigeria", "learn coding online", "AI tech academy", "affordable tech certificates", "web development course", "data science nigeria", "paystack courses"],
  authors: [{ name: "AI Tech Academy" }],
  creator: "AI Tech Academy",
  publisher: "AI Tech Academy",
  
  // OpenGraph (For Facebook, LinkedIn, WhatsApp previews)
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://aitechacademy.com",
    siteName: "AI Tech Academy",
    title: "AI Tech Academy | Master Tech Skills & Get Certified",
    description: "Learn for free. Get verified for ₦1,000. Master in-demand tech skills with AI-powered courses.",
    images: [
      {
        url: "/og-image.png", // Make sure to add an og-image.png to your public folder!
        width: 1200,
        height: 630,
        alt: "AI Tech Academy Preview",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI Tech Academy | Master Tech Skills & Get Certified",
    description: "Learn for free. Get verified for ₦1,000. Master in-demand tech skills with AI-powered courses.",
    images: ["/og-image.png"],
    creator: "@aitechacademy",
  },
  
  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Verification (Add your Google Search Console / Bing codes here later)
  verification: {
    google: "your-google-site-verification-code",
  },
};

// ==========================================
// ROOT LAYOUT COMPONENT
// ==========================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is CRITICAL for the ThemeProvider (Dark Mode)
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} font-sans antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200`}
      >
        {/* 
          PROVIDER NESTING ORDER IS CRITICAL:
          1. ThemeProvider: Handles UI theme (no auth dependency)
          2. AuthProvider: Handles user login state
          3. CourseProvider: Handles user enrollments (depends on AuthProvider)
        */}
        <ThemeProvider>
          <AuthProvider>
            <CourseProvider>
              
              {/* Global Navigation */}
              <Navbar />
              
              {/* Main Content Area 
                  flex flex-col min-h-screen ensures the footer sticks to the bottom 
              */}
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                  {children}
                </main>
                
                {/* Global Footer */}
                <Footer />
              </div>

            </CourseProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}