"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  ArrowRight,
  Tag,
  AlertCircle,
  Loader2,
  Check,
  CheckCircle2,
  Sparkles,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { PricingPackage, PaymentGateway } from "@/lib/menusnap-types";
import { trackEvent, trackBeginCheckout } from "@/lib/analytics";
import {
  initiatePayStationPaymentAction,
  getPayStationPublicStatus,
} from "@/app/actions/paystation";
import { getPublicPricingPackagesAction } from "@/app/actions/packages";
import { validateCouponAction } from "@/app/actions/coupons";
import { checkClientSubscription } from "@/app/actions/clients";
import { useClientAuth } from "@/hooks/use-client-auth";

function DedicatedCheckoutForm() {
  const searchParams = useSearchParams();
  const rawPlan = (searchParams.get("plan") || "pro").toLowerCase().trim();
  const rawCoupon = (searchParams.get("coupon") || "").trim();

  const { clientUser, isSubscriber, currentPackage, isAdmin } = useClientAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponInput, setCouponInput] = useState(rawCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [typedPhonePackage, setTypedPhonePackage] = useState<string | null>(null);

  const [selectedGateway] = useState<PaymentGateway>("bkash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setPaystationActive] = useState<boolean | null>(null);

  // Dynamic Packages from MySQL
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [packagesLoaded, setPackagesLoaded] = useState(false);

  // Auto-fill logged in client user information
  useEffect(() => {
    if (clientUser) {
      if (!fullName && clientUser.businessName) setFullName(clientUser.businessName);
      if (!email && clientUser.email) setEmail(clientUser.email);
      if (!phone && clientUser.whatsappNumber) setPhone(clientUser.whatsappNumber);
    }
  }, [clientUser, fullName, email, phone]);

  // Check PayStation gateway status
  useEffect(() => {
    let isMounted = true;
    getPayStationPublicStatus()
      .then((status) => {
        if (isMounted && status) setPaystationActive(!!status.isEnabled);
      })
      .catch(() => {
        if (isMounted) setPaystationActive(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Pricing Packages from DB
  useEffect(() => {
    let isMounted = true;
    getPublicPricingPackagesAction()
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setPackages(res.data);
          }
          setPackagesLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPackages([]);
          setPackagesLoaded(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Live lookup if guest enters phone or email already registered with lifetime package
  useEffect(() => {
    const cleanP = phone.trim();
    const cleanE = email.trim();
    if (cleanP.length >= 11 || (cleanE.includes("@") && cleanE.includes("."))) {
      let isSubMounted = true;
      const timer = setTimeout(() => {
        checkClientSubscription(cleanP, cleanE)
          .then((res) => {
            if (
              isSubMounted &&
              res.success &&
              res.isSubscriber &&
              res.plan &&
              res.plan.toLowerCase().trim() !== "free"
            ) {
              setTypedPhonePackage(res.plan);
            } else if (
              isSubMounted &&
              (!res.isSubscriber || res.plan?.toLowerCase().trim() === "free")
            ) {
              setTypedPhonePackage(null);
            }
          })
          .catch(() => {});
      }, 350);

      return () => {
        isSubMounted = false;
        clearTimeout(timer);
      };
    } else {
      setTypedPhonePackage(null);
    }
  }, [phone, email]);

  // Find matching package
  const matchedPackage = useMemo(() => {
    return packages.find((p) => p.package_id.toLowerCase() === rawPlan);
  }, [packages, rawPlan]);

  const planDisplayName = matchedPackage
    ? `${matchedPackage.name} Plan`
    : rawPlan === "starter"
    ? "Starter Plan"
    : rawPlan === "pro"
    ? "Pro Plan"
    : rawPlan === "agency"
    ? "Agency Plan"
    : `${rawPlan.toUpperCase()} Plan`;

  // Base price calculation
  const basePrice = useMemo(() => {
    if (matchedPackage) {
      return matchedPackage.price;
    }
    if (rawPlan === "starter") return 199;
    if (rawPlan === "pro") return 499;
    if (rawPlan === "agency") return 1499;
    return 499;
  }, [matchedPackage, rawPlan]);

  // Features list
  const featuresList = useMemo(() => {
    if (matchedPackage?.features) {
      if (Array.isArray(matchedPackage.features) && matchedPackage.features.length > 0) {
        return matchedPackage.features;
      }
      if (typeof (matchedPackage.features as unknown) === "string") {
        try {
          const parsed = JSON.parse(matchedPackage.features as unknown as string);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    if (rawPlan === "starter") {
      return [
        "1 Restaurant / Parlor Access",
        "Lifetime Validity — No Monthly Fee",
        "Browse 30,000+ Food Items & Pricing",
        "Digital Menu Builder & PNG/PDF Export",
        "Standard Email & WhatsApp Support",
      ];
    }
    if (rawPlan === "agency") {
      return [
        "Unlimited Restaurant Menus",
        "Full Client Team Tracker",
        "White-label PDF & QR Exports",
        "Magic Docs & Collaborative Editor",
        "Dedicated VIP Account Manager",
      ];
    }
    return [
      "Everything in Starter Plan",
      "Full Competitor Price Research Benchmark",
      "Interactive Digital Menu Builder",
      "Unlimited Menu Drafts & Exports",
      "High Priority WhatsApp Support",
    ];
  }, [matchedPackage, rawPlan]);

  // Duplicate purchase check
  const activeUserPlan = (
    clientUser?.subscriptionPackage ||
    currentPackage ||
    (isAdmin ? "agency" : "")
  )
    .toLowerCase()
    .trim();

  const detectedPlan = (typedPhonePackage || activeUserPlan || "").toLowerCase().trim();

  const isSamePlanAlreadyPurchased = Boolean(
    (isSubscriber || Boolean(typedPhonePackage) || isAdmin) &&
      detectedPlan &&
      detectedPlan !== "free" &&
      rawPlan !== "free" &&
      (detectedPlan.includes(rawPlan) ||
        (matchedPackage && detectedPlan.includes(matchedPackage.name.toLowerCase().trim())) ||
        rawPlan.includes(detectedPlan) ||
        (matchedPackage && matchedPackage.name.toLowerCase().trim().includes(detectedPlan)))
  );

  // Handle coupon validation
  const handleApplyCoupon = useCallback(
    async (codeToApply: string) => {
      const cleanCode = (codeToApply || "").trim().toUpperCase();
      if (!cleanCode) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(null);
        setCouponMessage(null);
        return;
      }

      setIsValidatingCoupon(true);
      setCouponError(null);
      setCouponMessage(null);

      try {
        const targetPackageId = matchedPackage ? matchedPackage.package_id : rawPlan;
        const res = await validateCouponAction(cleanCode, targetPackageId, basePrice);

        if (res.valid) {
          setAppliedCoupon(cleanCode);
          setCouponDiscount(res.discount);
          setCouponMessage(res.message || `৳${res.discount.toLocaleString()} discount applied`);
          setCouponError(null);
        } else {
          if (
            matchedPackage &&
            matchedPackage.coupon_code &&
            cleanCode === matchedPackage.coupon_code.toUpperCase()
          ) {
            const fallbackDiscount = matchedPackage.coupon_discount || 0;
            setAppliedCoupon(cleanCode);
            setCouponDiscount(fallbackDiscount);
            setCouponMessage(`৳${fallbackDiscount.toLocaleString()} package discount applied`);
            setCouponError(null);
          } else {
            setAppliedCoupon(null);
            setCouponDiscount(0);
            setCouponError(res.message || "Invalid or expired coupon code");
          }
        }
      } catch {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError("Failed to validate coupon");
      } finally {
        setIsValidatingCoupon(false);
      }
    },
    [basePrice, matchedPackage, rawPlan]
  );

  // Auto-apply initial coupon from URL query param
  useEffect(() => {
    if (rawCoupon && basePrice > 0) {
      setCouponInput(rawCoupon);
      handleApplyCoupon(rawCoupon);
    }
  }, [rawCoupon, basePrice, handleApplyCoupon]);

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
    setCouponMessage(null);
  };

  const finalAmount = Math.max(0, basePrice - couponDiscount);

  // =========================================================================
  // GTM DataLayer Event: begin_checkout / InitiateCheckout
  // =========================================================================
  const hasTrackedCheckoutRef = useRef<string | null>(null);

  useEffect(() => {
    if (packagesLoaded && basePrice > 0) {
      const trackingKey = `${rawPlan}-${finalAmount}-${appliedCoupon || ""}`;
      if (hasTrackedCheckoutRef.current !== trackingKey) {
        hasTrackedCheckoutRef.current = trackingKey;
        trackBeginCheckout({
          planId: rawPlan,
          planName: planDisplayName,
          price: finalAmount,
          currency: "BDT",
          coupon: appliedCoupon || undefined,
          checkoutMethod: "online",
        });
      }
    }
  }, [packagesLoaded, rawPlan, planDisplayName, basePrice, finalAmount, appliedCoupon]);

  // Handle PayStation payment redirection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSamePlanAlreadyPurchased) {
      setErrorMessage(
        `Your account already has active lifetime access to ${planDisplayName}. Duplicate purchase is not permitted.`
      );
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please complete your full name, email address, and phone number.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Live server check to strictly prevent double purchase
      const checkRes = await checkClientSubscription(phone.trim(), email.trim());
      if (
        checkRes.success &&
        checkRes.isSubscriber &&
        checkRes.plan &&
        checkRes.plan.toLowerCase().trim() !== "free"
      ) {
        const livePlan = checkRes.plan.toLowerCase().trim();
        const targetPlan = rawPlan.toLowerCase().trim();
        if (
          targetPlan !== "free" &&
          (livePlan.includes(targetPlan) || targetPlan.includes(livePlan))
        ) {
          setErrorMessage(
            `Your account already has active lifetime access to ${planDisplayName}. You do not need to purchase it again.`
          );
          setIsProcessing(false);
          return;
        }
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const response = await initiatePayStationPaymentAction({
        plan: rawPlan,
        duration: "lifetime",
        amount: finalAmount,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        coupon: appliedCoupon || couponInput,
        origin,
      });

      if (response.success && response.paymentUrl) {
        trackEvent("checkout_initiated", {
          plan: rawPlan,
          duration: "lifetime",
          amount: finalAmount,
          invoice: response.invoiceNumber,
        });
        window.location.href = response.paymentUrl;
        return;
      }

      setErrorMessage(
        response.error || "Failed to initiate payment session. Please try again or contact support."
      );
      setIsProcessing(false);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred connecting to payment gateway.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* ================= LEFT COLUMN: CUSTOMER & PAYMENT DETAILS ================= */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-card">
        <div className="mb-6 pb-6 border-b border-line">

          <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
            Checkout Details
          </h2>
          <p className="text-sm text-muted mt-1">
            Provide your contact info to receive immediate account activation details upon payment.
          </p>
        </div>

        {isSamePlanAlreadyPurchased && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Active Subscription Detected</p>
              <p className="mt-0.5">
                You already own <strong>{planDisplayName}</strong>. You do not need to purchase it again.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="co-name" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Full Name / Business Name <span className="text-accent">*</span>
            </label>
            <input
              id="co-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahim Uddin / Chef's Table"
              className="w-full rounded-xl border border-line bg-cream/40 px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:bg-white focus:border-accent/60 focus:outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="co-email" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Email Address <span className="text-accent">*</span>
            </label>
            <input
              id="co-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahim@example.com"
              className="w-full rounded-xl border border-line bg-cream/40 px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:bg-white focus:border-accent/60 focus:outline-none transition-all"
            />
            <p className="mt-1 text-[11px] text-muted">
              Login instructions and invoice will be sent to this email.
            </p>
          </div>

          {/* WhatsApp / Phone */}
          <div>
            <label htmlFor="co-phone" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              WhatsApp / Phone Number <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">
                +88
              </span>
              <input
                id="co-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-line bg-cream/40 pl-12 pr-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:bg-white focus:border-accent/60 focus:outline-none transition-all"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Used for account recovery and instant WhatsApp priority support.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button & Guarantees */}
          <div className="pt-2 space-y-2.5">
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isProcessing || isSamePlanAlreadyPurchased}
                className="group relative w-full max-w-[320px] h-11 rounded-xl bg-accent hover:bg-accent-deep text-white font-bold text-sm sm:text-[15px] shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to Secure Gateway…</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 opacity-90" />
                    <span>Pay ৳{finalAmount.toLocaleString()} BDT</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-muted pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>256-Bit SSL Encrypted & Instant Activation</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-[10px]">
                <span className="px-2 py-0.5 rounded bg-pink-50 text-[#D82376] border border-pink-200/70">bKash</span>
                <span className="px-2 py-0.5 rounded bg-orange-50 text-[#F1592A] border border-orange-200/70">Nagad</span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-[#8C3494] border border-purple-200/70">Rocket</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#00579E] border border-blue-200/70">Cards</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted mb-3">
            Order Summary
          </p>

          <div className="flex items-start justify-between pb-5 border-b border-line">
            <div>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 mb-1.5">
                <Sparkles className="h-3 w-3" /> Lifetime Deal
              </span>
              <h3 className="text-xl font-black text-ink">{planDisplayName}</h3>
              <p className="text-xs text-muted mt-0.5">One-time payment, lifetime access</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-ink">
                ৳{basePrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Features list */}
          <div className="py-4 border-b border-line space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">What&apos;s Included:</p>
            <ul className="space-y-2">
              {featuresList.map((feat: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coupon Input */}
          <div className="py-4 border-b border-line">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="coupon-code" className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Tag className="h-3 w-3" /> Discount Coupon
              </label>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] font-bold text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                id="coupon-code"
                type="text"
                disabled={Boolean(appliedCoupon)}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 rounded-xl border border-line bg-cream/30 px-3.5 py-2 text-xs font-mono font-bold uppercase text-ink placeholder:text-muted/50 focus:bg-white focus:border-accent/60 focus:outline-none disabled:bg-slate-100"
              />
              {!appliedCoupon ? (
                <button
                  type="button"
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  onClick={() => handleApplyCoupon(couponInput)}
                  className="rounded-xl bg-ink hover:bg-black text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isValidatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                </button>
              ) : (
                <span className="flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> Applied
                </span>
              )}
            </div>

            {couponMessage && (
              <p className="mt-2 text-xs font-medium text-emerald-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> {couponMessage}
              </p>
            )}
            {couponError && (
              <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {couponError}
              </p>
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Standard Price</span>
              <span>৳{basePrice.toLocaleString()} BDT</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-success">
                <span>Coupon Discount</span>
                <span>-৳{couponDiscount.toLocaleString()} BDT</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-extrabold text-ink pt-2 border-t border-line">
              <span>Total Payable</span>
              <span className="text-xl text-accent font-black">
                ৳{finalAmount.toLocaleString()} BDT
              </span>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}

export function CheckoutClient() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-line bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="container-site flex h-16 items-center justify-between">
          <Link href="/" aria-label="MenuSnap Home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="text-xs font-bold text-muted hover:text-ink transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-site py-8 sm:py-12 max-w-5xl mx-auto">
        <div className="mb-8 text-center max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Complete Your Subscription
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1.5">
            One-time payment for lifetime access. Build smarter restaurant menus in minutes.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="w-full rounded-3xl border border-line bg-white p-12 text-center text-sm text-muted shadow-card flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span>Loading secure checkout…</span>
            </div>
          }
        >
          <DedicatedCheckoutForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white/50 py-6 mt-12">
        <div className="container-site text-center text-xs text-muted">
          <p>© {new Date().getFullYear()} MenuSnap (MenuBldr). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}