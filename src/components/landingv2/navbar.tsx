"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useClientAuth } from "@/hooks/use-client-auth";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const { isClientLoggedIn, clientLoading } = useClientAuth();

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined' && document.cookie.includes('admin_session=')) {
      setIsAdminLoggedIn(true);
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loggedIn = mounted && !clientLoading && (isClientLoggedIn || isAdminLoggedIn);
  const dashboardHref = isClientLoggedIn ? "/dashboard" : "/m-admin";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center group select-none cursor-pointer"
        >
          <Image
            src="/menusnap-logo-white.png"
            alt="MenuSnap Logo"
            width={160}
            height={36}
            priority
            className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            style={{ filter: "url(#menusnap-white-to-black)" }}
          />
        </Link>

        {/* Center Nav Items (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 bg-white/80 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-5 py-2 rounded-full backdrop-blur-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13.5px] lg:text-[14px] font-medium text-gray-600 hover:text-gray-950 transition-colors cursor-pointer select-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA / Login (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!loggedIn && (
            <Link
              href="/login"
              className="text-[14px] font-medium text-gray-700 hover:text-gray-950 transition-colors px-3 py-1.5 cursor-pointer select-none"
            >
              Login
            </Link>
          )}
          {loggedIn ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-1.5 bg-[#FF5A36] hover:bg-[#e84d2a] text-white text-[13.5px] font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="#pricing"
              onClick={() => trackEvent("hero_cta_clicked", { source: "navbar" })}
              className="inline-flex items-center gap-1.5 bg-[#FF5A36] hover:bg-[#e84d2a] text-white text-[13.5px] font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Get MenuSnap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:text-gray-950 hover:bg-gray-100/80 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden bg-white border-b border-gray-200 px-5 pt-3 pb-6 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 flex flex-col gap-2.5">
              {!loggedIn && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-[14.5px] font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Login
                </Link>
              )}
              {loggedIn ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] text-white text-[14px] font-semibold py-3 rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="#pricing"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    trackEvent("hero_cta_clicked", { source: "mobile_navbar" });
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] text-white text-[14px] font-semibold py-3 rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  <span>Get MenuSnap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG filter converting white text in logo to dark while preserving orange accent */}
      <svg xmlns="http://www.w3.org/2000/svg" className="hidden" aria-hidden="true">
        <defs>
          <filter id="menusnap-white-to-black">
            <feColorMatrix
              type="matrix"
              values="1 -1 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </header>
  );
}
