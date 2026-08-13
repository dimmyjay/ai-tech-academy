// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Save, 
  Camera, 
  Shield, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import Loader from "@/components/Loader";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // 2. Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  // 3. Handle Profile Update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSaving(true);
    setStatus("idle");

    try {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        name,
        phone,
        bio,
        updatedAt: Date.now(),
      });

      setStatus("success");
      setStatusMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatus("error");
      setStatusMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} message="Loading profile..." />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and account preferences.
        </p>
      </div>

      {/* ========================================== */}
      {/* 1. PROFILE PICTURE & BASIC INFO */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User size={20} className="text-orange-600" />
          Public Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="relative group">
            {profile.photoURL ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50">
                <Image
                  src={profile.photoURL}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-50">
                {getInitials(profile.name)}
              </div>
            )}
            
            {/* Change Photo Overlay (Mock) */}
            <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{profile.email}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide">
              {profile.role || "Student"}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              *.jpg, *.png or *.gif. Max size 2MB. (Feature coming soon)
            </p>
          </div>
        </div>

        {/* Status Message */}
        {status !== "idle" && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            status === "success" 
              ? "bg-green-50 border border-green-100 text-green-700" 
              : "bg-red-50 border border-red-100 text-red-700"
          }`}>
            {status === "success" ? <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Role (Read Only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Account Type
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={profile.role === "admin" ? "Administrator" : "Student"}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 capitalize cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Short Bio <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us a little about yourself, your goals, or your tech journey..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-right">{bio.length}/250 characters</p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================== */}
      {/* 2. SECURITY & DANGER ZONE */}
      {/* ========================================== */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Security */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-gray-600" />
            Security
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Manage your password and secure your account.
          </p>
          <button 
            onClick={() => router.push("/auth/forgot-password")}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <Lock size={18} />
            Reset Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={20} />
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Once you delete your account, there is no going back. All your progress and certificates will be permanently lost.
          </p>
          <button className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors">
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}