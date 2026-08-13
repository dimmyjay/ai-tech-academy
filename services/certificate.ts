import { adminDb } from "@/lib/firebase-admin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateCertificate(
  userId: string,
  courseId: string,
  studentName: string,
  courseName: string,
  grade: string
) {
  try {
    // Generate unique certificate number
    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create certificate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Certificate design
    page.drawText("Certificate of Completion", {
      x: 200,
      y: 500,
      size: 36,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.8),
    });

    page.drawText("This is to certify that", {
      x: 250,
      y: 450,
      size: 16,
      font,
    });

    page.drawText(studentName, {
      x: 250,
      y: 420,
      size: 28,
      font: boldFont,
      color: rgb(0.1, 0.3, 0.6),
    });

    page.drawText("has successfully completed the course", {
      x: 180,
      y: 380,
      size: 16,
      font,
    });

    page.drawText(courseName, {
      x: 220,
      y: 350,
      size: 22,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.8),
    });

    page.drawText(`Grade: ${grade}`, {
      x: 320,
      y: 310,
      size: 18,
      font,
    });

    page.drawText(`Certificate No: ${certNumber}`, {
      x: 280,
      y: 100,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(`Issued: ${new Date().toLocaleDateString()}`, {
      x: 280,
      y: 80,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    // Store certificate in database
    const certRef = adminDb.ref("certificates").push();
    await certRef.set({
      id: certRef.key,
      userId,
      courseId,
      certificateNumber: certNumber,
      issuedAt: Date.now(),
      verified: true,
      studentName,
      courseName,
      grade,
      pdfUrl: `/api/certificates/${certRef.key}/download`,
    });

    // Update user's certificates
    await adminDb.ref(`users/${userId}/certificates`).push(certRef.key);

    return {
      id: certRef.key,
      certificateNumber: certNumber,
      pdfBytes,
    };
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  }
}

export async function verifyCertificate(certificateId: string) {
  const snapshot = await adminDb.ref(`certificates/${certificateId}`).once("value");
  return snapshot.exists() ? snapshot.val() : null;
}