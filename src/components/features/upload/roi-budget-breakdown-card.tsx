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
        "relative rounded-2xl overflow-hidden border border-border-default/80",
        "bg-gradient-to-b from-bg-secondary/90 via-bg-primary/95 to-bg-secondary/90",
        "p-5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 space-y-5",
        className
      )}
    >
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-primary opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs shrink-0 flex items-center justify-center">
            💰
          </div>
          <div>
            <h3 className="text-xs font-bold font-[family-name:var(--font-outfit)] text-text-primary tracking-wide">
              Estimated Investment & ROI Matrix
            </h3>
            <p className="text-[11px] text-text-tertiary mt-0.5 leading-normal">
              AI-projected budget allocation & property value appreciation
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          AI Cost Engine
        </span>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Estimated Budget */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-brand-primary/30 transition-all duration-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1.5 font-medium">
            Estimated Budget
          </span>
          <span className="text-lg font-bold font-[family-name:var(--font-outfit)] text-gradient-gold tracking-tight">
            {estimatedBudget}
          </span>
        </div>

        {/* Expected ROI */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-emerald-500/30 transition-all duration-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1.5 font-medium">
            Expected ROI
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-[family-name:var(--font-outfit)] text-emerald-400 tracking-tight">
              {expectedROI}
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-medium">
              📈
            </span>
          </div>
        </div>

        {/* Property Value Increase */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-brand-primary/30 transition-all duration-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1.5 font-medium">
            Property Appreciation
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-[family-name:var(--font-outfit)] text-text-primary tracking-tight">
              {propertyValueIncrease}
            </span>
            <span className="text-[11px] text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded font-mono font-medium">
              🏛️
            </span>
          </div>
        </div>
      </div>

      {/* Visual Cost Allocation Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-text-secondary tracking-tight">Cost Distribution</span>
          <span className="text-text-tertiary font-mono text-[10px]">100% Allocated</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-bg-tertiary overflow-hidden flex p-0.5 gap-0.5 border border-border-subtle/50">
          <div style={{ width: "41%" }} className="bg-brand-primary h-full rounded-l-full" title="Furniture (41%)" />
          <div style={{ width: "14%" }} className="bg-amber-400 h-full" title="Lighting (14%)" />
          <div style={{ width: "8%" }} className="bg-cyan-400 h-full" title="Paint (8%)" />
          <div style={{ width: "37%" }} className="bg-emerald-400 h-full rounded-r-full" title="Labor & Fitting (37%)" />
        </div>
      </div>

      {/* Detailed Cost Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {costItems.map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-xl bg-bg-tertiary/40 border border-border-subtle/60 hover:border-brand-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mb-1.5">
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate text-[11px]">{item.label}</span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs font-bold text-text-primary">
                {item.value}
              </span>
              <span className="text-[10px] font-mono font-semibold text-text-tertiary bg-bg-primary/60 px-1.5 py-0.5 rounded">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
