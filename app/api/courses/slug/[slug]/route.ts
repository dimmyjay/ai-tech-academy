import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MIN_LESSON_WORDS = 800;
const MAX_RETRIES = 3;
const MAX_TOKENS = 4096;
const DELAY_MS = 2000;

const REQUIRED_SECTIONS = [
  "learning objectives",
  "prerequisites",
  "step-by-step instructions",
  "example / try this",
  "common pitfalls",
  "short exercise",
  "summary",
];

interface ValidationResult {
  ok: boolean;
  missing: string[];
  tooShort: boolean;
  wordCount: number;
  hasCode: boolean;
}

// ==========================================
// GROQ API CALL WITH RETRY
// ==========================================
async function groqCall(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {},
  rateLimitRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt <= rateLimitRetries; attempt++) {
    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: opts.maxTokens ?? MAX_TOKENS,
        temperature: opts.temperature ?? 0.2,
      }),
    });

    if (res.status === 429) {
      const txt = await res.text().catch(() => "");
      const match = txt.match(/try again in ([\d.]+)s/);
      const waitSeconds = match ? parseFloat(match[1]) : 5;
      if (attempt < rateLimitRetries) {
        await new Promise((r) => setTimeout(r, waitSeconds * 1000 + 500));
        continue;
      }
      throw new Error(`Groq API rate limit exceeded: ${txt}`);
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Groq API error ${res.status}: ${txt}`);
    }

    const j = await res.json();
    const raw = j?.choices?.[0]?.message?.content;
    return typeof raw === "string" ? raw.trim() : JSON.stringify(raw);
  }
  throw new Error("Groq API call failed unexpectedly.");
}

// ==========================================
// UTILITIES
// ==========================================
function extractBetweenMarkers(raw: string): string {
  if (!raw) return "";
  const start = raw.indexOf("<<BEGIN_LESSON>>");
  const end = raw.indexOf("<<END_LESSON>>");
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start + 16, end).trim();
  return raw.trim();
}

function countWords(text?: string): number {
  if (!text) return 0;
  const matches = text.match(/\b\w+\b/g);
  return matches ? matches.length : 0;
}

function looksLikePlaceholder(text?: string): boolean {
  if (!text || text.trim().length < 80) return true;
  if (/being prepared|tbd|check back|no content|welcome to/i.test(text)) return true;
  return false;
}

function hasRunnable(text?: string): boolean {
  if (!text) return false;
  if (/```[\s\S]*?```/.test(text)) return true;
  if (/\b(node|npm|yarn|curl|git|python|pip|figma|sketch|photoshop)\b/i.test(text)) return true;
  return false;
}

function validateLesson(body: string) {
  const lc = (body || "").toLowerCase();
  const missing = REQUIRED_SECTIONS.filter((s) => !lc.includes(s));
  const wordCount = countWords(body);
  return {
    ok: missing.length === 0 && wordCount >= MIN_LESSON_WORDS,
    missing,
    tooShort: wordCount < MIN_LESSON_WORDS,
    wordCount,
    hasCode: hasRunnable(body),
  };
}

// Make a stable slug
function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Normalize modules & lessons and deduplicate IDs across the course
function normalizeCourseStructure(rawCourse: any) {
  const rawModules = rawCourse.modules || [];
  const modulesArray = Array.isArray(rawModules)
    ? rawModules
    : Object.values(rawModules).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const idCounts = new Map<string, number>();

  const normalizedModules = modulesArray.map((mod: any, mIdx: number) => {
    const modIdBase = mod.id || `module-${mIdx}`;
    // ensure unique module ids if necessary
    const modPrev = idCounts.get(modIdBase) ?? 0;
    const modId = modPrev === 0 ? modIdBase : `${modIdBase}-${modPrev + 1}`;
    idCounts.set(modIdBase, modPrev + 1);

    const lessons = (mod.lessons || []).map((les: any, lIdx: number) => {
      const base = les.id || slugify(les.title || `mod${mIdx}-les${lIdx}`);
      const prev = idCounts.get(base) ?? 0;
      const id = prev === 0 ? base : `${base}-${prev + 1}`;
      idCounts.set(base, prev + 1);

      return {
        id,
        title: les.title || "Untitled Lesson",
        duration: les.duration || "10 mins",
        type: les.type || "article",
        content: les.content || "",
        videoUrl: les.videoUrl || null,
      };
    });

    return {
      order: mod.order ?? mIdx + 1,
      title: mod.title || `Module ${mIdx + 1}`,
      id: modId,
      lessons,
    };
  });

  return {
    id: rawCourse.id,
    slug: rawCourse.slug,
    title: rawCourse.title || rawCourse.slug || "",
    description: rawCourse.description || "",
    thumbnail: rawCourse.thumbnail || "",
    level: rawCourse.level || "Beginner",
    duration: rawCourse.duration || "Self-paced",
    modules: normalizedModules,
  };
}

// ==========================================
// LESSON GENERATION
// ==========================================
async function generateLessonServer(
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
  lessonType: string,
  level = "Beginner"
): Promise<{ body: string; raw?: string }> {
  const systemPrompt = [
    "You are an expert curriculum writer producing extremely detailed, long-form lessons.",
    "OUTPUT RULES (MUST FOLLOW):",
    "1) Output ONLY the lesson body wrapped exactly between <<BEGIN_LESSON>> and <<END_LESSON>>.",
    `2) Include these exact headings using markdown ## format: ${REQUIRED_SECTIONS.join(", ")}.`,
    `3) Total length MUST be at least ${MIN_LESSON_WORDS} words.`,
    "4) CRITICAL: EVERY single section must be multiple paragraphs long. Do NOT write 1-sentence or 2-sentence sections.",
    "5) The 'Short exercise' MUST be a comprehensive, multi-step challenge with specific requirements, starter scenarios, hints, and a grading rubric.",
    "6) The 'Common pitfalls' section MUST detail at least 3 specific mistakes with examples of the wrong way and the right way.",
    "7) Use proper Markdown formatting: ## for headings, **bold**, - bullet points, ```code blocks```.",
    "8) Do NOT output JSON, commentary, or text outside the markers.",
  ].join(" ");

  const baseUserPrompt = `Generate a comprehensive ${level}-level ${lessonType} lesson.
Course: ${courseTitle}
Module: ${moduleTitle}
Lesson Topic: ${lessonTitle}

CRITICAL: The content MUST be specifically about "${lessonTitle}" within the context of "${moduleTitle}". Do NOT write generic content.

Remember: Write extensively. Every section must be deeply detailed and multiple paragraphs long. No brief summaries.`;

  let lastRaw = "";
  let lastBody = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const effectiveUserPrompt =
      attempt === 0
        ? baseUserPrompt
        : `${baseUserPrompt}\n\nPREVIOUS ATTEMPT WAS TOO SHORT. Expand EVERY section significantly.`;

    lastRaw = await groqCall(systemPrompt, effectiveUserPrompt, {
      temperature: attempt === 0 ? 0.2 : 0.4,
      maxTokens: MAX_TOKENS,
    });

    lastBody = extractBetweenMarkers(lastRaw);
    if (validateLesson(lastBody).ok) return { body: lastBody, raw: lastRaw };

    if (attempt < MAX_RETRIES - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  return { body: lastBody, raw: lastRaw };
}

