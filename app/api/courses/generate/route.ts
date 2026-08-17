// app/api/courses/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

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

const MIN_LESSON_WORDS = 1500;
const MAX_RETRIES = 3;
const MAX_TOKENS = 4096;
const DELAY_MS = 2000;

// ==========================================
// GROQ API CALL WITH MODEL FALLBACK & RATE LIMIT RETRY
// ==========================================
async function groqCall(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {},
  rateLimitRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  // Try each model in the preferred list
  for (const model of PREFERRED_MODELS) {
    // Inner loop for rate limit (429) retries on the CURRENT model
    for (let attempt = 0; attempt <= rateLimitRetries; attempt++) {
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
          temperature: opts.temperature ?? 0.7,
        }),
      });

      // ✅ If model is retired/not found (404), break inner loop and try the next model
      if (res.status === 404) {
        const txt = await res.text().catch(() => "");
        if (txt.includes("model_not_found") || txt.includes("does not exist")) {
          console.warn(`[groqCall] Model "${model}" retired/unavailable, trying next...`);
          lastError = new Error(`Groq model "${model}" not found`);
          break; 
        }
      }

      // ✅ If rate limited (429), wait and retry the SAME model
      if (res.status === 429) {
        const txt = await res.text().catch(() => "");
        const match = txt.match(/try again in ([\d.]+)s/);
        const waitSeconds = match ? parseFloat(match[1]) : 5;
        if (attempt < rateLimitRetries) {
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

function hasRunnable(text?: string): boolean {
  if (!text) return false;
  if (/```[\s\S]*?```/.test(text)) return true;
  if (/\b(node|npm|yarn|curl|git|python|pip|figma|sketch|photoshop|react|vue|angular)\b/i.test(text)) return true;
  return false;
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
  const systemPrompt = `You are an expert technical educator and curriculum designer at AI Tech Academy. Your task is to create comprehensive, engaging, and professionally structured lesson content that reads like a premium online course.

## CONTENT STRUCTURE REQUIREMENTS

Every lesson MUST follow this exact markdown structure:

### 1. Opening Hook (2-3 sentences)
Start with a compelling introduction that explains WHY this topic matters and WHAT the student will be able to do after completing this lesson.

### 2. Use Proper Heading Hierarchy
- Use ## headings for each major section (3-5 sections per lesson)
- Use ### headings for subsections
- NEVER use # (H1) - the lesson title is already displayed separately
- Every heading must be descriptive and action-oriented

### 3. Rich Content Formatting
You MUST use ALL of these formatting elements throughout the lesson:
- **Bold text** for key terms, concepts, and important phrases
- *Italic text* for emphasis and technical terms being introduced
- \`inline code\` for all code snippets, commands, file names, variables, and technical terms
- Bullet lists (- item) for features, characteristics, and unordered collections
- Numbered lists (1. item) for step-by-step processes and procedures

### 4. Code Blocks (CRITICAL for tech courses)
Include 2-4 well-commented code blocks per lesson using this format:
\`\`\`javascript
// Clear, descriptive comment explaining what this code does
const example = "well-formatted code";
\`\`\`

### 5. Special Callout Boxes (CRITICAL - Include at least 3 different types)
For important tips:
> 💡 **Pro Tip:** [Valuable insight]

For warnings:
> ⚠️ **Warning:** [Critical information]

For key concepts:
> 🎯 **Key Concept:** [Fundamental principle]

For real-world applications:
> 🚀 **Real-World Application:** [How this is used in industry]

### 6. Closing Section (REQUIRED)
End the lesson with a "## What You've Learned" section with 3-5 bullet-point takeaways.

## QUALITY STANDARDS
- Minimum 1500 words per lesson
- Zero fluff - every sentence must add value
- Wrap your ENTIRE output between <<BEGIN_LESSON>> and <<END_LESSON>> markers`;

  const baseUserPrompt = `Generate a comprehensive ${level}-level ${lessonType} lesson.

Course: ${courseTitle}
Module: ${moduleTitle}
Lesson Topic: ${lessonTitle}

CRITICAL REQUIREMENTS:
1. Include at least 3 different callout boxes (💡, ⚠️, 🎯, 🚀).
2. Include 2-4 well-commented code blocks with language specified.
3. End with a "## What You've Learned" section.
4. Aim for 1500-2500 words of rich content.
5. Wrap everything between <<BEGIN_LESSON>> and <<END_LESSON>> markers.`;

  let lastRaw = "";
  let lastBody = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    lastRaw = await groqCall(systemPrompt, baseUserPrompt, {
      temperature: attempt === 0 ? 0.7 : 0.8,
      maxTokens: MAX_TOKENS,
    });

    lastBody = extractBetweenMarkers(lastRaw);
    const wordCount = countWords(lastBody);
    
    if (wordCount >= MIN_LESSON_WORDS && hasRunnable(lastBody)) {
      console.log(`✅ Lesson validated on attempt ${attempt + 1}: ${wordCount} words`);
      return { body: lastBody, raw: lastRaw };
    }

    if (attempt < MAX_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return { body: lastBody, raw: lastRaw };
}

// ==========================================
// ROUTE HANDLER
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'topic' in request body" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY environment variable is not set" }, { status: 500 });
    }

    // Generate the lesson
    const result = await generateLessonServer(topic, "Generated Module", topic, "article");

    // RTDB Persistence
    const courseId = uuidv4();
    const slug = topic.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    
    await adminDb.ref(`courses/${courseId}`).set({
      title: topic,
      slug: slug,
      generatedAt: new Date().toISOString(),
      lessonBody: result.body,
      wordCount: countWords(result.body),
    });

    return NextResponse.json({
      success: true,
      courseId,
      slug,
      wordCount: countWords(result.body),
      body: result.body,
    });
  } catch (error) {
    console.error("[POST /api/courses/generate] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
