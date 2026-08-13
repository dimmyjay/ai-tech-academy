
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ✅ FIX 1: params is a Promise in Next.js 15+ — must be awaited
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // Unwrap the params promise first
  const { courseId } = await params;

  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { courseTitle, courseSlug, modules } = body;

    if (!courseTitle) {
      return NextResponse.json({ error: "courseTitle is required" }, { status: 400 });
    }

    // Build context from module/lesson titles
    const curriculum = modules
      ?.map((m: any) => `Module: ${m.title}\nLessons: ${m.lessonTitles?.join(", ") || "N/A"}`)
      .join("\n\n") || "No curriculum provided";

    // ✅ FIX 2: Reduced token usage to avoid 429 rate limit
    // Request fewer questions per generation, use smaller max_tokens
    const prompt = `Generate a final exam for "${courseTitle}".

CURRICULUM:
${curriculum}

REQUIREMENTS:
- Generate exactly 20 multiple-choice questions (not 50)
- Each question has 4 options (A-D) with one correct answer
- Cover all modules proportionally
- Mix difficulty: 30% easy, 50% medium, 20% hard

RESPOND WITH VALID JSON ONLY:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "easy",
      "moduleIndex": 0
    }
  ]
}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000, // ✅ Reduced from 8000 to stay within TPM limits
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();

      // ✅ FIX 2b: Handle rate limiting with retry
      if (groqRes.status === 429) {
        const retryAfter = groqRes.headers.get("retry-after");
        const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 20;

        console.warn(`Groq rate limited. Waiting ${waitSeconds}s before retry...`);

        // Wait and retry once
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));

        const retryRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (!retryRes.ok) {
          const retryErrText = await retryRes.text();
          throw new Error(`Groq API rate limited after retry: ${retryRes.status} - ${retryErrText}`);
        }

        // Use retry response instead
        const retryData = await retryRes.json();
        return processGroqResponse(retryData, courseId, courseSlug, courseTitle);
      }

      throw new Error(`Groq API error: ${groqRes.status} - ${errText}`);
    }

    const groqData = await groqRes.json();
    return processGroqResponse(groqData, courseId, courseSlug, courseTitle);

  } catch (err: any) {
    console.error("Exam generation error:", err);
    return NextResponse.json(
      { error: err.message || "Exam generation failed" },
      { status: 500 }
    );
  }
}

// ✅ FIX 3: Extracted processing into helper to guarantee courseId is never undefined
async function processGroqResponse(
  groqData: any,
  courseId: string,
  courseSlug: string,
  courseTitle: string
) {
  const content = groqData.choices?.[0]?.message?.content || "";

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Groq response did not contain valid JSON");
  }

  let examData: any;
  try {
    examData = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Failed to parse exam JSON from Groq response");
  }

  if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length === 0) {
    throw new Error("Invalid exam structure: no questions found in Groq response");
  }

  // ✅ FIX 3: Validate courseId before building examId
  if (!courseId || typeof courseId !== "string") {
    throw new Error(`Invalid courseId: ${courseId}`);
  }

  const examId = `exam_${courseId}_${Date.now()}`;
  const examRecord = {
    id: examId,
    courseId,       // ✅ Guaranteed to be a valid string
    courseSlug: courseSlug || "",
    courseTitle: courseTitle || "",
    questions: examData.questions,
    totalQuestions: examData.questions.length,
    durationMinutes: 60,
    passingScore: 70,
    generatedAt: Date.now(),
    generatedBy: "groq",
    model: GROQ_MODEL,
  };

  // Validate no undefined values in the record
  for (const [key, value] of Object.entries(examRecord)) {
    if (value === undefined) {
      throw new Error(`Exam record contains undefined value for key: ${key}`);
    }
  }

 // ✅ Save under the courseId node so the client can read it directly
await adminDb.ref(`exams/${courseId}/${examId}`).set(examRecord);

  return NextResponse.json({
    success: true,
    examId,
    questionCount: examData.questions.length,
  });
}