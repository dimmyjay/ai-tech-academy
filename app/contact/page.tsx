// app/contact/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API call
      // await fetch("/api/contact", {
      //   method: "POST",
      //   body: JSON.stringify(formData),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);

      setFormData({
        name: "",
        email: "",
        subject: "general",
        message: "",
      });
    } catch (err) {
      setError(
        "Something went wrong. Please try again or email us directly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* HEADER */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">
            <MessageSquare size={16} />
            <span>We're here to help</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, need technical support, or want to partner with
            us? Drop us a message and our team will get back to you within
            24 hours.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="space-y-5">

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <Mail className="text-orange-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">
                      Email Us
                    </p>

                    <a
                      href="mailto:techtuneinternational@gmail.com"
                      className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      techtuneinternational@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <Phone className="text-orange-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">
                      Call Us
                    </p>

                    <a
                      href="tel:+2347038784017"
                      className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      +234 703 878 4017
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <MapPin className="text-orange-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">
                      Visit Us
                    </p>

                    <p className="font-semibold text-gray-900">
                      Abuja,
                      <br />
                      Nigeria
                    </p>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <Clock className="text-orange-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">
                      Support Hours
                    </p>

                    <p className="font-semibold text-gray-900">
                      Mon - Fri: 9:00 AM - 6:00 PM (WAT)
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* FAQ Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle
                    size={20}
                    className="text-orange-400"
                  />

                  <h3 className="text-lg font-bold">
                    Looking for quick answers?
                  </h3>
                </div>

                <p className="text-sm text-gray-300 mb-4">
                  Check our comprehensive FAQ section. You might find the
                  answer you're looking for instantly!
                </p>

                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Browse FAQs
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Follow Us
              </h3>

              <div className="flex items-center gap-3">
                {[
                  {
                    icon: FaTwitter,
                    href: "#",
                    color: "hover:bg-sky-500",
                  },
                  {
                    icon: FaLinkedin,
                    href: "#",
                    color: "hover:bg-blue-700",
                  },
                  {
                    icon: FaInstagram,
                    href: "#",
                    color: "hover:bg-pink-600",
                  },
                  {
                    icon: FaFacebook,
                    href: "#",
                    color: "hover:bg-blue-600",
                  },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 ${social.color} hover:text-white transition-all duration-200`}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <CheckCircle2
                      className="text-green-600"
                      size={40}
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent!
                  </h2>

                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Thank you for reaching out. Our support team has received
                    your message and will get back to you within 24 hours.
                  </p>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-orange-600 font-semibold hover:text-orange-700 underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Send us a message
                  </h2>

                  <p className="text-gray-600 mb-8">
                    Fill out the form below and we'll get back to you shortly.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-3">
                      <span>⚠️</span>
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-2 gap-6">

                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 mb-1.5"
                        >
                          Full Name
                        </label>

                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-1.5"
                        >
                          Email Address
                        </label>

                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        What can we help you with?
                      </label>

                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all appearance-none"
                      >
                        <option value="general">
                          General Inquiry
                        </option>

                        <option value="technical">
                          Technical Support / Bug Report
                        </option>

                        <option value="billing">
                          Billing & Payments (Paystack)
                        </option>

                        <option value="certificate">
                          Certificate Verification
                        </option>

                        <option value="enterprise">
                          Enterprise / Team Pricing
                        </option>

                        <option value="partnership">
                          Partnership / Sponsorship
                        </option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        Your Message
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us a bit more about your question or issue..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isLoading ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            size={18}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>

        </div>
      </section>
    </main>
  );
}