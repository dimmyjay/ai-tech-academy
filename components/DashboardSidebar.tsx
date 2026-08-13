"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/progress", icon: BookOpen },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-6 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-600 hover:text-orange-600 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-gray-50">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">AI Tech</h1>
                <p className="-mt-0.5 text-[10px] font-medium text-orange-600 uppercase tracking-wider">Academy</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Main Menu
            </p>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-orange-50 text-orange-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={20} 
                      className={isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"} 
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-orange-400" />}
                </Link>
              );
            })}

            {/* Upgrade Prompt Card */}
            <div className="mt-8 mx-2 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 rounded-full blur-xl -mr-4 -mt-4"></div>
              <h4 className="font-bold text-sm mb-1 relative z-10">Get Certified</h4>
              <p className="text-xs text-gray-300 mb-3 relative z-10">Unlock your verified certificate for just ₦1,000.</p>
              <Link 
                href="/pricing" 
                className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-xs font-bold py-2 rounded-lg transition-colors relative z-10"
              >
                View Plans
              </Link>
            </div>
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-gray-50">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
            
            <div className="mt-4 px-4 text-center">
              <p className="text-[10px] text-gray-400">
                © {new Date().getFullYear()} AI Tech Academy
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}