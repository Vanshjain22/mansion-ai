"use client";

import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { StyleDefinition } from "@/types/design";

/**
 * StyleCard — Individual style option in the selection grid.
 *
 * DESIGN DECISIONS:
 * - Gradient thumbnail: CSS-based, resolution-independent, instant-loading
 * - Selected state: Accent-colored ring + scale bump + checkmark
 * - Hover: Subtle lift (translateY + shadow) for affordance
 * - Tags as badges: Quick scanability without reading descriptions
 *
 * ACCESSIBILITY:
 * - role="radio" within a role="radiogroup" container (StyleGrid)
 * - aria-checked for screen readers
 * - Keyboard: Enter/Space to select
 * - Focus ring for keyboard navigation
 */

interface StyleCardProps {
  style: StyleDefinition;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`${style.name} style: ${style.description}`}
      onClick={() => onSelect(style.id)}
      className={cn(
        "group relative w-full text-left rounded-xl overflow-hidden",
        "border-2 transition-all duration-300 ease-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
        "focus-visible:ring-offset-bg-primary",
        isSelected
          ? "border-brand-primary shadow-[0_0_20px_hsl(265_83%_57%/0.2)] scale-[1.02]"
          : "border-border-subtle hover:border-border-strong hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      {/* Gradient thumbnail — represents the style's aesthetic */}
      <div
        className="relative h-36 w-full overflow-hidden"
        style={{ background: style.gradient }}
      >
        {/* Subtle pattern overlay for visual depth */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_40%,white_0%,transparent_60%)]" />

        {/* Style name overlay on gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-white font-semibold text-lg font-[family-name:var(--font-outfit)]">
            {style.name}
          </h3>
        </div>

        {/* Selected checkmark indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-3.5 bg-bg-secondary">
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-3">
          {style.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {style.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-2 py-0.5 bg-bg-tertiary text-text-tertiary border-none font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}
