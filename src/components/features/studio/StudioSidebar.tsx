"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useDesignStore } from "@/stores/design-store";
import { getStyleById } from "@/lib/data/styles";
import Image from "next/image";
import {
  Sparkles,
  Home,
  Palette,
  Sun,
  Wallet,
  SlidersHorizontal,
  Zap,
  ArrowRight,
  Coins,
} from "lucide-react";

/**
 * StudioSidebar — Sticky Floating Config Summary Panel.
 *
 * Shows real-time summary of current user selections, uploaded image preview,
 * credit cost calculation, and quick generate CTA.
 */

interface StudioSidebarProps {
  uploadedImageUrl?: string;
  onGenerate: () => void;
  canGenerate: boolean;
  className?: string;
}

export function StudioSidebar({
  uploadedImageUrl,
  onGenerate,
  canGenerate,
  className,
}: StudioSidebarProps) {
  const selectedStyle = useDesignStore((s) => s.selectedStyle);
  const roomType = useDesignStore((s) => s.roomType);
  const colorPalette = useDesignStore((s) => s.colorPalette);
  const mood = useDesignStore((s) => s.mood);
  const lighting = useDesignStore((s) => s.lighting);
  const budget = useDesignStore((s) => s.budget);
  const creativityLevel = useDesignStore((s) => s.creativityLevel);
  const furniturePreference = useDesignStore((s) => s.furniturePreference);

  const styleDef = selectedStyle ? getStyleById(selectedStyle) : null;

  return (
    <aside className={cn("w-full lg:w-80 shrink-0 space-y-4", className)}>
      <div className="sticky top-20 rounded-3xl glass-premium border border-border-subtle p-5 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            Config Summary
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-mono font-bold">
            LIVE
          </span>
        </div>

        {/* Room Photo Preview */}
        {uploadedImageUrl && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border-subtle bg-bg-primary">
            <Image
              src={uploadedImageUrl}
              alt="Uploaded Room Preview"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white">
              Target Photo
            </div>
          </div>
        )}

        {/* Config Summary Items */}
        <div className="space-y-2.5 text-xs">
          {/* Style */}
          <div className="flex items-center justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-tertiary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Style
            </span>
            <span className="font-bold text-text-primary">
              {styleDef?.name || "Not selected"}
            </span>
          </div>

          {/* Room Type */}
          <div className="flex items-center justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-tertiary flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-text-tertiary" />
              Room
            </span>
            <span className="font-semibold text-text-primary capitalize">
              {roomType ? roomType.replace("_", " ") : "Auto-detect"}
            </span>
          </div>

          {/* Color Palette */}
          <div className="flex items-center justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-tertiary flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-text-tertiary" />
              Palette
            </span>
            <span className="font-semibold text-text-primary capitalize">
              {colorPalette || "Neutral"}
            </span>
          </div>

          {/* Lighting */}
          {lighting && (
            <div className="flex items-center justify-between py-1 border-b border-border-subtle/50">
              <span className="text-text-tertiary flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-text-tertiary" />
                Lighting
              </span>
              <span className="font-semibold text-text-primary capitalize">
                {lighting}
              </span>
            </div>
          )}

          {/* Budget */}
          {budget && (
            <div className="flex items-center justify-between py-1 border-b border-border-subtle/50">
              <span className="text-text-tertiary flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-text-tertiary" />
                Budget
              </span>
              <span className="font-semibold text-text-primary capitalize">
                {budget}
              </span>
            </div>
          )}

          {/* Creativity Level */}
          <div className="flex items-center justify-between py-1">
            <span className="text-text-tertiary flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-text-tertiary" />
              Creativity
            </span>
            <span className="font-mono font-bold text-brand-primary">
              Level {creativityLevel}/10
            </span>
          </div>
        </div>

        {/* Cost & Generation CTA */}
        <div className="pt-3 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-brand-primary" />
              Estimated Cost
            </span>
            <span className="font-mono font-bold text-brand-primary">
              1 Credit
            </span>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl",
              "text-xs font-extrabold tracking-wide transition-all duration-300 focus-ring",
              canGenerate
                ? [
                  "gradient-cta text-bg-primary shadow-lg",
                  "hover:-translate-y-0.5",
                ]
                : "bg-bg-tertiary text-text-tertiary border border-border-subtle cursor-not-allowed"
            )}
          >
            <Zap className="w-4 h-4" />
            <span>Generate Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
