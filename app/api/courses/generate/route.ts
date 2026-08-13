// app/api/courses/generate/route.ts
// app/api/courses/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

// ... (Keep all your constants and helper functions exactly the same as above) ...

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

    // RTDB Persistence syntax
    const courseId = uuidv4();
    const slug = topic.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    
    await adminDb.ref(`courses/${courseId}`).set({
      title: topic,
      slug: slug, // Important for your GET route to find it!
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