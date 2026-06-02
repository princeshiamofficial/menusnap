"use client";

import { useState, useEffect, MouseEvent } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function FreeDesignNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks: { label: string; href: string; isExternal?: boolean }[] = [
    { label: "Partners", href: "#happy-clients" },
    { label: "Reviews", href: "#client-reviews" },
    { label: "Pricing", href: "#features" },
    { label: "Coverage", href: "#coverage" },
    { label: "Stats", href: "#quantity-info" },
    { label: "Booking", href: "#booking-calendar" }
  ];

  const [activeSection, setActiveSection] = useState<string>("");

  const handleScrollClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      const id = href.substring(1);
      setActiveSection(id); // Set the clicked section as active
      window.history.pushState(null, "", href); // Update URL hash on click
      const element = document.getElementById(id);
      if (element) {
        const topOffset = 90; // offset height under sticky header
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - topOffset,
          behavior: "smooth"
        });
      }
    }
  };

  // Smooth scroll with offset for direct hash loads and hash change events
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        setActiveSection(id); // Set the hash section as active on direct link load / hashchange
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            const topOffset = 90; // offset height under sticky header
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: elementPosition - topOffset,
              behavior: "smooth"
            });
          }, 150);
        }
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-[100] w-full font-bengali md:px-6">
      <header 
        className="max-w-7xl mx-auto w-full bg-white/90 backdrop-blur-md border-b border-slate-200/50 md:border md:rounded-b-xl shadow-lg py-3 px-4 md:px-10 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/free-design" className="flex items-center gap-2 group">
            <div className="transition-transform group-hover:scale-105 flex items-center justify-center">
              <img 
                src="/menusnap-logo-white.png" 
                alt="MenuSnap Logo" 
                className="h-8 w-auto object-contain"
                style={{ filter: "url(#white-to-black)" }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, idx) => {
              const isActive = link.href === `#${activeSection}`;
              return link.isExternal ? (
                <Link 
                  key={idx}
                  href={link.href}
                  className={`font-semibold text-sm transition-colors flex items-center gap-1.5 ${
                    isActive ? "text-[#F07C22] font-bold" : "text-[#666666] hover:text-[#F07C22]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {link.label}
                </Link>
              ) : (
                <a 
                  key={idx}
                  href={link.href}
                  onClick={(e) => handleScrollClick(e, link.href)}
                  className={`font-semibold text-sm transition-colors ${
                    isActive ? "text-[#F07C22] font-bold" : "text-[#666666] hover:text-[#F07C22]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a href="#booking-calendar" onClick={(e) => handleScrollClick(e, "#booking-calendar")}>
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
                {navLinks.map((link, idx) => {
                  const isActive = link.href === `#${activeSection}`;
                  return link.isExternal ? (
                    <Link 
                      key={idx}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`font-semibold text-base transition-colors flex items-center gap-2 ${
                        isActive ? "text-[#F07C22] font-bold" : "text-[#666666] hover:text-[#F07C22]"
                      }`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ) : (
                    <a 
                      key={idx}
                      href={link.href}
                      onClick={(e) => {
                        setIsOpen(false);
                        handleScrollClick(e, link.href);
                      }}
                      className={`font-semibold text-base transition-colors ${
                        isActive ? "text-[#F07C22] font-bold" : "text-[#666666] hover:text-[#F07C22]"
                      }`}
                    >
                      {link.label}
                    </a>
                  );
                })}
                <a 
                  href="#booking-calendar" 
                  onClick={(e) => {
                    setIsOpen(false);
                    handleScrollClick(e, "#booking-calendar");
                  }} 
                  className="w-full"
                >
                  <Button className="w-full bg-[#F07C22] hover:bg-[#D96B19] text-white py-6 rounded-xl font-bold text-base shadow-sm">
                    Book Slot
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SVG Filter to change logo white text to black while keeping red intact */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <defs>
          <filter id="white-to-black">
            <feColorMatrix 
              type="matrix" 
              values="1 -1 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
