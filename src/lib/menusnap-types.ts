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
export type PlanTier = "starter" | "pro" | "agency" | string;
export type BillingPeriod = "lifetime" | "one_time" | "1_month" | "3_months" | string;

export interface PricingPackage {
  id: number;
  package_id: string;
  name: string;
  tagline: string;
  badge_text?: string | null;
  price: number;
  original_price?: number | null;
  billing_period_text?: string | null;
  discount_tag?: string | null;
  coupon_code?: string | null;
  coupon_discount?: number | null;
  features: string[];
  feature_highlight_title?: string | null;
  button_text: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  is_category_unlimited?: boolean;
  category_limit?: number;
  is_item_unlimited?: boolean;
  item_limit?: number;
  created_at?: string;
  updated_at?: string;
}

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

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  applicable_package: string; // 'all' or package_id
  min_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

