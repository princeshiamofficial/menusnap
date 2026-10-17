"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { PRICE_COMPARISONS, PRICE_DISCLAIMER } from "@/lib/data";
import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { ChevronDownIcon } from "@/components/landing/icons";
import { Sandwich, Coffee, Utensils, UtensilsCrossed, type LucideIcon } from "lucide-react";

const COMPARISON_ICONS: Record<string, LucideIcon> = {
  Burger: Sandwich,
  "Cold Coffee": Coffee,
  Pasta: Utensils,
};

export function PriceComparison() {
  const [activeIndex, setActiveIndex] = useState(0);
  const comparison = PRICE_COMPARISONS[activeIndex];
  const maxPrice = Math.max(...comparison.rows.map((r) => r.price));

  return (
    <section id="price-research" className="relative overflow-hidden bg-night text-white">
      <div className="bg-grid-dark absolute inset-0" aria-hidden="true" />
      <Container className="section-pad relative">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* Copy + item selector */}
          <Reveal>
            <SectionHeading
              dark
              align="left"
              eyebrow="Price Research"
              title="Price Guess না করে Reference দেখুন।"
              description="Inspect listed price references for similar menu items, then combine that information with your own costing, positioning and business strategy."
            />

            {/* Item tabs */}
            <div
              className="mt-8 flex flex-col gap-2"
              role="tablist"
              aria-label="Compare items"
              aria-orientation="vertical"
            >
              {PRICE_COMPARISONS.map((item, i) => {
                const active = i === activeIndex;
                return (
                  <button
                    key={item.item}
                    type="button"
                    role="tab"
                    id={`price-tab-${i}`}
                    aria-selected={active}
                    aria-controls="price-panel"
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200",
                      active
                        ? "border-accent/50 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                  >
                    {(() => {
                      const TabIcon = COMPARISON_ICONS[item.item] || UtensilsCrossed;
                      return (
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            active ? "bg-accent/20 text-accent" : "bg-white/10 text-white/60",
                          )}
                          aria-hidden="true"
                        >
                          <TabIcon className="h-5 w-5" />
                        </span>
                      );
                    })()}
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[15px] font-bold",
                          active ? "text-white" : "text-white/60",
                        )}
                      >
                        {item.item}
                      </span>
                      <span className="block text-xs text-white/40">{item.count} in database</span>
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "h-4 w-4 -rotate-90 transition-transform duration-200",
                        active ? "text-accent" : "text-white/30",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <p className="mt-6 max-w-lg text-xs leading-relaxed text-white/40">{PRICE_DISCLAIMER}</p>
          </Reveal>

          {/* Comparison card */}
          <Reveal delay={120}>
            <div
              id="price-panel"
              role="tabpanel"
              aria-labelledby={`price-tab-${activeIndex}`}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-lift backdrop-blur sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const CompIcon = COMPARISON_ICONS[comparison.item] || UtensilsCrossed;
                    return (
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
                        <CompIcon className="h-5 w-5" />
                      </span>
                    );
                  })()}
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{comparison.item}</h3>
                    <p className="text-xs font-semibold text-accent">Listed Price Reference</p>
                  </div>
                </div>
                <span className="hidden rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/60 sm:inline">
                  {comparison.count}
                </span>
              </div>

              <ul className="mt-6 flex flex-col gap-3.5">
                {comparison.rows.map((row) => (
                  <li key={row.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-white/70">{row.name}</span>
                      <span className="font-extrabold text-white">৳{row.price}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10" role="presentation">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent/50 transition-all duration-500"
                        style={{ width: `${(row.price / maxPrice) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              {/* Range insight */}
              <div className="mt-7 rounded-2xl border border-accent/30 bg-accent/15 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                  Reference Value
                </p>
                <p className="mt-1 text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight text-white">
                  {comparison.range}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Based on listed menu references in the MenuSnap database
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}