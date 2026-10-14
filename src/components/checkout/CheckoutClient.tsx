"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { COUPON, PLANS, type BillingPeriod, type PlanId } from "@/lib/data";
import { createCheckoutSession } from "@/lib/checkout";
import { trackEvent } from "@/lib/analytics";
import { Logo } from "@/components/landing/Logo";
import { ArrowRightIcon, LockIcon, ShieldIcon } from "@/components/landing/icons";

type Status = "idle" | "submitting" | "done" | "error";

function computePrice(planId: PlanId, period: BillingPeriod, coupon: boolean): number {
  if (planId === "starter") return 499;
  const plan = PLANS.find((p) => p.id === planId)!;
  if (period === "1m") return plan.monthly;
  const quarterly = plan.quarterly ?? plan.monthly * 3;
  return coupon && planId === "pro" ? quarterly - COUPON.discount : quarterly;
}

function CheckoutForm() {
  const params = useSearchParams();
  const planId = (params.get("plan") as PlanId | null) ?? "pro";
  const period = (params.get("period") as BillingPeriod | null) ?? "1m";
  const couponParam = params.get("coupon")?.toUpperCase() === COUPON.code;

  const plan = PLANS.find((p) => p.id === planId) ?? PLANS.find((p) => p.id === "pro")!;
  const [periodState, setPeriodState] = useState<BillingPeriod>(period);
  const [couponApplied] = useState(couponParam);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const price = useMemo(
    () => computePrice(plan.id, periodState, couponApplied),
    [plan.id, periodState, couponApplied],
  );

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setStatus("error");
      setMessage("Please fill in your name, email and phone number.");
      return;
    }
    setStatus("submitting");
    setMessage(null);
    trackEvent("checkoutStarted", { plan: plan.id, period: periodState });
    try {
      const response = await createCheckoutSession({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        plan: plan.id,
        billingPeriod: periodState,
        couponCode: couponApplied ? COUPON.code : undefined,
      });
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
        return;
      }
      setStatus("done");
      setMessage(response.message);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Order summary */}
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
        <div className="border-b border-line bg-cream/60 px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Your order</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-lg font-extrabold text-ink">{plan.name} Plan</p>
              <p className="text-sm text-muted">
                {periodState === "1m" ? "1 Month" : "3 Months"}
                {couponApplied && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-extrabold text-accent-deep">
                    {COUPON.code} applied
                  </span>
                )}
              </p>
            </div>
            <p className="text-right">
              <span className="block text-2xl font-extrabold text-ink">৳{price}</span>
              {couponApplied && periodState === "3m" && plan.id === "pro" && (
                <span className="text-xs font-bold text-success">Save ৳{COUPON.discount}</span>
              )}
            </p>
          </div>
        </div>

        {/* Billing duration choice (if the plan supports it) */}
        {plan.id !== "starter" && (
          <div className="flex gap-2 border-b border-line px-6 py-4">
            {(["1m", "3m"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodState(p)}
                aria-pressed={periodState === p}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-bold transition-all",
                  periodState === p
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-muted hover:text-ink",
                )}
              >
                {p === "1m" ? "1 Month" : "3 Months — Save More"}
              </button>
            ))}
          </div>
        )}

        {/* Contact form */}
        <div className="flex flex-col gap-4 px-6 py-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="co-name" className="text-sm font-bold text-ink">
              Your name
            </label>
            <input
              id="co-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rahim Uddin"
              className="rounded-xl border border-line bg-cream/50 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="co-email" className="text-sm font-bold text-ink">
              Email
            </label>
            <input
              id="co-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="rounded-xl border border-line bg-cream/50 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="co-phone" className="text-sm font-bold text-ink">
              Phone number (Bangladesh)
            </label>
            <input
              id="co-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="01XXXXXXXXX"
              className="rounded-xl border border-line bg-cream/50 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
            />
          </div>

          {/* Status / messages */}
          {status === "done" && message && (
            <div className="rounded-2xl border border-success/30 bg-success/5 px-4 py-3.5 text-sm leading-relaxed text-ink">
              <span className="font-bold text-success">Checkout session ready: </span>
              {message}
            </div>
          )}
          {status === "error" && message && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p>
          )}
          {status === "idle" && (
            <p className="rounded-xl bg-cream px-4 py-3 text-xs leading-relaxed text-muted">
              After payment is verified server-side, your account is activated and secure
              login instructions are sent to your email. No plain-text passwords — ever.
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={status === "submitting"}
            className="group mt-1 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-bold text-white shadow-pop transition-all hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Preparing secure payment…
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-muted">
            <LockIcon className="h-3.5 w-3.5 text-success" />
            256-bit encrypted · bKash · Nagad · Cards (at launch)
          </p>
        </div>
      </div>
    </div>
  );
}

export function CheckoutClient() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <div className="container-site flex h-16 items-center justify-between">
          <a href="/" aria-label="Back to MenuSnap home">
            <Logo />
          </a>
          <a
            href="/"
            className="text-sm font-bold text-muted transition-colors hover:text-ink"
          >
            ← Back to home
          </a>
        </div>
      </header>

      <main className="container-site py-10 sm:py-14">
        <div className="mx-auto mb-8 max-w-lg text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-[13px] font-bold text-ink shadow-card">
            <ShieldIcon className="h-4 w-4 text-accent" />
            Secure Checkout
          </p>
          <h1 className="mt-4 text-balance text-[clamp(1.6rem,3.4vw,2.2rem)] font-extrabold tracking-tight text-ink">
            Almost there — complete your order
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Research Less. Build Smarter. Your account activates right after verified payment.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-lg rounded-3xl border border-line bg-white p-10 text-center text-sm text-muted shadow-lift">
              Loading checkout…
            </div>
          }
        >
          <CheckoutForm />
        </Suspense>
      </main>
    </div>
  );
}