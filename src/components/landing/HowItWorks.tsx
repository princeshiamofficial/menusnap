"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { HOW_STEPS, HOW_WORKFLOW } from "@/lib/data";
import { Button, Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { ArrowRightIcon, CheckIcon, GripIcon, PlusIcon } from "@/components/landing/icons";

/* Mini previews for each step */
function ExplorePreview() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">Café</span>
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-muted">Fast Food</span>
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-muted">Chinese</span>
      </div>
      {["Café Nodi", "Burger Bari", "Golden Dragon"].map((name, i) => (
        <div key={name} className="flex items-center gap-2.5 rounded-lg border border-line bg-white px-3 py-2">
          <span className={cn("h-6 w-6 rounded-md", ["bg-amber-100", "bg-accent-soft", "bg-red-100"][i])} />
          <span className="text-xs font-semibold text-ink">{name}</span>
          <span className="ml-auto text-[10px] font-medium text-muted">{[86, 42, 118][i]} items</span>
        </div>
      ))}
    </div>
  );
}

function PickPreview() {
  const [selected, setSelected] = useState<string[]>([
    "Chicken Burger",
    "Cold Coffee",
    "Chicken Pasta",
  ]);
  const items = [
    { name: "Chicken Burger", price: 280 },
    { name: "Cold Coffee", price: 180 },
    { name: "Chicken Pasta", price: 350 },
  ];
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {items.map((item) => {
        const active = selected.includes(item.name);
        return (
          <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-line bg-white px-3 py-2">
            <span className="text-xs font-semibold text-ink">{item.name}</span>
            <span className="text-[11px] font-bold text-accent-deep">৳{item.price}</span>
            <button
              type="button"
              tabIndex={-1}
              onClick={() =>
                setSelected((prev) =>
                  active ? prev.filter((n) => n !== item.name) : [...prev, item.name],
                )
              }
              className={cn(
                "ml-auto flex h-6 items-center gap-1 rounded-md px-2.5 text-[10px] font-bold transition-all cursor-pointer",
                active ? "bg-success text-white shadow-2xs" : "bg-accent-soft text-accent-deep hover:bg-accent hover:text-white",
              )}
            >
              {active ? <CheckIcon className="h-3 w-3" /> : <PlusIcon className="h-3 w-3" />}
              {active ? "Added" : "Add"}
            </button>
          </div>
        );
      })}
      <p className="text-center text-[11px] font-bold text-success">
        {selected.length} {selected.length === 1 ? "item" : "items"} selected
      </p>
    </div>
  );
}

function BuildPreview() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {[
        { name: "Classic Chicken Burger", price: 280 },
        { name: "BBQ Chicken Burger", price: 320 },
      ].map((item, i) => (
        <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-line bg-white px-3 py-2">
          <GripIcon className="h-3.5 w-3.5 text-muted/50" />
          <span className="text-xs font-semibold text-ink">{item.name}</span>
          <span className="ml-auto text-[11px] font-bold text-accent-deep">৳{item.price}</span>
          <span className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-accent" : "bg-line")} />
        </div>
      ))}
      <div className="rounded-lg border border-dashed border-line px-3 py-2 text-center text-[11px] font-semibold text-muted">
        + Drag to reorder
      </div>
    </div>
  );
}

const PREVIEWS = [ExplorePreview, PickPreview, BuildPreview];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad bg-surface">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="3 Steps-এ নিজের Menu Plan করুন।"
          description="Explore references, pick what fits your business, then build a complete menu — all inside one workspace."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {HOW_STEPS.map((step, i) => {
            const Preview = PREVIEWS[i];
            return (
              <Reveal key={step.number} delay={i * 110}>
                <article className="group flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex items-start justify-between">
                    <span className="text-5xl font-extrabold tracking-tight text-ink/10 transition-colors group-hover:text-accent/25">
                      {step.number}
                    </span>
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-deep">
                      {step.kicker}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.desc}</p>
                  <div className="mt-5 border-t border-line pt-5">
                    <Preview />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom workflow */}
        <Reveal className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-3">
            {HOW_WORKFLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-bold",
                    i === HOW_WORKFLOW.length - 1
                      ? "bg-accent text-white shadow-pop"
                      : "border border-line bg-white text-ink shadow-card",
                  )}
                >
                  {step}
                </span>
                {i < HOW_WORKFLOW.length - 1 && (
                  <ArrowRightIcon className="h-4 w-4 text-muted/50" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="#pricing" size="lg" withArrow>
              Start Building My Menu
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}