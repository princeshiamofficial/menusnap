"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import {
  Search,
  GripVertical,
  Check,
  Plus,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Interactive UI Previews for Bento Cards                            */
/* ------------------------------------------------------------------ */

/**
 * 1. Database Preview (500+ Menu References)
 * 2x2 grid of restaurants + category filter pills + verified badges.
 */
function DatabasePreview() {
  const restaurants = [
    { initial: "N", name: "Café Nodi", location: "Dhanmondi", items: "42 items", tone: "bg-amber-100 text-amber-800" },
    { initial: "B", name: "Burger Bari", location: "Banani", items: "38 items", tone: "bg-orange-100 text-orange-700" },
    { initial: "G", name: "Golden Dragon", location: "Uttara", items: "65 items", tone: "bg-red-100 text-red-700" },
    { initial: "C", name: "Coffee Tree", location: "Gulshan", items: "28 items", tone: "bg-emerald-100 text-emerald-800" },
  ];

  return (
    <div className="flex flex-col gap-2.5 h-full justify-between" aria-hidden="true">
      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pb-0.5 text-[11px] font-bold">
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-white shadow-2xs">All (500+)</span>
        <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-muted">Dhaka</span>
        <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-muted">Fast Food</span>
        <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-muted">Café</span>
        <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-muted">Bakery</span>
      </div>

      {/* 2x2 Restaurant Directory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {restaurants.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2 shadow-2xs transition-all hover:border-accent/40"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black", r.tone)}>
                {r.initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink">{r.name}</p>
                <p className="text-[10px] text-muted">{r.location} • {r.items}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-md border border-line bg-gray-50/80 px-2 py-0.5 text-[10px] font-semibold text-muted">
              ref
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Counter Bar */}
      <div className="rounded-xl border border-dashed border-accent/40 bg-accent-soft/40 py-2 px-3 text-center text-xs font-bold text-accent-deep">
        +500 more restaurants across Bangladesh
      </div>
    </div>
  );
}

/**
 * 2. Search Preview (Smart Search)
 */
