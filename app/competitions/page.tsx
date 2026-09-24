"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { Trophy, ChevronRight } from "lucide-react";

type Competition = {
  id: number;
  code: string;
  name: string;
  emblem: string | null;
  type: string;
  area: { name: string | null; flag: string | null };
  currentMatchday: number | null;
};

function CompetitionCard({ competition }: { competition: Competition }) {
  return (
    <Link
      href={`/competitions/${competition.code}`}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111c2d] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#19c59b]/40"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 p-2.5">
        {competition.emblem ? (
          <img
            src={competition.emblem}
            alt={competition.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <Trophy className="h-6 w-6 text-slate-500" strokeWidth={1.8} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-white">
          {competition.name}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          {competition.area.flag && (
            <img
              src={competition.area.flag}
              alt={competition.area.name ?? ""}
              className="h-3 w-4 shrink-0 object-cover"
            />
          )}
          <span className="truncate">
            {competition.area.name}
            {competition.currentMatchday
              ? ` • Matchday ${competition.currentMatchday}`
              : ""}
          </span>
        </div>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-[#19c59b]"
        strokeWidth={2}
      />
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111c2d] p-5">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[] | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/football/competitions", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCompetitions(data.competitions ?? []);
        if (!data.competitions?.length && data.message) {
          setError(data.message);
        }
      })
      .catch((err) => {
        console.error("Competitions page error:", err);
        if (!cancelled) {
          setError("Unable to load competitions.");
          setCompetitions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#19c59b]" strokeWidth={2} />
          <h1 className="text-2xl font-bold sm:text-3xl">Competitions</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Browse leagues and tournaments, and view live tables.
        </p>

        {competitions === null && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {competitions?.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
            <p className="text-sm text-slate-400">
              {error || "No competitions available right now."}
            </p>
          </div>
        )}

        {competitions && competitions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}