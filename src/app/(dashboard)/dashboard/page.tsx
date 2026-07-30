"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Images, Coins, TrendingUp, ArrowRight, Zap } from "lucide-react";

/**
 * Dashboard Home — Overview page with credit balance, recent designs, and quick actions.
 */

interface UsageData {
  credits: number;
  analytics: {
    totalSpent: number;
    totalPurchased: number;
    generationsCount: number;
  };
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing/usage")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setUsage(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Credits Remaining",
      value: usage?.credits ?? "—",
      icon: Coins,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Total Designs",
      value: usage?.analytics.generationsCount ?? "—",
      icon: Images,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Credits Earned",
      value: usage?.analytics.totalPurchased ?? "—",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Credits Used",
      value: usage?.analytics.totalSpent ?? "—",
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Your AI interior design studio at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-brand-primary/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded bg-bg-tertiary animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/generation-demo"
          className="group p-6 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 hover:border-brand-primary/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <h3 className="font-semibold">Create New Design</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Upload a room photo and transform it with AI-powered design styles.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/dashboard/designs"
          className="group p-6 rounded-2xl bg-bg-secondary border border-border-subtle hover:border-brand-primary/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Images className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Browse My Designs</h3>
              </div>
              <p className="text-sm text-text-secondary">
                View, download, and manage your AI-generated room designs.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
