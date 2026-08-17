// lib/youtube.ts
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export interface YouTubeVideo {
  videoId: string;
  title: string;
  url: string;
  channelTitle: string;
}

// Search YouTube and return up to `maxResults` matching videos
export async function searchYouTubeVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !query) return [];
  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      videoEmbeddable: "true", // only videos that can be embedded in your site
      maxResults: String(maxResults),
      key: YOUTUBE_API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.items || [];
    return items
      .filter((item: any) => item?.id?.videoId)
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet?.title || "",
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelTitle: item.snippet?.channelTitle || "",
      }));
  } catch {
    return [];
  }
}

// ✅ Randomly pick ONE video from the top matches
export async function pickRandomYouTubeVideo(query: string): Promise<YouTubeVideo | null> {
  const videos = await searchYouTubeVideos(query, 10);
  if (videos.length === 0) return null;
  return videos[Math.floor(Math.random() * videos.length)];
}
