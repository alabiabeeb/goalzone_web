"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  Moon,
  UserRound,
  Trophy,
  Loader2,
  Menu,
  X,
  Home,
  Radio,
  CalendarDays,
  Shield,
  Users,
  Newspaper,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Live", href: "/live", icon: Radio, live: true },
  { label: "Matches", href: "/matches", icon: CalendarDays },
  { label: "Competitions", href: "/competitions", icon: Trophy },
  { label: "Teams", href: "/teams", icon: Shield },
  { label: "Players", href: "/players", icon: Users },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "My Football", href: "/my-football", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: UserRound },
];

type FootballTeam = {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
    capacity: number | null;
    image: string | null;
  };
};

type SearchResult = {
  id: number;
  name: string;
  code: string | null;
  country: string;
  logo: string;
  href: string;
};

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const mobileSearchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      setLoading(false);

      abortRef.current?.abort();

      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);
        setShowResults(true);

        const response = await fetch(
          `/api/football/teams?search=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to search teams.");
        }

        const teams: FootballTeam[] = data.response ?? [];

        const formattedResults: SearchResult[] = teams
          .map((item) => ({
            id: item.team.id,
            name: item.team.name,
            code: item.team.code,
            country: item.team.country,
            logo: item.team.logo,
            href: `/teams/${item.team.id}`,
          }))
          .filter(
            (team, index, array) =>
              array.findIndex((item) => item.id === team.id) === index
          )
          .slice(0, 10);

        setResults(formattedResults);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Team search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function openMenu(focusSearch = false) {
    setMenuOpen(true);

    if (focusSearch) {
      // Wait for the panel to mount before focusing.
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
    setShowResults(false);
  }

  const renderResultRow = (result: SearchResult, onSelect: () => void) => (
    <Link
      key={result.id}
      href={result.href}
      onClick={() => {
        setQuery("");
        setShowResults(false);
        onSelect();
      }}
      className="flex items-center gap-3 border-b border-white/5 p-3 transition hover:bg-white/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 p-1.5">
        {result.logo ? (
          <img
            src={result.logo}
            alt={result.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <Trophy className="h-4 w-4 text-[#19c59b]" strokeWidth={1.8} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">
          {result.name}
        </p>
        <p className="truncate text-[10px] text-slate-400">
          {result.country}
          {result.code ? ` • ${result.code}` : ""}
        </p>
      </div>
    </Link>
  );

  return (
    <header className="w-full border-b border-white/5 bg-[#0c1423] text-white">
      <div className="mx-auto flex h-[64px] max-w-[1180px] items-center px-4 sm:px-5">
        {/* Logo */}
        <Link href="/" className="mr-8 flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#19c59b]">
            <Trophy className="h-4 w-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-[18px] font-bold tracking-[-0.03em]">
            GoalZone
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems
            .filter((item) => item.label !== "Profile")
            .map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  item.label === "Home"
                    ? "text-[#19c59b]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
                {item.live && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#19c59b] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#19c59b]" />
                  </span>
                )}
              </Link>
            ))}
        </nav>

        {/* Right section */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Desktop search */}
          <div className="relative hidden lg:block">
            <div className="flex h-8 w-[210px] items-center gap-2 rounded-md border border-white/10 bg-[#111c2d] px-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim().length >= 3) setShowResults(true);
                }}
                placeholder="Search teams..."
                className="w-full bg-transparent text-[10px] text-white outline-none placeholder:text-slate-500"
              />
              {loading && (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400" />
              )}
            </div>

            {showResults && query.trim().length >= 3 && (
              <div className="absolute right-0 top-10 z-[100] w-[320px] overflow-hidden rounded-lg border border-white/10 bg-[#111c2d] shadow-2xl">
                {loading ? (
                  <div className="flex items-center gap-2 p-4 text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching teams...
                  </div>
                ) : results.length > 0 ? (
                  <div className="max-h-[360px] overflow-y-auto">
                    {results.map((result) =>
                      renderResultRow(result, () => {})
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs text-slate-400">
                      No teams found for{" "}
                      <span className="text-white">"{query}"</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search icon — mobile & tablet */}
          <button
            type="button"
            aria-label="Search teams"
            onClick={() => openMenu(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Search className="h-4 w-4" strokeWidth={1.8} />
          </button>

          {/* Notification — desktop only, folded into menu on mobile */}
          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white lg:flex"
          >
            <Bell className="h-4 w-4" strokeWidth={1.8} />
          </button>

          {/* Theme — desktop only, folded into menu on mobile */}
          <button
            type="button"
            aria-label="Toggle theme"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white lg:flex"
          >
            <Moon className="h-4 w-4" strokeWidth={1.8} />
          </button>

          {/* Profile — desktop only */}
          <Link
            href="/profile"
            aria-label="Profile"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#172235] text-slate-300 transition hover:border-white/20 hover:text-white lg:flex"
          >
            <UserRound className="h-4 w-4" strokeWidth={1.8} />
          </Link>

          {/* Menu toggle — mobile & tablet */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => (menuOpen ? closeMenu() : openMenu(false))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            {menuOpen ? (
              <X className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel — search + nav, scoreboard-style dashed divider */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeMenu}
          />

          <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto border-b border-white/10 bg-[#0c1423] pb-6 shadow-2xl">
            <div className="flex h-[64px] items-center justify-between px-4 sm:px-5">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#19c59b]">
                  <Trophy className="h-4 w-4 text-white" strokeWidth={2.2} />
                </div>
                <span className="text-[18px] font-bold tracking-[-0.03em]">
                  GoalZone
                </span>
              </Link>

              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="px-4 sm:px-5">
              {/* Search */}
              <div className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#111c2d] px-3">
                <Search className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search teams..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
                {loading && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
                )}
              </div>

              {query.trim().length >= 3 && (
                <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#111c2d]">
                  {loading ? (
                    <div className="flex items-center gap-2 p-4 text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching teams...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="max-h-[280px] overflow-y-auto">
                      {results.map((result) =>
                        renderResultRow(result, closeMenu)
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-xs text-slate-400">
                        No teams found for{" "}
                        <span className="text-white">"{query}"</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Scoreboard-style divider */}
              <div className="my-5 border-t border-dashed border-white/10" />

              {/* Nav */}
              <nav className="flex flex-col">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isHome = item.label === "Home";

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center justify-between border-b border-white/5 py-3.5 text-sm font-medium transition-colors last:border-b-0 ${
                        isHome
                          ? "text-[#19c59b]"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                        {item.label}
                      </span>

                      {item.live && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#19c59b] opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#19c59b]" />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Utility row */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Bell className="h-4 w-4" strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  aria-label="Toggle theme"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Moon className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}