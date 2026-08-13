"use client";

import { 
  Award, 
  Shield, 
  Share2, 
  Briefcase, 
  CheckCircle2, 
  Sparkles,
  Download,
  Globe
} from "lucide-react";

// Import the official LinkedIn brand icon from React Icons
import { FaLinkedin } from "react-icons/fa";

const benefits = [
  {
    icon: Briefcase,
    title: "Boost Your Career",
    description: "Stand out to employers with verified credentials that prove your tech expertise.",
  },
  {
    icon: FaLinkedin, // 👈 Replaced with React Icon
    title: "LinkedIn Ready",
    description: "Easily add your certificate to your LinkedIn profile with one click.",
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    description: "Each certificate has a unique ID and can be verified by employers online.",
  },
  {
    icon: Globe,
    title: "Globally Recognized",
    description: "Our certificates are recognized by tech companies and institutions worldwide.",
  },
];

export default function CertificateSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-amber-50 via-orange-50 to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full blur-3xl -z-0"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6">
            <Award size={16} />
            <span>Industry-Recognized Certification</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get Certified for Just{" "}
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              ₦1,000
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Complete your course, pass the final exam, and unlock a verified certificate 
            that validates your skills and boosts your professional profile.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          
          {/* Left: Certificate Mockup */}
          <div className="relative">
            {/* Certificate Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border-8 border-double border-orange-200 p-8 md:p-12 transform hover:scale-105 transition-transform duration-500">
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-orange-400"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-orange-400"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-orange-400"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-orange-400"></div>

              {/* Certificate Content */}
              <div className="text-center space-y-6">
                {/* Logo/Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <div>
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">
                    Certificate of Completion
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    AI Tech Academy
                  </h3>
                </div>

                {/* Recipient */}
                <div className="py-4 border-y border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">This is to certify that</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 font-serif italic">
                    John Doe
                  </p>
                </div>

                {/* Course */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">has successfully completed the course</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Complete React.js & Next.js Masterclass
                  </p>
                </div>

                {/* Date & ID */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4">
                  <div>
                    <p className="font-semibold text-gray-700">Issued: Jan 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-gray-600">ID: CERT-2024-X8F9A2</p>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={16} />
                  <span>Verified Certificate</span>
                </div>
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-semibold text-gray-700">
                <Download size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 bg-[#0077B5] px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-semibold text-white">
                <Share2 size={16} />
                Share on LinkedIn
              </button>
            </div>
          </div>

          {/* Right: Benefits */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Why Our Certificates Matter
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our certificates are more than just pieces of paper. They're verified credentials 
                that employers trust and that can open doors to new career opportunities.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                      {/* React Icons work perfectly with Tailwind className */}
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Verification Info */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Employer Verification
                  </h4>
                  <p className="text-sm text-gray-600">
                    Every certificate includes a unique verification link. Employers can instantly 
                    verify your credentials at{" "}
                    <span className="font-semibold text-orange-600">aitechacademy.com/verify</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff20_0%,transparent_70%)]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Certified?
            </h3>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Complete any course, pass the final exam, and get your verified certificate for just ₦1,000. 
              It's the best investment you'll make in your career.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/courses" 
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-orange-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Learning Free
                <Award size={20} />
              </a>
              <a 
                href="/pricing" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition"
              >
                View Pricing Details
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-orange-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Lifetime access</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}