"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  LifeBuoy, 
  Copy, 
  Check, 
  Bug 
} from "lucide-react";

// ==========================================
// ERROR BOUNDARY COMPONENT
// ==========================================

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // 1. Log the error to the console (or your error tracking service like Sentry)
  useEffect(() => {
    console.error("🔥 Application Error:", error);
    
    // TODO: Integrate with Sentry, Datadog, or LogRocket here
    // Sentry.captureException(error);
  }, [error]);

  // 2. Handle copying the error digest for support tickets
  const handleCopyDigest = () => {
    if (error.digest) {
      navigator.clipboard.writeText(`Error Code: ${error.digest}\nMessage: ${error.message}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-hidden px-6 py-20 transition-colors">
      
      {/* Background Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>
      
      {/* Glowing Red/Orange Orbs for Error Vibe */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-100/40 dark:bg-red-900/20 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-100/40 dark:bg-orange-900/20 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        
        {/* Stylized Error Icon */}
        <div className="relative inline-block mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 shadow-2xl shadow-red-500/30 mx-auto">
            <AlertTriangle className="text-white" size={48} strokeWidth={2.5} />
          </div>
          {/* Floating Bug Icon */}
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <Bug className="w-5 h-5 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! We hit a snag in the code.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          Don't worry, your learning progress and certificates are perfectly safe. 
          Our team has been notified, but you can try refreshing the page below.
        </p>

        {/* Error Digest Box (For Support) */}
        {error.digest && (
          <div className="mb-10 max-w-md mx-auto">
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 shadow-sm">
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Error Reference</p>
                <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 truncate">
                  {error.digest}
                </p>
              </div>
              <button
                onClick={handleCopyDigest}
                className="ml-4 p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                aria-label="Copy error code"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Share this code with support if the issue persists.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          
          {/* Primary: Try Again (Resets the error boundary) */}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <RefreshCw size={18} />
            Try Again
          </button>

          {/* Secondary: Go Home */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home size={18} />
            Go to Homepage
          </Link>

          {/* Tertiary: Contact Support */}
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 w-full sm:w-auto text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 font-semibold px-4 py-3 transition-colors"
          >
            <LifeBuoy size={18} />
            Contact Support
          </Link>
        </div>

      </div>
    </main>
  );
}