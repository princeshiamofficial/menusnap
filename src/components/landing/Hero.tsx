"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { HERO_FILTERS, HERO_ITEMS, HERO_MENU_DEFAULT, type HeroItem } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { Button, Container } from "@/components/landing/ui";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import {
  CheckIcon,
  CloseIcon,
  LayersIcon,
  LockIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/landing/icons";
import {
  Utensils,
  Sandwich,
  Flame,
  Coffee,
  Beef,
  Soup,
  CakeSlice,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

const FOOD_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  "Chicken Burger": { icon: Sandwich, color: "bg-orange-50 text-orange-600 border-orange-200/80" },
  "Chicken Pasta": { icon: Utensils, color: "bg-amber-50 text-amber-700 border-amber-200/80" },
  "Thai Fried Chicken": { icon: Flame, color: "bg-rose-50 text-rose-600 border-rose-200/80" },
  "Cold Coffee": { icon: Coffee, color: "bg-amber-100/70 text-amber-800 border-amber-200/80" },
  "Chicken Sandwich": { icon: Sandwich, color: "bg-orange-50 text-orange-600 border-orange-200/80" },
  "Beef Steak": { icon: Beef, color: "bg-red-50 text-red-700 border-red-200/80" },
  "Dim Sum (4 pcs)": { icon: Soup, color: "bg-yellow-50 text-yellow-700 border-yellow-200/80" },
  "Chocolate Cake Slice": { icon: CakeSlice, color: "bg-pink-50 text-pink-600 border-pink-200/80" },
};

/* ------------------------------------------------------------------ */
/* Interactive dashboard mockup                                        */
/* ------------------------------------------------------------------ */

type MenuEntry = { name: string; price: number };

