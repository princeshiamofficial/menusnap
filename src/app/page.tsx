"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsStrip } from "@/components/landing/stats-strip";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { DatabaseSection } from "@/components/landing/database-section";
import { FeatureBentoSection } from "@/components/landing/feature-bento-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTASection } from "@/components/landing/final-cta-section";
import { Footer } from "@/components/landing/footer";
import { DemoModal } from "@/components/landing/demo-modal";
import { CheckoutModal } from "@/components/landing/checkout-modal";
import { StickyMobileCTA } from "@/components/landing/sticky-mobile-cta";
import { PlanTier, BillingPeriod } from "@/lib/menusnap-types";

export default function HomePage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("pro");
  const [selectedDuration, setSelectedDuration] = useState<BillingPeriod>("3_months");
  const [activeCoupon, setActiveCoupon] = useState<string | undefined>("MENUSNAP500");

  const handleOpenCheckout = (
    plan: PlanTier,
    duration: BillingPeriod,
    coupon?: string
  ) => {
    setSelectedPlan(plan);
    setSelectedDuration(duration);
    setActiveCoupon(coupon);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#FF5A36]/15 selection:text-[#FF5A36] overflow-x-clip">
      {/* Premium Sticky Navigation */}
      <Navbar />

      <main>
        {/* 1. Hero Section with 3D Interactive Dashboard Mockup */}
        <HeroSection onOpenDemo={() => setDemoModalOpen(true)} />

        {/* 2. Fast Proof Metrics Strip */}
        <StatsStrip />

        {/* 3. 3-Step Guided Workflow */}
        <HowItWorksSection />

        {/* 4. 3,000+ Menu Database & Interactive 3D Blueprint Stage */}
        <DatabaseSection />

        {/* 5. Modern Asymmetric Feature Bento Grid (Search, Pricing, Builder, Export) */}
        <FeatureBentoSection />

        {/* 6. Interactive Pricing Table with Launch Offer */}
        <PricingSection onSelectPlan={handleOpenCheckout} />

        {/* 7. Accessible FAQ Accordion */}
        <FAQSection />

        {/* 8. Final High-Converting Closing CTA */}
        <FinalCTASection onOpenDemo={() => setDemoModalOpen(true)} />
      </main>

      {/* Clean SaaS Footer */}
      <Footer />

      {/* Interactive Modals */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        plan={selectedPlan}
        duration={selectedDuration}
        coupon={activeCoupon}
      />

      {/* Sticky Bottom Bar for Mobile Visitors */}
      <StickyMobileCTA />
    </div>
  );
}
