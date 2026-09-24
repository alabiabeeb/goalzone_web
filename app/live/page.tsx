"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { RefreshCw, Radio, Clock } from "lucide-react";

type Match = {
  id: number;
  status: string;
  minute: number | null;
  utcDate: string;
  competition: string;
  home: { id: number; name: string; shortName: string; crest: string };
  away: { id: number; name: string; shortName: string; crest: string };
  score: { home: number | null; away: number | null };
};

type LiveResponse = {
  live: Match[];
  scheduledToday: Match[];
  fetchedAt: string;
};

const POLL_INTERVAL_MS = 30_000;

function formatKickoff(utcDate: string) {
  return new Date(utcDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(match: Match) {
  if (match.status === "IN_PLAY") {
    return match.minute ? `${match.minute}'` : "Live";
  }
  if (match.status === "PAUSED") return "Half-time";
  return match.status;
}

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#19c59b] opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#19c59b]" />
    </span>
  );
}

function TeamRow({
  team,
  score,
  align,
}: {
  team: Match["home"];
  score: number | null;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-3 ${
        align === "right" ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 p-1.5">
        <Image
          src={team.crest}
          alt={team.name}
          width={40}
          height={40}
          className="h-full w-full object-contain"
        />
      </div>
      <p className="min-w-0 truncate text-sm font-semibold text-white">
        {team.shortName}
      </p>
      <p className="w-8 shrink-0 text-center text-xl font-bold tabular-nums text-white">
        {score ?? "-"}
      </p>
    </div>
  );
}

function LiveMatchCard({ match }: { match: Match }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111c2d] p-4">
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
        <span>{match.competition}</span>
        <span className="flex items-center gap-1.5 text-[#19c59b]">
          <LivePulse />
          {statusLabel(match)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <TeamRow team={match.home} score={match.score.home} align="left" />
        <span className="shrink-0 px-1 text-xs text-slate-600">—</span>
        <TeamRow team={match.away} score={match.score.away} align="right" />
      </div>
    </div>
  );
}

function ScheduledMatchRow({ match }: { match: Match }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        <Image
          src={match.home.crest}
          alt={match.home.name}
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 object-contain"
        />
        <p className="truncate text-sm text-white">{match.home.shortName}</p>
        <span className="text-xs text-slate-600">vs</span>
        <Image
          src={match.away.crest}
          alt={match.away.name}
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 object-contain"
        />
        <p className="truncate text-sm text-white">{match.away.shortName}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
        <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />
        {formatKickoff(match.utcDate)}
      </div>
    </div>
  );
}

export default function LivePage() {
  const [data, setData] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (isBackground = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!isBackground) setLoading(true);
      setError("");

      const response = await fetch("/api/football/live", {
        cache: "no-store",
        signal: controller.signal,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load live matches.");
      }

      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Live page error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load live matches."
      );
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void load();
    }, 0);

    const interval = setInterval(() => {
      void load(true);
    }, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [load]);

  const hasLive = (data?.live.length ?? 0) > 0;
  const hasScheduled = (data?.scheduledToday.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <main className="mx-auto w-full max-w-225 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-[#19c59b]" strokeWidth={2} />
            <h1 className="text-2xl font-bold sm:text-3xl">Live</h1>
          </div>

          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            aria-label="Refresh"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {data?.fetchedAt && (
          <p className="mt-1 text-xs text-slate-500">
            Updated{" "}
            {new Date(data.fetchedAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}{" "}
            • refreshes every 30s
          </p>
        )}

        {loading && !data && (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19c59b] border-t-transparent" />
          </div>
        )}

        {error && !data && (
          <div className="mt-10 rounded-xl border border-white/10 bg-[#111c2d] p-6 text-center">
            <p className="text-sm text-slate-400">{error}</p>
            <button
              onClick={() => load()}
              className="mt-4 rounded-lg bg-[#19c59b] px-4 py-2 text-xs font-semibold text-[#062018] transition hover:bg-[#15b58d]"
            >
              Try Again
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="mt-6 space-y-3">
              {hasLive ? (
                data.live.map((match) => (
                  <LiveMatchCard key={match.id} match={match} />
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#111c2d] p-8 text-center">
                  <p className="text-sm text-slate-400">
                    No Premier League matches in play right now.
                  </p>
                </div>
              )}
            </div>

            {hasScheduled && (
              <div className="mt-8">
                <div className="border-t border-dashed border-white/10 pt-6">
                  <h2 className="text-sm font-semibold text-white">
                    Later today
                  </h2>

                  <div className="mt-3 rounded-xl border border-white/10 bg-[#111c2d] px-4">
                    {data.scheduledToday.map((match) => (
                      <ScheduledMatchRow key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}