function HeroMockup() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof HERO_FILTERS)[number]>("All");
  const [menu, setMenu] = useState<MenuEntry[]>(HERO_MENU_DEFAULT);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(
    () =>
      HERO_ITEMS.filter(
        (item) =>
          (filter === "All" || item.category === filter) &&
          item.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, filter],
  );

  const isAdded = (name: string) => menu.some((m) => m.name === name);

  const addItem = (item: HeroItem) => {
    if (isAdded(item.name)) return;
    setMenu((prev) => [...prev, { name: item.name, price: item.price }]);
    setJustAdded(item.name);
    trackEvent("addToMenu", { item: item.name, price: item.price });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(null), 1400);
  };

  const removeItem = (name: string) => {
    setMenu((prev) => prev.filter((m) => m.name !== name));
  };

  const toggleItem = (item: HeroItem) => {
    if (isAdded(item.name)) {
      removeItem(item.name);
    } else {
      addItem(item);
    }
  };

  return (
    <div className="relative mx-auto mt-14 w-full max-w-5xl sm:mt-16">
      {/* Dashboard window */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lift transition-transform duration-700 lg:[transform:perspective(1600px)_rotateX(2.5deg)] lg:hover:[transform:perspective(1600px)_rotateX(0deg)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-cream/70 px-4 py-2.5 sm:px-5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
            <LockIcon className="h-3 w-3 text-success" />
            app.menusnap.com
          </span>
          <span className="hidden h-2.5 w-2.5 sm:block" aria-hidden="true" />
        </div>

        <div className="grid lg:grid-cols-[280px_1fr]">
          {/* My Menu sidebar */}
          <aside className="hidden flex-col border-r border-line bg-cream/50 p-5 lg:flex">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Saved project
            </p>
            <h3 className="mb-4 text-lg font-extrabold text-ink">My Menu</h3>
            <ul className="flex flex-1 flex-col gap-2">
              {menu.map((entry, i) => (
                <li
                  key={`${entry.name}-${i}`}
                  className="animate-pop-in group flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-card"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{entry.name}</p>
                    <p className="text-xs font-bold text-accent-deep">৳{entry.price}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.name} from My Menu`}
                    onClick={() => removeItem(entry.name)}
                    className="rounded-md p-1 text-muted opacity-0 transition-opacity hover:bg-ink/5 hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-accent-soft px-3.5 py-2.5">
              <span className="text-sm font-bold text-accent-deep">
                {menu.length} {menu.length === 1 ? "Item" : "Items"} Added
              </span>
              <span className="text-xs font-semibold text-accent-deep/70">Save ✓</span>
            </div>
          </aside>

          {/* Main panel */}
          <div className="p-4 sm:p-6">
            {/* Search */}
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-cream/60 px-3.5 py-3 transition-colors focus-within:border-accent/50 focus-within:bg-white">
              <SearchIcon className="h-4.5 w-4.5 shrink-0 text-muted" />
              <label htmlFor="hero-search" className="sr-only">
                Search restaurant or food item
              </label>
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurant or food item..."
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

            {/* Filter chips */}
            <div className="mt-3.5 flex flex-wrap gap-2" role="group" aria-label="Filter items by category">
              {HERO_FILTERS.map((chip) => {
                const active = filter === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setFilter(chip)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
                      active
                        ? "border-accent bg-accent text-white shadow-pop"
                        : "border-line bg-white text-muted hover:border-ink/20 hover:text-ink",
                    )}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Results */}
            <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Menu references · {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            <ul className="flex flex-col gap-2">
              {results.map((item) => {
                const added = isAdded(item.name);
                const justAddedThis = justAdded === item.name;
                return (
                  <li
                    key={item.name}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift"
                  >
                    {(() => {
                      const meta = FOOD_ICONS[item.name] || { icon: UtensilsCrossed, color: "bg-cream text-accent-deep border-line" };
                      const FoodIcon = meta.icon;
                      return (
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-2xs", meta.color)}>
                          <FoodIcon className="h-4.5 w-4.5" />
                        </span>
                      );
                    })()}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {item.restaurant} · {item.category}
                      </span>
                    </span>
                    <span className="text-sm font-extrabold text-ink">৳{item.price}</span>
                    <button
                      type="button"
                      onClick={() => toggleItem(item)}
                      aria-label={added ? `Remove ${item.name} from My Menu` : `Add ${item.name} to My Menu`}
                      className={cn(
                        "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all duration-200 cursor-pointer",
                        added || justAddedThis
                          ? "bg-success text-white shadow-2xs hover:bg-success/90"
                          : "border border-accent/30 bg-accent-soft text-accent-deep hover:bg-accent hover:text-white",
                      )}
                    >
                      {added || justAddedThis ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" /> Added
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-3.5 w-3.5" /> Add
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
              {results.length === 0 && (
                <li className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
                  No items match “{query}”. Try another food or category.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile metric strip */}
      <div className="mt-5 grid grid-cols-3 gap-3 lg:hidden">
        {[
          { icon: <LayersIcon className="h-4 w-4" />, value: "500+", label: "Restaurants" },
          { icon: <SearchIcon className="h-4 w-4" />, value: "Thousands", label: "Items" },
          { icon: <span className="text-xs font-extrabold">৳</span>, value: "Price", label: "Reference" },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1 rounded-xl border border-line bg-white px-3 py-3 text-center shadow-card"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent-deep">
              {m.icon}
            </span>
            <span className="text-[13px] font-extrabold text-ink">{m.value}</span>
            <span className="text-[11px] font-medium text-muted">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero section                                                        */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-cream pb-14 pt-32 sm:pb-20 sm:pt-36">
      {/* Background */}
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgb(255 90 54 / 0.14), rgb(255 238 233 / 0.4) 60%, transparent)",
        }}
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Badge */}
          <span className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink shadow-card">
            <span aria-hidden="true">🇧🇩</span>
            Built for Bangladesh&rsquo;s Food Businesses
          </span>

          {/* Headline */}
          <h1 className="mt-6 text-balance text-[clamp(2.6rem,6.2vw,4.4rem)] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink">
            আপনার Restaurant-এর <span className="text-accent">Menu বানানো এখন অনেক সহজ।</span>
          </h1>

          {/* Supporting copy */}
          <p className="mt-6 max-w-2xl text-balance text-[clamp(1rem,1.8vw,1.1875rem)] leading-relaxed text-muted">
            বাংলাদেশের 500+ Restaurant &amp; Parlor-এর Menu Reference Explore করুন,
            হাজারো Food Item Search করুন, Price সম্পর্কে ধারণা নিন এবং নিজের
            Restaurant-এর Complete Menu List তৈরি করুন।
          </p>

          {/* CTAs */}
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              href="#pricing"
              size="lg"
              withArrow
              className="w-full sm:w-auto"
              onClick={() => trackEvent("heroCtaClicked", { cta: "start_building" })}
            >
              Start Building My Menu
            </Button>
            <Button
              href="#demo"
              variant="night"
              size="lg"
              className="w-full sm:w-auto"
            >
              <PlayIcon className="h-4 w-4 text-accent" />
              Watch 2-Min Demo
            </Button>
          </div>

          {/* Trust microcopy */}
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <SparkleIcon className="h-3.5 w-3.5 text-accent" /> Easy to use
            </span>
            <span aria-hidden="true" className="text-ink/20">•</span>
            <span className="inline-flex items-center gap-1.5">
              <SparkleIcon className="h-3.5 w-3.5 text-accent" /> Bangla-friendly
            </span>
            <span aria-hidden="true" className="text-ink/20">•</span>
            <span>Built for food businesses</span>
          </p>
        </div>

        {/* Demo video device */}
        <VideoShowcase />

        {/* Product mockup */}
        <HeroMockup />
      </Container>
    </section>
  );
}