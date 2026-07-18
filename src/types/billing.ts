export type PlanType = "free" | "pro" | "business" | "enterprise";

export type TransactionType = "purchase" | "usage" | "bonus" | "refund";

export interface CreditTransactionRecord {
  id: string;
  userId: string;
  amount: number; // positive for credits added, negative for credits deducted
  type: TransactionType;
  description: string;
  stripePaymentId: string | null;
  designId: string | null;
  createdAt: number;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: PlanType;
  status: "active" | "cancelled" | "past_due" | "none";
  monthlyCredits: number;
  currentPeriodEnd: number; // timestamp
  createdAt: number;
  updatedAt: number;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  credits: number;
  features: string[];
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}
