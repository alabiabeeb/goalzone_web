import { NextRequest, NextResponse } from "next/server";

const FOOTBALL_DATA_URL = "https://api.football-data.org/v4";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "FOOTBALL_DATA_API_KEY is missing", teams: [] },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${FOOTBALL_DATA_URL}/competitions/${code}/teams`,
      {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600 },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Teams-by-competition API error:", data);
      return NextResponse.json(
        {
          message:
            data?.message || "Teams aren't available for this competition.",
          teams: [],
        },
        { status: response.status }
      );
    }

    const teams = (data.teams ?? []).map((team: any) => ({
      id: team.id, 
      name: team.name,
      shortName: team.shortName ?? team.name,
      tla: team.tla ?? null,
      crest: team.crest,
      founded: team.founded ?? null,
      venue: team.venue ?? null,
      clubColors: team.clubColors ?? null,
    }));

    return NextResponse.json({
      competition: data.competition
        ? { name: data.competition.name, code: data.competition.code }
        : null,
      teams,
    });
  } catch (error) {
    console.error("Teams-by-competition API error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong while fetching teams.",
        error: error instanceof Error ? error.message : String(error),
        teams: [],
      },
      { status: 500 }
    );
  }
}