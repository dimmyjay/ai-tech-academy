import { verifyCertificate } from "@/services/certificate";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldCheck, 
  XCircle, 
  Calendar, 
  Award, 
  User, 
  BookOpen, 
  Trophy,
  ArrowRight,
  GraduationCap,
  CheckCircle2
} from "lucide-react";

// ==========================================
// DYNAMIC SEO METADATA (Next.js 15+ Fix)
// ==========================================
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ certificateId: string }> 
}): Promise<Metadata> {
  const { certificateId } = await params;
  const result = await verifyCertificate(certificateId);
  
  if (result.isValid) {
    return {
      title: `Verified Certificate: ${result.studentName} | AI Tech Academy`,
      description: `Verify the authenticity of ${result.studentName}'s certificate in ${result.courseName} issued by AI Tech Academy.`,
    };
  }
  
  return {
    title: "Certificate Verification | AI Tech Academy",
    description: "Verify the authenticity of AI Tech Academy certificates.",
  };
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const result = await verifyCertificate(certificateId);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        
        {/* Header / Branding */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
            <GraduationCap className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">AI Tech Academy</h1>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verification Portal</p>
          </div>
        </div>

        {/* STATE 1: VALID CERTIFICATE */}
        {result.isValid ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff20_0%,transparent_70%)]"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 border border-white/30">
                  <ShieldCheck size={32} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Certificate Verified</h2>
                <p className="text-green-100 mt-1 text-sm">This credential is 100% authentic and currently active.</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Left: Recipient & Course */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Awarded To</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <User className="text-orange-600" size={20} />
                      </div>
                      <p className="text-xl font-bold text-gray-900">{result.studentName}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">For Completing</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="text-blue-600" size={20} />
                      </div>
                      <p className="text-lg font-bold text-gray-900 leading-tight">{result.courseName}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Metadata */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" /> Grade
                    </span>
                    <span className="font-bold text-gray-900">{result.grade}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Award size={16} className="text-purple-500" /> Score
                    </span>
                    <span className="font-bold text-gray-900">{result.score}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={16} className="text-green-500" /> Issued
                    </span>
                    <span className="font-bold text-gray-900">{formatDate(result.issuedAt)}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">Credential ID</p>
                    <p className="font-mono text-sm font-bold text-gray-700 break-all">{result.certificateNumber}</p>
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400 text-center sm:text-left">
                  Verified by AI Tech Academy on {formatDate(result.verificationTimestamp)}.<br />
                  Status: <span className="font-bold text-green-600 uppercase">{result.status}</span>
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Visit AI Tech Academy <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* STATE 2: INVALID / NOT FOUND */
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-10 md:p-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6 border border-red-100">
              <XCircle size={40} className="text-red-500" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Certificate Not Found
            </h2>
            <p className="text-gray-600 mb-2 max-w-lg mx-auto">
              We could not find a valid certificate matching the ID provided.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-md mx-auto mb-8">
              <p className="text-xs text-gray-400 mb-1">Searched ID:</p>
              <p className="font-mono text-sm font-bold text-gray-700 break-all">
                {certificateId}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Please double-check the certificate ID or contact the student to verify the correct link.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Go to Homepage
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs font-semibold text-gray-600">
              Secured by AI Tech Academy Verification System
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}