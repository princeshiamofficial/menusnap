"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Receipt,
  CreditCard,
  Lock,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import Link from 'next/link';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get('status') || 'success';
  const invoice = searchParams.get('invoice') || '';
  const trxId = searchParams.get('trx_id') || '';
  const amount = searchParams.get('amount') || '';
  const plan = searchParams.get('plan') || 'Pro Plan';
  const duration = searchParams.get('duration') || '1 Month';
  const method = searchParams.get('method') || 'PayStation Gateway';
  const message = searchParams.get('message') || '';

  const isSuccess = status === 'success' || status === 'Successful';
  const isCancelled = status === 'cancelled' || status === 'canceled';

  useEffect(() => {
    if (isSuccess) {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#FF5A36', '#10B981', '#F59E0B', '#3B82F6'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isSuccess]);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-orange-100/40 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl bg-white border border-slate-200/90 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8"
      >
        {isSuccess ? (
          <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Payment
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Subscription Activated!
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Thank you for subscribing to MenuSnap. Your payment has been confirmed via PayStation Bangladesh.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200/70 pb-2.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Receipt className="w-4 h-4 text-slate-500" /> Plan Subscribed
                </span>
                <span className="text-[#FF5A36] uppercase tracking-wide font-extrabold">
                  {plan} ({duration})
                </span>
              </div>

              {amount && (
                <div className="flex items-center justify-between text-slate-700">
                  <span>Amount Paid</span>
                  <span className="font-bold text-slate-900 text-base">৳{amount} BDT</span>
                </div>
              )}

              {invoice && (
                <div className="flex items-center justify-between text-slate-700">
                  <span>Invoice Number</span>
                  <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {invoice}
                  </span>
                </div>
              )}

              {trxId && (
                <div className="flex items-center justify-between text-slate-700">
                  <span>PayStation TrxID</span>
                  <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {trxId}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-700">
                <span>Payment Gateway</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" /> {method}
                </span>
              </div>
            </div>

            {/* Activation steps */}
            <div className="bg-orange-50/60 border border-orange-200/60 rounded-xl p-3.5 text-xs text-orange-900/90 text-left space-y-1">
              <p className="font-bold text-orange-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FF5A36]" /> Instant Access Ready:
              </p>
              <p>Your subscription is active. Click below to access your MenuSnap dashboard or explore 3,000+ restaurant menus.</p>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold h-12 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
                  <span>Go to MenuSnap Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 font-semibold text-xs">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            {/* Error or Cancel Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center border-4 border-red-100 shadow-inner">
              {isCancelled ? (
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </div>

            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                isCancelled
                  ? 'bg-amber-100/70 text-amber-800 border-amber-200'
                  : 'bg-red-100/70 text-red-800 border-red-200'
              }`}>
                {isCancelled ? 'Payment Cancelled' : 'Payment Incomplete'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isCancelled ? 'Payment Was Cancelled' : 'Transaction Not Completed'}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                {message ||
                  (isCancelled
                    ? 'You cancelled the payment process on the PayStation gateway.'
                    : 'The payment could not be verified or completed. No money was charged to your account.')}
              </p>
            </div>

            {invoice && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 font-mono">
                Invoice Reference: {invoice}
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <Link href="/#pricing" className="block w-full">
                <Button className="w-full bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold h-12 rounded-xl text-sm shadow-md flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again / Choose Plan</span>
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 font-semibold text-xs">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFDFC] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <CheckoutResultContent />
    </Suspense>
  );
}
