import React from "react";
import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { Clock, Compass, Zap, Layers, type LucideIcon } from "lucide-react";

type BenefitItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  badgeStyle: string;
};

const BENEFITS_LIST: BenefitItem[] = [
  {
    icon: Clock,
    title: "Save Research Time",
    desc: "Stop searching Facebook pages, PDFs and screenshots one by one. Start from an organized reference library.",
    badgeStyle: "bg-amber-50 text-amber-600 border-amber-200/80 group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    icon: Compass,
    title: "Make Better Decisions",
    desc: "Use organized menu references when planning categories, items and price ranges.",
    badgeStyle: "bg-blue-50 text-blue-600 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    icon: Zap,
    title: "Build Faster",
    desc: "Move from research to a ready menu in one workflow — no scattered tools.",
    badgeStyle: "bg-accent-soft text-accent-deep border-accent/30 group-hover:bg-accent group-hover:text-white",
  },
  {
    icon: Layers,
    title: "Stay Organized",
    desc: "Replace scattered notes and spreadsheets with one clean workspace.",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="section-pad bg-surface">
      <Container>
        <SectionHeading
          eyebrow="Why MenuSnap"
          title="Database নয়। আপনার Menu Planning Shortcut."
          description="MenuSnap is not just a collection of menus — it's a workflow that takes you from blank page to buildable menu."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS_LIST.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <Reveal key={benefit.title} delay={i * 90}>
                <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-2xs transition-all duration-300 group-hover:scale-105 ${benefit.badgeStyle}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-extrabold tracking-tight text-ink transition-colors group-hover:text-accent-deep">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {benefit.desc}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}