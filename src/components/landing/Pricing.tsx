"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { COUPON, PRICING_TRUST } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { Button, Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { CheckIcon, SparkleIcon } from "@/components/landing/icons";
import { getPublicPricingPackagesAction } from "@/app/actions/packages";
import { validateCouponAction } from "@/app/actions/coupons";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import type { PricingPackage } from "@/lib/menusnap-types";

function formatTaka(value: number): string {
  return value.toLocaleString("en-US");
}

export interface PricingProps {
  onSelectPlan?: (plan: string, duration?: string, coupon?: string) => void;
}

const FALLBACK_LIFETIME_PACKAGES: Omit<PricingPackage, "id">[] = [
  {
    package_id: "starter",
    name: "Starter",
    tagline: "For solo entrepreneurs exploring initial restaurant ideas.",
    badge_text: "Lifetime Access",
    price: 199,
    original_price: 499,
    billing_period_text: "Lifetime Access • Pay once, use forever",
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
    button_text: "Get Lifetime Starter",
    is_popular: false,
    is_active: true,
    sort_order: 1,
  },
  {
    package_id: "pro",
    name: "Pro",
    tagline: "Complete menu research, market pricing & unlimited menu exports.",
    badge_text: "Most Popular • Lifetime Deal",
    price: 499,
    original_price: 1499,
    billing_period_text: "Lifetime Access • One-time payment",
    features: [
      "Everything in Starter",
      "Advanced Item & Competitor Research",
      "Market Price Spread Comparison",
      "Unlimited Menu Building Projects",
      "Item Shortlist & Favorites",
      "Custom Category Organization",
      "Custom Pricing & Portion Weights",
      "Rich Description Editing",
      "Print-Ready PDF & Clean Excel Export",
      "Lifetime Priority Updates",
    ],
    button_text: "Get Lifetime Pro",
    is_popular: true,
    is_active: true,
    sort_order: 2,
  },
  {
    package_id: "agency",
    name: "Agency",
    tagline: "For consultants and agencies managing multiple restaurant brands.",
    badge_text: "Full Team • Lifetime",
    price: 1499,
    original_price: 4999,
    billing_period_text: "Lifetime Team Access • One-time payment",
    features: [
      "Everything in Pro",
      "Multiple Restaurant Projects",
      "Client-wise Menu Workspaces",
      "Agency Multi-user Access",
      "Higher Export & Query Limits",
      "Direct Onboarding & Priority Support",
      "Lifetime Agency License",
    ],
    button_text: "Get Lifetime Agency",
    is_popular: false,
    is_active: true,
    sort_order: 3,
  },
];

