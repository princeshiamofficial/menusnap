"use client";

import React, { useState, useEffect } from "react";
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
  Star,
  Infinity as InfinityIcon,
  Lock
} from "lucide-react";
import { PlanTier, BillingPeriod, PricingPackage } from "@/lib/menusnap-types";
import { trackEvent } from "@/lib/analytics";
import { ThreeDTiltCard } from "@/components/landing/three-d-tilt-card";
import { getPublicPricingPackagesAction } from "@/app/actions/packages";
import { useClientAuth } from "@/hooks/use-client-auth";

interface PricingSectionProps {
  onSelectPlan: (plan: PlanTier, duration: BillingPeriod, coupon?: string) => void;
}

const FALLBACK_PACKAGES: PricingPackage[] = [
  {
    id: 1,
    package_id: "starter",
    name: "Starter",
    tagline: "For solo entrepreneurs exploring initial restaurant ideas.",
    badge_text: "Lifetime Access",
    price: 499,
    original_price: 999,
    billing_period_text: "Lifetime Access • Pay once, use forever",
    discount_tag: "",
    coupon_code: "",
    coupon_discount: 0,
    is_category_unlimited: false,
    category_limit: 5,
    is_item_unlimited: false,
    item_limit: 30,
    features: [
      "3,000+ Menu Database Access",
      "Restaurant & Cuisine Browse",
      "Food Item Search",
      "Category-wise Exploration",
      "Standard Price Reference",
      "Basic Menu Builder (1 Project)",
      "Cloud Menu Save",
      "Lifetime Blueprints & Future Updates",
    ],
    feature_highlight_title: "Features Included:",
    button_text: "Get Lifetime Starter",
    is_popular: false,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    package_id: "pro",
    name: "Pro",
    tagline: "Complete menu research, market pricing & unlimited menu exports.",
    badge_text: "Most Popular • Lifetime Deal",
    price: 1499,
    original_price: 2999,
    billing_period_text: "Lifetime Access • One-time payment",
    discount_tag: "LIFETIME DEAL: MENUSNAP500",
    coupon_code: "MENUSNAP500",
    coupon_discount: 500,
    is_category_unlimited: true,
    category_limit: 0,
    is_item_unlimited: true,
    item_limit: 0,
    features: [
      "Everything in Starter",
      "Advanced Item & Competitor Research",
      "Market Price Spread Comparison",
      "Unlimited Menu Building Projects",
      "Item Shortlist & Favorites",
      "Custom Pricing & Portion Weights",
      "Rich Description Editing",
      "Print-Ready PDF & Clean Excel Export",
      "Lifetime Priority Updates",
    ],
    feature_highlight_title: "Everything in Starter, Plus:",
    button_text: "Get Lifetime Pro",
    is_popular: true,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    package_id: "agency",
    name: "Agency",
    tagline: "For consultants and agencies managing multiple restaurant brands.",
    badge_text: "Full Team • Lifetime",
    price: 4999,
    original_price: 9999,
    billing_period_text: "Lifetime Team Access • One-time payment",
    discount_tag: "",
    coupon_code: "",
    coupon_discount: 0,
    is_category_unlimited: true,
    category_limit: 0,
    is_item_unlimited: true,
    item_limit: 0,
    features: [
      "Everything in Pro",
      "Multiple Restaurant Projects",
      "Client-wise Menu Workspaces",
      "Agency Multi-user Access",
      "Higher Export & Query Limits",
      "Direct Onboarding & Priority Support",
      "Lifetime Agency License",
    ],
    feature_highlight_title: "Everything in Pro, Plus:",
    button_text: "Get Lifetime Agency",
    is_popular: false,
    is_active: true,
    sort_order: 3,
  },
];

export function SwirlBrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.2 3.8C4.8 3.8 2 6.6 2 10C2 14.2 6.2 16.5 10.5 16.5C12.2 16.5 13 15.2 13 13C13 9.8 10.8 3.8 8.2 3.8Z" />
      <path d="M19.8 24.2C23.2 24.2 26 21.4 26 18C26 13.8 21.8 11.5 17.5 11.5C15.8 11.5 15 12.8 15 15C15 18.2 17.2 24.2 19.8 24.2Z" />
    </svg>
  );
}

