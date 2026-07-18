"use client";

import { cn } from "@/lib/utils/cn";

interface AIFeaturePreviewProps {
  className?: string;
}

const AI_FEATURES = [
  {
    icon: "⚡",
    title: "Spatial Auto-Detection",
    desc: "Identifies room type, walls, ceilings & floors",
  },
  {
    icon: "🎨",
    title: "Palette Extraction",
    desc: "Scans primary, secondary & accent color tones",
  },
  {
    icon: "📐",
    title: "3D Mesh Mapping",
    desc: "Estimates furniture geometry & room proportions",
  },
  {
    icon: "✨",
    title: "Lighting & Depth AI",
    desc: "Analyzes natural light sources & shadow direction",
  },
];

export function AIFeaturePreview({ className }: AIFeaturePreviewProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-3.5 bg-bg-secondary/70 border border-border-subtle backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          <span className="text-xs font-semibold text-text-primary tracking-wide">
            AI Feature Detection Engine
          </span>
        </div>
        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
          Neural Vision 4.0
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {AI_FEATURES.map((feat) => (
          <div
            key={feat.title}
            className="flex items-start gap-2 p-2 rounded-lg bg-bg-tertiary/60 border border-border-subtle/50 hover:border-brand-primary/30 transition-colors"
          >
            <span className="text-sm p-1 rounded-md bg-bg-elevated border border-border-subtle">
              {feat.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-text-primary truncate">
                {feat.title}
              </p>
              <p className="text-[10px] text-text-tertiary truncate">
                {feat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