export function Pricing({ onSelectPlan }: PricingProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCouponData, setAppliedCouponData] = useState<{
    code: string;
    discount: number;
    applicable_package?: string;
    discount_type?: "fixed" | "percentage";
    discount_value?: number;
  } | null>(null);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const pricingRef = useRef<HTMLDivElement>(null);

  /* Fetch dynamic lifetime pricing packages from database */
  useEffect(() => {
    let isMounted = true;
    getPublicPricingPackagesAction()
      .then((res) => {
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setPackages(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load public pricing packages:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /* Track pricing viewed once */
  useEffect(() => {
    const el = pricingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackEvent("pricingViewed");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponApplied(false);
      setAppliedCouponData(null);
      setCouponMessage(null);
      setCouponError("Enter a coupon code first.");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponMessage(null);

    try {
      const proPkg = packages.find((p) => p.is_popular || p.package_id === "pro");
      const basePrice = proPkg ? Number(proPkg.price || 499) : 499;

      const res = await validateCouponAction(code, "pro", basePrice);

      if (res.valid) {
        setCouponApplied(true);
        setCouponError(null);
        setCouponMessage(res.message || `Coupon applied successfully! ৳${res.discount.toLocaleString()} discount.`);
        setAppliedCouponData({
          code,
          discount: res.discount,
          applicable_package: res.coupon?.applicable_package || "all",
          discount_type: res.coupon?.discount_type || "fixed",
          discount_value: res.coupon?.discount_value || res.discount,
        });
        trackEvent("couponUsed", { code, discount: res.discount });
      } else {
        // Fallback check: in case package has its own coupon_code or local COUPON.code
        const matchingPkg = packages.find(
          (p) => p.coupon_code && p.coupon_code.toUpperCase() === code
        );
        if (code === COUPON.code || matchingPkg) {
          const discount = matchingPkg?.coupon_discount || COUPON.discount;
          setCouponApplied(true);
          setCouponError(null);
          setCouponMessage(`Coupon applied successfully! ৳${discount.toLocaleString()} discount.`);
          setAppliedCouponData({
            code,
            discount,
            applicable_package: matchingPkg ? matchingPkg.package_id : "all",
            discount_type: "fixed",
            discount_value: discount,
          });
          trackEvent("couponUsed", { code, discount });
        } else {
          setCouponApplied(false);
          setAppliedCouponData(null);
          setCouponError(res.message || "Invalid coupon code.");
        }
      }
    } catch {
      if (code === COUPON.code) {
        setCouponApplied(true);
        setCouponError(null);
        setCouponMessage(`Coupon applied successfully! ৳${COUPON.discount.toLocaleString()} discount.`);
        setAppliedCouponData({
          code: COUPON.code,
          discount: COUPON.discount,
          applicable_package: "all",
          discount_type: "fixed",
          discount_value: COUPON.discount,
        });
      } else {
        setCouponApplied(false);
        setAppliedCouponData(null);
        setCouponError("Invalid or unverified coupon code.");
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setAppliedCouponData(null);
    setCouponError(null);
    setCouponMessage(null);
    setCouponInput("");
  };

  const checkoutHref = (planId: string): string => {
    const params = new URLSearchParams({ plan: planId, period: "lifetime" });
    if (couponApplied && appliedCouponData) {
      params.set("coupon", appliedCouponData.code);
    }
    return `/checkout?${params.toString()}`;
  };

  // Prepare display packages (dynamic from DB or fallback)
  const displayItems = useMemo(() => {
    const sourceList = packages.length > 0 ? packages : (FALLBACK_LIFETIME_PACKAGES as PricingPackage[]);

    return sourceList.map((pkg) => {
      const isPro = pkg.is_popular;
      const basePrice = Number(pkg.price && pkg.price > 0 ? pkg.price : (pkg.price_1_month || 499));
      const originalPrice = pkg.original_price ? Number(pkg.original_price) : null;

      let canApplyCoupon = false;
      let calculatedDiscount = 0;

      if (couponApplied && appliedCouponData) {
        const appliesToPackage =
          appliedCouponData.applicable_package === "all" ||
          appliedCouponData.applicable_package?.toLowerCase() === (pkg.package_id || "").toLowerCase() ||
          (pkg.coupon_code && pkg.coupon_code.toUpperCase() === appliedCouponData.code) ||
          pkg.package_id === "pro";

        if (appliesToPackage) {
          canApplyCoupon = true;
          if (appliedCouponData.discount_type === "percentage" && appliedCouponData.discount_value) {
            calculatedDiscount = Math.round((basePrice * appliedCouponData.discount_value) / 100);
          } else {
            calculatedDiscount = appliedCouponData.discount || COUPON.discount;
          }
          if (calculatedDiscount > basePrice) {
            calculatedDiscount = basePrice;
          }
        }
      }

      const finalPrice = canApplyCoupon ? Math.max(0, basePrice - calculatedDiscount) : basePrice;

      return {
        id: pkg.package_id || String(pkg.id),
        name: pkg.name,
        tagline: pkg.tagline,
        badgeText: pkg.badge_text,
        features: pkg.features || [],
        cta: pkg.button_text || (isPro ? "Get Lifetime Pro" : "Get Started"),
        isPopular: isPro,
        price: finalPrice,
        originalPrice: canApplyCoupon ? basePrice : originalPrice,
        billingPeriodText: pkg.billing_period_text || "Lifetime Access • One-time payment",
        hasCouponDiscount: canApplyCoupon,
        couponDiscount: calculatedDiscount,
        couponCode: appliedCouponData?.code || pkg.coupon_code,
      };
    });
  }, [packages, couponApplied, appliedCouponData]);

  return (
    <section id="pricing" className="section-pad bg-cream" ref={pricingRef}>
      <Container>
        <SectionHeading
          eyebrow="Lifetime Deal"
          title="Pick your perfect lifetime plan."
          description="One-time payment, unlimited lifetime menu blueprints and updates. No monthly or recurring fees."
        />

        {/* Lifetime Banner Pill */}
        <Reveal className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2 text-xs font-bold text-ink shadow-card">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-sm font-black text-accent-deep">
              ∞
            </span>
            <span>Lifetime License • Pay Once, Use Forever</span>
          </div>
        </Reveal>

        {/* Dynamic Lifetime Plans Grid */}
        <div
          className={cn(
            "mt-12 grid items-stretch gap-6",
            displayItems.length === 1 && "mx-auto max-w-md grid-cols-1",
            displayItems.length === 2 && "mx-auto max-w-3xl md:grid-cols-2",
            displayItems.length === 3 && "lg:grid-cols-3",
            displayItems.length >= 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {displayItems.map((plan, i) => {
            const isPro = plan.isPopular;
            return (
              <Reveal key={plan.id} delay={i * 80}>
                <article
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300 sm:p-8",
                    isPro
                      ? "border border-accent/40 bg-night text-white shadow-pop lg:-my-4 lg:scale-[1.03]"
                      : "border border-line bg-white shadow-card hover:-translate-y-1 hover:shadow-lift",
                  )}
                >
                  {isPro && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-pop">
                      {plan.badgeText || "Most Popular • Lifetime"}
                    </span>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={cn("text-xl font-extrabold", isPro ? "text-white" : "text-ink")}>
                        {plan.name}
                      </h3>
                      {plan.badgeText && !isPro && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-extrabold text-accent-deep">
                          🔥 {plan.badgeText}
                        </span>
                      )}
                    </div>
                    {plan.tagline && (
                      <p className={cn("mt-1 text-xs font-medium leading-relaxed", isPro ? "text-white/60" : "text-muted")}>
                        {plan.tagline}
                      </p>
                    )}
                  </div>

                  {/* Price display */}
                  <div className="mt-6">
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        className={cn(
                          "text-[2.6rem] font-extrabold leading-none tracking-tight",
                          isPro ? "text-white" : "text-ink",
                        )}
                      >
                        ৳{formatTaka(plan.price)}
                      </span>
                      <span className={cn("text-xs font-bold uppercase tracking-wider", isPro ? "text-accent" : "text-muted")}>
                        / lifetime
                      </span>
                    </p>

                    {/* Strikethrough original price + savings pill */}
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                      <p className={cn("mt-2 flex items-center gap-2 text-xs font-semibold", isPro ? "text-white/70" : "text-muted")}>
                        <span className="line-through opacity-70">৳{formatTaka(plan.originalPrice)}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
                          <SparkleIcon className="h-3 w-3" /> Save ৳{formatTaka(plan.originalPrice - plan.price)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className={cn("mt-6 flex flex-col gap-2.5 border-t pt-6", isPro ? "border-white/10" : "border-line")}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            isPro ? "bg-accent/25 text-accent" : "bg-accent-soft text-accent-deep",
                          )}
                        >
                          <CheckIcon className="h-3 w-3" />
                        </span>
                        <span className={cn("text-sm font-medium", isPro ? "text-white/85" : "text-ink")}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <div className="mt-8 flex flex-1 items-end">
                    <Button
                      href={checkoutHref(plan.id)}
                      variant={isPro ? "primary" : "secondary"}
                      size="lg"
                      withArrow={isPro}
                      className="w-full"
                      onClick={(e) => {
                        trackEvent("planSelected", { plan: plan.id, period: "lifetime" });
                        trackEvent("checkoutStarted", { plan: plan.id, period: "lifetime" });
                        if (onSelectPlan) {
                          e.preventDefault();
                          onSelectPlan(
                            plan.id,
                            "lifetime",
                            couponApplied ? (plan.couponCode || COUPON.code) : undefined,
                          );
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Coupon */}
        <Reveal className="mt-10">
          <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-5 shadow-card transition-all duration-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">
                Have a discount coupon?
              </p>
              {couponApplied && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                  title="Remove coupon"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <label htmlFor="coupon-input" className="sr-only">
                Coupon code
              </label>
              <div className="relative flex-1">
                <input
                  id="coupon-input"
                  type="text"
                  value={couponInput}
                  disabled={isValidatingCoupon}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setCouponInput(val);
                    if (couponApplied) {
                      setCouponApplied(false);
                      setAppliedCouponData(null);
                    }
                    if (couponError) setCouponError(null);
                    if (couponMessage) setCouponMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !couponApplied && !isValidatingCoupon) {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                  placeholder="Enter coupon code"
                  className={cn(
                    "w-full rounded-xl border bg-cream/60 px-4 py-2.5 text-sm font-semibold uppercase text-ink placeholder:normal-case placeholder:font-medium placeholder:text-muted/70 focus:outline-none transition-colors",
                    couponApplied
                      ? "border-success/60 bg-success/5 text-success"
                      : couponError
                      ? "border-red-400 bg-red-50/40 text-red-700 focus:border-red-500"
                      : "border-line focus:border-accent/50",
                  )}
                />
              </div>

              {couponApplied ? (
                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-success px-4 text-sm font-bold text-white shadow-sm">
                  <CheckCircle2 className="h-4 w-4" /> Applied
                </div>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white transition-all",
                    isValidatingCoupon
                      ? "bg-ink/70 cursor-not-allowed"
                      : !couponInput.trim()
                      ? "bg-ink/50 cursor-not-allowed"
                      : "bg-ink hover:bg-ink/85 active:scale-95 shadow-sm"
                  )}
                >
                  {isValidatingCoupon ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    "Apply"
                  )}
                </button>
              )}
            </div>

            {/* Error Message */}
            {couponError && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-red-500 animate-in fade-in duration-200">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            {/* Success Message */}
            {couponApplied && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-success animate-in fade-in duration-200">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{couponMessage || "Coupon applied successfully! Your discount is reflected on applicable packages."}</span>
              </div>
            )}
          </div>
        </Reveal>

        {/* Trust strip */}
        <Reveal className="mt-12">
          <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
            {PRICING_TRUST.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card"
              >
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-[13px] font-bold text-ink">{item.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}