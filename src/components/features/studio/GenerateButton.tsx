"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Sparkles, Zap, ShieldCheck, Coins, Check } from "lucide-react";

/**
 * GenerateButton — World-Class Animated Gradient CTA with Quality Tier Cost Calculator.
 */

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  userCredits?: number;
  className?: string;
}

type QualityTier = "standard" | "hd" | "ultra";

const TIERS: Record<QualityTier, { label: string; resolution: string; cost: number; desc: string }> = {
  standard: { label: "Standard", resolution: "1080p", cost: 1, desc: "Fast render, sharp detail" },
  hd: { label: "HD Quality", resolution: "2K", cost: 2, desc: "High resolution shaders" },
  ultra: { label: "4K Ultra", resolution: "4K", cost: 3, desc: "Photorealistic raytracing" },
};

export function GenerateButton({
  onClick,
  disabled = false,
  userCredits = 20,
  className,
}: GenerateButtonProps) {
  const [selectedTier, setSelectedTier] = useState<QualityTier>("standard");
  const tierInfo = TIERS[selectedTier];
  const remainingCredits = Math.max(0, userCredits - tierInfo.cost);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
      className={cn("w-full max-w-2xl mx-auto space-y-6", className)}
    >
      {/* Ready Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>All Preferences Configured — Ready to Render</span>
        </div>
      </div>

      {/* Quality Tier Selector */}
      <div className="rounded-3xl glass-premium p-5 border border-border-subtle space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-text-secondary flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-brand-primary" />
            Select Output Quality Tier
          </span>
          <span className="text-brand-primary font-mono">
            {userCredits} Credits Available
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Quality tier selection">
          {(Object.keys(TIERS) as QualityTier[]).map((tierKey) => {
            const t = TIERS[tierKey];
            const isSelected = selectedTier === tierKey;

            return (
              <button
                key={tierKey}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedTier(tierKey)}
                className={cn(
                  "relative p-3.5 rounded-2xl text-left transition-all duration-200 focus-ring",
                  isSelected
                    ? "bg-brand-primary/15 border-2 border-brand-primary text-text-primary shadow-sm"
                    : "bg-bg-tertiary/40 border border-border-subtle text-text-secondary hover:bg-bg-tertiary/80"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold">{t.label}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary">
                    {t.cost} {t.cost === 1 ? "Credit" : "Credits"}
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary leading-snug">
                  {t.desc} ({t.resolution})
                </p>
                {isSelected && (
                  <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-brand-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main CTA Button */}
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={cn(
          "relative w-full overflow-hidden rounded-3xl",
          "py-6 px-8",
          "text-xl font-extrabold tracking-wide",
          "transition-all duration-300 focus-ring",
          "group",
          disabled
            ? "bg-bg-tertiary text-text-tertiary border border-border-subtle cursor-not-allowed"
            : [
              "gradient-cta text-bg-primary",
              "shadow-[0_10px_50px_hsl(42_78%_60%_/_0.35)]",
              "hover:shadow-[0_14px_70px_hsl(42_78%_60%_/_0.5)]",
            ]
        )}
        aria-label="Generate AI interior designs"
      >
        {!disabled && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        )}

        <span className="relative z-10 flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
          <span>Generate {tierInfo.resolution} AI Design</span>
          <Zap className="w-5 h-5 text-bg-primary opacity-80" />
        </span>
      </motion.button>

      {/* Cost & Remaining Info */}
      <div className="flex items-center justify-center gap-4 text-xs text-text-secondary font-medium">
        <span className="flex items-center gap-1">
          <Coins className="w-3.5 h-3.5 text-brand-primary" />
          Cost: <strong className="text-brand-primary">{tierInfo.cost} Credit</strong>
        </span>
        <span>•</span>
        <span>Remaining: <strong className="text-text-primary">{remainingCredits} Credits</strong></span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          ~15s Render
        </span>
      </div>
    </motion.div>
  );
}
