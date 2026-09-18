import Stripe from "stripe";
import type { PlanConfig } from "@/types/billing";

/**
 * STRIPE BILLING SERVICE
 *
 * Encapsulates all backend Stripe interactions:
 * 1. Checkout session creation (Plan subscriptions & credit purchases)
 * 2. Customer billing portal creation (Subscription cancellations/upgrades)
 * 3. Webhook signatures verification
 *
 * SAAS PRICING CONFIGURATION:
 * We support 3 main tiers (Free, Pro, Business).
 * Under a production environment, Price IDs should map to real prices inside
 * your Stripe Dashboard.
 */

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfect for exploring room layouts.",
    priceMonthly: 0,
    priceYearly: 0,
    credits: 10,
    features: [
      "10 onboarding credits",
      "Standard SDXL speed",
      "Upload JPG/PNG/WebP",
      "Public gallery visibility",
    ],
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Great for design enthusiasts and homeowners.",
    priceMonthly: 19,
    priceYearly: 144, // $12/month billed annually
    credits: 100, // 100 credits per month
    features: [
      "100 credits monthly",
      "Priority generation worker queue",
      "High resolution upscaling",
      "Private folder collections",
      "Unlimited file uploads",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "price_mock_pro_monthly_19",
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || "price_mock_pro_yearly_144",
  },
  business: {
    id: "business",
    name: "Business",
    description: "For professional interior designers & realtors.",
    priceMonthly: 49,
    priceYearly: 420, // $35/month billed annually
    credits: 500, // 500 credits per month
    features: [
      "500 credits monthly",
      "Commercial usage license",
      "Fastest dedicated GPU inference",
      "Premium customer support",
      "Early access to new styles",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY || "price_mock_business_monthly_49",
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_BUSINESS_YEARLY || "price_mock_business_yearly_420",
  },
};

/** Mock billing is strictly for local development and is never available in production. */
export function isMockBillingEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Initialize Stripe instance.
 * Throws a helpful warning instead of crashing if keys are missing.
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY must be configured before Stripe can be used.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-01-27.accredited" as any, // use current API version structure
  });
}

/** Helper to resolve a Plan configuration by Stripe Price ID */
export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS).find(
    (p) => p.stripePriceIdMonthly === priceId || p.stripePriceIdYearly === priceId
  );
}
