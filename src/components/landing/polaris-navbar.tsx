"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "#" },
  { name: "Product", href: "#" },
  { name: "Solutions", href: "#" },
  { name: "Developers", href: "#" },
  { name: "Pricing", href: "#" },
];

export function PolarisNavbar() {
  const [activeItem, setActiveItem] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full pt-4 sm:pt-6 px-4 sm:px-6 md:px-8">
      <div className="max-w-[1180px] mx-auto bg-white rounded-2xl sm:rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/80 px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center group select-none cursor-pointer"
        >
          <Image
            src="/menusnap-logo-white.png"
            alt="MenuSnap"
            width={155}
            height={32}
            priority
            className="h-6 sm:h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            style={{ filter: "url(#polaris-white-to-black)" }}
          />
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-9">
          {navItems.map((item) => {
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveItem(item.name)}
                className={`relative text-[14px] lg:text-[14.5px] font-medium transition-colors duration-150 py-1 cursor-pointer select-none ${
                  isActive
                    ? "text-gray-950 font-semibold"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="polaris-nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gray-950 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-5 lg:gap-6">
          <Link
            href="/login"
            className="text-[14px] lg:text-[14.5px] font-medium text-gray-800 hover:text-gray-950 transition-colors cursor-pointer select-none"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-[#0c0d12] hover:bg-black text-white text-[13.5px] lg:text-[14px] font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-700 hover:text-gray-950 hover:bg-gray-100/70 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden max-w-[1180px] mx-auto mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 space-y-4"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = activeItem === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setActiveItem(item.name);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100/80 text-gray-950 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-950" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-[14.5px] font-medium text-gray-800 hover:text-gray-950 transition-colors rounded-lg hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#0c0d12] hover:bg-black text-white text-[14px] font-medium py-2.5 rounded-xl shadow-sm transition-all"
              >
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* SVG Filter to adapt white logo text for light navbar background */}
      <svg xmlns="http://www.w3.org/2000/svg" className="hidden" aria-hidden="true">
        <defs>
          <filter id="polaris-white-to-black">
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
    </nav>
  );
}
