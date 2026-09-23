"use client";

import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#111111] text-gray-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 mb-12">
          
          {/* Brand Info (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF5A36] flex items-center justify-center text-white font-black text-lg shadow-sm">
                M
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Menu<span className="text-[#FF5A36]">Snap</span>
              </span>
            </div>

            <p className="text-base font-bold text-gray-200">
              Research Less. Build Smarter.
            </p>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm font-sans">
              Restaurant Menu Research & Menu Builder SaaS platform designed primarily for food entrepreneurs, café owners, and restaurants across Bangladesh.
            </p>

            <div className="text-[11px] text-gray-500 pt-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Proudly built for Bangladesh&apos;s food industry.</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#product" className="hover:text-white transition-colors">
                  Explore 3,000+ Menus
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Menu Builder Studio
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <a href="https://wa.me/8801800000000" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Data Accuracy Disclaimer
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 MenuSnap. All rights reserved.</p>
          <p className="text-[11px]">
            Third-party menu references belong to their respective restaurants and are used for research and comparison purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
