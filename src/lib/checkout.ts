/**
 * Checkout client — the only place the frontend talks to the checkout API.
 *
 * Architecture notes:
 *  - The frontend NEVER processes payments. It only asks the server to create
 *    a checkout session and redirects the customer to the gateway.
 *  - A "payment successful" state reported by the client is never used to
 *    activate accounts. Activation is driven exclusively by server-side
 *    webhook / verification endpoints (see docs/ARCHITECTURE.md).
 *  - Payment credentials and private keys never reach the browser.
 */

import type { CheckoutRequest, CheckoutResponse } from "@/types";

export const CHECKOUT_ENDPOINTS = {
  create: "/api/checkout",
  verify: "/api/payments/verify",
  activate: "/api/subscriptions/activate",
  setupEmail: "/api/auth/setup",
} as const;

export async function createCheckoutSession(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  let response: Response;
  try {
    response = await fetch(CHECKOUT_ENDPOINTS.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("Network error. Please check your connection and try again.");
  }

  const data = (await response.json().catch(() => null)) as CheckoutResponse | null;
  if (!response.ok || !data) {
    throw new Error(data?.message ?? "Checkout is temporarily unavailable. Please try again.");
  }
  return data;
}