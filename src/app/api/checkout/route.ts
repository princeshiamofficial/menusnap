import { NextResponse } from "next/server";
import { COUPON, PLANS } from "@/lib/data";
import { isBangladeshPhone, isBillingPeriod, isEmail, isPlanId, sanitizeString } from "@/lib/validation";
import type { CheckoutResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse<CheckoutResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  const name = sanitizeString(record.name, 120);
  const email = sanitizeString(record.email, 200);
  const phone = sanitizeString(record.phone, 30);
  const plan = record.plan;
  const billingPeriod = record.billingPeriod;
  const couponCode = sanitizeString(record.couponCode, 40);

  if (!name) {
    return NextResponse.json({ ok: false, message: "Name is required." }, { status: 400 });
  }
  if (!email || !isEmail(email)) {
    return NextResponse.json({ ok: false, message: "A valid email is required." }, { status: 400 });
  }
  if (!phone || !isBangladeshPhone(phone)) {
    return NextResponse.json(
      { ok: false, message: "A valid Bangladeshi phone number is required." },
      { status: 400 },
    );
  }
  if (!isPlanId(plan) || !isBillingPeriod(billingPeriod)) {
    return NextResponse.json(
      { ok: false, message: "Invalid plan or billing period." },
      { status: 400 },
    );
  }

  const planConfig = PLANS.find((p) => p.id === plan)!;

  let discount = 0;
  const couponIsValid =
    couponCode !== null && couponCode.toUpperCase() === COUPON.code;
  if (couponIsValid && plan === "pro" && billingPeriod === "3m") {
    discount = COUPON.discount;
  }

  const quarterly = planConfig.quarterly ?? planConfig.monthly * 3;
  const amount =
    plan === "starter" || billingPeriod === "1m"
      ? planConfig.monthly
      : quarterly - discount;

  // We can return a helpful launch response or integrate PayStation if configured
  return NextResponse.json({
    ok: true,
    checkoutId: "ck_" + Date.now(),
    redirectUrl: "",
    message: "Checkout initiated. Our team will contact you shortly to activate your account.",
  });
}
