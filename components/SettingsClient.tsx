
// components/SettingsClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  Megaphone,
  GraduationCap,
  LogOut,
  Trash2,
  Check,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function SettingsClient() {
  const router = useRouter();
  const { user, profile, loading: authLoading, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Notification State
  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    newCourses: true,
    promotions: false,
    weeklyDigest: true,
  });

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success">("idle");

  // 1. Initialize notification state from profile (if saved in DB)
  useEffect(() => {
    if (profile?.preferences?.notifications) {
      setNotifications(profile.preferences.notifications);
    }
    if (profile?.preferences?.theme) {
      setTheme(profile.preferences.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // 2. Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  // Persist theme choice and apply it
  const handleSetTheme = async (t: "light" | "dark" | "system") => {
    try {
      setTheme(t);
      if (user?.uid) {
        setIsSaving(true);
        const userRef = ref(db, `users/${user.uid}/preferences`);
        await update(userRef, { theme: t });
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 1800);
      }
    } catch (err) {
      console.error("Failed to save theme preference:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Handle Notification Toggle
  const handleToggleNotification = async (key: keyof typeof notifications) => {
    const updatedNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(updatedNotifs);

    if (user?.uid) {
      try {
        const userRef = ref(db, `users/${user.uid}/preferences`);
        await update(userRef, { notifications: updatedNotifs });
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    }
  };

  // 4. Handle Sign Out Everywhere
  const handleSignOutEverywhere = async () => {
    if (confirm("Are you sure you want to sign out of all devices?")) {
      await logout();
      router.push("/auth/signin");
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-orange-600" size={28} />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account preferences, notifications, and security.</p>
      </div>

      {/* Success Toast */}
      {saveStatus === "success" && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Check size={18} />
          <span className="text-sm font-semibold">Preferences saved!</span>
        </div>
      )}

      {/* 1. APPEARANCE (THEME) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Monitor size={20} className="text-orange-600" />
          Appearance
        </h2>
        <p className="text-sm text-gray-500 mb-6">Choose how AI Tech Academy looks to you. Select light, dark, or system theme.</p>

        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
          <span>Applied:</span>
          <span className="font-medium">{theme}</span>
          <span className="text-xs text-gray-400">({resolvedTheme ?? "system"})</span>
          {isSaving && <span className="ml-2 text-xs text-gray-500">saving...</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ThemeCard icon={Sun} label="Light" description="Classic bright look" isActive={theme === "light"} onClick={() => handleSetTheme("light")} />
          <ThemeCard icon={Moon} label="Dark" description="Easy on the eyes" isActive={theme === "dark"} onClick={() => handleSetTheme("dark")} />
          <ThemeCard icon={Monitor} label="System" description="Match your device" isActive={theme === "system"} onClick={() => handleSetTheme("system")} />
        </div>
      </div>

      {/* 2. NOTIFICATIONS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Bell size={20} className="text-orange-600" />
          Email Notifications
        </h2>
        <p className="text-sm text-gray-500 mb-6">Decide which updates you want to receive in your inbox.</p>

        <div className="divide-y divide-gray-100">
          <NotificationToggle icon={GraduationCap} title="Course Updates" description="Get notified when new lessons or quizzes are added to your courses." isEnabled={notifications.courseUpdates} onToggle={() => handleToggleNotification("courseUpdates")} />
          <NotificationToggle icon={Megaphone} title="New Courses & Features" description="Be the first to know when we launch new AI-generated courses." isEnabled={notifications.newCourses} onToggle={() => handleToggleNotification("newCourses")} />
          <NotificationToggle icon={Mail} title="Promotions & Discounts" description="Receive exclusive offers, discount codes, and special announcements." isEnabled={notifications.promotions} onToggle={() => handleToggleNotification("promotions")} />
          <NotificationToggle icon={Mail} title="Weekly Learning Digest" description="A weekly summary of your progress and recommended next steps." isEnabled={notifications.weeklyDigest} onToggle={() => handleToggleNotification("weeklyDigest")} />
        </div>
      </div>

      {/* 3. SECURITY & SESSIONS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ShieldCheck size={20} className="text-orange-600" />
          Security & Sessions
        </h2>
        <p className="text-sm text-gray-500 mb-6">Manage your account security and active sessions.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <Smartphone size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Current Session</p>
                <p className="text-xs text-gray-500">
                  Active now • {typeof window !== "undefined" ? window.location.hostname : "Web Browser"}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
          </div>

          <button
            onClick={handleSignOutEverywhere}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <LogOut size={18} />
            Sign Out of All Devices
          </button>
        </div>
      </div>

      {/* 4. DANGER ZONE */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
          <Trash2 size={20} />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-600 mb-6">Irreversible actions for your account. Please proceed with caution.</p>

        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-red-800 text-sm">Delete Account</p>
            <p className="text-xs text-red-600 mt-1">Permanently delete your account, progress, and certificates. This cannot be undone.</p>
          </div>
          <button className="flex-shrink-0 flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ icon: Icon, label, description, isActive, onClick }: { icon: any; label: string; description: string; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${isActive ? "border-orange-500 bg-orange-50 shadow-md" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}`}>
      {isActive && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      )}
      <div className={`p-2.5 rounded-xl w-fit mb-3 ${isActive ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}>
        <Icon size={20} />
      </div>
      <h3 className={`font-bold mb-0.5 ${isActive ? "text-orange-900" : "text-gray-900"}`}>{label}</h3>
      <p className={`text-xs ${isActive ? "text-orange-700" : "text-gray-500"}`}>{description}</p>
    </button>
  );
}

function NotificationToggle({ icon: Icon, title, description, isEnabled, onToggle }: { icon: any; title: string; description: string; isEnabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3 pr-4">
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 mt-0.5">
          <Icon size={18} className="text-gray-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button onClick={onToggle} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${isEnabled ? "bg-orange-600" : "bg-gray-200"}`}>
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
