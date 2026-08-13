"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  Award, Download, ShieldCheck, Calendar, Hash, ExternalLink, GraduationCap, Loader2
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

// ❌ REMOVED: Top-level import crashes Next.js SSR/Prerendering because it accesses `self`/`window`
// import html2pdf from "html2pdf.js";

interface CertificateCardProps {
  certificateId: string;
  courseName: string;
  courseSlug: string;
  studentName: string;
  issuedAt: number;
  certificateNumber: string;
  grade?: "Distinction" | "Merit" | "Pass";
}

export default function CertificateCard({
  certificateId, courseName, courseSlug, studentName, issuedAt, certificateNumber, grade
}: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const formatName = (name: string) => {
    if (!name) return "Student";
    return name.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getGradeColor = (g?: string) => {
    switch (g) {
      case "Distinction": return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100";
      case "Merit": return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100";
      case "Pass": return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100";
      default: return "bg-gray-50 text-gray-700 border-gray-200 ring-1 ring-gray-100";
    }
  };

  // ✅ Direct PDF Download (No Payment Check)
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = certRef.current;
      if (!element) throw new Error("Certificate template not found");

      // ✅ FIX: Dynamically import html2pdf.js ONLY on the client when clicked
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      const opt = {
        margin: 0,
        filename: `${courseName.replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: "#ffffff"
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };

      // ✅ Cast opt to `any` to bypass strict html2pdf.js literal type checking
      await html2pdf().set(opt as any).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Direct LinkedIn Share (No Payment Check)
  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(`https://aitechacademy.com/verify/${certificateId}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  return (
    <>
      {/* ========================================== */}
      {/* HIDDEN HTML CERTIFICATE (Used for PDF Gen) */}
      {/* ========================================== */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div 
          ref={certRef} 
          style={{
            width: "1122px",
            height: "793px",
            backgroundColor: "#ffffff",
            padding: "60px",
            fontFamily: "'Georgia', serif",
            position: "relative",
            border: "12px solid #D97706",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", bottom: "20px", border: "2px solid #F59E0B", pointerEvents: "none" }} />

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div style={{ fontFamily: "Arial, sans-serif", fontSize: "16px", letterSpacing: "6px", color: "#6B7280", textTransform: "uppercase", fontWeight: "bold" }}>
              AI Tech Academy
            </div>
            <div style={{ fontSize: "56px", color: "#111827", marginTop: "10px", fontWeight: "bold" }}>
              Certificate of Completion
            </div>
          </div>

          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", width: "100%" }}>
            <div style={{ fontFamily: "Arial, sans-serif", fontSize: "16px", color: "#6B7280", letterSpacing: "3px", textTransform: "uppercase" }}>
              This is to certify that
            </div>
            <div style={{ fontSize: "64px", color: "#111827", margin: "20px 0", fontWeight: "bold", lineHeight: 1.1 }}>
              {formatName(studentName)}
            </div>
            <div style={{ width: "200px", height: "2px", background: "linear-gradient(90deg, transparent, #F59E0B, transparent)", margin: "0 auto" }} />
            <div style={{ fontFamily: "Arial, sans-serif", fontSize: "16px", color: "#6B7280", marginTop: "20px" }}>
              has successfully completed the course
            </div>
            <div style={{ fontSize: "36px", color: "#D97706", marginTop: "15px", fontWeight: "bold" }}>
              {courseName}
            </div>
            {grade && (
              <div style={{ display: "inline-block", marginTop: "20px", padding: "8px 24px", background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "4px", fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: "bold", color: "#92400E", letterSpacing: "1px" }}>
                GRADE: {grade.toUpperCase()}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 40px", alignItems: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>Date Issued</div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "16px", color: "#374151", fontWeight: "bold" }}>{formatDate(issuedAt)}</div>
              <div style={{ width: "150px", borderTop: "1px solid #D1D5DB", margin: "10px auto 0", paddingTop: "8px", fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#6B7280" }}>
                Director, AI Tech Academy
              </div>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>Credential ID</div>
              <div style={{ fontFamily: "Courier New, monospace", fontSize: "14px", color: "#6B7280" }}>{certificateNumber}</div>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>Verify Online</div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#374151", fontWeight: "bold" }}>aitechacademy.com/verify</div>
              <div style={{ fontFamily: "Courier New, monospace", fontSize: "12px", color: "#6B7280" }}>/{certificateNumber}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISIBLE UI CARD (No Locks or Overlays)     */}
      {/* ========================================== */}
      <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600"></div>

        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 shadow-md">
                <GraduationCap className="text-amber-400" size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 tracking-tight">AI Tech Academy</h4>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Certificate of Completion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {grade && <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getGradeColor(grade)}`}>{grade}</span>}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-200 text-green-700">
                <ShieldCheck size={12} />
                <span className="text-[11px] font-bold uppercase tracking-wide">Verified</span>
              </div>
            </div>
          </div>

          <div className="text-center py-8 px-4 bg-gradient-to-b from-gray-50/50 to-transparent rounded-xl border border-dashed border-gray-200 mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-3">This is to certify that</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-serif tracking-tight">{formatName(studentName)}</h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 mb-2">has successfully completed the course</p>
            <Link href={`/courses/${courseSlug}`} className="inline-block text-lg md:text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors hover:underline underline-offset-4 decoration-orange-300">
              {courseName}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /><span>Issued {formatDate(issuedAt)}</span></div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400"><Hash size={14} /><span>{certificateNumber}</span></div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button onClick={handleDownload} disabled={downloading} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70">
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? "Generating PDF..." : "Download PDF"}
            </button>
            
            <button onClick={handleShareLinkedIn} className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#004182] transition-colors shadow-sm">
              <FaLinkedin size={16} /> Add to LinkedIn
            </button>

            <Link href={`/verify/${certificateId}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <ExternalLink size={16} /> Verify
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
