"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics";

/**
 * Sticky mobile purchase bar. Appears after the visitor scrolls past the
 * hero and hides while the footer is on screen so it never covers footer
 * links or the final CTA.
 */
export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home");
    const footer = document.querySelector("footer");
    if (!hero || !footer) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    const footerObserver = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    heroObserver.observe(hero);
    footerObserver.observe(footer);
    return () => {
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const show = visible && !footerVisible;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-300 lg:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!show}
    >
      <a
        href="#pricing"
        onClick={() => trackEvent("mobileCtaClicked")}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-[15px] font-bold text-white shadow-pop transition-colors hover:bg-accent-deep"
      >
        Get Lifetime Deal — From ৳199
      </a>
    </div>
  );
}