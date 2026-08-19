import { adminDb } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

interface AIGeneratedCourse {
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  modules: any[];
}

// ✅ Fallback list to prevent 404 model crashes
const PREFERRED_MODELS = [
  "openai/gpt-oss-120b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
];

const topicsByCategory = [
  // Original 12 Courses
  { topic: "Complete Web Development with React and Next.js", category: "Web Development" },
  { topic: "Full-Stack JavaScript with Node.js and Express", category: "Web Development" },
  { topic: "Python for Data Science and Machine Learning", category: "Data Science" },
  { topic: "Data Visualization with Python and Tableau", category: "Data Science" },
  { topic: "Flutter Mobile App Development for Beginners", category: "Mobile Development" },
  { topic: "React Native: Build Cross-Platform Mobile Apps", category: "Mobile Development" },
  { topic: "UI/UX Design Principles with Figma", category: "UI/UX Design" },
  { topic: "User Research and Design Thinking for Digital Products", category: "UI/UX Design" },
  { topic: "Cybersecurity Fundamentals and Ethical Hacking", category: "Cybersecurity" },
  { topic: "Network Security and Penetration Testing", category: "Cybersecurity" },
  { topic: "AWS Cloud Computing and Serverless Architecture", category: "Cloud Computing" },
  { topic: "Microsoft Azure Fundamentals and Cloud Services", category: "Cloud Computing" },

  // 🤖 7 NEW Artificial Intelligence Courses
  { topic: "Generative AI and Large Language Models (LLMs)", category: "Artificial Intelligence" },
  { topic: "Prompt Engineering for AI Applications", category: "Artificial Intelligence" },
  { topic: "Retrieval-Augmented Generation (RAG) with Vector Databases", category: "Artificial Intelligence" },
  { topic: "Building Autonomous AI Agents with LangChain", category: "Artificial Intelligence" },
  { topic: "Computer Vision and Image Recognition with OpenCV", category: "Artificial Intelligence" },
  { topic: "Fine-Tuning Open Source LLMs like Llama and Mistral", category: "Artificial Intelligence" },
  { topic: "MLOps: Deploying and Scaling AI Models in Production", category: "Artificial Intelligence" },
];

// ✅ Helper: Extract wait time from Groq's rate limit error message
function extractWaitTime(errorMessage: string): number {
  const match = errorMessage.match(/try again in ([\d.]+)s/i);
  return match ? parseFloat(match[1]) + 2 : 10; // Add 2 second buffer
}

// ✅ Helper: Call Groq with automatic model fallback (404) and retry on rate limits (429)
async function callGroqWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error | null = null;

  for (const model of PREFERRED_MODELS) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model, // ✅ Uses dynamic model from fallback list
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 4096,
          }),
        });

        // ✅ If model is retired/not found (404), break inner loop and try the next model
        if (aiResponse.status === 404) {
          const txt = await aiResponse.text().catch(() => "");
          if (txt.includes("model_not_found") || txt.includes("does not exist")) {
            console.warn(`[seed] Model "${model}" retired/unavailable, trying next...`);
            lastError = new Error(`Model ${model} not found`);
            break; 
          }
        }

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json().catch(() => ({}));
          const errorMessage = errorData?.error?.message || aiResponse.statusText;
          
          // ✅ Detect rate limit error (429)
          if (aiResponse.status === 429 || errorMessage.toLowerCase().includes("rate limit")) {
            attempt++;
            const waitTime = extractWaitTime(errorMessage);
            console.warn(`⏱️ Rate limited on ${model}. Waiting ${waitTime}s before retry ${attempt}/${maxRetries}...`);
            
            if (attempt >= maxRetries) {
              throw new Error(`Rate limit exceeded after ${maxRetries} retries: ${errorMessage}`);
            }
            
            // Wait the requested time plus a small buffer
            await new Promise((r) => setTimeout(r, waitTime * 1000));
            continue; // Retry the request with the SAME model
          }
          
          throw new Error(`Groq API failed: ${errorMessage}`);
        }

        // Success — return the data
        return await aiResponse.json();
        
      } catch (error: any) {
        // If it's our intentional retry throw, let it bubble up
        if (error.message.includes("Rate limit exceeded after") || error.message.includes("not found")) {
          throw error;
        }
        // Other errors (network, etc.) — throw immediately
        throw error;
      }
    }
  }
  throw lastError || new Error("All Groq models failed or were unavailable.");
}

export async function seedInitialCourses() {
  const snapshot = await adminDb.ref("courses").once("value");
  const existingCourses = snapshot.val() || {};
  const existingTitles = new Set(
    Object.values(existingCourses).map((course: any) => course.title?.toLowerCase())
  );

  const topicsToSeed = topicsByCategory.filter(
    ({ topic }) => !existingTitles.has(topic.toLowerCase())
  );

  if (topicsToSeed.length === 0) {
    console.log("✅ All courses already exist in database. Nothing to seed.");
    return;
  }

  console.log(`🤖 Found ${existingTitles.size} existing courses. Generating ${topicsToSeed.length} missing courses...`);

  for (const { topic, category } of topicsToSeed) {
    try {
      console.log(`🔄 Generating "${topic}" for category: ${category}...`);

      const prompt = `You are an expert tech curriculum designer. Generate a comprehensive course about "${topic}".
CRITICAL: The category for this course MUST be exactly: "${category}"
Return ONLY valid JSON. Do NOT wrap in markdown code blocks.
CRITICAL: You MUST generate at least 3 modules, and each module MUST have at least 3 lessons. Do not return empty arrays.
Structure:
{
  "title": "Course Title",
  "description": "Brief, engaging description",
  "category": "${category}",
  "level": "Beginner",
  "duration": "8 Weeks",
  "modules": [
    {
      "title": "Module Title",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson Title",
          "type": "article",
          "content": "",
          "duration": "15 mins",
          "order": 1
        }
      ]
    }
  ]
}`;

      // ✅ Use the retry wrapper instead of direct fetch
      const aiData = await callGroqWithRetry(prompt);
      
      let cleanContent = aiData.choices[0].message.content;
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      const courseData: AIGeneratedCourse = JSON.parse(cleanContent);
      courseData.category = category;

      const totalLessons = courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
      if (totalLessons === 0) throw new Error("AI returned empty lessons array");

      const courseId = `course_${uuidv4()}`;
      await adminDb.ref(`courses/${courseId}`).set({
        id: courseId,
        slug: courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        ...courseData,
        price: 1000,
        currency: "NGN",
        thumbnail: getThumbnailForCategory(category),
        instructor: "AI Tech Academy",
        enrolledStudents: 0,
        rating: 0,
        reviewCount: 0,
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log(`✅ Generated and saved: ${courseData.title} [${category}] (${totalLessons} lessons)`);
      
      // ✅ Increased base delay to 5 seconds to stay safely under TPM limits
      await new Promise((r) => setTimeout(r, 5000));
      
    } catch (error: any) {
      console.error(`❌ Failed to generate course for topic: "${topic}"`, error.message || error);
    }
  }
  
  console.log(`\n🎉 Seeding complete! Added courses across all categories.`);
}

// ✅ Added "Artificial Intelligence" thumbnail
function getThumbnailForCategory(category: string): string {
  const thumbnails: Record<string, string> = {
    "Web Development": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    "Artificial Intelligence": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
    "Mobile Development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60",
    "UI/UX Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60",
    "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60",
    "Cloud Computing": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
  };
  return thumbnails[category] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60";
}
