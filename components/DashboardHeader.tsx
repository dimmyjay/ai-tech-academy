"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings, 
  Award,
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  };

  // Mock notifications (Replace with real data later)
  const notifications = [
    { id: 1, text: "You completed 'Intro to React' lesson!", time: "2h ago", unread: true },
    { id: 2, text: "New course available: Advanced Next.js", time: "1d ago", unread: true },
    { id: 3, text: "Your certificate is ready to download.", time: "3d ago", unread: false },
  ];
  
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      
      {/* Left Side: Greeting */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {getGreeting()}, {profile?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Here is what is happening with your courses today.
          </p>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
          <Search className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="pl-9 pr-4 py-2 w-56 lg:w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </form>

        {/* Mobile Search Icon (Fallback) */}
        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Search size={20} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <button className="text-xs text-orange-600 font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.unread ? 'bg-orange-50/30' : ''}`}>
                    <p className="text-sm text-gray-700">{notif.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/notifications" className="block w-full text-center py-3 text-sm font-semibold text-orange-600 hover:bg-gray-50 border-t border-gray-100">
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {profile?.photoURL ? (
              <Image
                src={profile.photoURL}
                alt={profile.name || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                {getInitials(profile?.name)}
              </div>
            )}
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{profile?.name || "Student"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <User size={16} className="text-gray-400" /> Profile Settings
                </Link>
                <Link href="/dashboard/certificates" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Award size={16} className="text-gray-400" /> My Certificates
                </Link>
                <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings size={16} className="text-gray-400" /> Account Settings
                </Link>
              </div>
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}