"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { 
  Award, 
  Download, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CertificateCard from "@/components/CertificateCard";
import Loader from "@/components/Loader";
import type { CertificateSummary } from "@/types/certificate";

export default function CertificatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [certificates, setCertificates] = useState<CertificateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Read from user-scoped path instead of querying global collection
  useEffect(() => {
    async function fetchCertificates() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Read directly from the user's certificates node
        // This path should be allowed by rules: "users/$uid/certificates": { ".read": "auth.uid === $uid" }
        const userCertsRef = ref(db, `users/${user.uid}/certificates`);
        const snapshot = await get(userCertsRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const certList: CertificateSummary[] = Object.keys(data).map((key) => {
            const cert = data[key];
            return {
              id: key,
              certificateNumber: cert.certificateNumber,
              courseName: cert.courseName,
              courseSlug: cert.courseSlug || "complete-react-nextjs-masterclass",
              studentName: cert.studentName,
              grade: cert.grade,
              issuedAt: cert.issuedAt,
              status: cert.status,
              pdfUrl: cert.pdfUrl,
              shareUrl: cert.shareUrl,
            } as CertificateSummary;
          });
          
          certList.sort((a, b) => b.issuedAt - a.issuedAt);
          setCertificates(certList);
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        // Fallback: If user-scoped path doesn't exist yet, try server API
        try {
          const res = await fetch(`/api/certificates?userId=${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setCertificates(Array.isArray(data) ? data : []);
          }
        } catch (fallbackErr) {
          console.error("Fallback certificate fetch failed:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} message="Loading your certificates..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-orange-600" size={28} />
            My Certificates
          </h1>
          <p className="text-gray-600 mt-1">
            Download, share, and verify your earned credentials.
          </p>
        </div>
        
        {certificates.length > 0 && (
          <Link 
            href="/courses" 
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm w-fit"
          >
            <Sparkles size={16} className="text-orange-500" />
            Earn More
          </Link>
        )}
      </div>

      {/* CERTIFICATES GRID OR EMPTY STATE */}
      {certificates.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2">
          {certificates.map((cert) => (
            <CertificateCard 
              key={cert.id} 
              certificateId={cert.id}
              courseName={cert.courseName}
              courseSlug={cert.courseSlug}
              studentName={cert.studentName}
              issuedAt={cert.issuedAt}
              certificateNumber={cert.certificateNumber}
              grade={cert.grade}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mb-6">
              <Award className="text-orange-600" size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No certificates yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              You haven&apos;t earned any certificates yet. Complete a course, pass the final exam, 
              and get your verified digital certificate for just <span className="font-bold text-orange-600">₦1,000</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/courses" 
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Browse Courses
                <ArrowRight size={18} />
              </Link>
              <Link 
                href="/dashboard/progress" 
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                View My Progress
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" />
                <span>Employer Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Download size={16} className="text-blue-500" />
                <span>Instant PDF Download</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" />
                <span>LinkedIn Integration</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}