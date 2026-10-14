"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { FAQS } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { ChevronDownIcon, MailIcon } from "@/components/landing/icons";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad bg-surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left — heading + support */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title="প্রশ্ন থাকলে এখানে দেখে নিন।"
              description="Everything you need to know about MenuSnap, the database, pricing and your data."
            />
            <div className="mt-8 rounded-3xl border border-line bg-cream p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
                <MailIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-extrabold text-ink">Still have questions?</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Write to us — we reply fast.
              </p>
              <a
                href="mailto:support@menusnap.app"
                className="mt-3 inline-block text-sm font-bold text-accent-deep hover:text-accent"
              >
                support@menusnap.app
              </a>
            </div>
          </div>

          {/* Right — accordion */}
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => {
              const open = openIndex === i;
              return (
                <Reveal key={faq.q} delay={i * 60}>
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                      open ? "border-accent/30 shadow-card" : "border-line shadow-card",
                    )}
                  >
                    <h3>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenIndex(open ? null : i);
                          if (!open) trackEvent("faqOpened", { question: faq.q });
                        }}
                        aria-expanded={open}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-button-${i}`}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left sm:px-6 sm:py-5"
                      >
                        <span className="text-[15px] font-bold text-ink sm:text-base">{faq.q}</span>
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                            open
                              ? "rotate-180 border-accent bg-accent text-white"
                              : "border-line bg-cream text-muted",
                          )}
                          aria-hidden="true"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="border-t border-line px-5 py-4 text-[15px] leading-relaxed text-muted sm:px-6 sm:py-5">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}