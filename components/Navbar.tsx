"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  Award,
  Settings,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (accountOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAccountOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Replace with your actual logo path */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">AI Tech</h1>
            <p className="-mt-1 text-xs font-medium text-orange-600">Academy</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-orange-600 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions (Auth) */}
        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            /* Logged In State */
            <div className="relative" ref={containerRef}>
              <button
                onClick={() => setAccountOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white pl-1.5 pr-3 py-1.5 transition hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {profile?.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt={profile.name || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">
                    {getInitials(profile?.name)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden xl:block">
                  {profile?.name?.split(" ")[0] || "Dashboard"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {accountOpen && (
                <div className="absolute right-0 z-50 mt-3 w-60 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                  {/* User Info Header */}
                  <div className="mb-2 border-b border-gray-100 pb-2 px-3 pt-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profile?.name || "Student"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <LayoutDashboard size={16} className="text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/progress"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <BookOpen size={16} className="text-gray-400" />
                      My Courses
                    </Link>
                    <Link
                      href="/dashboard/certificates"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Award size={16} className="text-gray-400" />
                      Certificates
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="mt-1.5 border-t border-gray-100 pt-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out State */
            <>
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-orange-600 px-2 py-1"
              >
                <User size={16} />
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-20 z-40 max-h-[calc(100vh-5rem)] overflow-y-auto border-t bg-white lg:hidden shadow-xl">
          <div className="space-y-2 p-5 pb-8">
            {/* Nav Links */}
            <div className="space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-orange-50 text-orange-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Actions */}
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link
                    href="/dashboard/progress"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <BookOpen size={16} /> My Courses
                  </Link>
                  <Link
                    href="/dashboard/certificates"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Award size={16} /> Certificates
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    <User size={16} /> Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 transition shadow-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}