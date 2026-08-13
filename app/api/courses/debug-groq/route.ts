// app/api/courses/debug-groq/route.ts
import { NextRequest, NextResponse } from "next/server";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function tryParseJsonLoosely(s: string) {
  if (!s || typeof s !== "string") return null;
  // strip fences
  const cleaned = s.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // find first {...} substring
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      const sub = cleaned.slice(first, last + 1);
      try {
        return JSON.parse(sub);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

    const generationSystem = `You are an expert tech curriculum designer. Generate a comprehensive, structured course about "${topic}" and RETURN ONLY valid JSON (an object).
Follow the JSON schema:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "level": "Beginner|Intermediate|Advanced",
  "duration": "string",
  "modules": [
    {
      "title": "string",
      "order": number,
      "lessons": [
        { "id":"string","title":"string","type":"article|code-along|quiz","content":"string","duration":"string","order":number }
      ]
    }
  ]
}
Make sure every lesson.content includes the sections: Learning objectives, Prerequisites, Step-by-step instructions, Example / Try this, Common pitfalls, Short exercise, Summary.
Return pure JSON only (no markdown code fences).`;

    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: generationSystem }],
        // do not rely on response_format — provider may still send string
        max_tokens: 2000,
        temperature: 0.08,
      }),
    });

    const status = res.status;
    const fullResponse = await res.text();

    // Try to parse JSON from the provider's returned text
    // Many providers put JSON inside choices[0].message.content; try to extract that
    let rawContent: string | null = null;
    try {
      // attempt to parse as JSON to access choices[0] if it's JSON
      const parsed = JSON.parse(fullResponse);
      rawContent = parsed?.choices?.[0]?.message?.content ?? null;
    } catch {
      // fullResponse wasn't JSON (or provider returned plain text) — use fullResponse as raw
      rawContent = fullResponse;
    }

    const parsedJson = rawContent ? tryParseJsonLoosely(rawContent) : null;

    return NextResponse.json({
      ok: status >= 200 && status < 300,
      status,
      rawResponse: fullResponse.slice ? fullResponse.slice(0, 20000) : String(fullResponse),
      rawContent: rawContent ? (rawContent.length > 20000 ? rawContent.slice(0, 20000) : rawContent) : null,
      parseAttempted: !!rawContent,
      parsedJson: parsedJson ? parsedJson : null,
      note: "If parsedJson is null, paste rawContent here so I can tune the prompt.",
    });
  } catch (err: any) {
    console.error("Debug Groq error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}