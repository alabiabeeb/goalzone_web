import { NextResponse } from "next/server";

const GNEWS_URL = "https://gnews.io/api/v4/search";

export async function GET() {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GNEWS_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      q: '"football" OR soccer',
      in: "title,description",
      lang: "en",
      max: "10",
      sortby: "publishedAt",
      apikey: apiKey,
    });

    const response = await fetch(`${GNEWS_URL}?${params.toString()}`, {
    next: { revalidate: 300 },
    });

    const data = await response.json();

    console.log("GNEWS STATUS:", response.status);
    console.log("GNEWS RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.errors?.join(", ") ||
            data?.message ||
            `GNews API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const articles = (data.articles || []).map(
      (article: any) => ({
        id: article.id,

        title: article.title || "",

        description: article.description || "",

        content: article.content || "",

        link: article.url || "",

        pubDate: article.publishedAt || null,

        thumbnail: article.image || null,

        source: article.source?.name || "Unknown",

        sourceUrl: article.source?.url || null,
      })
    );

    return NextResponse.json({
      articles,
    });
  } catch (error) {
    console.error("GNEWS SERVER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch football news",
      },
      { status: 500 }
    );
  }
}