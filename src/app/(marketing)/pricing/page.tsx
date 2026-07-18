"use client";

import { useState } from "react";
import { PLANS } from "@/lib/stripe/client";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * PricingPage — Premium SaaS billing plans matrix.
 *
 * DESIGN CONCEPTS:
 * 1. TOGGLE FREQUENCY: Monthly/Yearly toggle with 20% discount highlight.
 * 2. PRO CARD HIGHLIGHT: Prominently brands the "Pro" plan with glowing
 *    borders and pulse effects to guide conversions (the "Default Option" pattern).
 * 3. STRIPE REDIRECT TRIGGERS: Triggers POST /api/billing/checkout and
 *    redirects browser directly to the checkout page.
 * 4. ACCESSIBILITY COMPLIANT: Use of semantic lists and readable details.
 */

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string, priceId: string) => {
    if (planId === "free") return; // Free plan requires no checkout

    setLoadingPlan(planId);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize checkout.");
      }

      const json = await response.json();
      if (json.url) {
        // Redirect browser to Stripe Checkout or simulated Mock gateway
        window.location.href = json.url;
      }
    } catch (error) {
      console.error(error);
      alert("Error initiating checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen pb-20">
      
      {/* Title Header */}
      <section className="text-center py-20 px-4 max-w-3xl mx-auto space-y-4 animate-fade-in-up">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Plans for every <span className="text-gradient">creative scale</span>
        </h1>
        <p className="text-text-secondary text-base sm:text-lg">
          Whether you are remodeling a single guest bedroom or managing a complete interior design agency, select a plan that fits.
        </p>

        {/* Monthly/Yearly Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <span className={cn("text-sm transition-colors", billingPeriod === "monthly" ? "text-text-primary font-medium" : "text-text-tertiary")}>
            Monthly billing
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 rounded-full bg-bg-tertiary border border-border-default relative p-0.5 transition-colors focus-ring"
            aria-label="Toggle pricing period"
          >
            <div
              className={cn(
                "w-45 h-45 w-4.5 h-4.5 rounded-full bg-brand-primary transition-transform duration-200",
                billingPeriod === "yearly" ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm transition-colors", billingPeriod === "yearly" ? "text-text-primary font-medium" : "text-text-tertiary")}>
              Yearly billing
            </span>
            <span className="text-[10px] font-bold text-brand-accent bg-brand-accent-hover/10 px-2 py-0.5 rounded-full border border-brand-accent/20">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* Plans Matrix Grid */}
      <section className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Free Plan */}
        <div className="flex flex-col justify-between p-8 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-border-default transition-all duration-300">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">{PLANS.free.name}</h3>
              <p className="text-xs text-text-tertiary mt-1 min-h-[32px]">{PLANS.free.description}</p>
            </div>
            <div className="flex items-baseline text-text-primary">
              <span className="text-4xl font-extrabold font-[family-name:var(--font-outfit)]">$0</span>
              <span className="text-text-tertiary text-xs ml-1">/ month</span>
            </div>
            
            <button
              disabled
              className="w-full py-3 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-xs transition-colors cursor-not-allowed border border-border-subtle"
            >
              Default plan
            </button>

            <ul className="space-y-3.5 text-xs text-text-secondary border-t border-border-subtle pt-6">
              {PLANS.free.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pro Plan (Highlighted conversion target) */}
        <div className="flex flex-col justify-between p-8 rounded-2xl bg-bg-secondary border-2 border-brand-primary shadow-[0_0_24px_hsl(265_83%_57%/0.15)] relative scale-100 md:scale-[1.03] transition-all duration-300">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-white bg-brand-primary px-3 py-1 rounded-full shadow-md">
            Most Popular
          </span>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">{PLANS.pro.name}</h3>
              <p className="text-xs text-text-tertiary mt-1 min-h-[32px]">{PLANS.pro.description}</p>
            </div>
            <div className="flex items-baseline text-text-primary">
              <span className="text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                ${billingPeriod === "monthly" ? PLANS.pro.priceMonthly : PLANS.pro.priceYearly / 12}
              </span>
              <span className="text-text-tertiary text-xs ml-1">/ month</span>
            </div>

            <button
              onClick={() => handleCheckout("pro", billingPeriod === "monthly" ? PLANS.pro.stripePriceIdMonthly : PLANS.pro.stripePriceIdYearly)}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs transition-all shadow-md focus-ring flex items-center justify-center gap-1"
            >
              {loadingPlan === "pro" ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Subscribe to Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <ul className="space-y-3.5 text-xs text-text-secondary border-t border-border-brand pt-6">
              {PLANS.pro.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Business Plan */}
        <div className="flex flex-col justify-between p-8 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-border-default transition-all duration-300">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">{PLANS.business.name}</h3>
              <p className="text-xs text-text-tertiary mt-1 min-h-[32px]">{PLANS.business.description}</p>
            </div>
            <div className="flex items-baseline text-text-primary">
              <span className="text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                ${billingPeriod === "monthly" ? PLANS.business.priceMonthly : PLANS.business.priceYearly / 12}
              </span>
              <span className="text-text-tertiary text-xs ml-1">/ month</span>
            </div>

            <button
              onClick={() => handleCheckout("business", billingPeriod === "monthly" ? PLANS.business.stripePriceIdMonthly : PLANS.business.stripePriceIdYearly)}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl bg-bg-tertiary hover:bg-bg-elevated text-text-primary font-semibold text-xs border border-border-default transition-all focus-ring flex items-center justify-center gap-1"
            >
              {loadingPlan === "business" ? (
                <div className="w-4 h-4 rounded-full border-2 border-text-primary border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Subscribe to Business</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <ul className="space-y-3.5 text-xs text-text-secondary border-t border-border-subtle pt-6">
              {PLANS.business.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>
      
      {/* Enterprise callout (Architectural support for custom contracts) */}
      <section className="max-w-[1200px] mx-auto px-4 mt-16">
        <div className="p-8 rounded-2xl glass border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">Enterprise Custom Contracts</h4>
            <p className="text-xs text-text-secondary">Custom GPU allocation, API integration support, and volume discounts for professional studios.</p>
          </div>
          <button 
            onClick={() => alert("Enterprise contact request simulation sent!")}
            className="px-6 py-2.5 rounded-xl bg-bg-tertiary hover:bg-bg-elevated text-text-primary font-semibold text-xs border border-border-default transition-colors focus-ring"
          >
            Contact Sales
          </button>
        </div>
      </section>

    </main>
  );
}
