import { NextRequest, NextResponse } from "next/server";

const FOOTBALL_DATA_URL = "https://api.football-data.org/v4";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "FOOTBALL_DATA_API_KEY is missing" },
        { status: 500 }
      );
    }

    const headers = { "X-Auth-Token": apiKey };
    const today = todayISO();

    /*
     * ==========================================
     * 1. MATCHES CURRENTLY IN PLAY
     * ==========================================
     */

    const liveResponse = await fetch(
      `${FOOTBALL_DATA_URL}/matches?competitions=PL&status=LIVE`,
      { headers, cache: "no-store" }
    );

    const liveJson = await liveResponse.json();

    if (!liveResponse.ok) {
      console.error("Live matches API error:", liveJson);
      return NextResponse.json(
        { message: liveJson?.message || "Failed to fetch live matches." },
        { status: liveResponse.status }
      );
    }

    /*
     * ==========================================
     * 2. TODAY'S SCHEDULED KICKOFFS
     *    (shown when nothing is live yet)
     * ==========================================
     */

    const scheduledResponse = await fetch(
      `${FOOTBALL_DATA_URL}/matches?competitions=PL&status=SCHEDULED&dateFrom=${today}&dateTo=${today}`,
      { headers, cache: "no-store" }
    );

    const scheduledJson = await scheduledResponse.json();

    const mapMatch = (match: any) => ({
      id: match.id,
      status: match.status,
      minute: match.minute ?? null,
      utcDate: match.utcDate,
      competition: match.competition?.name ?? "Premier League",
      home: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName ?? match.homeTeam.name,
        crest: match.homeTeam.crest,
      },
      away: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName ?? match.awayTeam.name,
        crest: match.awayTeam.crest,
      },
      score: {
        home: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? null,
        away: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? null,
      },
    });

    const live = (liveJson.matches ?? []).map(mapMatch);
    const scheduled = scheduledResponse.ok
      ? (scheduledJson.matches ?? []).map(mapMatch)
      : [];

    return NextResponse.json({
      live,
      scheduledToday: scheduled,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live matches API error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while fetching live matches.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}