/**
 * Server-side input validation helpers. All user-supplied input that reaches
 * API routes must pass through here (or an equivalent schema validator)
 * before being used. Never trust raw client input.
 */

import type { BillingPeriod, PlanId } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BD_PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const PLAN_IDS: readonly PlanId[] = ["starter", "pro", "agency"];
const BILLING_PERIODS: readonly BillingPeriod[] = ["1m", "3m"];

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isBangladeshPhone(value: string): boolean {
  return BD_PHONE_RE.test(value.replace(/[\s-]/g, ""));
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

export function isBillingPeriod(value: unknown): value is BillingPeriod {
  return typeof value === "string" && (BILLING_PERIODS as readonly string[]).includes(value);
}

/** Trim + strip control characters. Returns null when empty or too long. */
export function sanitizeString(value: unknown, maxLength = 200): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (cleaned.length === 0 || cleaned.length > maxLength) return null;
  return cleaned;
}

export function isSafeId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(value);
}