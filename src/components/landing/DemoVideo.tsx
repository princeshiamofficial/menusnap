"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_TOUR_VIDEO_URL, DEMO_WORKFLOW } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { Button, Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { ArrowRightIcon } from "@/components/landing/icons";

export function DemoVideo() {
  const [started, setStarted] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (started || !DEMO_TOUR_VIDEO_URL) return;
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          trackEvent("demoStarted", { source: "demo_section" });
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  return (
    <section id="demo" className="relative overflow-hidden bg-night text-white">
      <div className="bg-grid-dark absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(255 90 54 / 0.18), transparent)" }}
        aria-hidden="true"
      />

      <Container className="section-pad relative">
        <SectionHeading
          dark
          eyebrow="See MenuSnap in Action"
          title="Research থেকে Ready Menu — দেখুন কীভাবে।"
          description="Two minutes is all you need to understand how MenuSnap turns scattered research into an organized, buildable menu."
        />

        {/* Video container */}
        <Reveal className="mt-12">
          <div
            ref={frameRef}
            className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02]"
          >
            {/* Dashboard thumbnail (CSS-only) */}
            <div className="absolute inset-6 flex flex-col gap-3 opacity-30 sm:inset-10">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white/40" />
                <span className="h-3 w-3 rounded-full bg-white/40" />
                <span className="h-3 w-3 rounded-full bg-white/40" />
                <span className="ml-auto h-6 w-44 rounded-md bg-white/15" />
              </div>
              <div className="mt-3 flex gap-2">
                <span className="h-7 w-24 rounded-lg bg-accent/50" />
                <span className="h-7 w-24 rounded-lg bg-white/15" />
                <span className="h-7 w-24 rounded-lg bg-white/15" />
              </div>
              <div className="mt-2 grid flex-1 gap-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.07] px-4 py-3">
                    <span className="h-7 w-7 rounded-md bg-white/20" />
                    <span className="h-2.5 w-1/3 rounded bg-white/25" />
                    <span className="ml-auto h-2.5 w-12 rounded bg-accent/50" />
                  </div>
                ))}
              </div>
            </div>

            {started && (
              <video
                src={DEMO_TOUR_VIDEO_URL}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                playsInline
                controls
                preload="auto"
                onEnded={() => trackEvent("demoCompleted")}
                title="MenuSnap product tour video"
              />
            )}

            {!started && (
              <span className="absolute bottom-4 left-4 rounded-full bg-night/70 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur">
                2-Min Product Tour
              </span>
            )}
          </div>
        </Reveal>

        {/* Workflow */}
        <Reveal className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3" aria-label="MenuSnap workflow">
            {DEMO_WORKFLOW.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={
                    i === DEMO_WORKFLOW.length - 1
                      ? "rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-bold text-white"
                      : "rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-white/80"
                  }
                >
                  {step}
                </span>
                {i < DEMO_WORKFLOW.length - 1 && (
                  <ArrowRightIcon className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <Button href="#pricing" size="lg" withArrow>
            Start Building My Menu
          </Button>
        </div>
      </Container>
    </section>
  );
}