// app/auth/signin/page.tsx
// app/auth/signin/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Loader2
} from "lucide-react";

// Import the official colorful Google icon from React Icons
import { FcGoogle } from "react-icons/fc";

import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { login, googleSignIn, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Handle Email/Password Login
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
      router.refresh(); // Refresh to ensure server components get the new auth state
    } catch (err: any) {
      console.error("Login error:", err);
      // Map Firebase errors to friendly messages
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please reset your password or try later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Google Login
  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await googleSignIn();
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* ========================================== */}
      {/* LEFT PANEL: BRANDING & VALUE PROP (Desktop Only) */}
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
            Welcome back to the <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">future of learning</span>.
          </h2>
          <p className="text-lg text-gray-300 max-w-md">
            Pick up right where you left off. Your AI tutor, courses, and progress are waiting for you.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Zap className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">100% Free to Learn</h4>
              <p className="text-sm text-gray-400">Access all lessons, quizzes, and AI explanations without paying a dime.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Sparkles className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">AI-Powered Tutor</h4>
              <p className="text-sm text-gray-400">Get instant, context-aware answers to your coding questions 24/7.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <ShieldCheck className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Verified Certificates</h4>
              <p className="text-sm text-gray-400">Get certified for just ₦1,000 and boost your LinkedIn profile instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL: LOGIN FORM */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50/50">
        <div className="w-full max-w-md">
          
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
            <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                Create one for free
              </Link>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
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
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-3 text-gray-500 font-semibold tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin text-orange-600" size={20} />
            ) : (
              // 👈 Replaced Chrome with FcGoogle
              <FcGoogle size={22} />
            )}
            {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
          </button>

          {/* Footer Note */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}