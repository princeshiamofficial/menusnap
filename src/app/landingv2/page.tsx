"use client";

import React from "react";
import { Navbar } from "@/components/landingv2/navbar";
import { HeroSection } from "@/components/landingv2/hero-section";
import { StatsStrip } from "@/components/landingv2/stats-strip";
import { HowItWorksSection } from "@/components/landingv2/how-it-works-section";
import { Pricing } from "@/components/landing/Pricing";
import { FAQSection } from "@/components/landingv2/faq-section";
import { FinalCTASection } from "@/components/landingv2/final-cta-section";
import { Footer } from "@/components/landingv2/footer";
import { StickyMobileCTA } from "@/components/landingv2/sticky-mobile-cta";

export default function LandingV2Page() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#FF5A36]/15 selection:text-[#FF5A36] overflow-x-clip">
      {/* Premium Sticky Navigation */}
      <Navbar />

      <main>
        {/* 1. Hero Section with 3D Interactive Dashboard Mockup */}
        <HeroSection />

        {/* 2. Fast Proof Metrics Strip */}
        <StatsStrip />

        {/* 3. 3-Step Guided Workflow */}
        <HowItWorksSection />

        {/* 4. Interactive Pricing Table (Identical to default) */}
        <Pricing />

        {/* 5. Accessible FAQ Accordion */}
        <FAQSection />

        {/* 6. Final High-Converting Closing CTA */}
        <FinalCTASection />
      </main>

      {/* Clean SaaS Footer */}
      <Footer />

      {/* Sticky Bottom Bar for Mobile Visitors */}
      <StickyMobileCTA />
    </div>
  );
}
