import { NextResponse } from "next/server";

const BBC_FOOTBALL_RSS =
  "https://feeds.bbci.co.uk/sport/football/rss.xml";

function getTag(item: string, tag: string) {
  const regex = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  return item.match(regex)?.[1]?.trim() || "";
}

function getMediaThumbnail(item: string) {
  const match = item.match(
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i
  );

  return match?.[1] || null;
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const articleUrl = searchParams.get("url");

    if (!articleUrl) {
      return NextResponse.json(
        { error: "Article URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch(BBC_FOOTBALL_RSS, {
      headers: {
        "User-Agent": "GoalZone/1.0",
      },
      next: {
        revalidate: 900,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch BBC football news");
    }

    const xml = await response.text();

    const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

    const articles = items.map((item) => {
      const link = decodeHtml(getTag(item, "link"));

      return {
        title: decodeHtml(getTag(item, "title")),
        description: decodeHtml(getTag(item, "description")),
        link,
        pubDate: getTag(item, "pubDate") || null,
        thumbnail: getMediaThumbnail(item),
        source: "BBC Sport",
      };
    });

    const article = articles.find(
      (item) => item.link === articleUrl
    );

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("News article error:", error);

    return NextResponse.json(
      { error: "Failed to load article" },
      { status: 500 }
    );
  }
}