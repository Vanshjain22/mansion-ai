"use client";

import { cn } from "@/lib/utils/cn";

interface ROIBudgetBreakdownCardProps {
  className?: string;
  estimatedBudget?: string;
  expectedROI?: string;
  furnitureCost?: string;
  paintCost?: string;
  lightingCost?: string;
  propertyValueIncrease?: string;
}

export function ROIBudgetBreakdownCard({
  className,
  estimatedBudget = "₹2,30,000",
  expectedROI = "18%",
  furnitureCost = "₹95,000",
  paintCost = "₹18,000",
  lightingCost = "₹32,000",
  propertyValueIncrease = "+9%",
}: ROIBudgetBreakdownCardProps) {
  // Breakdown list for cost distribution
  const costItems = [
    { label: "Furniture Cost", value: furnitureCost, percentage: 41, icon: "🛋️" },
    { label: "Lighting & Fixtures", value: lightingCost, percentage: 14, icon: "💡" },
    { label: "Paint & Wall Finishes", value: paintCost, percentage: 8, icon: "🎨" },
    { label: "Labor & Fitting (Est.)", value: "₹85,000", percentage: 37, icon: "🛠️" },
  ];

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border border-border-default",
        "bg-gradient-to-b from-bg-secondary/90 via-bg-primary/95 to-bg-secondary/90",
        "p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 space-y-4",
        className
      )}
    >
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-primary" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            💰
          </span>
          <div>
            <h3 className="text-xs font-bold font-[family-name:var(--font-outfit)] text-text-primary tracking-wide">
              Estimated Investment & ROI Matrix
            </h3>
            <p className="text-[10px] text-text-tertiary">
              AI-projected budget allocation & property value appreciation
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          AI Cost Engine
        </span>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Estimated Budget */}
        <div className="p-3 rounded-xl bg-bg-tertiary/60 border border-border-subtle hover:border-brand-primary/40 transition-colors">
          <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-0.5">
            Estimated Budget
          </span>
          <span className="text-lg font-bold font-[family-name:var(--font-outfit)] text-gradient-gold">
            {estimatedBudget}
          </span>
        </div>

        {/* Expected ROI */}
        <div className="p-3 rounded-xl bg-bg-tertiary/60 border border-border-subtle hover:border-emerald-500/40 transition-colors">
          <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-0.5">
            Expected ROI
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold font-[family-name:var(--font-outfit)] text-emerald-400">
              {expectedROI}
            </span>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
              📈
            </span>
          </div>
        </div>

        {/* Property Value Increase */}
        <div className="p-3 rounded-xl bg-bg-tertiary/60 border border-border-subtle hover:border-brand-primary/40 transition-colors">
          <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-0.5">
            Property Appreciation
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary">
              {propertyValueIncrease}
            </span>
            <span className="text-xs text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded font-mono">
              🏛️
            </span>
          </div>
        </div>
      </div>

      {/* Visual Cost Allocation Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-text-secondary">Cost Distribution</span>
          <span className="text-text-tertiary font-mono">100% Allocated</span>
        </div>
        <div className="h-2 w-full rounded-full bg-bg-tertiary overflow-hidden flex">
          <div style={{ width: "41%" }} className="bg-brand-primary h-full" title="Furniture (41%)" />
          <div style={{ width: "14%" }} className="bg-amber-400 h-full" title="Lighting (14%)" />
          <div style={{ width: "8%" }} className="bg-cyan-400 h-full" title="Paint (8%)" />
          <div style={{ width: "37%" }} className="bg-emerald-400 h-full" title="Labor & Fitting (37%)" />
        </div>
      </div>

      {/* Detailed Cost Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {costItems.map((item) => (
          <div
            key={item.label}
            className="p-2.5 rounded-xl bg-bg-tertiary/40 border border-border-subtle/70 hover:border-brand-primary/30 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-1">
              <span>{item.icon}</span>
              <span className="truncate text-[11px]">{item.label}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-text-primary">
                {item.value}
              </span>
              <span className="text-[10px] font-mono text-text-tertiary">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
