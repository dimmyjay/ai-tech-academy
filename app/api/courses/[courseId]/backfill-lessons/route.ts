// app/api/courses/[courseId]/backfill-lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import fetch from "node-fetch"; // Next includes fetch but keep compatibility
type BackfillReport = { lessonId: string; success: boolean; error?: string };

const PLACEHOLDER_PATTERNS = ["being prepared", "will be added", "check back", "Content will be added", "being prepared"];

async function generateLessonContentWithGroq(courseTitle: string, moduleTitle: string, lessonTitle: string): Promise<string> {
  const system = `You are an expert curriculum writer for developer education. Produce a clear, detailed lesson content for the lesson title provided. Output plain text (no markdown fences), at least 150-400 words, with examples or code snippets where appropriate. Keep the tone instructional and step-by-step.`;
  const user = `Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"

Write a complete lesson body with explanation, key steps, and at least one example or "Try this" code snippet if applicable. Do NOT output JSON or metadata — only the lesson content text.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 1200,
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API failed: ${res.status} ${err}`);
  }

  const json = await res.json();
  // groq response shape may differ; adjust if needed. We expect choices[0].message.content (string)
  const content = json?.choices?.[0]?.message?.content ?? "";
  return String(content).trim();
}

function isPlaceholderContent(s: any) {
  if (!s || typeof s !== "string") return true;
  const lower = s.toLowerCase();
  return PLACEHOLDER_PATTERNS.some(p => lower.includes(p.toLowerCase())) || lower.trim().length < 30;
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId;
    const courseSnap = await adminDb.ref(`courses/${courseId}`).once("value");
    if (!courseSnap.exists()) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const course = courseSnap.val();
    const modules: any[] = Array.isArray(course.modules) ? course.modules : Object.values(course.modules || {});

    const reports: BackfillReport[] = [];

    // Process sequentially to avoid hitting rate limits; you can parallelize with care.
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const module = modules[mIdx];
      const lessons: any[] = Array.isArray(module.lessons) ? module.lessons : Object.values(module.lessons || {});
      for (let lIdx = 0; lIdx < lessons.length; lIdx++) {
        const lesson = lessons[lIdx];
        const lessonId = lesson?.id || `module_${mIdx}_lesson_${lIdx}`;

        if (!isPlaceholderContent(lesson?.content)) {
          reports.push({ lessonId, success: true });
          continue;
        }

        try {
          // Generate a detailed content body
          const generated = await generateLessonContentWithGroq(course.title || "Untitled Course", module.title || `Module ${mIdx+1}`, lesson.title || `Lesson ${lIdx+1}`);

          // Basic safety: ensure we got something
          if (!generated || generated.length < 50) {
            throw new Error("Generated content too short");
          }

          // Update the exact lesson path in the DB.
          // If modules were stored as an array: courses/{courseId}/modules/{mIdx}/lessons/{lIdx}/content
          // If modules stored as object with keys, we need to find exact DB path. We'll patch by searching for lesson.id.
          // Simpler: update the whole modules array and save it back.
          lessons[lIdx] = { ...lesson, content: generated };

          reports.push({ lessonId, success: true });
        } catch (err: any) {
          reports.push({ lessonId, success: false, error: err.message || String(err) });
        }
      }

      // After processing module lessons, assign back
      modules[mIdx].lessons = lessons;
    }

    // Save the updated modules back to the course
    await adminDb.ref(`courses/${courseId}/modules`).set(modules);

    // Optionally set isPublished true if none of the lessons are placeholders now
    const anyLeftPlaceholder = modules.some((m: any) => (m.lessons || []).some((l: any) => isPlaceholderContent(l.content)));
    if (!anyLeftPlaceholder) {
      await adminDb.ref(`courses/${courseId}`).update({ isPublished: true, processing: false });
    } else {
      await adminDb.ref(`courses/${courseId}`).update({ processing: true, isPublished: false });
    }

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error("Backfill error:", err);
    return NextResponse.json({ error: err.message || "Backfill failed" }, { status: 500 });
  }
}