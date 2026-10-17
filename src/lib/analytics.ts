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
  | "begin_checkout"
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

export interface BeginCheckoutItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
}

export interface BeginCheckoutParams {
  planId: string;
  planName: string;
  price: number;
  currency?: string;
  coupon?: string;
  checkoutMethod?: string;
  eventId?: string;
}

/**
 * Pushes GA4 & GTM standard ecommerce `begin_checkout` event to window.dataLayer
 * and forwards InitiateCheckout to Meta Pixel (fbq) with optional eventId for CAPI deduplication.
 */
export function trackBeginCheckout({
  planId,
  planName,
  price,
  currency = "BDT",
  coupon,
  checkoutMethod = "online",
  eventId,
}: BeginCheckoutParams): void {
  if (typeof window === "undefined") return;

  const cleanPlanId = String(planId).toLowerCase().trim();
  const cleanPrice = Number(price) || 0;
  const cleanCurrency = currency || "BDT";
  const formattedItemName = planName.startsWith("MenuSnap")
    ? planName
    : `MenuSnap ${planName.replace(/\s*Plan$/i, "")}`;

  const items: BeginCheckoutItem[] = [
    {
      item_id: cleanPlanId,
      item_name: formattedItemName,
      price: cleanPrice,
      quantity: 1,
      item_category: "Software Subscription",
      item_variant: "lifetime",
    },
  ];

  const ecommercePayload: Record<string, unknown> = {
    currency: cleanCurrency,
    value: cleanPrice,
    items,
  };

  if (coupon) {
    ecommercePayload.coupon = coupon;
  }

  try {
    // 1. Safe dataLayer initialization
    window.dataLayer = window.dataLayer || [];

    // Clear previous ecommerce object per GA4 / GTM best practice to prevent state pollution
    window.dataLayer.push({ ecommerce: null });

    // 2. Push standard begin_checkout event
    const dataLayerEvent: Record<string, unknown> = {
      event: "begin_checkout",
      ecommerce: ecommercePayload,
      plan_id: cleanPlanId,
      checkout_method: checkoutMethod,
    };

    if (eventId) {
      dataLayerEvent.event_id = eventId;
    }

    window.dataLayer.push(dataLayerEvent);

    // 3. Forward to gtag if present
    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", ecommercePayload);
    }

    // 4. Forward to Meta Pixel if fbq is present
    if (typeof window.fbq === "function") {
      const pixelPayload: Record<string, unknown> = {
        content_name: formattedItemName,
        content_category: "Software Subscription",
        content_ids: [cleanPlanId],
        contents: [{ id: cleanPlanId, quantity: 1, item_price: cleanPrice }],
        value: cleanPrice,
        currency: cleanCurrency,
        num_items: 1,
      };

      if (eventId) {
        window.fbq("track", "InitiateCheckout", pixelPayload, { eventID: eventId });
      } else {
        window.fbq("track", "InitiateCheckout", pixelPayload);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.debug("[MenuSnap analytics] begin_checkout", dataLayerEvent);
    }
  } catch (err) {
    console.error("[MenuSnap analytics] Error pushing begin_checkout", err);
  }
}

export interface EbookLeadParams {
  eventId?: string;
  leadId: string | number;
  ebookName: string;
  leadType?: string;
  formId?: string;
}

/**
 * Pushes standard `ebook_lead` event to window.dataLayer for GTM
 * and optionally forwards Lead event to Meta Pixel (fbq).
 */
export function trackEbookLead({
  eventId,
  leadId,
  ebookName,
  leadType = "free_ebook",
  formId = "ebook_lead_form",
}: EbookLeadParams): void {
  if (typeof window === "undefined") return;

  const resolvedEventId = eventId || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    window.dataLayer = window.dataLayer || [];

    const payload: Record<string, unknown> = {
      event: "ebook_lead",
      event_id: resolvedEventId,
      lead_type: leadType,
      ebook_name: ebookName,
      lead_id: String(leadId),
      form_id: formId,
      page_location: window.location.href,
    };

    window.dataLayer.push(payload);

    // Forward to Meta Pixel if fbq is present
    if (typeof window.fbq === "function") {
      const pixelParams: Record<string, unknown> = {
        content_name: ebookName,
        content_category: leadType,
      };
      window.fbq("track", "Lead", pixelParams, { eventID: resolvedEventId });
    }

    if (process.env.NODE_ENV === "development") {
      console.debug("[MenuSnap analytics] ebook_lead", payload);
    }
  } catch (err) {
    console.error("[MenuSnap analytics] Error pushing ebook_lead", err);
  }
}

