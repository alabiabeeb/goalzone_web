"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Header from "@/components/Header";

import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Newspaper,
} from "lucide-react";

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

// GNews's free tier truncates full article text and appends a marker
// like "[+1234 chars]" — strip that off.
function cleanContent(content: string) {
  return content
    .replace(/\[\+\d+\s*chars?\]\s*$/i, "")
    .trim();
}

// GNews's `content` field usually starts by repeating the
// `description` verbatim before continuing. Strip that overlap.
function stripOverlap(description: string, content: string) {
  const normalize = (s: string) =>
    s.replace(/\s+/g, " ").trim();

  const normDesc = normalize(description);
  const normContent = normalize(content);

  if (normDesc && normContent.startsWith(normDesc)) {
    return normContent.slice(normDesc.length).trim();
  }

  return content;
}

// GNews gives back one unbroken blob of text with no paragraph
// breaks — group every 2 sentences into a paragraph.
function toParagraphs(text: string) {
  const sentences =
    text.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [text];

  const paragraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences
      .slice(i, i + 2)
      .join("")
      .trim();

    if (chunk) {
      paragraphs.push(chunk);
    }
  }

  return paragraphs;
}

function formatDate(pubDate: string | null) {
  if (!pubDate) return null;

  return new Date(pubDate).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}



function ArticleDetailContent() {
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [article, setArticle] = useState<
    Article | null | undefined
  >(undefined);

  useEffect(() => {
    if (!id) {
      setArticle(null);
      return;
    }

    try {
      const raw = sessionStorage.getItem(`article:${id}`);

      setArticle(raw ? JSON.parse(raw) : null);
    } catch (err) {
      console.error("Failed to load cached article:", err);
      setArticle(null);
    }
  }, [id]);

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (article === undefined) {
    return (
      <div className="min-h-screen bg-[#08111e] text-white">
        <Header />

        <main className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-6">
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />

          <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-white/5" />

          <div className="mt-4 h-4 w-full animate-pulse rounded bg-white/5" />
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Article not found                                                        */
  /* ------------------------------------------------------------------------ */

  if (!article) {
    return (
      <div className="min-h-screen bg-[#08111e] text-white">
        <Header />

        <main className="mx-auto flex w-full max-w-[820px] flex-col items-center px-4 py-16 text-center sm:px-6">
          <Newspaper
            className="h-10 w-10 text-slate-600"
            strokeWidth={1.5}
          />

          <h1 className="mt-4 text-xl font-bold">
            Article not available
          </h1>

          <p className="mt-2 max-w-sm text-sm text-slate-400">
            This article couldn&apos;t be loaded — it may have opened
            in a new tab or the session expired. Head back to News
            and pick it again.
          </p>

          <Link
            href="/news"
            className="mt-6 flex items-center gap-2 rounded-lg bg-[#19c59b] px-4 py-2.5 text-sm font-semibold text-[#062018] transition hover:bg-[#15b58d]"
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={2}
            />

            Back to News
          </Link>
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Article content                                                          */
  /* ------------------------------------------------------------------------ */

  const snippet = cleanContent(
    article.content || article.description || ""
  );

  const bodyParagraphs = toParagraphs(
    stripOverlap(
      article.description || "",
      snippet
    )
  );

  return (
    <div className="min-h-screen bg-[#08111e] text-white">
      <Header />

      <main className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-6">
        {/* Back button */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft
            className="h-4 w-4"
            strokeWidth={2}
          />

          Back to News
        </Link>

        {/* Article image */}
        {article.thumbnail && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1828]">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        )}

        {/* Source + date */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="rounded-full bg-[#19c59b]/10 px-3 py-1 font-semibold text-[#19c59b]">
            {article.source}
          </span>

          {formatDate(article.pubDate) && (
            <span className="flex items-center gap-1.5">
              <Clock
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />

              {formatDate(article.pubDate)}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
          {article.title}
        </h1>

        {/* Description */}
        {article.description && (
          <p className="mt-4 text-base font-medium leading-7 text-slate-200">
            {article.description}
          </p>
        )}

        {/* Article body */}
        {bodyParagraphs.map((paragraph, i) => (
          <p
            key={i}
            className="mt-4 text-base leading-7 text-slate-300"
          >
            {paragraph}
          </p>
        ))}

        {/* Continue reading */}
        <div className="mt-8 rounded-xl border border-white/10 bg-[#111c2d] p-5">
          <p className="text-sm text-slate-400">
            This is a preview from {article.source}. Read the
            full story on their site.
          </p>

          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#19c59b] px-4 py-2.5 text-sm font-semibold text-[#062018] transition hover:bg-[#15b58d]"
          >
            Continue reading at {article.source}

            <ExternalLink
              className="h-4 w-4"
              strokeWidth={2}
            />
          </a>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ArticleDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08111e] text-white">
          <Header />

          <main className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-6">
            <div className="h-64 animate-pulse rounded-2xl bg-white/5" />

            <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-white/5" />

            <div className="mt-4 h-4 w-full animate-pulse rounded bg-white/5" />
          </main>
        </div>
      }
    >
      <ArticleDetailContent />
    </Suspense>
  );
}