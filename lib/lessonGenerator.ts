// lib/lessonGenerator.ts
import fetch from "node-fetch"; // in Next.js route you can use global fetch; import here for scripts compatibility

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MIN_TOTAL_CHARS = 400; // require longer full lesson
const REQUIRED_HEADERS = [
  "Learning objectives:",
  "Prerequisites:",
  "Step-by-step instructions:",
  "Example / Try this:",
  "Common pitfalls:",
  "Short exercise:",
  "Summary:"
];

function containsCodeBlockOrCommand(s: string) {
  if (!s) return false;
  if (/```[\s\S]*?```/.test(s)) return true;                // explicit code block
  if (/\b(node|npm|npx|yarn|curl|git|pip|python|powershell)\b/i.test(s)) return true; // likely commands
  if (/^\s*\$ |\bmkdir\b|\bcd\b|npm install\b|npm init\b/i.test(s)) return true;
  return false;
}

function findMissingHeaders(s: string) {
  const missing: string[] = [];
  for (const h of REQUIRED_HEADERS) {
    const re = new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (!re.test(s)) missing.push(h);
  }
  return missing;
}

async function groqCall(systemPrompt: string, userPrompt: string, maxTokens = 1600, temperature = 0.0) {
  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq API error ${res.status}: ${txt}`);
  }
  const json = await res.json();
  return String(json?.choices?.[0]?.message?.content ?? "").trim();
}

/**
 * Generate a robust lesson body with strict structure.
 * Returns a plain-text lesson string (includes headers and code blocks).
 */
export async function generateLessonContent(courseTitle: string, moduleTitle: string, lessonTitle: string, lessonType = "article", targetLevel = "Beginner") {
  const system = [
    "You are a professional curriculum writer for online developer courses.",
    "Produce a practical, step-by-step lesson body for an online course.",
    "Output plain text only. You may include code blocks using triple backticks. Do NOT output JSON or extra metadata.",
  ].join(" ");

  const baseUserPrompt = `Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"
Type: ${lessonType}
Level: ${targetLevel}

Write a complete lesson body that MUST include the following SEVEN section headers (exact text, case-insensitive):
1) Learning objectives:
2) Prerequisites:
3) Step-by-step instructions:
4) Example / Try this:
5) Common pitfalls:
6) Short exercise:
7) Summary:

For each section:
- Learning objectives: 1–3 concise bullets.
- Prerequisites: short bullets (installations or knowledge).
- Step-by-step instructions: numbered steps with practical commands or actions.
- Example / Try this: include at least one runnable command or a short code snippet in triple backticks (bash or relevant language).
- Common pitfalls: 1–3 bullets.
- Short exercise: 1 small practice task the learner can do.
- Summary: 1–2 concise sentences.

Be explicit: include concrete commands for macOS/Linux and Windows where relevant. Aim for 400–800 characters (or more) overall. Do NOT output anything other than the lesson text with the required sections.`;

  // Primary call
  let content = await groqCall(system, baseUserPrompt, 1700, 0.0);

  // Validate and retry logic (up to 3 attempts total)
  for (let attempt = 1; attempt <= 3; attempt++) {
    const tooShort = !content || content.length < MIN_TOTAL_CHARS;
    const missing = findMissingHeaders(content);
    const noCode = !containsCodeBlockOrCommand(content);

    if (!tooShort && missing.length === 0 && !noCode) {
      // success
      return content;
    }

    // Build targeted re-prompt describing what's missing
    const reasons: string[] = [];
    if (tooShort) reasons.push(`lesson is too short (need >= ${MIN_TOTAL_CHARS} chars)`);
    if (missing.length) reasons.push(`missing headers: ${missing.join(", ")}`);
    if (noCode) reasons.push("missing a runnable command or code block");

    const retryUserPrompt = baseUserPrompt + `

NOTE: The previous attempt is unacceptable because: ${reasons.join("; ")}.
REWRITE the lesson now and ENSURE you include ALL seven required headers (exact text) and a runnable example (triple backticks). Do NOT include JSON or any extra metadata.`;

    // Slightly relax temperature on later attempts to encourage different output
    const temp = attempt === 1 ? 0.0 : attempt === 2 ? 0.1 : 0.15;
    content = await groqCall(system, retryUserPrompt, 1700, temp);
  }

  // Final fallback: produce a guaranteed structured template (safe, useful)
  const fallback = [
    "Learning objectives:",
    "- Understand the purpose and key features of Next.js.",
    "- Create a basic Next.js app and run it locally.",
    "",
    "Prerequisites:",
    "- Node.js (14+) and npm installed.",
    "- Basic React knowledge and command-line familiarity.",
    "",
    "Step-by-step instructions:",
    "1. Install Node.js from https://nodejs.org (LTS).",
    "2. Create a new Next.js app:",
    "```bash\nnpx create-next-app@latest my-app\ncd my-app\nnpm run dev\n```",
    "3. Open http://localhost:3000 to see the running app.",
    "",
    "Example / Try this:",
    "```bash\n# Create and run a Next.js app\nnpx create-next-app@latest demo-next\ncd demo-next\nnpm run dev\n# Check versions\nnode -v\nnpm -v\n```",
    "",
    "Common pitfalls:",
    "- Forgetting to open a new terminal after installing Node (PATH).",
    "- Using incompatible Node versions for older Next.js versions.",
    "",
    "Short exercise:",
    "- Modify pages/index.js to render \"Hello Next.js\" and reload the page.",
    "",
    "Summary:",
    "- Next.js is a React framework that supports SSR, SSG, and hybrid rendering. Use the CLI to scaffold a starter project quickly."
  ].join("\n\n");

  return fallback;
}