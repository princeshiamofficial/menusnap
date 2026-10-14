/**
 * Core data model for the MenuSnap platform.
 *
 * These interfaces are the shared contract between the frontend and the
 * (future) backend. They mirror the database models documented in
 * docs/ARCHITECTURE.md and are designed to scale beyond 500 restaurants
 * (indexed lookups, pagination, caching-friendly shapes).
 */

export type UserRole = "customer" | "agency" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export type PlanId = "starter" | "pro" | "agency";
export type BillingPeriod = "1m" | "3m";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface Subscription {
  userId: string;
  plan: PlanId;
  billingPeriod: BillingPeriod;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  location?: string;
  logo?: string;
  /** e.g. source URL, verified-at timestamp, verifier id */
  sourceMetadata?: Record<string, string>;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  /** Listed price reference only — never a guarantee or recommendation. */
  referencePrice?: number;
  lastVerifiedAt?: string;
}

export interface UserMenu {
  id: string;
  userId: string;
  name: string;
  restaurantName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserMenuItem {
  id: string;
  userMenuId: string;
  categoryId: string;
  name: string;
  description?: string;
  price?: number;
  order: number;
}

export type CouponDiscountType = "fixed" | "percent";

export interface Coupon {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  active: boolean;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentGateway = "bkash" | "nagad" | "sslcommerz" | "card";

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  transactionId: string;
  gateway: PaymentGateway;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Checkout / auth API contracts                                       */
/* ------------------------------------------------------------------ */

export interface CheckoutRequest {
  name: string;
  email: string;
  phone: string;
  plan: PlanId;
  billingPeriod: BillingPeriod;
  couponCode?: string;
}

export interface CheckoutResponse {
  ok: boolean;
  /** Gateway session id created server-side. */
  checkoutId?: string;
  /** Where to send the customer for secure payment. */
  redirectUrl?: string;
  message: string;
}

export interface VerifyPaymentRequest {
  checkoutId: string;
  transactionId: string;
}

export interface ActivateSubscriptionRequest {
  checkoutId: string;
}

export interface SetupEmailRequest {
  userId: string;
  email: string;
}

export interface ApiError {
  ok: false;
  message: string;
}