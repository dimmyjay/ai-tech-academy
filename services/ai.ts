// services/ai.ts
import Groq from "groq-sdk";

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ==========================================
// TYPES FOR AI OUTPUT
// ==========================================

export interface AILessonOutline {
  title: string;
  duration: string; // e.g., "15 mins"
}

export interface AIModuleOutline {
  moduleTitle: string;
  lessons: AILessonOutline[];
}

export interface AIQuizQuestion {
  questionText: string;
  options: string[]; // Exactly 4 options
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Cleans and parses JSON from LLM responses.
 * LLMs sometimes wrap JSON in markdown code blocks (```json ... ```), which breaks JSON.parse().
 */
function cleanAndParseJson<T>(rawString: string): T {
  const jsonString = rawString.replace(/^```json\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("❌ AI JSON Parse Error. Raw output:", jsonString);
    throw new Error("AI generated invalid JSON format. Please try again.");
  }
}

// ==========================================
// CORE AI GENERATION FUNCTIONS
// ==========================================

/**
 * 1. Generate Course Outline
 * Creates a structured curriculum with modules and lessons.
 */
export async function generateCourseOutline(
  courseTitle: string, 
  category: string, 
  level: "Beginner" | "Intermediate" | "Advanced"
) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert tech curriculum designer. Create a comprehensive course outline. 
        Return ONLY valid JSON with a "modules" array. Each module must have "moduleTitle" and a "lessons" array. 
        Each lesson must have "title" and "duration" (e.g., "15 mins").`
      },
      {
        role: "user",
        content: `Create an outline for a ${level} level ${category} course titled: "${courseTitle}". 
        Include 3-4 modules, with 3-4 lessons per module.`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0].message.content || "{}";
  return cleanAndParseJson<{ modules: AIModuleOutline[] }>(rawContent);
}

/**
 * 2. Generate Lesson Content
 * Writes the actual educational text/markdown for a specific lesson.
 */
export async function generateLessonContent(
  lessonTitle: string, 
  courseContext: string
) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert tech instructor. Write engaging, clear, and beginner-friendly educational content. 
        Use Markdown formatting for headings (##), lists (-), and code blocks (\`\`\`). 
        Return ONLY valid JSON with a "content" string.`
      },
      {
        role: "user",
        content: `Write the content for a lesson titled: "${lessonTitle}". 
        This lesson is part of the broader course: "${courseContext}". 
        Make it comprehensive (at least 500 words), include practical examples, and end with a short summary.`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0].message.content || "{}";
  return cleanAndParseJson<{ content: string }>(rawContent);
}

/**
 * 3. Generate Quiz Questions
 * Creates multiple-choice questions for a specific lesson.
 */
export async function generateQuizQuestions(
  lessonTitle: string, 
  count: number = 5
) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert tech examiner. Generate multiple-choice questions. 
        Return ONLY valid JSON with a "questions" array. 
        Each question object must have: "questionText", "options" (array of exactly 4 strings), "correctOptionIndex" (integer 0-3), and "explanation".`
      },
      {
        role: "user",
        content: `Generate ${count} multiple-choice questions to test a student's knowledge on the lesson: "${lessonTitle}".`
      }
    ],
    temperature: 0.6, // Lower temperature for more factual/accurate questions
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0].message.content || "{}";
  return cleanAndParseJson<{ questions: AIQuizQuestion[] }>(rawContent);
}

/**
 * 4. Generate Final Exam
 * Creates a comprehensive certification exam for the whole course.
 */
export async function generateFinalExam(
  courseTitle: string, 
  totalQuestions: number = 20
) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert tech examiner creating a final certification exam. 
        Return ONLY valid JSON with an "examQuestions" array. 
        Each question object must have: "questionText", "options" (array of exactly 4 strings), "correctOptionIndex" (integer 0-3), and "explanation". 
        Mix the difficulty levels (easy, medium, hard).`
      },
      {
        role: "user",
        content: `Generate a comprehensive final certification exam with ${totalQuestions} questions for the course: "${courseTitle}".`
      }
    ],
    temperature: 0.6,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0].message.content || "{}";
  return cleanAndParseJson<{ examQuestions: AIQuizQuestion[] }>(rawContent);
}

/**
 * 5. MASTER FUNCTION: Generate Full Course
 * Chains all the above functions to generate a complete course in one go.
 * Perfect for an Admin "Generate with AI" button.
 */
export async function generateFullCourse(
  courseTitle: string, 
  category: string, 
  level: "Beginner" | "Intermediate" | "Advanced"
) {
  console.log(`🤖 Starting AI generation for: ${courseTitle}`);

  // 1. Get Outline
  const outlineData = await generateCourseOutline(courseTitle, category, level);
  
  const allLessons: { moduleTitle: string; title: string; duration: string; content: string; quiz: AIQuizQuestion[] }[] = [];

  // 2. Generate Content and Quizzes for each lesson
  for (const module of outlineData.modules) {
    for (const lesson of module.lessons) {
      console.log(`📝 Generating content for: ${lesson.title}`);
      const contentData = await generateLessonContent(lesson.title, courseTitle);
      
      console.log(`❓ Generating quiz for: ${lesson.title}`);
      const quizData = await generateQuizQuestions(lesson.title, 3); // 3 questions per lesson quiz

      allLessons.push({
        moduleTitle: module.moduleTitle,
        title: lesson.title,
        duration: lesson.duration,
        content: contentData.content,
        quiz: quizData.questions,
      });
    }
  }

  // 3. Generate Final Exam
  console.log(`🎓 Generating final exam for: ${courseTitle}`);
  const examData = await generateFinalExam(courseTitle, 20); // 20 questions for final exam

  return {
    outline: outlineData.modules,
    lessons: allLessons,
    finalExam: examData.examQuestions,
  };
}