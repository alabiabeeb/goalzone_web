import { NextRequest, NextResponse } from "next/server";

const FOOTBALL_DATA_URL = "https://api.football-data.org/v4";


const FREE_TIER_CODES = [
  "PL",  // Premier League
  "ELC", // Championship
  "PD",  // La Liga
  "SA",  // Serie A
  "BL1", // Bundesliga
  "FL1", // Ligue 1
  "DED", // Eredivisie
  "PPL", // Primeira Liga
  "CL",  // Champions League
  "EC",  // European Championship
  "WC",  // World Cup
  "BSA", // Brasileirão
];

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "FOOTBALL_DATA_API_KEY is missing", competitions: [] },
        { status: 500 }
      );
    }

    const response = await fetch(`${FOOTBALL_DATA_URL}/competitions`, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Competitions API error:", data);
      return NextResponse.json(
        {
          message: data?.message || "Failed to fetch competitions.",
          competitions: [],
        },
        { status: response.status }
      );
    }

    const all = data.competitions ?? [];

    const competitions = all
      .filter((c: any) => FREE_TIER_CODES.includes(c.code))
      .map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        emblem: c.emblem,
        type: c.type,
        area: {
          name: c.area?.name ?? null,
          flag: c.area?.flag ?? null,
        },
        currentMatchday: c.currentSeason?.currentMatchday ?? null,
      }))
      // Stable order: big leagues + Europe first, rather than
      // whatever order the API happens to return.
      .sort(
        (a: any, b: any) =>
          FREE_TIER_CODES.indexOf(a.code) - FREE_TIER_CODES.indexOf(b.code)
      );

    return NextResponse.json({ competitions });
  } catch (error) {
    console.error("Competitions API error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong while fetching competitions.",
        error: error instanceof Error ? error.message : String(error),
        competitions: [],
      },
      { status: 500 }
    );
  }
}