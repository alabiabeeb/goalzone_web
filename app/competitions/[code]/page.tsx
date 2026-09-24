"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { ArrowLeft, Trophy } from "lucide-react";

type TeamRow = {
  position: number;
  team: { id: number; name: string; shortName: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
};

type Group = {
  type: string;
  group: string | null;
  table: TeamRow[];
};

type StandingsResponse = {
  competition: { id: number; code: string; name: string; emblem: string } | null;
  season: { startDate: string; endDate: string; currentMatchday: number } | null;
  groups: Group[];
};


function zoneClass(position: number, totalTeams: number) {
  if (position <= 4) return "border-l-2 border-l-[#19c59b]";
  if (position === 5) return "border-l-2 border-l-sky-400";
  if (position > totalTeams - 3) return "border-l-2 border-l-rose-400";
  return "border-l-2 border-l-transparent";
}

function FormBadges({ form }: { form: string | null }) {
  if (!form) return <span className="text-slate-600">—</span>;

  const results = form.split(",").slice(-5);

  return (
    <div className="flex gap-1">
      {results.map((result, i) => (
        <span
          key={i}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
            result === "W"
              ? "bg-[#19c59b]/15 text-[#19c59b]"
              : result === "D"
              ? "bg-white/10 text-slate-300"
              : "bg-rose-500/15 text-rose-400"
          }`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function StandingsTable({ group }: { group: Group }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111c2d]">
      {group.group && (
        <div className="border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-semibold text-white">{group.group}</h3>
        </div>
      )}

      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Club</th>
            <th className="px-3 py-3 text-center font-medium">P</th>
            <th className="px-3 py-3 text-center font-medium">W</th>
            <th className="px-3 py-3 text-center font-medium">D</th>
            <th className="px-3 py-3 text-center font-medium">L</th>
            <th className="px-3 py-3 text-center font-medium">GF</th>
            <th className="px-3 py-3 text-center font-medium">GA</th>
            <th className="px-3 py-3 text-center font-medium">GD</th>
            <th className="px-3 py-3 text-center font-medium">Pts</th>
            <th className="px-4 py-3 font-medium">Form</th>
          </tr>
        </thead>
        <tbody>
          {group.table.map((row) => (
            <tr
              key={row.team.id}
              className={`border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] ${zoneClass(
                row.position,
                group.table.length
              )}`}
            >
              <td className="px-4 py-3 font-semibold text-white">
                {row.position}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={row.team.crest}
                    alt={row.team.name}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                  <span className="truncate font-medium text-white">
                    {row.team.shortName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-center text-slate-300">
                {row.playedGames}
              </td>
              <td className="px-3 py-3 text-center text-slate-300">
                {row.won}
              </td>
              <td className="px-3 py-3 text-center text-slate-300">
                {row.draw}
              </td>
              <td className="px-3 py-3 text-center text-slate-300">
                {row.lost}
              </td>
              <td className="px-3 py-3 text-center text-slate-300">
                {row.goalsFor}
              </td>
              <td className="px-3 py-3 text-center text-slate-300">
                {row.goalsAgainst}
              </td>
              <td
                className={`px-3 py-3 text-center font-medium ${
                  row.goalDifference > 0
                    ? "text-[#19c59b]"
                    : row.goalDifference < 0
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {row.goalDifference > 0 ? "+" : ""}
                {row.goalDifference}
              </td>
              <td className="px-3 py-3 text-center font-bold text-white">
                {row.points}
              </td>
              <td className="px-4 py-3">
                <FormBadges form={row.form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompetitionDetailPage() {
  const params = useParams<{ code: string }>();
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/football/competitions/${params.code}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result.groups) {
          setData(result);
        } else {
          setError(result.message || "Unable to load standings.");
        }
      })
      .catch((err) => {
        console.error("Competition detail error:", err);
        if (!cancelled) setError("Unable to load standings.");
      });

    return () => {
      cancelled = true;
    };
  }, [params.code]);

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <main className="mx-auto w-full max-w-[1150px] px-4 py-6 sm:px-6">
        <Link
          href="/competitions"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Competitions
        </Link>

        {!data && !error && (
          <div className="mt-8 space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
          </div>
        )}

        {error && !data && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-slate-600" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-400">{error}</p>
          </div>
        )}

        {data && (
          <>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111c2d] p-5">
              {data.competition?.emblem && (
                <img
                  src={data.competition.emblem}
                  alt={data.competition.name}
                  className="h-12 w-12 object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  {data.competition?.name}
                </h1>
                {data.season?.currentMatchday && (
                  <p className="mt-0.5 text-sm text-slate-400">
                    Matchday {data.season.currentMatchday}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {data.groups.map((group, i) => (
                <StandingsTable key={group.group ?? i} group={group} />
              ))}
            </div>

            {data.groups.some((g) => g.table.length >= 5) && (
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#19c59b]" />
                  Champions League
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Europa League
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Relegation
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}