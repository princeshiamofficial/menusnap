"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { EXPLORER_BENEFITS, EXPLORER_FILTERS, EXPLORER_RESTAURANTS } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { Button, Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { ArrowRightIcon, CheckIcon, CloseIcon, SearchIcon } from "@/components/landing/icons";

export function RestaurantExplorer() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof EXPLORER_FILTERS)[number]>("All");

  const results = useMemo(
    () =>
      EXPLORER_RESTAURANTS.filter((r) => {
        const matchesFilter = filter === "All" || r.category === filter;
        const q = query.trim().toLowerCase();
        const matchesQuery =
          q === "" ||
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q);
        return matchesFilter && matchesQuery;
      }),
    [query, filter],
  );

  return (
    <section id="product" className="section-pad bg-cream">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Explorer mockup */}
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
              {/* Toolbar */}
              <div className="border-b border-line p-4 sm:p-5">
                <div className="flex items-center gap-2.5 rounded-xl border border-line bg-cream/60 px-3.5 py-2.5 transition-colors focus-within:border-accent/50 focus-within:bg-white">
                  <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
                  <label htmlFor="explorer-search" className="sr-only">
                    Search 500+ restaurants
                  </label>
                  <input
                    id="explorer-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search 500+ Restaurants"
                    className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted/70 focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                      className="rounded-md p-1 text-muted hover:bg-ink/5 hover:text-ink"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter restaurants by category">
                  {EXPLORER_FILTERS.map((chip) => {
                    const active = filter === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setFilter(chip);
                          trackEvent("explorerFilter", { filter: chip });
                        }}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[12px] font-semibold transition-all duration-200",
                          active
                            ? "border-accent bg-accent text-white"
                            : "border-line bg-white text-muted hover:border-ink/20 hover:text-ink",
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Restaurant cards */}
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                {results.map((restaurant) => (
                  <div
                    key={restaurant.name}
                    className="group flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-extrabold",
                        restaurant.tone,
                      )}
                    >
                      {restaurant.initial}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[15px] font-bold text-ink">{restaurant.name}</span>
                        <span className="hidden shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent-deep sm:inline">
                          {restaurant.category}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {restaurant.location} · {restaurant.items} items
                      </span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                ))}
                {results.length === 0 && (
                  <p className="col-span-full rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
                    No restaurants match “{query}”. Try another name or category.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-line bg-cream/40 px-5 py-3 text-xs font-medium text-muted">
                <span>
                  Showing <span className="font-bold text-ink">{results.length}</span> of 500+ references
                </span>
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  <span className="h-1.5 w-1.5 rounded-full bg-line" />
                </span>
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal delay={120}>
            <SectionHeading
              align="left"
              eyebrow="500+ Menu References"
              title="Market-এ কী চলছে, এক জায়গা থেকেই দেখুন।"
            />
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
              Instead of manually searching different Facebook pages, websites, PDFs and
              screenshots, users can explore organized menu references from MenuSnap —
              restaurant-wise, category-wise and item-wise.
            </p>
            <ul className="mt-6 flex max-w-lg flex-col gap-2.5">
              {EXPLORER_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-[15px] font-semibold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft">
                    <CheckIcon className="h-3.5 w-3.5 text-accent-deep" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#features" variant="secondary" withArrow>
                Explore the Features
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}