// ==========================================
// ROUTE HANDLER
// ==========================================
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    if (!adminDb || typeof adminDb.ref !== "function") {
      return NextResponse.json({ error: "DB misconfigured" }, { status: 500 });
    }

    const { slug } = await params;
    const url = new URL(req.url);
    const autoRegenerate = url.searchParams.get("auto_regenerate") === "true";
    const lessonId = url.searchParams.get("lesson_id");
    const lessonTitle = url.searchParams.get("lesson_title") || "";
    const moduleTitle = url.searchParams.get("module_title") || "";
    const courseTitleParam = url.searchParams.get("course_title") || "";

    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    // Fetch course by slug
    const snapshot = await adminDb.ref("courses").orderByChild("slug").equalTo(slug).limitToFirst(1).get();
    if (!snapshot.exists()) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const data = snapshot.val();
    const courseId = Object.keys(data)[0];
    const courseData = data[courseId];

    // Normalize & dedupe ids across modules & lessons
    const normalizedCourse = normalizeCourseStructure({
      id: courseId,
      slug,
      ...courseData,
    });

    // If not regenerating, return the normalized course
    if (!autoRegenerate || !lessonId) {
      return NextResponse.json(normalizedCourse);
    }

    // ==========================================
    // GENERATE CONTENT FOR SPECIFIC LESSON
    // ==========================================

    // Find target lesson indices using normalized structure
    let targetModuleIndex = -1;
    let targetLessonIndex = -1;
    let existingContent = "";

    for (let i = 0; i < normalizedCourse.modules.length; i++) {
      const lessons = normalizedCourse.modules[i].lessons || [];
      for (let j = 0; j < lessons.length; j++) {
        if (lessons[j].id === lessonId) {
          targetModuleIndex = i;
          targetLessonIndex = j;
          existingContent = lessons[j].content || "";
          break;
        }
      }
      if (targetModuleIndex !== -1) break;
    }

    if (targetModuleIndex === -1 || targetLessonIndex === -1) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Skip generation if content already exists and is valid
    if (existingContent && !looksLikePlaceholder(existingContent) && countWords(existingContent) >= MIN_LESSON_WORDS) {
      return NextResponse.json({
        success: true,
        lessonBody: existingContent,
        wordCount: countWords(existingContent),
        wasRegenerated: false,
      });
    }

    // Generate new content
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const result = await generateLessonServer(
      courseTitleParam || normalizedCourse.title || slug,
      moduleTitle || normalizedCourse.modules[targetModuleIndex]?.title || "Module",
      lessonTitle || normalizedCourse.modules[targetModuleIndex]?.lessons[targetLessonIndex]?.title || slug,
      "article",
      normalizedCourse.level || "Beginner"
    );

    // SAVE to the exact nested lesson in Firebase (by index)
    await adminDb
      .ref(`courses/${courseId}/modules/${targetModuleIndex}/lessons/${targetLessonIndex}/content`)
      .set(result.body);

    // Also update word count metadata
    await adminDb.ref(`courses/${courseId}/modules/${targetModuleIndex}/lessons/${targetLessonIndex}`).update({
      wordCount: countWords(result.body),
      regeneratedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      lessonBody: result.body,
      wordCount: countWords(result.body),
      wasRegenerated: true,
    });
  } catch (error) {
    console.error("[GET /api/courses/slug] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}