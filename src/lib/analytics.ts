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

export function trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    // Dispatch custom event for GTM/Pixel/Segment
    try {
      window.dispatchEvent(
        new CustomEvent("menusnap:event", {
          detail: { event, payload, timestamp: Date.now() },
        })
      );
      // Optional: console debug in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${event}`, payload);
      }
    } catch {
      // safe fallback
    }
  }
}
