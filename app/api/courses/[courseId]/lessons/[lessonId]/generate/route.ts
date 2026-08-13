// app/api/courses/[courseId]/lessons/[lessonId]/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;
    
    // Find the course and lesson
    const courseSnap = await adminDb.ref(`courses/${courseId}`).once("value");
    const courseData = courseSnap.val();
    
    if (!courseData) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    // Find the specific lesson
    let targetLesson: any = null;
    for (const mod of courseData.modules || []) {
      for (const les of mod.lessons || []) {
        if (les.id === lessonId) {
          targetLesson = les;
          break;
        }
      }
      if (targetLesson) break;
    }
    
    if (!targetLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    
    // If content already exists and is substantial, return it
    if (targetLesson.content && targetLesson.content.trim().length > 100) {
      return NextResponse.json({ content: targetLesson.content });
    }
    
    // TODO: Call your AI generation service here
    // const generatedContent = await callAIService(targetLesson.title, courseData.title);
    
    // For now, return placeholder content so the UI doesn't stay stuck
    const placeholderContent = `# ${targetLesson.title}\n\nThis lesson content is being generated. Please wait a moment and refresh.\n\n## Overview\n\nContent for "${targetLesson.title}" will appear here once the AI generation completes.`;
    
    // Save generated content back to database
    // await adminDb.ref(`courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/content`).set(generatedContent);
    
    return NextResponse.json({ content: placeholderContent });
    
  } catch (error: any) {
    console.error("Lesson generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}