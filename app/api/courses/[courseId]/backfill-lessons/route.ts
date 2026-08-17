import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

type BackfillReport = { lessonId: string; success: boolean; error?: string };

const PLACEHOLDER_PATTERNS = [
  "being prepared",
  "will be added",
  "check back",
  "Content will be added",
  "preparing lesson",
];

// ✅ Replaced single MODEL with a fallback list. 
// If Groq retires one, it automatically tries the next.
const PREFERRED_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
];

// ==========================================
// GROQ API CALL WITH MODEL FALLBACK & RATE LIMIT RETRY
// ==========================================
async function callGroq(system: string, user: string): Promise<string> {
  let lastError: Error | null = null;

  // Try each model in the preferred list
  for (const model of PREFERRED_MODELS) {
    // Inner loop for rate limit (429) retries on the CURRENT model
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 1200,
          temperature: 0.2,
        }),
      });

      // ✅ If model is retired/not found (404), break inner loop and try the next model
      if (res.status === 404) {
        const txt = await res.text().catch(() => "");
        if (txt.includes("model_not_found") || txt.includes("does not exist")) {
          console.warn(`[callGroq] Model "${model}" retired/unavailable, trying next...`);
          lastError = new Error(`Groq model "${model}" not found`);
          break; 
        }
      }

      // ✅ If rate limited (429), wait and retry the SAME model
      if (res.status === 429) {
        const txt = await res.text().catch(() => "");
        const match = txt.match(/try again in ([\d.]+)s/);
        const waitSeconds = match ? parseFloat(match[1]) : 2;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, waitSeconds * 1000 + 500));
          continue; 
        }
        throw new Error(`Groq API rate limit exceeded for ${model}: ${txt}`);
      }

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(`Groq API failed: ${res.status} ${err}`);
      }

      const json = (await res.json()) as any;
      const content = json?.choices?.[0]?.message?.content ?? "";
      return String(content).trim();
    }
  }

  throw lastError || new Error("All Groq models failed or were unavailable.");
}

async function generateLessonContentWithGroq(
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string
): Promise<string> {
  const system = `You are an expert curriculum writer for developer education. Produce a clear, detailed lesson content for the lesson title provided. Output plain text (no markdown fences), at least 150-400 words, with examples or code snippets where appropriate. Keep the tone instructional and step-by-step.`;

  const user = `Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"

Write a complete lesson body with explanation, key steps, and at least one example or "Try this" code snippet if applicable. Do NOT output JSON or metadata — only the lesson content text.`;

  return callGroq(system, user);
}

function isPlaceholderContent(s: any) {
  if (!s || typeof s !== "string") return true;
  const lower = s.toLowerCase();
  return (
    PLACEHOLDER_PATTERNS.some((p) => lower.includes(p.toLowerCase())) ||
    lower.trim().length < 30
  );
}

// ==========================================
// ROUTE HANDLER
// ==========================================
// ✅ FIX: In Next.js 15+, params is a Promise and must be awaited
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params; // ✅ Await the params Promise

    const courseSnap = await adminDb.ref(`courses/${courseId}`).once("value");
    if (!courseSnap.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseSnap.val();
    const modules: any[] = Array.isArray(course.modules)
      ? course.modules
      : Object.values(course.modules || {});

    const reports: BackfillReport[] = [];

    // Process sequentially to avoid hitting Groq rate limits
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const module = modules[mIdx];
      const lessons: any[] = Array.isArray(module.lessons)
        ? module.lessons
        : Object.values(module.lessons || {});

      for (let lIdx = 0; lIdx < lessons.length; lIdx++) {
        const lesson = lessons[lIdx];
        const lessonId = lesson?.id || `module_${mIdx}_lesson_${lIdx}`;

        if (!isPlaceholderContent(lesson?.content)) {
          reports.push({ lessonId, success: true });
          continue;
        }

        try {
          const generated = await generateLessonContentWithGroq(
            course.title || "Untitled Course",
            module.title || `Module ${mIdx + 1}`,
            lesson.title || `Lesson ${lIdx + 1}`
          );

          if (!generated || generated.length < 50) {
            throw new Error("Generated content too short");
          }

          lessons[lIdx] = { ...lesson, content: generated };
          reports.push({ lessonId, success: true });
        } catch (err: any) {
          reports.push({
            lessonId,
            success: false,
            error: err.message || String(err),
          });
        }
      }

      modules[mIdx].lessons = lessons;
    }

    // Save updated modules back to Firebase
    await adminDb.ref(`courses/${courseId}/modules`).set(modules);

    // Update publish state based on remaining placeholders
    const anyLeftPlaceholder = modules.some((m: any) =>
      (m.lessons || []).some((l: any) => isPlaceholderContent(l.content))
    );

    if (!anyLeftPlaceholder) {
      await adminDb
        .ref(`courses/${courseId}`)
        .update({ isPublished: true, processing: false });
    } else {
      await adminDb
        .ref(`courses/${courseId}`)
        .update({ processing: true, isPublished: false });
    }

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error("Backfill error:", err);
    return NextResponse.json(
      { error: err.message || "Backfill failed" },
      { status: 500 }
    );
  }
}
