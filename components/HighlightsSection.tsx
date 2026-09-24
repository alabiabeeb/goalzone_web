"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Highlight = {
  id: string; // YouTube video ID
  title: string;
  channel: string;
  publishedAt: string;
  thumbnail: string | null;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function HighlightCard({
  highlight,
  onPlay,
}: {
  highlight: Highlight;
  onPlay: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111c2d] transition duration-300 hover:-translate-y-1 hover:border-[#19c59b]/40">
      <div className="relative h-52 overflow-hidden bg-[#0d1828]">
        {highlight.thumbnail ? (
          <img
            src={highlight.thumbnail}
            alt={highlight.title}
            className="h-full w-full object-cover opacity-70 transition duration-300 group-hover:opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#18283d] via-[#0d1828] to-[#07111d]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        <button
          onClick={onPlay}
          aria-label={`Play: ${highlight.title}`}
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#19c59b] text-[#062018] shadow-lg shadow-[#19c59b]/20 transition duration-300 group-hover:scale-110"
        >
          <PlayIcon />
        </button>

        <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {highlight.channel}
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-white">
          {highlight.title}
        </h3>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-slate-500">
            {new Date(highlight.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>

          <button
            onClick={onPlay}
            className="text-xs font-semibold text-[#19c59b] hover:underline"
          >
            Watch highlights →
          </button>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111c2d]">
      <div className="h-52 animate-pulse bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function HighlightsSection() {
  const [highlights, setHighlights] = useState<Highlight[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/football/highlights", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setHighlights(data.highlights ?? []);
      })
      .catch((err) => {
        console.error("Highlights fetch error:", err);
        if (!cancelled) setHighlights([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="highlights"
      className="w-full bg-[#08111e] px-5 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#19c59b]">
              Match Centre
            </p>
            <h2 className="text-3xl font-black leading-[1.05] tracking-[-0.02em] text-white sm:text-4xl">
              Highlights
            </h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              Relive the best moments from the latest matches, with highlights
              and key plays from around the world.
            </p>
          </div>

          <button className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
            View All Highlights
          </button>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights === null &&
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

          {highlights?.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
              <p className="text-sm text-slate-400">
                No highlights available right now.
              </p>
            </div>
          )}

          {highlights?.map((highlight) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              onPlay={() => setActiveId(highlight.id)}
            />
          ))}
        </div>
      </div>

      {activeId && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveId(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c1423]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <p className="text-sm font-semibold text-white">Now playing</p>
              <button
                onClick={() => setActiveId(null)}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
                title="Highlight video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
