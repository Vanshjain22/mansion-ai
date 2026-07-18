"use client";

import { useEffect, useState } from "react";
import { PLANS } from "@/lib/stripe/client";
import { CreditCard, Calendar, ShoppingBag, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CreditTransactionRecord, SubscriptionRecord } from "@/types/billing";

/**
 * BillingDashboardPage — Credit balance ledger, subscription manager,
 * and daily consumption analytics dashboard.
 *
 * DESIGN HIGHLIGHTS:
 * 1. CSS BAR CHARTS: CSS flexbox based daily expenditure charting. Zero bundle
 *    overhead, instant thematic rendering.
 * 2. TRANSACTION HISTORY: Ledger showing positive purchases and negative deductions
 *    with corresponding date timestamps.
 * 3. STRIPE PORTAL LAUNCHERS: Calls portal APIs to launch card management windows.
 */

interface BillingData {
  credits: number;
  subscription: SubscriptionRecord;
  transactions: CreditTransactionRecord[];
  analytics: {
    totalSpent: number;
    totalPurchased: number;
    generationsCount: number;
    dailyUsage: Array<{ date: string; count: number }>;
  };
}

export default function BillingDashboardPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isPackLoading, setIsPackLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<string | null>(null);

  const fetchBillingInfo = async () => {
    try {
      const response = await fetch("/api/billing/usage");
      if (response.ok) {
        const json = await response.json();
        setData(json.data);
      }
    } catch (e) {
      console.error("Error loading billing info:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingInfo();

    // Parse URL parameter flags
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowAlert("payment_success");
    } else if (params.get("portal_mock") === "true") {
      setShowAlert("portal_mock");
    }
  }, []);

  const handleLaunchPortal = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      if (response.ok) {
        const json = await response.json();
        if (json.url) {
          window.location.href = json.url;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleBuyPack = async () => {
    setIsPackLoading(true);
    try {
      // priceId = "credits_pack_20" (one-time purchase)
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "credits_pack_20" }),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.url) {
          window.location.href = json.url;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPackLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-[1200px] mx-auto p-6 md:p-8 space-y-6">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 skeleton" />
          <div className="h-32 skeleton" />
          <div className="h-32 skeleton" />
        </div>
        <div className="h-64 skeleton" />
      </main>
    );
  }

  const creditsSpent = data?.analytics.totalSpent || 0;
  const maxSpentDay = data ? Math.max(...data.analytics.dailyUsage.map((u) => u.count), 1) : 1;

  return (
    <main className="max-w-[1200px] mx-auto p-6 md:p-8 space-y-8 animate-fade-in-up">
      
      {/* Alert Banners */}
      {showAlert === "payment_success" && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <strong>Payment Successful!</strong> Your credit balance and subscription status have been updated.
          </div>
        </div>
      )}
      {showAlert === "portal_mock" && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <strong>Mock Development Active:</strong> Real Stripe Portal redirects are bypassed. Add your Stripe keys to `.env` to enable live billing portal hooks.
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Billing & Usage
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Track balances, view payment ledgers, and manage plan details.
        </p>
      </div>

      {/* Top Cards: Balance, Subscriptions, Quick Purchases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Credit Balance Card */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
          <div>
            <span className="text-text-tertiary text-xs font-semibold uppercase tracking-wider">Available Credits</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold font-[family-name:var(--font-outfit)] text-brand-primary">
                {data?.credits}
              </span>
              <span className="text-text-secondary text-sm">credits</span>
            </div>
          </div>
          <p className="text-text-tertiary text-xs mt-4">1 generation consumes 1 credit.</p>
        </div>

        {/* Subscription details */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary text-xs font-semibold uppercase tracking-wider">Active Plan</span>
              <span className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0",
                data?.subscription.status === "active" ? "bg-success/15 text-success" : "bg-bg-tertiary text-text-tertiary"
              )}>
                {data?.subscription.plan === "free" ? "Free Tier" : "Pro Tier"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-text-secondary" />
              <span className="text-lg font-bold text-text-primary capitalize">{data?.subscription.plan} Plan</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle/50 flex items-center justify-between">
            {data?.subscription.plan !== "free" && data?.subscription.currentPeriodEnd ? (
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <Calendar className="w-3.5 h-3.5" />
                <span>Renews {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
            ) : (
              <span className="text-xs text-text-tertiary">Free plan has no expiration.</span>
            )}
            
            {data?.subscription.plan !== "free" && (
              <button
                onClick={handleLaunchPortal}
                disabled={isPortalLoading}
                className="text-xs text-brand-primary font-bold hover:underline focus-ring flex items-center gap-0.5"
              >
                {isPortalLoading ? "Loading..." : "Manage Portal"}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Quick purchases */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col justify-between">
          <div>
            <span className="text-text-tertiary text-xs font-semibold uppercase tracking-wider">Need more credits?</span>
            <div className="mt-3 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-brand-accent" />
              <span className="text-lg font-bold text-text-primary">20 Credits Pack</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">$5.00 one-time fee</p>
          </div>

          <button
            onClick={handleBuyPack}
            disabled={isPackLoading}
            className="w-full mt-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-lg transition-colors focus-ring"
          >
            {isPackLoading ? "Connecting..." : "Purchase Pack"}
          </button>
        </div>

      </div>

      {/* Analytics & Charts */}
      {creditsSpent > 0 && data && (
        <section className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle space-y-6">
          <div>
            <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">
              Credit Consumption
            </h3>
            <p className="text-text-secondary text-xs mt-0.5">
              Daily render expenditures over the last week.
            </p>
          </div>

          {/* CSS Native Bar Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-2.5 pt-4 border-b border-border-subtle/50 px-2">
            {data.analytics.dailyUsage.map((day) => {
              const heightPct = (day.count / maxSpentDay) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {day.count}
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500",
                      day.count > 0 ? "bg-brand-primary" : "bg-bg-tertiary"
                    )}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                  <span className="text-[10px] text-text-tertiary font-medium mt-1">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Transaction History Ledger */}
      <section className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle space-y-4">
        <div>
          <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">
            Billing History
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            Audit logs for credit purchases and generations.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-tertiary uppercase font-bold">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data?.transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-text-tertiary">
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                data?.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border-subtle/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/20">
                    <td className="py-3 px-2">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2 font-medium">{tx.description}</td>
                    <td className="py-3 px-2 capitalize">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold",
                        tx.type === "purchase" && "bg-success/10 text-success border border-success/20",
                        tx.type === "usage" && "bg-brand-primary/10 text-brand-primary border border-brand-primary/20",
                        tx.type === "bonus" && "bg-brand-accent-hover/10 text-brand-accent border border-brand-accent/20"
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={cn(
                      "py-3 px-2 text-right font-semibold",
                      tx.amount > 0 ? "text-success" : "text-text-secondary"
                    )}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </main>
  );
}
