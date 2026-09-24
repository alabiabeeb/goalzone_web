"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

import {
  LayoutDashboard,
  Settings,
  Users,
  Flame,
  Bell,
  Trophy,
  Clock,
  ChevronRight,
  Sparkles,
  Gauge,
  CalendarClock,
} from "lucide-react";

type FormResult = "W" | "D" | "L";

type ApiTeam = {
  id: number;
  name: string;
  logo: string;
  country: string;
};

type ApiTeamData = {
  team: ApiTeam;
  league: {
    id: number | null;
    name: string;
    season: number | null;
  };
  standing: {
    rank: number;
    points: number;
    form: string | null;
  } | null;
  form: FormResult[];
  upcoming: {
    id: number;
    date: string;
    status: string;
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
  } | null;
};

type FollowedTeam = {
  id: string;
  name: string;
  logo: string;
  league: string;
  rank: string;
  form: FormResult[];
  fixtureOpponent: string;
  fixtureWhen: string;
  live: boolean;
};

type Insight = {
  id: string;
  category: "TECHNICAL" | "PERFORMANCE" | "SCHEDULE";
  updatedAgo: string;
  title: string;
  description: string;
};

type TrackedPlayer = {
  id: string;
  name: string;
  team: string;
  position: string;
  stat: string;
};

const insightCategoryColor: Record<
  Insight["category"],
  string
> = {
  TECHNICAL: "text-[#19c59b]",
  PERFORMANCE: "text-amber-400",
  SCHEDULE: "text-sky-400",
};

const formColor: Record<FormResult, string> = {
  W: "bg-[#19c59b]/15 text-[#19c59b]",
  D: "bg-white/10 text-slate-300",
  L: "bg-rose-500/15 text-rose-400",
};