export function CircleCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.8 8.2L6.8 10.2L11.2 5.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [packages, setPackages] = useState<PricingPackage[]>(FALLBACK_PACKAGES);
  const { clientUser, isClientLoggedIn, isSubscriber, currentPackage, isAdmin } = useClientAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getPublicPricingPackagesAction()
      .then((res) => {
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setPackages(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch public pricing packages:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const checkIsCurrentPlan = (pkg: PricingPackage) => {
    if (!mounted) return false;
    if (!isSubscriber && !isClientLoggedIn && !isAdmin) return false;

    const activePlan = (
      clientUser?.subscriptionPackage ||
      currentPackage ||
      (isAdmin ? "agency" : "")
    )
      .toLowerCase()
      .trim();

    if (!activePlan) return false;

    const pkgId = pkg.package_id.toLowerCase().trim();
    const pkgName = pkg.name.toLowerCase().trim();

    return (
      activePlan.includes(pkgId) ||
      activePlan.includes(pkgName) ||
      pkgId.includes(activePlan) ||
      pkgName.includes(activePlan)
    );
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#EAEAEA] text-neutral-900 relative overflow-hidden">
      <div className="max-w-[1180px] mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-neutral-800 text-[11px] font-semibold tracking-wide uppercase mb-3 border border-neutral-300/80 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <InfinityIcon className="w-3.5 h-3.5 text-neutral-600" />
            <span>Lifetime License • No Monthly Fees</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-3">
            Pick your perfect plan
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            One-time payment, unlimited lifetime menu blueprints and updates.
          </p>
        </div>

        {/* Pixel-Perfect Reference Cards Grid */}
        <div className={`grid grid-cols-1 ${packages.length === 1 ? 'max-w-sm' : packages.length === 2 ? 'md:grid-cols-2 max-w-2xl' : 'md:grid-cols-3 max-w-5xl'} gap-6 lg:gap-7 items-stretch text-left mx-auto mb-14`}>
          {packages.map((pkg) => {
            const isPop = pkg.is_popular;
            const couponToPass = pkg.coupon_code || undefined;
            const isCurrentPlan = checkIsCurrentPlan(pkg);

            return (
              <div
                key={pkg.id}
                className={`rounded-[36px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                  isPop
                    ? "bg-[#141414] text-white shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
                    : "bg-white text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-200/60"
                }`}
              >
                <div>
                  {/* Top Row: Brand Swirl SVG + Badges */}
                  <div className="flex items-center justify-between mb-6">
                    <SwirlBrandIcon className={`w-7 h-7 ${isPop ? "text-white" : "text-black"}`} />
                    {isPop ? (
                      <span className="px-3.5 py-1 rounded-full bg-[#272727] text-neutral-300 text-xs font-medium tracking-tight">
                        {pkg.badge_text || "Popular"}
                      </span>
                    ) : null}
                  </div>

                  {/* Plan Name & Tagline */}
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold tracking-tight ${isPop ? "text-white" : "text-black"}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-xs mt-1 font-normal tracking-tight line-clamp-2 leading-relaxed ${isPop ? "text-neutral-400" : "text-neutral-500"}`}>
                      {pkg.tagline || `For ${pkg.name} most advance reliability.`}
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline mb-7">
                    <span className={`text-4xl font-extrabold tracking-tight ${isPop ? "text-white" : "text-black"}`}>
                      ৳{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400 font-normal ml-1">
                      /lifetime
                    </span>
                  </div>

                  {/* Pill CTA Button */}
                  {isCurrentPlan ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm text-center cursor-not-allowed select-none transition-all ${
                        isPop
                          ? "bg-[#272727] text-neutral-400"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200/80"
                      }`}
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent("plan_selected", {
                          plan: pkg.package_id,
                          duration: "lifetime",
                          coupon: couponToPass,
                        });
                        onSelectPlan(pkg.package_id, "lifetime", couponToPass);
                      }}
                      className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all duration-150 text-center cursor-pointer active:scale-[0.98] ${
                        isPop
                          ? "bg-white text-black hover:bg-neutral-100 shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
                          : "bg-white text-black border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-neutral-50"
                      }`}
                    >
                      {pkg.button_text || (isPop ? "Subscribe Now" : "Started Now")}
                    </button>
                  )}

                  {/* Divider Line */}
                  <div className={`h-px w-full my-7 ${isPop ? "bg-neutral-800/80" : "bg-neutral-100"}`} />

                  {/* Features Header */}
                  <p className={`text-xs font-semibold mb-4 tracking-tight ${isPop ? "text-white" : "text-black"}`}>
                    Features
                  </p>

                  {/* Features Checklist with exact circular check SVG */}
                  <div className="space-y-3.5 mb-2">
                    {pkg.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <CircleCheckIcon
                          className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-400"
                        />
                        <span
                          className={`font-normal leading-relaxed ${
                            isPop ? "text-neutral-300" : "text-neutral-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Minimalist Trust Strip */}
        <div className="max-w-3xl mx-auto pt-6 border-t border-neutral-300/70 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure bKash / Cards</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-700">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-700">
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Instant Email Login</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-700">
            <Headphones className="w-3.5 h-3.5 text-neutral-800" />
            <span>Direct WhatsApp Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
