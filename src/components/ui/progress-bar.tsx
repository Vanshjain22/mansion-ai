"use client";

import { cn } from "@/lib/utils/cn";

/**
 * ProgressBar — Reusable progress indicator.
 *
 * This is a PRIMITIVE component (components/ui/). It has:
 * - Zero business logic
 * - No knowledge of uploads, AI, or any feature
 * - Full accessibility (ARIA attributes for screen readers)
 *
 * It can be reused for upload progress, AI generation progress,
 * download progress, or any other percentage-based indicator.
 *
 * ACCESSIBILITY:
 * role="progressbar" tells screen readers this is a progress indicator.
 * aria-valuenow/min/max give the exact values.
 * aria-label describes what's progressing (supplied by the consumer).
 */

interface ProgressBarProps {
  /** Current progress value (0-100) */
  value: number;
  /** Accessible label describing what's progressing */
  label?: string;
  /** Visual size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "brand" | "success" | "warning";
  /** Show the percentage number */
  showValue?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const variantStyles = {
  brand: "bg-brand-primary",
  success: "bg-success",
  warning: "bg-warning",
};

export function ProgressBar({
  value,
  label,
  size = "md",
  variant = "brand",
  showValue = false,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showValue && (
        <div className="flex justify-between mb-1">
          {label && (
            <span className="text-xs text-text-secondary">{label}</span>
          )}
          <span className="text-xs text-text-secondary font-medium">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}

      <div
        className={cn(
          "w-full rounded-full bg-bg-tertiary overflow-hidden",
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variantStyles[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
