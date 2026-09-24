"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string | null;
  thumbnail: string | null;
  source: string;
  sourceUrl: string | null;
};

function timeAgo(pubDate: string | null) {
  if (!pubDate) return null;

  const then = new Date(pubDate).getTime();
  const diffMs = Date.now() - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/article?id=${encodeURIComponent(article.id)}`}
      onClick={() => {
        // Carry the full article payload to the detail page — GNews
        // has no "fetch one article" endpoint to re-query there.
        try {
          sessionStorage.setItem(
            `article:${article.id}`,
            JSON.stringify(article)
          );
        } catch (err) {
          console.error("Failed to cache article:", err);
        }
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111c2d] transition duration-300 hover:-translate-y-1 hover:border-[#19c59b]/40"
    >
      <div className="relative h-44 overflow-hidden bg-[#0d1828]">
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#18283d] via-[#0d1828] to-[#07111d]">
            <Newspaper className="h-8 w-8 text-slate-600" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {article.source}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold text-white transition group-hover:text-[#19c59b]">
          {article.title}
        </h3>

        {article.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {article.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          {timeAgo(article.pubDate) ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />
              {timeAgo(article.pubDate)}
            </span>
          ) : (
            <span />
          )}

          <span className="flex items-center gap-1 text-xs font-semibold text-[#19c59b]">
            Read article
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111c2d]">
      <div className="h-44 animate-pulse bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/football/news", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.articles) {
          setArticles(data.articles);
        } else {
          setError(data.error || data.message || "Unable to load news.");
          setArticles([]);
        }
      })
      .catch((err) => {
        console.error("News page error:", err);
        if (!cancelled) {
          setError("Unable to load news.");
          setArticles([]);
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
          <Newspaper className="h-5 w-5 text-[#19c59b]" strokeWidth={2} />
          <h1 className="text-2xl font-bold sm:text-3xl">News</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Latest football news.
        </p>

        {articles === null && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        )}

        {articles?.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#111c2d] p-8 text-center">
            <p className="text-sm text-slate-400">
              {error || "No news available right now."}
            </p>
          </div>
        )}

        {articles && articles.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}