"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import Link from 'next/link';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = React.useState(false);

  const status = searchParams.get('status') || '';
  const invoice = searchParams.get('invoice') || '';
  const trxId = searchParams.get('trx_id') || '';
  const amount = searchParams.get('amount') || '';
  const plan = searchParams.get('plan') || 'Pro Plan';
  const duration = searchParams.get('duration') || 'Lifetime';
  const message = searchParams.get('message') || '';

  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const name = searchParams.get('name') || '';

  const statusLower = (status || '').toLowerCase();
  const isSuccess = statusLower === 'success' || statusLower === 'successful';
  const isCancelled = statusLower.includes('cancel');

  const registerParams = new URLSearchParams();
  registerParams.set('tab', 'register');
  registerParams.set('from', 'checkout');
  if (email) registerParams.set('email', email);
  if (phone) registerParams.set('whatsapp', phone);
  if (name) registerParams.set('name', name);
  if (plan) registerParams.set('plan', plan);

  const registerUrl = `/login?${registerParams.toString()}`;

  useEffect(() => {
    if (isSuccess) {
      const end = Date.now() + 2 * 1000;
      const colors = ['#EF4444', '#10B981', '#6366F1'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
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

  const handleCopyInvoice = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Subtle ambient red/rose backdrop glow */}
      {!isSuccess && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 aspect-square bg-red-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-8 relative z-10 transition-all ${
          isSuccess
            ? 'border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
            : 'border border-red-100/90 shadow-[0_8px_30px_rgba(239,68,68,0.06)]'
        }`}
      >
        {isSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/50 mb-2">
              Payment Successful
            </span>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Subscription Active
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
              Your order for <span className="font-medium text-slate-700">{plan}</span> has been confirmed.
            </p>

            {/* Receipt Summary */}
            <div className="w-full bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 my-5 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Plan</span>
                <span className="font-semibold text-slate-900">{plan}</span>
              </div>
              {amount && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Amount</span>
                  <span className="font-bold text-slate-900">৳{amount} BDT</span>
                </div>
              )}
              {invoice && (
                <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200/50">
                  <span>Invoice</span>
                  <span className="font-mono text-[11px] text-slate-800">{invoice}</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="w-full space-y-2">
              <Link href={registerUrl} className="block w-full">
                <Button className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold h-11 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]">
                  <span>Complete Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 text-xs font-medium h-9 rounded-xl">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* ================= CANCELLED / FAILED STATE (RED VIBE) ================= */
          <div className="flex flex-col items-center text-center">
            {/* Minimal Red Icon Badge */}
            <div className="w-12 h-12 rounded-full bg-red-50/90 border border-red-100 text-red-500 flex items-center justify-center mb-4 shadow-sm shadow-red-500/5">
              <AlertCircle className="w-5 h-5 text-red-500 stroke-[2.2]" />
            </div>

            {/* Minimal Red Status Pill */}
            <span className="text-[11px] font-semibold tracking-wider uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60 mb-2">
              {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
            </span>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isCancelled ? 'Payment Was Cancelled' : 'Payment Incomplete'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
              {message || (isCancelled 
                ? 'You cancelled the payment request. No amount was charged to your account.' 
                : 'The transaction could not be completed. No amount was deducted.')}
            </p>

            {/* Invoice Ref Badge with soft red tint */}
            {invoice && (
              <button
                type="button"
                onClick={() => handleCopyInvoice(invoice)}
                title="Click to copy invoice reference"
                className="my-5 w-full bg-red-50/25 hover:bg-red-50/50 border border-red-100/80 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] text-slate-600 transition-colors cursor-pointer group"
              >
                <span className="text-red-400 font-medium">Invoice Ref</span>
                <span className="font-mono text-slate-700 truncate max-w-[200px]">{invoice}</span>
                <span className="text-slate-400 group-hover:text-red-500 flex items-center gap-1">
                  {copied ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            )}

            {/* CTAs with vibrant Red Vibe */}
            <div className={`w-full space-y-2 ${!invoice ? 'mt-6' : ''}`}>
              <Link href="/#pricing" className="block w-full">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold h-11 rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again / Choose Plan</span>
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50/40 text-xs font-medium h-9 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Homepage</span>
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
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutResultContent />
    </Suspense>
  );
}
