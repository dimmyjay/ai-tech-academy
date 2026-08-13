// data/navigation.ts
import { 
  Home, 
  BookOpen, 
  Tag, 
  Info, 
  Mail, 
  LayoutDashboard, 
  Award, 
  Settings,
  FileText,
  Shield,
  CreditCard,
  HelpCircle,
  Users,
  Briefcase,
  Newspaper,
  Phone
} from "lucide-react";
import { LucideIcon } from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  external?: boolean; // For links that open in a new tab
  description?: string; // Useful for mega-menus or footers
}

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

// ==========================================
// MAIN NAVIGATION (Navbar & Mobile Menu)
// ==========================================

export const mainNav: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Pricing", href: "/pricing", icon: Tag },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Mail },
];

// ==========================================
// DASHBOARD NAVIGATION (Sidebar)
// ==========================================

export const dashboardNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/progress", icon: BookOpen },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ==========================================
// FOOTER NAVIGATION
// ==========================================

export const footerNav: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about", icon: Info },
      { name: "Careers", href: "/careers", icon: Briefcase },
      { name: "Blog", href: "/blog", icon: Newspaper },
      { name: "Contact", href: "/contact", icon: Phone },
    ],
  },
  {
    title: "Top Courses",
    links: [
      { name: "Web Development", href: "/courses?category=web-development", icon: BookOpen },
      { name: "Data Science", href: "/courses?category=data-science", icon: BookOpen },
      { name: "UI/UX Design", href: "/courses?category=ui-ux", icon: BookOpen },
      { name: "Cybersecurity", href: "/courses?category=cybersecurity", icon: BookOpen },
      { name: "Mobile Development", href: "/courses?category=mobile", icon: BookOpen },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/faq", icon: HelpCircle },
      { name: "Pricing", href: "/pricing", icon: CreditCard },
      { name: "Terms of Service", href: "/terms", icon: FileText },
      { name: "Privacy Policy", href: "/privacy", icon: Shield },
      { name: "Refund Policy", href: "/refund", icon: CreditCard },
    ],
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get main navigation items
 */
export function getMainNav(): NavItem[] {
  return mainNav;
}

/**
 * Get dashboard navigation items
 */
export function getDashboardNav(): NavItem[] {
  return dashboardNav;
}

/**
 * Get footer navigation columns
 */
export function getFooterNav(): FooterColumn[] {
  return footerNav;
}

/**
 * Check if a given path is currently active
 */
export function isNavItemActive(itemHref: string, currentPath: string): boolean {
  if (itemHref === "/") return currentPath === "/";
  return currentPath.startsWith(itemHref);
}