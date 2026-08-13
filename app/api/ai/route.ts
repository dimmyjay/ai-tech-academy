import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const SYSTEM_PROMPT = `
You are an expert programming instructor.

Your job is to teach students technology courses step by step.

Always respond in this format:

# Course

# Lesson

# Explanation

# Example

# Practice

# Quiz (5 questions)

# Assignment

# Summary

Use beginner-friendly language.

Never skip any section.

Never answer unrelated questions outside technology.
`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],

      temperature: 0.5,
      max_tokens: 2500,
    });

    return NextResponse.json({
      success: true,
      response: completion.choices[0]?.message?.content,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}