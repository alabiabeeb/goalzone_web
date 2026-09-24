import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        highlights: [],
        message: "YOUTUBE_API_KEY is not configured.",
      });
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: "Premier League highlights",
      type: "video",
      order: "date",
      videoDuration: "medium", 
      maxResults: "6",
      key: apiKey,
    });

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
      // Cache for an hour so repeat page loads don't burn API quota.
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error:", data);
      return NextResponse.json(
        {
          message: data?.error?.message || "Failed to fetch highlights.",
          highlights: [],
        },
        { status: response.status }
      );
    }

    const highlights = (data.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        null,
    }));

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Highlights API error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while fetching highlights.",
        error: error instanceof Error ? error.message : String(error),
        highlights: [],
      },
      { status: 500 }
    );
  }
}