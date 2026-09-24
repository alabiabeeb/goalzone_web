"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Shield, Search, Loader2, MapPin } from "lucide-react";

const COMPETITIONS = [
  { code: "PL", name: "Premier League" },
  { code: "ELC", name: "Championship" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" },
  { code: "DED", name: "Eredivisie" },
  { code: "PPL", name: "Primeira Liga" },
  { code: "CL", name: "UEFA Champions League" },
  { code: "EC", name: "European Championship" },
  { code: "WC", name: "FIFA World Cup" },
  { code: "BSA", name: "Campeonato Brasileiro" },
];

type Team = {
  id: number;
  name: string;
  shortName: string;
  tla: string | null;
  crest: string;
  founded: number | null;
  venue: string | null;
  clubColors: string | null;
};

function TeamCard({ team }: { team: Team }) {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function handleClick() {
    if (resolving) return;
    setResolving(true);
    setNotFound(false);

    try {
      const response = await fetch(
        `/api/football/teams?search=${encodeURIComponent(team.shortName)}`
      );
      const data = await response.json();

      const match = (data.response ?? []).find((item: any) =>
        item.team.name.toLowerCase().includes(team.shortName.toLowerCase())
      );

      const resolvedId = match?.team.id ?? data.response?.[0]?.team.id;

      if (resolvedId) {
        router.push(`/teams/${resolvedId}`);
      } else {
        setNotFound(true);
        setResolving(false);
      }
    } catch (err) {
      console.error("Team resolve error:", err);
      setNotFound(true);
      setResolving(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={resolving}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111c2d] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#19c59b]/40 disabled:opacity-70"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 p-2.5">
        <img
          src={team.crest}
          alt={team.name}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-white">
          {team.name}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          {team.venue && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.8} />
              {team.venue}
            </span>
          )}
          {team.founded && <span>Founded {team.founded}</span>}
        </div>

        {notFound && (
          <p className="mt-1 text-xs text-rose-400">
            Couldn't open full profile — try again
          </p>
        )}
      </div>

      {resolving && (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin text-[#19c59b]"
          strokeWidth={2}
        />
      )}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111c2d] p-5">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [competitionCode, setCompetitionCode] = useState("PL");
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setTeams(null);
    setError("");

    fetch(`/api/football/teams-by-competition/${competitionCode}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setTeams(data.teams ?? []);
        if (!data.teams?.length && data.message) setError(data.message);
      })
      .catch((err) => {
        console.error("Teams page error:", err);
        if (!cancelled) {
          setError("Unable to load teams.");
          setTeams([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [competitionCode]);

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((team) =>
      team.name.toLowerCase().includes(q)
    );
  }, [teams, query]);

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#19c59b]" strokeWidth={2} />
          <h1 className="text-2xl font-bold sm:text-3xl">Teams</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Browse clubs by competition, or search by name.
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={competitionCode}
            onChange={(e) => {
              setCompetitionCode(e.target.value);
              setQuery("");
            }}
            className="h-11 rounded-lg border border-white/10 bg-[#111c2d] px-3 text-sm text-white outline-none focus:border-[#19c59b]/50 sm:w-64"
          >
            {COMPETITIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-[#111c2d] px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter teams in this competition..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Grid */}
        {teams === null && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {teams?.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
            <p className="text-sm text-slate-400">
              {error || "No teams found for this competition."}
            </p>
          </div>
        )}

        {teams && teams.length > 0 && filteredTeams.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
            <p className="text-sm text-slate-400">
              No teams match "{query}".
            </p>
          </div>
        )}

        {filteredTeams.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}