import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://v3.football.api-sports.io/teams";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    if (!search || search.length < 3) {
      return NextResponse.json(
        {
          response: [],
          message: "Search must contain at least 3 characters.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      console.error("API_FOOTBALL_KEY is missing");

      return NextResponse.json(
        {
          response: [],
          message: "Football API key is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${API_URL}?search=${encodeURIComponent(search)}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("API-Football error:", errorText);

      return NextResponse.json(
        {
          response: [],
          message: `Football API request failed: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Football team search error:", error);

    return NextResponse.json(
      {
        response: [],
        message: "Something went wrong while searching for teams.",
      },
      { status: 500 }
    );
  }
}