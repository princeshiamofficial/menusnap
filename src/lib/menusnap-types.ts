export type UserRole = "user" | "admin" | "agency";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export type SubscriptionStatus = "active" | "expired" | "pending" | "cancelled";
export type PlanTier = "starter" | "pro" | "agency";
export type BillingPeriod = "1_month" | "3_months";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  billingPeriod: BillingPeriod;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  location: string;
  logo?: string;
  itemCount: number;
  priceRange: string;
  sourceMetadata?: {
    verifiedAt: string;
    sourceType: "menu_card" | "social_page" | "official_website";
  };
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
  restaurantName: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  referencePrice: number;
  lastVerifiedAt: string;
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
  categoryName: string;
  name: string;
  description: string;
  price: number;
  order: number;
}

export interface Coupon {
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  active: boolean;
}

export type PaymentGateway = "bkash" | "nagad" | "sslcommerz" | "card";
export type PaymentStatus = "pending" | "verified" | "failed";

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  status: PaymentStatus;
  transactionId: string;
  gateway: PaymentGateway;
  createdAt: string;
}

export interface CheckoutSessionInput {
  name: string;
  email: string;
  phone: string;
  plan: PlanTier;
  billingDuration: BillingPeriod;
  couponCode?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  activationToken?: string;
  error?: string;
}
