"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Shield,
  Target,
  TrendingUp,
  Building2,
  Users,
  Goal,
} from "lucide-react";

type TeamData = {
  team: {
    id: number;
    name: string;
    logo: string;
    country: string;
    founded?: number | null;
    national?: boolean;
  };

  venue: {
    id: number | null;
    name: string | null;
    address: string | null;
    city: string | null;
    capacity: number | null;
    image: string | null;
  } | null;

  league: {
    id: number | null;
    name: string;
    season: number | null;
  };

  standing: {
    rank: number;
    points: number;
    form: string | null;
    played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    goalDifference?: number;
  } | null;

  statistics: {
    fixtures?: {
      played?: {
        home?: number;
        away?: number;
        total?: number;
      };
      wins?: {
        home?: number;
        away?: number;
        total?: number;
      };
      draws?: {
        home?: number;
        away?: number;
        total?: number;
      };
      loses?: {
        home?: number;
        away?: number;
        total?: number;
      };
    };

    goals?: {
      for?: {
        total?: {
          home?: number;
          away?: number;
          total?: number;
        };
      };
      against?: {
        total?: {
          home?: number;
          away?: number;
          total?: number;
        };
      };
    };

    biggest?: {
      wins?: {
        home?: string | null;
        away?: string | null;
      };
      loses?: {
        home?: string | null;
        away?: string | null;
      };
      goals?: {
        for?: number;
        against?: number;
      };
    };

    cleanSheet?: {
      home?: number;
      away?: number;
      total?: number;
    };

    failedToScore?: {
      home?: number;
      away?: number;
      total?: number;
    };

    penalty?: {
      scored?: {
        total?: number;
        percentage?: string;
      };
      missed?: {
        total?: number;
        percentage?: string;
      };
      total?: number;
    };
  } | null;

  form: ("W" | "D" | "L")[];

  upcoming: {
    id: number;
    date: string;
    timezone?: string;
    status: {
      short?: string;
      long?: string;
    };
    venue?: {
      id?: number | null;
      name?: string | null;
    };
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
    goals?: {
      home?: number | null;
      away?: number | null;
    };
  } | null;
};

