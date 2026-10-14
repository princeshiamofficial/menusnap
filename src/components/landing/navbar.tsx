"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/data";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/landing/ui";
import { CloseIcon, MenuIcon } from "@/components/landing/icons";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-line/80 bg-white/85 shadow-[0_1px_0_rgb(17_17_17/0.02),0_8px_24px_-16px_rgb(17_17_17/0.16)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        className="container-site flex h-[68px] items-center justify-between gap-6"
        aria-label="Main navigation"
      >
        {/* Left — logo */}
        <a
          href="#home"
          className="rounded-lg"
          aria-label="MenuSnap — back to top"
        >
          <Logo />
        </a>

        {/* Center — desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[15px] font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right — actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="/login"
            className="rounded-lg px-3.5 py-2 text-[15px] font-semibold text-ink transition-colors hover:bg-ink/5"
          >
            Login
          </a>
          <Button href="#pricing" size="sm">
            Get MenuSnap
          </Button>
        </div>

        {/* Mobile — hamburger */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span
              className={cn(
                "absolute left-0 top-0 h-[2px] w-full rounded-full bg-current transition-all duration-300",
                open && "top-[7px] rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[7px] h-[2px] w-full rounded-full bg-current transition-all duration-300",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[14px] h-[2px] w-full rounded-full bg-current transition-all duration-300",
                open && "top-[7px] -rotate-45",
              )}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={cn(
          "grid overflow-hidden border-line/80 transition-[grid-template-rows] duration-300 lg:hidden",
          open ? "grid-rows-[1fr] border-t bg-white/95 backdrop-blur-xl" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          <div className="container-site flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-ink transition-colors hover:bg-ink/5"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-center text-base font-semibold text-ink"
              >
                Login
              </a>
              <Button href="#pricing" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Get MenuSnap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}