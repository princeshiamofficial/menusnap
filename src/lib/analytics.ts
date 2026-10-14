/**
 * Funnel event tracking for MenuSnap.
 *
 * Events are pushed to `window.dataLayer` (Google Tag Manager convention)
 * and forwarded to `window.gtag` when present. In development they are
 * logged to the console. If no analytics container is configured this is a
 * harmless no-op — tracking never blocks or slows down the page.
 */

export const EVENTS = {
  heroCtaClicked: "hero_cta_clicked",
  demoStarted: "demo_started",
  demoCompleted: "demo_completed",
  pricingViewed: "pricing_viewed",
  billingPeriodChanged: "billing_period_changed",
  couponUsed: "coupon_used",
  planSelected: "plan_selected",
  checkoutStarted: "checkout_started",
  paymentSuccess: "payment_success",
  faqOpened: "faq_opened",
  finalCtaClicked: "final_cta_clicked",
  mobileCtaClicked: "mobile_cta_clicked",
  addToMenu: "add_to_menu",
  explorerFilter: "explorer_filter",
} as const;

export type AnalyticsEvent =
  | "hero_cta_clicked"
  | "demo_started"
  | "demo_completed"
  | "pricing_viewed"
  | "billing_period_changed"
  | "coupon_used"
  | "plan_selected"
  | "checkout_started"
  | "checkout_initiated"
  | "payment_success"
  | "faq_opened"
  | "final_cta_clicked";

export type EventName = keyof typeof EVENTS | AnalyticsEvent | (string & {});

type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Track a funnel event by its key or string name. */
export function trackEvent(event: EventName, props: EventProps = {}): void {
  const name = (EVENTS as Record<string, string>)[event] || event;
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...props });
    if (typeof window.gtag === "function") {
      window.gtag("event", name, props);
    }
    if (process.env.NODE_ENV === "development") {
      console.debug("[MenuSnap analytics]", name, props);
    }
  } catch {
    // Analytics must never break the page.
  }
}
