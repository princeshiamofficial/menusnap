"use client";

import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function FreeDesignNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "ড্যাশবোর্ড", href: "/dashboard/", isExternal: true },
    { label: "ঝুঁকি ও বৈশিষ্ট্য", href: "#features" },
    { label: "সার্ভিসসমূহ", href: "#services" },
    { label: "ক্লায়েন্ট রিভিউ", href: "#testimonials" }
  ];

  return (
    <div className="sticky top-0 z-[100] w-full px-4 md:px-6 pointer-events-none font-bengali">
      <header 
        className="max-w-7xl mx-auto w-full bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-b-2xl md:rounded-b-[2rem] shadow-lg py-3 px-6 md:px-10 transition-all duration-300 pointer-events-auto"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard/" className="flex items-center gap-2 group">
            <div className="bg-black px-4 py-2 rounded-xl transition-transform group-hover:scale-105 flex items-center justify-center">
              <img 
                src="/menusnap-logo-white.png" 
                alt="MenuSnap Logo" 
                className="h-6 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, idx) => (
              link.isExternal ? (
                <Link 
                  key={idx}
                  href={link.href}
                  className="text-[#666666] hover:text-[#F07C22] font-semibold text-sm transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {link.label}
                </Link>
              ) : (
                <a 
                  key={idx}
                  href={link.href}
                  className="text-[#666666] hover:text-[#F07C22] font-semibold text-sm transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a href="#booking-form">
              <Button className="bg-[#F07C22] hover:bg-[#D96B19] text-white px-6 py-5 rounded-full font-bold text-sm shadow-sm transition-all active:scale-95">
                Book Slot
              </Button>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#1A1A1A] hover:text-[#F07C22] transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden w-full overflow-hidden mt-3 border-t border-slate-100"
            >
              <div className="py-4 flex flex-col gap-4">
                {navLinks.map((link, idx) => (
                  link.isExternal ? (
                    <Link 
                      key={idx}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-[#666666] hover:text-[#F07C22] font-semibold text-base transition-colors flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ) : (
                    <a 
                      key={idx}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-[#666666] hover:text-[#F07C22] font-semibold text-base transition-colors"
                    >
                      {link.label}
                    </a>
                  )
                ))}
                <a href="#booking-form" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full bg-[#F07C22] hover:bg-[#D96B19] text-white py-6 rounded-xl font-bold text-base shadow-sm">
                    Book Slot
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
