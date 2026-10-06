"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  Tag,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
  LogIn,
} from "lucide-react";
import { PlanTier, BillingPeriod, PaymentGateway, PricingPackage } from "@/lib/menusnap-types";
import { trackEvent } from "@/lib/analytics";
import {
  initiatePayStationPaymentAction,
  getPayStationPublicStatus,
} from "@/app/actions/paystation";
import { getPublicPricingPackagesAction } from "@/app/actions/packages";
import { validateCouponAction } from "@/app/actions/coupons";
import { checkClientSubscription } from "@/app/actions/clients";
import { useClientAuth } from "@/hooks/use-client-auth";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanTier;
  duration: BillingPeriod;
  coupon?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  plan,
  duration,
  coupon,
}: CheckoutModalProps) {
  const { clientUser, isClientLoggedIn, isSubscriber, currentPackage, isAdmin } = useClientAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponInput, setCouponInput] = useState(coupon || "");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [typedPhonePackage, setTypedPhonePackage] = useState<string | null>(null);

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>("bkash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paystationActive, setPaystationActive] = useState<boolean | null>(null);

  // Dynamic Packages
  const [packages, setPackages] = useState<PricingPackage[]>([]);

  // Auto-fill logged in client user information
  useEffect(() => {
    if (clientUser && isOpen) {
      if (!fullName && clientUser.businessName) setFullName(clientUser.businessName);
      if (!email && clientUser.email) setEmail(clientUser.email);
      if (!phone && clientUser.whatsappNumber) setPhone(clientUser.whatsappNumber);
    }
  }, [clientUser, isOpen, fullName, email, phone]);

  // Live lookup if guest enters phone or email already registered with lifetime package
  useEffect(() => {
    const cleanP = phone.trim();
    const cleanE = email.trim();
    if (cleanP.length >= 11 || (cleanE.includes('@') && cleanE.includes('.'))) {
      let isSubMounted = true;
      const timer = setTimeout(() => {
        checkClientSubscription(cleanP, cleanE)
          .then((res) => {
            if (isSubMounted && res.success && res.isSubscriber && res.plan && res.plan.toLowerCase().trim() !== 'free') {
              setTypedPhonePackage(res.plan);
            } else if (isSubMounted && (!res.isSubscriber || res.plan?.toLowerCase().trim() === 'free')) {
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

  useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      try {
        const status = await getPayStationPublicStatus();
        if (isMounted && status) {
          setPaystationActive(!!status.isEnabled);
        }
      } catch {
        if (isMounted) setPaystationActive(false);
      }
    }
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getPublicPricingPackagesAction()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setPackages(res.data);
        }
      })
      .catch(() => {
        if (isMounted) setPackages([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Find matching package
  const matchedPackage = packages.find(
    (p) => p.package_id.toLowerCase() === plan.toLowerCase()
  );

  const planDisplayName = matchedPackage
    ? `${matchedPackage.name} Plan`
    : plan === "starter"
    ? "Starter Plan"
    : plan === "pro"
    ? "Pro Plan"
    : plan === "agency"
    ? "Agency Plan"
    : `${plan.toUpperCase()} Plan`;

  // Check if logged in user or entered phone already owns this lifetime package
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
    plan.toLowerCase().trim() !== "free" && (
      detectedPlan.includes(plan.toLowerCase().trim()) ||
      (matchedPackage && detectedPlan.includes(matchedPackage.name.toLowerCase().trim())) ||
      plan.toLowerCase().trim().includes(detectedPlan) ||
      (matchedPackage && matchedPackage.name.toLowerCase().trim().includes(detectedPlan))
    )
  );

  // Base price calculation
  let basePrice = 0;
  if (matchedPackage) {
    basePrice = matchedPackage.price;
  } else {
    if (plan === "starter") {
      basePrice = 499;
    } else if (plan === "pro") {
      basePrice = 1499;
    } else if (plan === "agency") {
      basePrice = 4999;
    }
  }

  // Handle coupon validation function
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
        const targetPackageId = matchedPackage ? matchedPackage.package_id : plan;
        const res = await validateCouponAction(cleanCode, targetPackageId, basePrice);

        if (res.valid) {
          setAppliedCoupon(cleanCode);
          setCouponDiscount(res.discount);
          setCouponMessage(res.message || `৳${res.discount.toLocaleString()} discount applied`);
          setCouponError(null);
        } else {
          // Check package-specific fallback coupon
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
    [basePrice, matchedPackage, plan]
  );

  // Auto-apply initial coupon if passed via props, or reset if no coupon
  useEffect(() => {
    if (isOpen) {
      if (coupon && basePrice > 0) {
        setCouponInput(coupon);
        handleApplyCoupon(coupon);
      } else if (!coupon) {
        setCouponInput("");
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(null);
        setCouponError(null);
      }
    }
  }, [coupon, isOpen, basePrice, handleApplyCoupon]);

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
    setCouponMessage(null);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSuccess(false);
      setIsProcessing(false);
      setErrorMessage(null);
      trackEvent("checkout_started", { plan, duration, coupon });
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, plan, duration, coupon]);

  if (!isOpen) return null;

  const finalAmount = Math.max(0, basePrice - couponDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSamePlanAlreadyPurchased) {
      setErrorMessage(`Your account already has active lifetime access to ${planDisplayName}. Duplicate purchase is not permitted.`);
      return;
    }
    if (!fullName || !email || !phone) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Live server check to strictly prevent double purchase
      const checkRes = await checkClientSubscription(phone.trim(), email.trim());
      if (checkRes.success && checkRes.isSubscriber && checkRes.plan && checkRes.plan.toLowerCase().trim() !== 'free') {
        const livePlan = checkRes.plan.toLowerCase().trim();
        const targetPlan = plan.toLowerCase().trim();
        if (targetPlan !== 'free' && (livePlan.includes(targetPlan) || targetPlan.includes(livePlan))) {
          setErrorMessage(`Your account already has active lifetime access to ${planDisplayName}. You do not need to purchase it again.`);
          setIsProcessing(false);
          return;
        }
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const response = await initiatePayStationPaymentAction({
        plan,
        duration: "lifetime",
        amount: finalAmount,
        fullName,
        email,
        phone,
        coupon: appliedCoupon || couponInput,
        origin,
      });

      if (response.success && response.paymentUrl) {
        trackEvent("checkout_initiated", {
          plan,
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FAFAF8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF5A36] font-bold">
                💳
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                  Checkout Confirmation
                </h3>
                <p className="text-xs text-gray-500">
                  Instant Lifetime Access via PayStation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Payment Successful!</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your lifetime subscription to {planDisplayName} has been activated.
                </p>
              </div>
              <Link
                href={`/login?tab=register&email=${encodeURIComponent(
                  email
                )}&name=${encodeURIComponent(fullName)}&whatsapp=${encodeURIComponent(
                  phone
                )}&from=checkout`}
                className="block w-full"
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-[#FF5A36] text-white font-bold text-sm rounded-xl hover:bg-[#e64c29] transition-all cursor-pointer"
                >
                  Continue to Account Registration
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Already Owned Alert */}
              {isSamePlanAlreadyPurchased && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-extrabold block text-emerald-950 text-sm">
                      You Already Own This Package
                    </span>
                    <p className="text-emerald-800 leading-relaxed font-normal">
                      Your account already has active lifetime access to <strong>{planDisplayName}</strong>. You do not need to purchase it again.
                    </p>
                  </div>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">{planDisplayName}</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Lifetime Access (Pay Once)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                  <span className="text-gray-500">Plan Subtotal</span>
                  <span className="font-bold text-gray-800">৳{basePrice.toLocaleString()}</span>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Coupon: {appliedCoupon}
                    </span>
                    <span>- ৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 font-black text-gray-950">
                  <span>Total Payable:</span>
                  <span className="text-lg text-[#FF5A36]">৳{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo / Coupon Input Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Have a Promo Coupon?</span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-red-500 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Remove Coupon
                    </button>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponInput}
                      disabled={!!appliedCoupon || isValidatingCoupon}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      className={`w-full bg-gray-50 border rounded-xl pl-8 pr-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-900 focus:outline-none transition-colors ${
                        appliedCoupon
                          ? "border-emerald-300 bg-emerald-50/50 text-emerald-800"
                          : couponError
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 focus:border-orange-500"
                      }`}
                    />
                  </div>

                  {appliedCoupon ? (
                    <div className="h-9 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!couponInput.trim() || isValidatingCoupon}
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="h-9 px-4 bg-slate-900 hover:bg-black disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  )}
                </div>

                {couponMessage && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> {couponMessage}
                  </p>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}
              </div>

              {/* Customer Info Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sultan's Dine / Food Express"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="awal@restaurant.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Error Notice if any */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Payment Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              {isSamePlanAlreadyPurchased ? (
                <Link
                  href={
                    phone || email
                      ? `/login?identifier=${encodeURIComponent(phone.trim() || email.trim())}`
                      : "/login"
                  }
                  className="block w-full"
                  onClick={onClose}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 text-white bg-[#FF5A36] hover:bg-[#e64c29] font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Go to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center gap-2 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 ${
                    finalAmount === 0
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-[#FF5A36] hover:bg-[#e64c29] shadow-orange-500/20"
                  }`}
                >
                  {isProcessing ? (
                    <span>
                      {finalAmount === 0
                        ? "Activating Free Lifetime Access..."
                        : "Redirecting to Payment Gateway..."}
                    </span>
                  ) : finalAmount === 0 ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Claim Free Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Pay ৳{finalAmount.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
                {finalAmount === 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Free Promo • Instant Lifetime Activation</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Verification • Instant Activation</span>
                  </>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