function SearchPreview() {
  return (
    <div className="flex flex-col gap-2 h-full justify-between" aria-hidden="true">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 shadow-2xs">
        <Search className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="text-xs font-semibold text-ink">Chicken Burg...</span>
        <span className="h-3.5 w-[2px] animate-pulse rounded bg-accent" />
      </div>

      {/* Results List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 shadow-2xs">
          <div>
            <p className="text-xs font-extrabold text-accent-deep">Crispy Chicken Burger</p>
            <p className="text-[10px] text-muted">Burger Bari • Fast Food</p>
          </div>
          <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-black text-ink shadow-2xs">
            ৳260
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2 shadow-2xs">
          <div>
            <p className="text-xs font-semibold text-ink">BBQ Chicken Burger</p>
            <p className="text-[10px] text-muted">Café Nodi • Burgers</p>
          </div>
          <span className="text-xs font-bold text-ink">৳320</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Price Preview (Price Reference)
 */
function PricePreview() {
  const bars = [
    { label: "৳180", height: "45%", highlight: false },
    { label: "৳220", height: "65%", highlight: false },
    { label: "৳260", height: "92%", highlight: true },
    { label: "৳320", height: "70%", highlight: false },
    { label: "৳380", height: "48%", highlight: false },
  ];

  return (
    <div className="flex flex-col gap-2 h-full justify-between" aria-hidden="true">
      {/* Distribution Bars */}
      <div className="flex h-24 items-end gap-2.5 rounded-xl border border-line bg-white p-2.5 shadow-2xs">
        {bars.map((bar, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div
              className={cn(
                "w-full rounded-t-md transition-all",
                bar.highlight
                  ? "bg-accent shadow-xs"
                  : "bg-accent/25 hover:bg-accent/40"
              )}
              style={{ height: bar.height }}
            />
            <span className={cn("text-[9px] font-bold", bar.highlight ? "text-accent-deep font-black" : "text-muted")}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200/60">
        <span>Sweet Spot: ৳240 – ৳290</span>
        <span>Avg: ৳265</span>
      </div>
    </div>
  );
}

/**
 * 4. Builder Preview (Menu Builder)
 */
function BuilderPreview() {
  const items = [
    { name: "Classic Chicken Burger", desc: "180g patty with cheddar & caramelized onion", price: "৳280" },
    { name: "BBQ Chicken Burger", desc: "Smoked tender fillet in hickory BBQ glaze", price: "৳320" },
    { name: "Crispy Chicken Wings", desc: "6 pcs zesty fried wings with garlic ranch", price: "৳240" },
  ];

  return (
    <div className="flex flex-col gap-2.5 h-full justify-between" aria-hidden="true">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 pb-0.5">
        <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-white shadow-2xs">
          Burger
        </span>
        <span className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-muted">
          Pizza
        </span>
        <span className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-muted">
          Drinks
        </span>
        <span className="flex items-center gap-1 rounded-full border border-dashed border-accent/50 px-2.5 py-1 text-[10px] font-bold text-accent-deep">
          <Plus className="h-3 w-3" /> New
        </span>
      </div>

      {/* Draggable Items List */}
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2 shadow-2xs transition-all hover:border-accent/40"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-muted/40 cursor-grab" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink">{item.name}</p>
              <p className="truncate text-[10px] text-muted">{item.desc}</p>
            </div>
            <span className="rounded-lg bg-cream px-2 py-0.5 text-xs font-extrabold text-accent-deep">
              {item.price}
            </span>
          </div>
        ))}
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-line px-3 py-1.5 text-[11px] font-semibold text-muted">
        <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Auto-Saved
        </span>
        <span>3 Categories • 18 Items</span>
        <span className="text-accent font-bold">Ready to Export</span>
      </div>
    </div>
  );
}

/**
 * 5. Custom Categories Preview
 */
function CategoriesPreview() {
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden="true">
      {["Burger", "Pizza", "Rice", "Drinks"].map((c, i) => (
        <span
          key={c}
          className={cn(
            "rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-2xs",
            i === 0
              ? "bg-accent text-white"
              : "border border-line bg-white text-muted hover:border-accent/40"
          )}
        >
          {c}
        </span>
      ))}
      <span className="flex items-center gap-0.5 rounded-xl border border-dashed border-accent/50 px-2 py-1 text-[10px] font-bold text-accent-deep">
        <Plus className="h-3 w-3" /> New
      </span>
    </div>
  );
}

/**
 * 6. Shortlist Preview
 */
function ShortlistPreview() {
  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      {[
        { name: "Chicken Burger", price: "৳260" },
        { name: "Cold Coffee", price: "৳180" },
        { name: "Thai Fried Chicken", price: "৳280" },
      ].map((item) => (
        <div key={item.name} className="flex items-center justify-between rounded-xl border border-line bg-white px-2.5 py-1.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-emerald-500 text-white">
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className="text-[11px] font-bold text-ink">{item.name}</span>
          </div>
          <span className="text-[10px] font-bold text-accent-deep">{item.price}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 7. Export Preview
 */
function ExportPreview() {
  return (
    <div className="grid grid-cols-2 gap-2" aria-hidden="true">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-2.5 shadow-2xs hover:border-accent/40">
        <FileText className="h-5 w-5 text-accent shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-ink">PDF</p>
          <p className="text-[9px] text-muted">Print Menu</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-2.5 shadow-2xs hover:border-emerald-400">
        <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-ink">XLSX</p>
          <p className="text-[9px] text-muted">Spreadsheet</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 8. Multiple Menus Preview
 */
function MultiplePreview() {
  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      {[
        { name: "Café Nodi Project", dot: "bg-rose-400", active: true },
        { name: "Burger Bari Project", dot: "bg-amber-400", active: false },
      ].map((p) => (
        <div key={p.name} className="flex items-center justify-between rounded-xl border border-line bg-white px-2.5 py-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-sm", p.dot)} />
            <span className="text-[11px] font-bold text-ink">{p.name}</span>
          </div>
          {p.active && (
            <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-extrabold text-accent-deep">
              Active
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bento Grid Section Component — 12-Column Balanced Architecture      */
/* ------------------------------------------------------------------ */

export function FeatureBento() {
  return (
    <section id="features" className="section-pad bg-cream/50 relative overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="Toolkit"
          title="Menu Planning-এর প্রয়োজনীয় Tools এক জায়গায়।"
          description="Research, compare, shortlist, build and export — the whole workflow, not a pile of disconnected tools."
        />

        {/* 12-Column Symmetrical Bento Grid (Every row aligns with 100% precision) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 text-left items-stretch">
          
          {/* ================= ROW 1 (12 Columns: 7 + 5) ================= */}
          {/* 1. Large Card: 500+ Menu References (Span 7) */}
          <Reveal className="md:col-span-12 lg:col-span-7 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  500+ Menu References
                </h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Restaurant-wise browsing across Bangladesh — categories, items and price references in one organized library.
                </p>
              </div>

              <div className="relative z-10 mt-5 flex-1 rounded-2xl border border-line/80 bg-cream/50 p-3.5 flex flex-col">
                <DatabasePreview />
              </div>
            </div>
          </Reveal>

          {/* 2. Medium Card: Smart Search (Span 5) */}
          <Reveal delay={80} className="md:col-span-12 lg:col-span-5 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  Smart Search
                </h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Find any food item across thousands of entries in seconds.
                </p>
              </div>

              <div className="relative z-10 mt-5 flex-1 rounded-2xl border border-line/80 bg-cream/50 p-3.5 flex flex-col">
                <SearchPreview />
              </div>
            </div>
          </Reveal>

          {/* ================= ROW 2 (12 Columns: 5 + 7) ================= */}
          {/* 3. Medium Card: Price Reference (Span 5) */}
          <Reveal delay={120} className="md:col-span-12 lg:col-span-5 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  Price Reference
                </h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  See listed price ranges for similar items before you decide.
                </p>
              </div>

              <div className="relative z-10 mt-5 flex-1 rounded-2xl border border-line/80 bg-cream/50 p-3.5 flex flex-col">
                <PricePreview />
              </div>
            </div>
          </Reveal>

          {/* 4. Large Card: Menu Builder (Span 7) */}
          <Reveal delay={160} className="md:col-span-12 lg:col-span-7 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  Menu Builder
                </h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Build, organize and export your complete menu from one workspace.
                </p>
              </div>

              <div className="relative z-10 mt-5 flex-1 rounded-2xl border border-line/80 bg-cream/50 p-3.5 flex flex-col">
                <BuilderPreview />
              </div>
            </div>
          </Reveal>

          {/* ================= ROW 3 (12 Columns: 3 + 3 + 3 + 3) ================= */}
          {/* 5. Small Card: Custom Categories (Span 3) */}
          <Reveal delay={180} className="md:col-span-6 lg:col-span-3 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
              <div>
                <h4 className="text-base font-extrabold text-ink">Custom Categories</h4>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">
                  Structure your menu the way your business needs.
                </p>
              </div>
              <div className="mt-4 flex-1 rounded-xl border border-line bg-cream/50 p-2.5 flex items-center">
                <CategoriesPreview />
              </div>
            </div>
          </Reveal>

          {/* 6. Small Card: Item Shortlist (Span 3) */}
          <Reveal delay={200} className="md:col-span-6 lg:col-span-3 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
              <div>
                <h4 className="text-base font-extrabold text-ink">Item Shortlist</h4>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">
                  Save candidate items while you research.
                </p>
              </div>
              <div className="mt-4 flex-1 rounded-xl border border-line bg-cream/50 p-2.5 flex items-center">
                <div className="w-full">
                  <ShortlistPreview />
                </div>
              </div>
            </div>
          </Reveal>

          {/* 7. Small Card: PDF & Excel Export (Span 3) */}
          <Reveal delay={220} className="md:col-span-6 lg:col-span-3 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
              <div>
                <h4 className="text-base font-extrabold text-ink">PDF / Excel Export</h4>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">
                  Export your menu depending on your plan.
                </p>
              </div>
              <div className="mt-4 flex-1 rounded-xl border border-line bg-cream/50 p-2.5 flex items-center">
                <div className="w-full">
                  <ExportPreview />
                </div>
              </div>
            </div>
          </Reveal>

          {/* 8. Small Card: Multiple Menus (Span 3) */}
          <Reveal delay={240} className="md:col-span-6 lg:col-span-3 flex flex-col">
            <div className="group relative flex flex-col h-full rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
              <div>
                <h4 className="text-base font-extrabold text-ink">Multiple Menus</h4>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">
                  Keep separate projects for each restaurant.
                </p>
              </div>
              <div className="mt-4 flex-1 rounded-xl border border-line bg-cream/50 p-2.5 flex items-center">
                <div className="w-full">
                  <MultiplePreview />
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </Container>
    </section>
  );
}