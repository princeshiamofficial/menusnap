"use client";

import { useEffect, useRef, useState } from "react";
import { SEARCH_DEMO_QUERY, SEARCH_RESULTS } from "@/lib/data";
import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { CloseIcon, SearchIcon, SparkleIcon } from "@/components/landing/icons";

export function SmartSearch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [userTyped, setUserTyped] = useState(false);
  const [demoRun, setDemoRun] = useState(0);

  /* Auto-type the demo query when the section scrolls into view */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || userTyped) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const typeNext = (idx: number) => {
          if (cancelled) return;
          setQuery(SEARCH_DEMO_QUERY.slice(0, idx));
          if (idx <= SEARCH_DEMO_QUERY.length) {
            timer = setTimeout(() => typeNext(idx + 1), 85);
          }
        };
        timer = setTimeout(() => typeNext(1), 250);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [userTyped, demoRun]);

  const results = SEARCH_RESULTS.filter((r) => {
    const q = query.trim().toLowerCase();
    if (q === "") return false;
    return r.name.toLowerCase().includes(q) || r.source.toLowerCase().includes(q);
  });

  const demoFinished = query === SEARCH_DEMO_QUERY && !userTyped;

  return (
    <section id="smart-search" className="section-pad bg-surface">
      <Container>
        <div ref={sectionRef} className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Smart Search"
            title="Food Item খুঁজুন Seconds-এর মধ্যে।"
            description="Search the MenuSnap database the way you think — by item name, category or restaurant."
          />

          {/* Search card */}
          <Reveal className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
                <label htmlFor="smart-search-input" className="sr-only">
                  Search food items
                </label>
                <input
                  id="smart-search-input"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setUserTyped(true);
                  }}
                  onFocus={() => setUserTyped(true)}
                  placeholder="Type any food item..."
                  className="w-full bg-transparent text-lg font-semibold text-ink placeholder:font-medium placeholder:text-muted/60 focus:outline-none"
                />
                {!userTyped && !demoFinished && (
                  <span className="animate-caret h-6 w-[2px] rounded-full bg-accent" aria-hidden="true" />
                )}
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setUserTyped(false);
                      setDemoRun((r) => r + 1);
                    }}
                    className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
                {demoFinished && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setDemoRun((r) => r + 1);
                    }}
                    className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent-deep transition-colors hover:bg-accent hover:text-white"
                  >
                    ↻ Replay demo
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="min-h-[300px] p-4 sm:p-5" aria-live="polite">
                {results.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {results.map((result, i) => (
                      <li
                        key={result.name}
                        className="animate-slide-up flex items-center gap-3.5 rounded-xl border border-line bg-white px-4 py-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-base font-extrabold text-accent-deep">
                          {result.name.charAt(0)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-bold text-ink">{result.name}</span>
                          <span className="block truncate text-xs text-muted">
                            Reference: {result.source}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-lg bg-cream px-2.5 py-1 text-sm font-extrabold text-ink">
                          ৳{result.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-center">
                    <SparkleIcon className="h-7 w-7 text-accent" />
                    {query.trim() === "" ? (
                      <>
                        <p className="text-base font-bold text-ink">Start typing to search</p>
                        <p className="text-sm text-muted">
                          Try <span className="font-semibold text-accent-deep">“Chicken Burger”</span>,{" "}
                          <span className="font-semibold text-accent-deep">“Pasta”</span> or{" "}
                          <span className="font-semibold text-accent-deep">“Coffee”</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted">
                        No items match “{query}”. Try a different item name.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* Statement */}
          <Reveal className="mt-8">
            <p className="text-center text-[clamp(1.3rem,2.6vw,1.9rem)] font-extrabold tracking-tight text-ink">
              Thousands of items. <span className="text-accent">One search.</span>
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}