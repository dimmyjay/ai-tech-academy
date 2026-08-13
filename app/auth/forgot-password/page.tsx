"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  GraduationCap, 
  KeyRound, 
  ShieldCheck, 
  LifeBuoy
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // 1. Handle Password Reset Request
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Attempt to send the reset email
      await sendPasswordResetEmail(auth, email);
      
      // SECURITY BEST PRACTICE: 
      // We set success to true regardless of whether the email exists in Firebase.
      // This prevents "Email Enumeration" attacks (hackers checking if an email is registered).
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      // If it's a completely invalid email format, show an error.
      // Otherwise, for security, we still show the success screen.
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
        setIsLoading(false);
      } else {
        // For auth/user-not-found or any other error, show success to prevent enumeration
        setIsSuccess(true);
      }
    } finally {
      if (!error) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* ========================================== */}
      {/* LEFT PANEL: BRANDING & REASSURANCE (Desktop Only) */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <GraduationCap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">AI Tech</h1>
              <p className="-mt-1 text-xs font-medium text-orange-400 uppercase tracking-wider">Academy</p>
            </div>
          </Link>

          {/* Headline */}
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Don't worry, <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              we've got you.
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-md">
            Resetting your password is quick and easy. You'll be back to learning and building in no time.
          </p>
        </div>

        {/* Security & Support Highlights */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <ShieldCheck className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Secure & Encrypted</h4>
              <p className="text-sm text-gray-400">Your reset link is single-use and expires in 1 hour for your security.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <LifeBuoy className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Need more help?</h4>
              <p className="text-sm text-gray-400">
                Can't access your email?{" "}
                <a href="/contact" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL: RESET FORM / SUCCESS STATE */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50/50">
        <div className="w-full max-w-md">
          
          {/* Back to Sign In Link */}
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          {/* ========================================== */}
          {/* STATE 1: SUCCESS MESSAGE */}
          {/* ========================================== */}
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Check your email</h2>
              <p className="text-gray-600 mb-2">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-gray-900 mb-6 break-all">
                {email}
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Didn't get the email?</strong> Check your spam or junk folder. The link will expire in 60 minutes.
                </p>
              </div>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            /* ========================================== */
            /* STATE 2: EMAIL INPUT FORM */
            /* ========================================== */
            <>
              {/* Mobile Logo */}
              <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                  <GraduationCap className="text-white" size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">AI Tech</h1>
                  <p className="-mt-1 text-[10px] font-medium text-orange-600 uppercase tracking-wider">Academy</p>
                </div>
              </Link>

              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-2xl mb-4">
                  <KeyRound className="text-orange-600" size={28} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Forgot password?</h2>
                <p className="mt-2 text-gray-600">
                  No problem. Enter your email below and we'll send you a link to reset it.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-3">
                  <div className="mt-0.5">⚠️</div>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Footer Note */}
              <p className="mt-8 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/auth/signin" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
