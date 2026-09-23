"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  ShieldCheck,
  Mail,
  Headphones,
  ArrowRight,
  Sparkles,
  Tag,
} from "lucide-react";
import { PlanTier, BillingPeriod } from "@/lib/menusnap-types";
import { trackEvent } from "@/lib/analytics";
import { ThreeDTiltCard } from "@/components/landing/three-d-tilt-card";

interface PricingSectionProps {
  onSelectPlan: (plan: PlanTier, duration: BillingPeriod, coupon?: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("3_months");
  const [couponApplied, setCouponApplied] = useState(true);

  const handlePeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
    trackEvent("billing_period_changed", { period });
  };

  const starterFeatures = [
    "3,000+ Menu Database Access",
    "Restaurant & Cuisine Browse",
    "Food Item Search",
    "Category-wise Exploration",
    "Standard Price Reference",
    "Basic Menu Builder (1 Project)",
    "Cloud Menu Save",
  ];

  const proFeatures = [
    "Everything in Starter",
    "Advanced Item & Competitor Research",
    "Market Price Spread Comparison",
    "Unlimited Menu Building Projects",
    "Item Shortlist & Favorites",
    "Custom Category Organization",
    "Custom Pricing & Portion Weights",
    "Rich Description Editing",
    "Print-Ready PDF & Clean Excel Export",
  ];

  const agencyFeatures = [
    "Everything in Pro",
    "Multiple Restaurant Projects",
    "Client-wise Menu Workspaces",
    "Agency Multi-user Access",
    "Higher Export & Query Limits",
    "Direct Onboarding & Priority Support",
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF8] relative overflow-hidden">
      {/* Background glow for Pro card accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF5A36]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto text-center relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          Simple Pricing
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4">
          আপনার Business-এর জন্য সঠিক Plan বেছে নিন।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-xl mx-auto mb-10">
          Choose a plan that fits your restaurant scale. Transparent pricing with zero hidden commissions.
        </p>

        {/* Billing Period Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-gray-200 shadow-sm mb-12 sm:mb-16">
          <button
            type="button"
            onClick={() => handlePeriodChange("1_month")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              billingPeriod === "1_month"
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-950"
            }`}
          >
            1 Month
          </button>

          <button
            type="button"
            onClick={() => handlePeriodChange("3_months")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingPeriod === "3_months"
                ? "bg-gray-950 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-950"
            }`}
          >
            <span>3 Months</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF5A36] text-white">
              SAVE MORE
            </span>
          </button>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch text-left max-w-6xl mx-auto mb-14">
          
          {/* 1. STARTER PLAN */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-200/90 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-gray-950">Starter</h3>
                <p className="text-xs text-gray-500 mt-1">
                  For solo entrepreneurs exploring initial restaurant ideas.
                </p>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    ৳{billingPeriod === "1_month" ? "499" : "1,299"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    / {billingPeriod === "1_month" ? "month" : "3 months"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Features Included:
                </p>
                {starterFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                trackEvent("plan_selected", { plan: "starter", billingPeriod });
                onSelectPlan("starter", billingPeriod);
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-900 text-gray-950 font-bold text-xs hover:bg-gray-900 hover:text-white transition-all text-center"
            >
              Start with Starter
            </button>
          </div>

          {/* 2. PRO PLAN (VISUALLY DOMINANT WITH 3D TILT) */}
          <ThreeDTiltCard depth={8} className="h-full">
            <div className="bg-[#111111] text-white rounded-3xl p-7 sm:p-8 border-2 border-[#FF5A36] shadow-2xl shadow-orange-500/10 flex flex-col justify-between relative transform lg:-translate-y-2 h-full">
              {/* Top Most Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5A36] text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md z-30">
                Most Popular Choice
              </div>

              <div>
                <div className="mb-4 mt-2">
                  <h3 className="text-2xl font-extrabold text-white">Pro</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete menu research, market pricing & unlimited menu exports.
                  </p>
                </div>

                {/* Price & Coupon Promotion Box */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  {billingPeriod === "3_months" ? (
                    <div>
                      {/* Launch Offer Banner */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF5A36]/20 border border-[#FF5A36]/40 text-[#FF5A36] text-[11px] font-bold mb-2">
                        <Tag className="w-3 h-3" />
                        <span>LAUNCH OFFER: MENUSNAP500</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-400 line-through">
                          ৳1,999
                        </span>
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          ৳1,499
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">
                          (Save ৳500)
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium block mt-0.5">
                        Billed quarterly (effectively ৳499/mo)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          ৳999
                        </span>
                        <span className="text-xs text-gray-400 font-medium">/ 1 month</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                    Everything in Starter, Plus:
                  </p>
                  {proFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-xs text-gray-200">
                      <Check className="w-4 h-4 text-[#FF5A36] flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  trackEvent("plan_selected", {
                    plan: "pro",
                    billingPeriod,
                    coupon: billingPeriod === "3_months" ? "MENUSNAP500" : undefined,
                  });
                  onSelectPlan(
                    "pro",
                    billingPeriod,
                    billingPeriod === "3_months" ? "MENUSNAP500" : undefined
                  );
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FF5A36] hover:bg-[#e64c29] text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Get MenuSnap Pro</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </ThreeDTiltCard>

          {/* 3. AGENCY PLAN */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-200/90 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-gray-950">Agency</h3>
                <p className="text-xs text-gray-500 mt-1">
                  For consultants and agencies managing multiple restaurant brands.
                </p>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    ৳{billingPeriod === "1_month" ? "2,499" : "4,999"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    / {billingPeriod === "1_month" ? "month" : "3 months"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Agency Superpowers:
                </p>
                {agencyFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                trackEvent("plan_selected", { plan: "agency", billingPeriod });
                onSelectPlan("agency", billingPeriod);
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-900 text-gray-950 font-bold text-xs hover:bg-gray-900 hover:text-white transition-all text-center"
            >
              Choose Agency
            </button>
          </div>

        </div>

        {/* PRICING TRUST STRIP */}
        <div className="max-w-4xl mx-auto pt-6 border-t border-gray-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure bKash / Nagad / Card</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Fast Account Activation</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>Access Sent to Email</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
            <Headphones className="w-4 h-4 text-[#FF5A36]" />
            <span>Dedicated WhatsApp Support</span>
          </div>
        </div>

      </div>
    </section>
  );
}
