import Header from "@/components/Header";
import { ArrowRight, Play } from "lucide-react";
import HighlightsSection from "@/components/HighlightsSection";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08111e]">
      <Header />
      <main className="flex flex-1">
        <section
          className="relative isolate flex min-h-[calc(100vh-64px)] w-full items-center overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.webp')" }}
        >
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,12,22,0.95)_0%,rgba(5,12,22,0.72)_40%,rgba(5,12,22,0.12)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(5,12,22,0.78)_0%,transparent_42%)]" />

          <div className="mx-auto w-full max-w-[1180px] px-5 py-24 sm:px-8 lg:py-32">
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#19c59b]">
                <span className="h-px w-8 bg-[#19c59b]" />
                The home of football
              </div>

              <h1 className="max-w-lg text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl">
                Every match.
                <span className="block text-[#19c59b]">Every moment.</span>
              </h1>

              <p className="mt-7 max-w-md text-base leading-7 text-slate-300 sm:text-lg">
                Live scores, fixtures, and the stories shaping the beautiful game, all in one place.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="/live"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-[#19c59b] px-5 text-sm font-bold text-[#06131e] transition hover:bg-[#39d9b2]"
                >
                  Explore live matches
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#highlights"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-white/25 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch highlights
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HighlightsSection />
    </div>
  );
}
