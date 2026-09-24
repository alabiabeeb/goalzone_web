import { NextRequest, NextResponse } from "next/server";

const API_FOOTBALL_URL = "https://v3.football.api-sports.io";
const FOOTBALL_DATA_URL = "https://api.football-data.org/v4";

// Strip suffixes/punctuation so "Nottingham Forest" and "Nott'm Forest",
// or "Liverpool" and "Liverpool FC", both normalize to something matchable.
function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\bfc\b|\bafc\b/g, "")
    .replace(/[^a-z]/g, "")
    .trim();
}

function namesMatch(a: string, b: string) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team");

    if (!teamId) {
      return NextResponse.json(
        { message: "Team ID is required" },
        { status: 400 }
      );
    }

    const apiFootballKey = process.env.API_FOOTBALL_KEY;
    const footballDataKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiFootballKey) {
      return NextResponse.json(
        { message: "API_FOOTBALL_KEY is missing" },
        { status: 500 }
      );
    }

    if (!footballDataKey) {
      return NextResponse.json(
        { message: "FOOTBALL_DATA_API_KEY is missing" },
        { status: 500 }
      );
    }

    /*
     * ==========================================
     * 1. TEAM PROFILE + VENUE (API-Football)
     * ==========================================
     * Not season-restricted, so the free key is fine here.
     */

    const teamResponse = await fetch(
      `${API_FOOTBALL_URL}/teams?id=${teamId}`,
      { headers: { "x-apisports-key": apiFootballKey }, cache: "no-store" }
    );

    const teamData = await teamResponse.json();

    if (!teamResponse.ok) {
      console.error("Team API error:", teamData);
      return NextResponse.json(
        {
          message:
            teamData?.errors?.message ||
            "Failed to fetch team information.",
          errors: teamData?.errors || null,
        },
        { status: teamResponse.status }
      );
    }

    const team = teamData.response?.[0]?.team;
    const venue = teamData.response?.[0]?.venue;

    if (!team) {
      return NextResponse.json(
        { message: "Team not found", apiResponse: teamData },
        { status: 404 }
      );
    }

    /*
     * ==========================================
     * 2. CURRENT-SEASON STANDINGS (football-data.org)
     * ==========================================
     */

    const fdHeaders = { "X-Auth-Token": footballDataKey };

    const standingsResponse = await fetch(
      `${FOOTBALL_DATA_URL}/competitions/PL/standings`,
      { headers: fdHeaders, cache: "no-store" }
    );

    const standingsJson = await standingsResponse.json();

    let standing: any = null;
    let fdTeamId: number | null = null;
    let season: number | null = null;

    if (standingsResponse.ok) {
      season = standingsJson.season?.startDate
        ? new Date(standingsJson.season.startDate).getFullYear()
        : null;

      const totalTable =
        standingsJson.standings?.find((s: any) => s.type === "TOTAL")
          ?.table ?? [];

      const found = totalTable.find((row: any) =>
        namesMatch(row.team.name, team.name)
      );

      if (found) {
        fdTeamId = found.team.id;
        standing = {
          rank: found.position,
          points: found.points,
          form: found.form ?? null,
          played: found.playedGames ?? 0,
          wins: found.won ?? 0,
          draws: found.draw ?? 0,
          losses: found.lost ?? 0,
          goalsFor: found.goalsFor ?? 0,
          goalsAgainst: found.goalsAgainst ?? 0,
          goalDifference: found.goalDifference ?? 0,
        };
      }
    } else {
      console.error("Standings API error:", standingsJson);
    }

    /*
     * ==========================================
     * 3. RECENT FORM + UPCOMING FIXTURE
     * ==========================================
     */

    let form: ("W" | "D" | "L")[] = [];
    let upcoming: any = null;
    let cleanSheet = 0;
    let failedToScore = 0;

    if (fdTeamId) {
      const finishedResponse = await fetch(
        `${FOOTBALL_DATA_URL}/teams/${fdTeamId}/matches?status=FINISHED&limit=5`,
        { headers: fdHeaders, cache: "no-store" }
      );

      const finishedJson = await finishedResponse.json();

      if (finishedResponse.ok) {
        const matches = (finishedJson.matches ?? []).slice().reverse();

        form = matches
          .map((match: any) => {
            const isHome = match.homeTeam.id === fdTeamId;
            const teamGoals = isHome
              ? match.score.fullTime.home
              : match.score.fullTime.away;
            const opponentGoals = isHome
              ? match.score.fullTime.away
              : match.score.fullTime.home;

            if (teamGoals === null || opponentGoals === null) return null;

            if (opponentGoals === 0) cleanSheet++;
            if (teamGoals === 0) failedToScore++;

            if (teamGoals > opponentGoals) return "W";
            if (teamGoals < opponentGoals) return "L";
            return "D";
          })
          .filter(Boolean);
      }

      const upcomingResponse = await fetch(
        `${FOOTBALL_DATA_URL}/teams/${fdTeamId}/matches?status=SCHEDULED&limit=1`,
        { headers: fdHeaders, cache: "no-store" }
      );

      const upcomingJson = await upcomingResponse.json();

      if (upcomingResponse.ok && upcomingJson.matches?.[0]) {
        const match = upcomingJson.matches[0];

        upcoming = {
          id: match.id,
          date: match.utcDate,
          status: { short: match.status, long: match.status },
          venue: { id: null, name: match.venue ?? null },
          home: {
            id: match.homeTeam.id,
            name: match.homeTeam.name,
            logo: match.homeTeam.crest,
          },
          away: {
            id: match.awayTeam.id,
            name: match.awayTeam.name,
            logo: match.awayTeam.crest,
          },
          goals: {
            home: match.score?.fullTime?.home ?? null,
            away: match.score?.fullTime?.away ?? null,
          },
        };
      }
    }

    /*
     * ==========================================
     * 4. RETURN DATA (same shape as before)
     * ==========================================
     */

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        logo: team.logo,
        country: team.country,
        founded: team.founded,
        national: team.national,
      },

      venue: venue
        ? {
            id: venue.id ?? null,
            name: venue.name ?? null,
            address: venue.address ?? null,
            city: venue.city ?? null,
            capacity: venue.capacity ?? null,
            image: venue.image ?? null,
          }
        : null,

      league: { id: 39, name: "Premier League", season },

      standing,

      // Full match/possession/penalty stats aren't available on either
      // free tier — cleanSheet/failedToScore are derived from the last
      // 5 finished matches above; the rest stay null.
      statistics: fdTeamId
        ? {
            fixtures: null,
            goals: null,
            biggest: null,
            cleanSheet: { total: cleanSheet },
            failedToScore: { total: failedToScore },
            penalty: null,
          }
        : null,

      form,
      upcoming,
    });
  } catch (error) {
    console.error("Team dashboard API error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while fetching team data.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}