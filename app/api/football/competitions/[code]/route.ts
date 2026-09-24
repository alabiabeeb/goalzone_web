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
        { message: "FOOTBALL_DATA_API_KEY is missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${FOOTBALL_DATA_URL}/competitions/${code}/standings`,
      {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 300 },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Standings API error:", data);
      return NextResponse.json(
        {
          message:
            data?.message ||
            "Standings aren't available for this competition right now.",
        },
        { status: response.status }
      );
    }


    const groups = (data.standings ?? []).map((group: any) => ({
      type: group.type,
      group: group.group ?? null,
      table: (group.table ?? []).map((row: any) => ({
        position: row.position,
        team: {
          id: row.team.id,
          name: row.team.name,
          shortName: row.team.shortName ?? row.team.name,
          crest: row.team.crest,
        },
        playedGames: row.playedGames,
        won: row.won,
        draw: row.draw,
        lost: row.lost,
        points: row.points,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        form: row.form ?? null,
      })),
    }));

    return NextResponse.json({
      competition: data.competition
        ? {
            id: data.competition.id,
            code: data.competition.code,
            name: data.competition.name,
            emblem: data.competition.emblem,
          }
        : null,
      season: data.season
        ? {
            startDate: data.season.startDate,
            endDate: data.season.endDate,
            currentMatchday: data.season.currentMatchday,
          }
        : null,
      groups,
    });
  } catch (error) {
    console.error("Competition standings API error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong while fetching standings.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}