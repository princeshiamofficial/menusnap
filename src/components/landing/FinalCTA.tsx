"use client";

import { trackEvent } from "@/lib/analytics";
import { Button, Container } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { PlayIcon } from "@/components/landing/icons";

export function FinalCTA() {
  return (
    <section id="final-cta" className="section-pad bg-surface">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-night px-6 py-16 text-center text-white sm:px-12 sm:py-20 lg:py-24">
            <div className="bg-grid-dark absolute inset-0" aria-hidden="true" />
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
              style={{ background: "radial-gradient(closest-side, rgb(255 90 54 / 0.25), transparent)" }}
              aria-hidden="true"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent">
                Your Menu Starts Here
              </span>
              <h2 className="mt-6 text-balance text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.1] tracking-tight">
                Next Restaurant Menu শূন্য থেকে শুরু করবেন না।
              </h2>
              <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-white/60 sm:text-lg">
                500+ Menu References explore করুন এবং নিজের Restaurant-এর Menu আরও দ্রুত
                plan করুন।
              </p>

              <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                <Button
                  href="#pricing"
                  size="lg"
                  withArrow
                  className="w-full sm:w-auto"
                  onClick={() => trackEvent("finalCtaClicked", { cta: "start_building" })}
                >
                  Start Building My Menu
                </Button>
                <Button href="#demo" variant="dark-ghost" size="lg" className="w-full sm:w-auto">
                  <PlayIcon className="h-4 w-4 text-accent" />
                  Watch Demo
                </Button>
              </div>

              <p className="mt-8 text-sm font-semibold text-white/50">
                500+ References <span className="mx-1.5 text-accent">•</span> Thousands of Items
                <span className="mx-1.5 text-accent">•</span> One Menu Builder
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}