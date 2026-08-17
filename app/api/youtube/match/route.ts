// app/api/youtube/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pickRandomYouTubeVideo } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const video = await pickRandomYouTubeVideo(query);
  if (!video) return NextResponse.json({ video: null });
  return NextResponse.json({ video });
}