function getOrdinal(number: number) {
  if (number % 100 >= 11 && number % 100 <= 13) {
    return `${number}th`;
  }

  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  return value.toLocaleString();
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeamDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!id) {
          throw new Error("Team ID is missing.");
        }

        const response = await fetch(
          `/api/football/team-dashboard?team=${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        console.log("TEAM API RESPONSE:", result);

        if (!response.ok) {
          throw new Error(
            result?.message || `Request failed with status ${response.status}`
          );
        }

        if (!result?.team) {
          throw new Error("Team data was not returned by the API.");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error("Team page error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load team information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTeam();

    return () => {
      cancelled = true;
    };
  }, [params]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08111e] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#19c59b] border-t-transparent" />

          <p className="mt-4 text-sm text-slate-400">
            Loading team information...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08111e] px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
            <Shield className="h-7 w-7 text-rose-400" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Unable to load team
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {error || "We couldn't load this team's information."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-[#19c59b] px-5 py-2.5 text-sm font-semibold text-[#062018] transition hover:bg-[#15b58d]"
            >
              Try Again
            </button>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    team,
    venue,
    league,
    standing,
    statistics,
    form,
    upcoming,
  } = data;

  const goalsFor =
    standing?.goalsFor ??
    statistics?.goals?.for?.total?.total ??
    null;

  const goalsAgainst =
    standing?.goalsAgainst ??
    statistics?.goals?.against?.total?.total ??
    null;

  const goalDifference =
    standing?.goalDifference ??
    (goalsFor !== null && goalsAgainst !== null
      ? goalsFor - goalsAgainst
      : null);

  const matchesPlayed =
    standing?.played ??
    statistics?.fixtures?.played?.total ??
    null;

  const wins =
    standing?.wins ??
    statistics?.fixtures?.wins?.total ??
    null;

  const draws =
    standing?.draws ??
    statistics?.fixtures?.draws?.total ??
    null;

  const losses =
    standing?.losses ??
    statistics?.fixtures?.loses?.total ??
    null;

  const upcomingDate = upcoming
    ? formatDate(upcoming.date)
    : "No upcoming fixture";

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <main className="mx-auto w-full max-w-[1150px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* =========================
            TEAM HEADER
        ========================== */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111c2d]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Logo */}
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/5 p-5">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Shield className="h-14 w-14 text-slate-500" />
                )}
              </div>

              {/* Team information */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#19c59b]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#19c59b]">
                    Team
                  </span>

                  {team.national && (
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                      National Team
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {team.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                  {team.country && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#19c59b]" />
                      {team.country}
                    </span>
                  )}

                  {team.founded && (
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#19c59b]" />
                      Founded {team.founded}
                    </span>
                  )}

                  {league.name && (
                    <span className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#19c59b]" />
                      {league.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            MAIN STATS
        ========================== */}
        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Position */}
          <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Position
              </p>

              <Trophy className="h-4 w-4 text-amber-400" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {standing?.rank ? getOrdinal(standing.rank) : "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {league.name}
            </p>
          </div>

          {/* Points */}
          <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Points
              </p>

              <TrendingUp className="h-4 w-4 text-[#19c59b]" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {formatNumber(standing?.points)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current season
            </p>
          </div>

          {/* Played */}
          <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Played
              </p>

              <Calendar className="h-4 w-4 text-blue-400" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {formatNumber(matchesPlayed)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Matches
            </p>
          </div>

          {/* Goal Difference */}
          <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Goal Diff.
              </p>

              <Goal className="h-4 w-4 text-purple-400" />
            </div>

            <p
              className={`mt-3 text-3xl font-bold ${
                goalDifference !== null && goalDifference > 0
                  ? "text-[#19c59b]"
                  : goalDifference !== null && goalDifference < 0
                  ? "text-rose-400"
                  : "text-white"
              }`}
            >
              {goalDifference !== null
                ? goalDifference > 0
                  ? `+${goalDifference}`
                  : goalDifference
                : "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Goals
            </p>
          </div>
        </section>

        {/* =========================
            RESULTS
        ========================== */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Season Record
            </h2>

            <span className="text-xs text-slate-500">
              {league.season
                ? `${league.season}/${league.season + 1}`
                : "Current season"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Wins */}
            <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5 text-center">
              <p className="text-3xl font-bold text-[#19c59b]">
                {formatNumber(wins)}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                Wins
              </p>
            </div>

            {/* Draws */}
            <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5 text-center">
              <p className="text-3xl font-bold text-slate-300">
                {formatNumber(draws)}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                Draws
              </p>
            </div>

            {/* Losses */}
            <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5 text-center">
              <p className="text-3xl font-bold text-rose-400">
                {formatNumber(losses)}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                Losses
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            GOALS + FORM
        ========================== */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Goals */}
          <div className="rounded-2xl border border-white/10 bg-[#111c2d] p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#19c59b]" />

              <h2 className="text-lg font-semibold">
                Goals
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#0c1423] p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Goals For
                </p>

                <p className="mt-2 text-3xl font-bold text-[#19c59b]">
                  {formatNumber(goalsFor)}
                </p>
              </div>

              <div className="rounded-xl bg-[#0c1423] p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Goals Against
                </p>

                <p className="mt-2 text-3xl font-bold text-rose-400">
                  {formatNumber(goalsAgainst)}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-white/10 bg-[#111c2d] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Recent Form
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest matches
                </p>
              </div>

              <TrendingUp className="h-5 w-5 text-[#19c59b]" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {form.length > 0 ? (
                form.map((result, index) => (
                  <div
                    key={`${result}-${index}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold ${
                      result === "W"
                        ? "bg-[#19c59b]/15 text-[#19c59b]"
                        : result === "D"
                        ? "bg-white/10 text-slate-300"
                        : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {result}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No recent form available.
                </p>
              )}
            </div>

            {standing?.form && (
              <p className="mt-4 text-xs text-slate-500">
                API form: {standing.form}
              </p>
            )}
          </div>
        </section>

        {/* =========================
            UPCOMING FIXTURE
        ========================== */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#111c2d] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#19c59b]" />

              <h2 className="text-lg font-semibold">
                Upcoming Fixture
              </h2>
            </div>

            {upcoming && (
              <span className="rounded-full bg-[#19c59b]/10 px-3 py-1 text-xs font-semibold text-[#19c59b]">
                {upcoming.status?.long ||
                  upcoming.status?.short ||
                  "Upcoming"}
              </span>
            )}
          </div>

          {upcoming ? (
            <div className="mt-8">
              {/* Date */}
              <div className="text-center">
                <p className="text-sm font-semibold text-white">
                  {upcomingDate}
                </p>

                {upcoming.venue?.name && (
                  <p className="mt-1 text-xs text-slate-500">
                    {upcoming.venue.name}
                  </p>
                )}
              </div>

              {/* Teams */}
              <div className="mt-8 flex items-center justify-center gap-6 sm:gap-16">
                {/* Home */}
                <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-3 sm:h-24 sm:w-24">
                    <img
                      src={upcoming.home.logo}
                      alt={upcoming.home.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-3 max-w-[150px] truncate text-sm font-semibold sm:text-base">
                    {upcoming.home.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Home
                  </p>
                </div>

                {/* VS */}
                <div className="shrink-0 text-center">
                  <p className="text-2xl font-bold text-slate-500">
                    VS
                  </p>
                </div>

                {/* Away */}
                <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-3 sm:h-24 sm:w-24">
                    <img
                      src={upcoming.away.logo}
                      alt={upcoming.away.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-3 max-w-[150px] truncate text-sm font-semibold sm:text-base">
                    {upcoming.away.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Away
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-[#0c1423] p-6 text-center">
              <Calendar className="mx-auto h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-400">
                No upcoming fixture available.
              </p>
            </div>
          )}
        </section>

        {/* =========================
            TEAM STATISTICS
        ========================== */}
        {statistics && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">
              Team Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {/* Clean Sheets */}
              <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Clean Sheets
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(
                    statistics.cleanSheet?.total
                  )}
                </p>
              </div>

              {/* Failed to Score */}
              <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Failed to Score
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(
                    statistics.failedToScore?.total
                  )}
                </p>
              </div>

              {/* Penalties */}
              <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Penalties Scored
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(
                    statistics.penalty?.scored?.total
                  )}
                </p>
              </div>

              {/* Penalties Missed */}
              <div className="rounded-xl border border-white/10 bg-[#111c2d] p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Penalties Missed
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(
                    statistics.penalty?.missed?.total
                  )}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =========================
            STADIUM
        ========================== */}
        {venue && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#111c2d] p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#19c59b]" />

              <h2 className="text-lg font-semibold">
                Stadium
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Stadium image */}
              {venue.image && (
                <div className="overflow-hidden rounded-xl bg-[#0c1423]">
                  <img
                    src={venue.image}
                    alt={venue.name || "Stadium"}
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}

              {/* Stadium details */}
              <div
                className={`rounded-xl bg-[#0c1423] p-5 ${
                  !venue.image ? "sm:col-span-2" : ""
                }`}
              >
                <h3 className="text-xl font-bold">
                  {venue.name || "Unknown Stadium"}
                </h3>

                {venue.address && (
                  <p className="mt-3 flex items-start gap-2 text-sm text-slate-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#19c59b]" />
                    {venue.address}
                  </p>
                )}

                {venue.city && (
                  <p className="mt-3 text-sm text-slate-400">
                    City:{" "}
                    <span className="text-white">
                      {venue.city}
                    </span>
                  </p>
                )}

                {venue.capacity && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <Users className="h-4 w-4 text-[#19c59b]" />
                    Capacity:{" "}
                    <span className="font-semibold text-white">
                      {venue.capacity.toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* =========================
            COMPETITION
        ========================== */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#111c2d] p-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />

            <h2 className="text-lg font-semibold">
              Competition
            </h2>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl bg-[#0c1423] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">
                {league.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Season{" "}
                {league.season
                  ? `${league.season}/${league.season + 1}`
                  : "—"}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-10" />
      </main>
    </div>
  );
}