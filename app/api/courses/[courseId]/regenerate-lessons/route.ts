import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

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

const MIN_CONTENT_CHARS = 300;
const MAX_RETRIES = 3;
const MAX_TOKENS = 2500;
const DELAY_MS = 250;

const REQUIRED_SECTIONS = [
  "Learning objectives",
  "Prerequisites",
  "Step-by-step instructions",
  "Example / Try this",
  "Common pitfalls",
  "Short exercise",
  "Summary",
];

// ==========================================
// GROQ API CALL WITH MODEL FALLBACK & RATE LIMIT RETRY
// ==========================================
async function callGroq(system: string, user: string, opts: { temperature?: number; maxTokens?: number } = {}) {
  let lastError: Error | null = null;

  // Try each model in the preferred list
  for (const model of PREFERRED_MODELS) {
    // Inner loop for rate limit (429) retries on the CURRENT model
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(GROQ_API, {
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
          max_tokens: opts.maxTokens ?? MAX_TOKENS,
          temperature: opts.temperature ?? 0.0,
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
        const txt = await res.text().catch(() => "");
        throw new Error(`Groq API error ${res.status} for ${model}: ${txt}`);
      }

      const j = await res.json();
      const raw = j?.choices?.[0]?.message?.content;
      return typeof raw === "string" ? raw.trim() : JSON.stringify(raw);
    }
  }

  throw lastError || new Error("All Groq models failed or were unavailable.");
}

// ==========================================
// UTILITIES
// ==========================================
function extractBetweenMarkers(raw: string) {
  if (!raw) return "";
  const start = raw.indexOf("<<BEGIN_LESSON>>");
  const end = raw.indexOf("<<END_LESSON>>");
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start + "<<BEGIN_LESSON>>".length, end).trim();
  return raw.trim();
}

function containsRequiredSections(text: string) {
  const lower = (text || "").toLowerCase();
  const missing = REQUIRED_SECTIONS.filter((s) => !lower.includes(s.toLowerCase()));
  return { ok: missing.length === 0, missing };
}

async function generateLessonText(courseTitle: string, moduleTitle: string, lessonTitle: string, lessonType: string) {
  const system = [
    "You are an expert curriculum writer for practical online developer courses.",
    "Output plain text only. Wrap the final lesson body between <<BEGIN_LESSON>> and <<END_LESSON>>.",
    `Required sections: ${REQUIRED_SECTIONS.join(" | ")}`,
    "For 'code-along' include at least one runnable code block (triple backticks).",
  ].join(" ");

  const userBase = `Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"
Type: ${lessonType}

Write a full lesson body that contains the required sections. Aim for ${MIN_CONTENT_CHARS}+ characters. Return only the lesson text wrapped between <<BEGIN_LESSON>> and <<END_LESSON>>.`;

  let out = await callGroq(system, userBase, { temperature: 0.0, maxTokens: MAX_TOKENS });
  if (process.env.DEBUG === "true") console.log("DEBUG raw groq:", out.slice(0, 2000));
  let lessonText = extractBetweenMarkers(out);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { ok, missing } = containsRequiredSections(lessonText);
    const tooShort = lessonText.length < MIN_CONTENT_CHARS;
    const requireCode = lessonType === "code-along";
    const hasCode = /```[\s\S]*?```/.test(lessonText) || /\b(node|npm|python|pip|curl|git|yarn)\b/i.test(lessonText);

    if (ok && !tooShort && (!requireCode || hasCode)) {
      return { lessonText, raw: out };
    }

    const reasons = [];
    if (tooShort) reasons.push(`too short (${lessonText.length} chars)`);
    if (!ok) reasons.push(`missing sections: ${missing.join(", ")}`);
    if (requireCode && !hasCode) reasons.push("missing runnable code/example");

    const retryPrompt = userBase + `

PREVIOUS_OUTPUT_UNACCEPTABLE: ${reasons.join("; ")}.
Rewrite the lesson now and ensure all required headers and runnable examples are present and wrapped between <<BEGIN_LESSON>> and <<END_LESSON>>.`;

    out = await callGroq(system, retryPrompt, { temperature: 0.06, maxTokens: MAX_TOKENS });
    if (process.env.DEBUG === "true") console.log("DEBUG raw groq retry:", out.slice(0, 2000));
    lessonText = extractBetweenMarkers(out);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  return { lessonText: `<<BEGIN_LESSON>>\nNEEDS_REVIEW: Automatic generation failed for ${lessonTitle}\n<<END_LESSON>>`, raw: "" };
}

// ==========================================
// ROUTE HANDLER
// ==========================================
// ✅ FIX: Next.js 15 requires params to be a Promise
export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await the params Promise
    const { courseId } = await context.params;
    if (!courseId) return NextResponse.json({ error: "missing courseId" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const DRY_RUN = Boolean(body?.dryRun);
    const FORCE = Boolean(body?.force);

    const snap = await adminDb.ref(`courses/${courseId}`).once("value");
    if (!snap.exists()) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const course = snap.val();
    const modulesRaw = Array.isArray(course.modules) ? course.modules : Object.values(course.modules || {});
    const updatedModules: any[] = [];

    for (let mi = 0; mi < modulesRaw.length; mi++) {
      const m = modulesRaw[mi];
      const lessonsRaw = Array.isArray(m.lessons) ? m.lessons : Object.values(m.lessons || {});
      const updatedLessons: any[] = [];

      for (let li = 0; li < lessonsRaw.length; li++) {
        const lesson = { ...(lessonsRaw[li] || {}) };
        const contentExisting = typeof lesson.content === "string" ? lesson.content.trim() : "";

        const needRegen =
          FORCE ||
          !contentExisting ||
          contentExisting.length < MIN_CONTENT_CHARS ||
          /being prepared|tbd|check back|will be added/i.test(contentExisting);

        if (needRegen) {
          const { lessonText, raw } = await generateLessonText(course.title || "Course", m.title || `Module ${mi + 1}`, lesson.title || `Lesson ${li + 1}`, lesson.type || "article");
          lesson.content = lessonText;
          lesson.updatedAt = Date.now();
          lesson._lastRaw = raw ? String(raw).slice(0, 10000) : "";
        }

        updatedLessons.push(lesson);
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }

      updatedModules.push({ ...m, lessons: updatedLessons });
    }

    if (DRY_RUN) {
      return NextResponse.json({ success: true, dryRun: true, previewModules: updatedModules });
    }

    await adminDb.ref(`courses/${courseId}/modules`).set(updatedModules);

    const anyShort = updatedModules.some((mod: any) => (mod.lessons || []).some((l: any) => !l.content || l.content.length < MIN_CONTENT_CHARS));
    await adminDb.ref(`courses/${courseId}`).update({ isPublished: !anyShort, processing: anyShort, updatedAt: Date.now() });

    return NextResponse.json({ success: true, updatedModulesCount: updatedModules.length });
  } catch (err: any) {
    console.error("Regenerate error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
