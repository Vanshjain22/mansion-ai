"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Home,
  Sofa,
  Sun,
  Maximize,
  Palette,
  LayoutGrid,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { VisionAnalysisData } from "@/components/features/upload/ai-vision-analysis-card";

/**
 * DetectionPanel — Step 2: AI Room Detection Results.
 *
 * Shows detected room attributes in clean, stagger-revealed cards
 * with a continue button once all attributes are loaded.
 */

interface DetectionCard {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  detail?: string;
}

const SIMULATED_ANALYSIS: VisionAnalysisData = {
  roomType: "Living Room",
  roomTypeConfidence: 99.2,
  layoutComplexity: "Medium",
  complexityScore: 3,
  detectedFurniture: [
    { name: "Sofa / Sectional", confidence: 98.4, count: 1 },
    { name: "Coffee Table", confidence: 96.1, count: 1 },
    { name: "Floor Lamp", confidence: 93.8, count: 2 },
    { name: "Accent Chair", confidence: 91.5, count: 1 },
    { name: "TV Console", confidence: 89.2, count: 1 },
    { name: "Area Rug", confidence: 87.6, count: 1 },
  ],
  naturalLighting: "Direct Sunlight (South-West)",
  lightingConfidence: 97.8,
  floorMaterial: "Oak Hardwood Parquet",
  floorConfidence: 95.4,
  wallColor: "Warm Off-White Sand",
  wallColorHex: "#F2EFE9",
  wallColorConfidence: 98.1,
  overallConfidence: 98.6,
  dimensionsEstimate: "4.8m × 6.2m (~30 m²)",
};

export function DetectionPanel({ onContinue, className }: { onContinue: () => void; className?: string }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const data = SIMULATED_ANALYSIS;

  const cards: DetectionCard[] = useMemo(
    () => [
      {
        id: "room-type",
        icon: Home,
        label: "Room Type",
        value: data.roomType,
      },
      {
        id: "furniture",
        icon: Sofa,
        label: "Furniture Detected",
        value: `${data.detectedFurniture.length} Items`,
        detail: data.detectedFurniture.map((f) => f.name).join(", "),
      },
      {
        id: "lighting",
        icon: Sun,
        label: "Natural Lighting",
        value: data.naturalLighting,
      },
      {
        id: "dimensions",
        icon: Maximize,
        label: "Room Dimensions",
        value: data.dimensionsEstimate,
      },
      {
        id: "colors",
        icon: Palette,
        label: "Wall Color",
        value: data.wallColor,
        detail: data.wallColorHex,
      },
      {
        id: "layout",
        icon: LayoutGrid,
        label: "Layout Complexity",
        value: data.layoutComplexity,
      },
      {
        id: "style",
        icon: Eye,
        label: "Detected Style",
        value: "Contemporary Warm",
      },
    ],
    [data]
  );

  useEffect(() => {
    if (visibleCount < cards.length) {
      const timer = setTimeout(() => setVisibleCount((v) => v + 1), 250);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setScanComplete(true), 300);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, cards.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("w-full max-w-6xl mx-auto space-y-8", className)}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-6 rounded-3xl glass-premium border border-border-subtle">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-text-primary">
            AI Room Analysis
          </h2>
          <p className="text-xs text-text-tertiary mt-1">
            Here's what we detected in your room
          </p>
        </div>
      </div>

      {/* Detection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const CardIcon = card.icon;
          const isVisible = idx < visibleCount;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={
                isVisible
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 24, scale: 0.95 }
              }
              transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1.1] }}
              className={cn(
                "relative p-5 rounded-2xl overflow-hidden",
                "glass-premium card-hover-lift flex flex-col justify-between",
                "group"
              )}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 transition-colors">
                    <CardIcon className="w-5 h-5" />
                  </div>
                  {isVisible && (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 animate-check-pop" />
                  )}
                </div>

                <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1">
                  {card.label}
                </span>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  {card.value}
                </h3>
                {card.detail && (
                  <p className="text-[11px] font-mono text-text-secondary leading-normal truncate">
                    {card.detail}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={scanComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!scanComplete}
          className={cn(
            "inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl",
            "text-sm font-extrabold tracking-wide",
            "gradient-cta text-bg-primary shadow-xl",
            "hover:-translate-y-0.5 transition-all duration-300 focus-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          )}
          aria-label="Continue to preference customization"
        >
          <span>Continue to Customization</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
