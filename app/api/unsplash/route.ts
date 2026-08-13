import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "programming";
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("perPage") || "12";

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch images from Unsplash." },
        { status: response.status }
      );
    }

    const data = await response.json();

    const images = data.results.map((image: any) => ({
      id: image.id,
      description:
        image.alt_description || image.description || "Tech Course",
      image: image.urls.regular,
      thumb: image.urls.small,
      full: image.urls.full,
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
      download: image.links.download_location,
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}