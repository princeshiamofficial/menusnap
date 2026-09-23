"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Tag,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { PlanTier, BillingPeriod, PaymentGateway } from "@/lib/menusnap-types";
import { trackEvent } from "@/lib/analytics";

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponInput, setCouponInput] = useState(coupon || "");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>("bkash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (coupon) setCouponInput(coupon);
  }, [coupon]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSuccess(false);
      setIsProcessing(false);
      trackEvent("checkout_started", { plan, duration, coupon });
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, plan, duration, coupon]);

  if (!isOpen) return null;

  // Calculate pricing
  const planNames: Record<PlanTier, string> = {
    starter: "Starter Plan",
    pro: "Pro Plan",
    agency: "Agency Plan",
  };

  let basePrice = 0;
  if (plan === "starter") {
    basePrice = duration === "1_month" ? 499 : 1299;
  } else if (plan === "pro") {
    basePrice = duration === "1_month" ? 999 : 1999;
  } else if (plan === "agency") {
    basePrice = duration === "1_month" ? 2499 : 4999;
  }

  // Discount rule
  const discount =
    couponInput.toUpperCase() === "MENUSNAP500" && plan === "pro" && duration === "3_months"
      ? 500
      : 0;

  const finalAmount = Math.max(0, basePrice - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;

    setIsProcessing(true);
    // Simulate server-side payment verification pipeline
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      trackEvent("payment_success", {
        plan,
        duration,
        amount: finalAmount,
        gateway: selectedGateway,
      });
    }, 1200);
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden z-10 text-left my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
            <div>
              <h3 className="text-base font-extrabold text-gray-950">
                MenuSnap Subscription Checkout
              </h3>
              <p className="text-xs text-gray-500">
                Secure Bangladesh Gateway Payment
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-gray-200/70 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-gray-950 font-bengali">
                অভিনন্দন! আপনার সাবস্ক্রিপশন সম্পন্ন হয়েছে।
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans max-w-md mx-auto">
                We have verified your payment for the <strong className="text-gray-900">{planNames[plan]} ({duration === "1_month" ? "1 Month" : "3 Months"})</strong>.
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1 text-left">
                <p className="font-bold text-gray-900">Next Steps:</p>
                <p>1. We have dispatched your private magic activation link to <strong className="text-gray-900">{email}</strong>.</p>
                <p>2. Open the link to set your secure password and start building your menu instantly.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#FF5A36] text-white font-bold text-sm rounded-xl hover:bg-[#e64c29] transition-all"
              >
                Go to MenuSnap Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Order Summary Box */}
              <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">{planNames[plan]}</span>
                  <span className="font-semibold text-gray-600">
                    {duration === "1_month" ? "1 Month Access" : "3 Months (Save More)"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                  <span className="text-gray-500">Plan Subtotal</span>
                  <span className="font-bold text-gray-800">৳{basePrice}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Coupon: {couponInput}
                    </span>
                    <span>- ৳{discount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 font-black text-gray-950">
                  <span>Total Payable:</span>
                  <span className="text-lg text-[#FF5A36]">৳{finalAmount}</span>
                </div>
              </div>

              {/* Customer Info Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
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
                      placeholder="asif@restaurant.com"
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

              {/* Payment Gateway Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "bkash", name: "bKash" },
                      { id: "nagad", name: "Nagad" },
                      { id: "card", name: "Debit / Credit Card" },
                    ] as const
                  ).map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        selectedGateway === gw.id
                          ? "border-[#FF5A36] bg-orange-50/50 text-[#FF5A36] shadow-2xs"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {gw.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] hover:bg-[#e64c29] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <>
                    <span>Pay ৳{finalAmount} & Activate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted Verification • Instant Activation</span>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