function formatFixtureDate(date: string) {
  const fixtureDate = new Date(date);

  return fixtureDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function TeamCard({
  team,
}: {
  team: FollowedTeam;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111c2d] p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 p-1.5">
            <img
              src={team.logo}
              alt={team.name}
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {team.name}
            </p>

            <p className="text-[10px] font-medium tracking-wide text-slate-400">
              {team.league}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`${team.name} settings`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <Settings
            className="h-3.5 w-3.5"
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-semibold tracking-wide text-slate-500">
            LEAGUE RANK
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
            <Trophy
              className="h-3.5 w-3.5 text-amber-400"
              strokeWidth={2}
            />

            {team.rank}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-semibold tracking-wide text-slate-500">
            RECENT FORM
          </p>

          <div className="mt-1.5 flex gap-1">
            {team.form.map((result, i) => (
              <span
                key={`${result}-${i}`}
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${formColor[result]}`}
              >
                {result}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#0c1423] px-3 py-2.5">
        <div>
          <p className="text-[9px] font-semibold tracking-wide text-slate-500">
            UPCOMING FIXTURE
          </p>

          <p className="mt-0.5 text-xs font-medium text-white">
            {team.fixtureOpponent}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {team.fixtureWhen}
          </p>
        </div>

        {team.live && (
          <span className="rounded-full bg-[#19c59b]/15 px-2 py-1 text-[9px] font-semibold text-[#19c59b]">
            Live
          </span>
        )}
      </div>

      <Link
        href={`/teams/${team.id}`}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-[#19c59b] transition hover:bg-[#19c59b]/10"
      >
        Team Detail
        <ChevronRight
          className="h-3.5 w-3.5"
          strokeWidth={2}
        />
      </Link>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111c2d] px-4 py-3.5">
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold text-white">
          {value}
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300">
        {icon}
      </div>
    </div>
  );
}

export default function Profile() {
  const [teams, setTeams] = useState<FollowedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchOfTheDay, setMatchOfTheDay] =
    useState<FollowedTeam | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);

        // Liverpool = 40
        // Arsenal = 42
        const teamIds = [40, 42];

        const responses = await Promise.all(
          teamIds.map(async (id) => {
            const response = await fetch(
              `/api/football/team-dashboard?team=${id}`
            );

            if (!response.ok) {
              throw new Error(
                `Failed to fetch team ${id}`
              );
            }

            return response.json() as Promise<ApiTeamData>;
          })
        );

        const formattedTeams: FollowedTeam[] =
          responses.map((data) => {
            const fixture = data.upcoming;

            let opponent = "No upcoming fixture";
            let fixtureWhen = "—";

            if (fixture) {
              const isHome =
                fixture.home.id === data.team.id;

              opponent = `vs ${
                isHome
                  ? fixture.away.name
                  : fixture.home.name
              }`;

              fixtureWhen = formatFixtureDate(
                fixture.date
              );
            }

            return {
              id: String(data.team.id),
              name: data.team.name,
              logo: data.team.logo,
              league: data.league.name.toUpperCase(),
              rank: data.standing
                ? `${data.standing.rank}${
                    data.standing.rank === 1
                      ? "st"
                      : data.standing.rank === 2
                      ? "nd"
                      : data.standing.rank === 3
                      ? "rd"
                      : "th"
                  }`
                : "—",
              form: data.form,
              fixtureOpponent: opponent,
              fixtureWhen,
              live: fixture
                ? ["1H", "HT", "2H", "ET", "P", "LIVE"].includes(
                    fixture.status
                  )
                : false,
            };
          });

        setTeams(formattedTeams);

        if (formattedTeams.length > 0) {
          setMatchOfTheDay(formattedTeams[0]);
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  const insights: Insight[] = teams.length
    ? [
        {
          id: "team-form",
          category: "PERFORMANCE",
          updatedAgo: "Live data",
          title: "Team Form",
          description:
            `${teams[0].name} recent results are now being pulled directly from API-Football.`,
        },
        {
          id: "fixture",
          category: "SCHEDULE",
          updatedAgo: "Live data",
          title: "Upcoming Fixture",
          description:
            teams[0].fixtureOpponent !==
            "No upcoming fixture"
              ? `${teams[0].name} next fixture: ${teams[0].fixtureOpponent}.`
              : `No upcoming fixture is currently available.`,
        },
        {
          id: "standings",
          category: "TECHNICAL",
          updatedAgo: "Live data",
          title: "League Position",
          description:
            `${teams[0].name} is currently ${
              teams[0].rank
            } in ${teams[0].league}.`,
        },
      ]
    : [];

  const trackedPlayers: TrackedPlayer[] = [];

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <main className="flex">
        <div className="flex w-full flex-col px-2 py-4 sm:px-4 sm:py-6 lg:mx-auto lg:max-w-[1180px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-[#19c59b] sm:px-2 sm:text-lg">
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />

                <h1>Dashboard</h1>
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:mt-3 sm:text-4xl">
                MY FOOTBALL
              </h2>

              <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
                Welcome back. Here&apos;s what&apos;s
                happening with your favorites today.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:px-2">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
              >
                <Settings className="h-3.5 w-3.5" />
                Manage Feed
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-[#19c59b] px-3 py-2 text-xs font-semibold text-[#062018] transition hover:bg-[#19c59b]/90"
              >
                + Add Favorites
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:px-2 lg:grid-cols-4">
            <div className="rounded-xl bg-[#19c59b] p-4">
              <p className="text-[10px] font-semibold tracking-wide text-[#062018]/70">
                MATCH OF THE DAY
              </p>

              <p className="mt-1 text-lg font-bold text-[#062018]">
                {matchOfTheDay
                  ? `${matchOfTheDay.name} ${matchOfTheDay.fixtureOpponent}`
                  : "Loading match..."}
              </p>

              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#062018]/80">
                <Clock className="h-3.5 w-3.5" />

                {matchOfTheDay?.fixtureWhen ??
                  "Loading..."}
              </p>
            </div>

            <StatCard
              icon={
                <Users
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              label="FOLLOWED TEAMS"
              value={teams.length}
            />

            <StatCard
              icon={
                <Flame
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              label="TRACKED PLAYERS"
              value={trackedPlayers.length}
            />

            <StatCard
              icon={
                <Bell
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              label="LIVE ALERTS"
              value={teams.filter((team) => team.live).length}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:px-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Followed Teams
                </h3>

                <Link
                  href="/teams"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#19c59b] hover:underline"
                >
                  View All
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {loading ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-[#111c2d] p-6 text-center text-sm text-slate-400">
                  Loading real football data...
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="rounded-xl border border-white/10 bg-[#111c2d] p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#19c59b]" />

                  <h3 className="text-sm font-semibold text-white">
                    Smart Insights
                  </h3>
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  Live information from your football data
                </p>

                <div className="mt-4 space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="flex gap-2.5"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          insight.category === "TECHNICAL"
                            ? "bg-[#19c59b]"
                            : insight.category ===
                              "PERFORMANCE"
                            ? "bg-amber-400"
                            : "bg-sky-400"
                        }`}
                      />

                      <div>
                        <p className="text-[9px] font-semibold tracking-wide">
                          <span
                            className={
                              insightCategoryColor[
                                insight.category
                              ]
                            }
                          >
                            {insight.category}
                          </span>

                          <span className="text-slate-500">
                            {" "}
                            • {insight.updatedAgo}
                          </span>
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-white">
                          {insight.title}
                        </p>

                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-lg bg-[#19c59b] py-2 text-xs font-semibold text-[#062018] transition hover:bg-[#19c59b]/90"
                >
                  Full Intelligence Report
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:px-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Tracked Players
              </h3>

              <Link
                href="/players"
                className="flex items-center gap-1 text-[11px] font-semibold text-[#19c59b] hover:underline"
              >
                Scout Network
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-[#111c2d] p-6 text-center text-sm text-slate-400">
              Player tracking will be connected to the
              API next.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}