// app/auth/signup/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2
} from "lucide-react";

// Import the official colorful Google icon from React Icons
import { FcGoogle } from "react-icons/fc";

import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { register, googleSignIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Simple password strength check for visual feedback
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthColor = 
    strength <= 1 ? "bg-red-500" : 
    strength === 2 ? "bg-yellow-500" : 
    strength === 3 ? "bg-blue-500" : "bg-green-500";

  // 1. Handle Email/Password Registration
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Google Registration
  const handleGoogleSignUp = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await googleSignIn();
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError("Failed to sign up with Google. Please try again.");
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
            Start your <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">tech journey</span> today.
          </h2>
          <p className="text-lg text-gray-300 max-w-md">
            Join thousands of students mastering Web Dev, Data Science, and more. 
            It's free to start, and only ₦1,000 to get certified.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Zap className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Instant Access</h4>
              <p className="text-sm text-gray-400">Create your account in seconds and start learning immediately.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Sparkles className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">AI-Powered Curriculum</h4>
              <p className="text-sm text-gray-400">Learn from courses that are constantly updated by advanced AI.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <ShieldCheck className="text-orange-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Verified Credentials</h4>
              <p className="text-sm text-gray-400">Earn certificates that employers trust and can verify online.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL: SIGN UP FORM */}
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
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                Sign in here
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
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:opacity-60"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          strength >= level ? strengthColor : "bg-gray-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {strength <= 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong"} password
                  </p>
                </div>
              )}
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Free Account
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
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin text-orange-600" size={20} />
            ) : (
              // 👈 Replaced Chrome with FcGoogle
              <FcGoogle size={22} />
            )}
            {isGoogleLoading ? "Connecting..." : "Sign up with Google"}
          </button>

          {/* Footer Note */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}