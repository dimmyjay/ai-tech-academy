// components/Footer.tsx
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

// Import social icons from React Icons (FontAwesome)
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],

  courses: [
    {
      name: "Web Development",
      href: "/courses?category=web-development",
    },
    {
      name: "Data Science",
      href: "/courses?category=data-science",
    },
    {
      name: "UI/UX Design",
      href: "/courses?category=ui-ux",
    },
    {
      name: "Cybersecurity",
      href: "/courses?category=cybersecurity",
    },
    {
      name: "Mobile Development",
      href: "/courses?category=mobile",
    },
  ],

  support: [
    { name: "Help Center", href: "/faq" },
    { name: "Pricing", href: "/pricing" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ],
};

const socialLinks = [
  {
    name: "Twitter",
    icon: FaTwitter,
    href: "https://twitter.com",
  },
  {
    name: "LinkedIn",
    icon: FaLinkedin,
    href: "https://linkedin.com",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://instagram.com",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    href: "https://facebook.com",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    href: "https://youtube.com",
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-5 md:grid-cols-2">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                <GraduationCap
                  className="text-white"
                  size={24}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  AI Tech
                </h2>

                <p className="-mt-1 text-xs font-medium text-orange-400">
                  Academy
                </p>
              </div>
            </Link>

            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Empowering the next generation of tech professionals in Africa
              with AI-powered learning, affordable certifications, and
              industry-recognized credentials.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">

              {/* Email */}
              <a
                href="mailto:techtuneinternational@gmail.com"
                className="flex items-center gap-3 text-sm hover:text-orange-400 transition-colors"
              >
                <Mail
                  size={16}
                  className="text-orange-500"
                />

                techtuneinternational@gmail.com
              </a>

              {/* Phone */}
              <a
                href="tel:+2347038784017"
                className="flex items-center gap-3 text-sm hover:text-orange-400 transition-colors"
              >
                <Phone
                  size={16}
                  className="text-orange-500"
                />

                +234 703 878 4017
              </a>

              {/* Address */}
              <div className="flex items-center gap-3 text-sm">
                <MapPin
                  size={16}
                  className="text-orange-500 flex-shrink-0"
                />

                Abuja, Nigeria
              </div>

            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5">
              Company
            </h3>

            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />

                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5">
              Top Courses
            </h3>

            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />

                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5">
              Support
            </h3>

            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />

                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} AI Tech Academy. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-orange-600 hover:text-white transition-all duration-200 hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </footer>
  );
}