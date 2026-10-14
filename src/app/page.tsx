"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { DemoVideo } from "@/components/landing/DemoVideo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RestaurantExplorer } from "@/components/landing/RestaurantExplorer";
import { SmartSearch } from "@/components/landing/SmartSearch";
import { PriceComparison } from "@/components/landing/PriceComparison";
import { MenuBuilderPreview } from "@/components/landing/MenuBuilderPreview";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { Benefits } from "@/components/landing/Benefits";
import { Audience } from "@/components/landing/Audience";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Pricing } from "@/components/landing/Pricing";
import { PurchaseFlow } from "@/components/landing/PurchaseFlow";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { CheckoutModal } from "@/components/landing/checkout-modal";
import { FAQS } from "@/lib/data";
import type { PlanTier, BillingPeriod } from "@/lib/menusnap-types";

export default function HomePage() {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("pro");
  const [selectedDuration, setSelectedDuration] = useState<BillingPeriod>("lifetime");
  const [activeCoupon, setActiveCoupon] = useState<string | undefined>(undefined);

  const handleOpenCheckout = (
    plan: PlanTier,
    duration: BillingPeriod = "lifetime",
    coupon?: string
  ) => {
    setSelectedPlan(plan);
    setSelectedDuration(duration);
    setActiveCoupon(coupon);
    setCheckoutModalOpen(true);
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MenuSnap",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Restaurant menu research and menu builder for Bangladesh. Explore 500+ restaurant and parlor menu references, research food items and price references, and build your own restaurant menu.",
    offers: [
      { "@type": "Offer", name: "Starter", price: "499", priceCurrency: "BDT" },
      { "@type": "Offer", name: "Pro", price: "1499", priceCurrency: "BDT" },
      { "@type": "Offer", name: "Agency", price: "4999", priceCurrency: "BDT" },
    ],
    inLanguage: ["bn", "en"],
    publisher: { "@type": "Organization", name: "MenuSnap" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Stats />
        <ProblemSection />
        <DemoVideo />
        <HowItWorks />
        <RestaurantExplorer />
        <SmartSearch />
        <PriceComparison />
        <MenuBuilderPreview />
        <FeatureBento />
        <Benefits />
        <Audience />
        <BeforeAfter />
        <Pricing onSelectPlan={handleOpenCheckout} />
        <PurchaseFlow />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />

      {/* Interactive PayStation Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => {
          setCheckoutModalOpen(false);
          setActiveCoupon(undefined);
        }}
        plan={selectedPlan}
        duration={selectedDuration}
        coupon={activeCoupon}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
