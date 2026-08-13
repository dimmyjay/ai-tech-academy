import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateCourseContent(topic: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an expert tech instructor. Create comprehensive, beginner-friendly course content."
      },
      {
        role: "user",
        content: `Create a detailed lesson about: ${topic}. Include examples, code snippets, and exercises.`
      }
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

export async function generateQuizQuestions(topic: string, count: number = 5) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Generate multiple-choice quiz questions in JSON format."
      },
      {
        role: "user",
        content: `Generate ${count} multiple-choice questions about ${topic}. Return as JSON array with: question, options (array of 4), correctAnswer (index 0-3), explanation.`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  return JSON.parse(completion.choices[0].message.content || "{}");
}

export async function generateExamQuestions(courseTitle: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Generate comprehensive certification exam questions."
      },
      {
        role: "user",
        content: `Generate 50 certification exam questions for ${courseTitle}. Mix difficulty levels. Return as JSON with questions array containing: question, options, correctAnswer, explanation, difficulty.`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  return JSON.parse(completion.choices[0].message.content || "{}");
}

export default groq;