"use client";

import { cn } from "@/lib/utils/cn";

/**
 * Skeleton — Shimmer loading placeholder components.
 *
 * Variants: text, card, image, avatar, button.
 */

interface SkeletonProps {
  variant?: "text" | "card" | "image" | "avatar" | "button";
  className?: string;
  lines?: number;
}

export function Skeleton({
  variant = "text",
  className,
  lines = 1,
}: SkeletonProps) {
  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 rounded-lg skeleton-shimmer",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border-subtle overflow-hidden",
          className
        )}
      >
        <div className="h-32 skeleton-shimmer" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-2/3 rounded-lg skeleton-shimmer" />
          <div className="h-3 w-full rounded-lg skeleton-shimmer" />
          <div className="h-3 w-4/5 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (variant === "image") {
    return (
      <div
        className={cn(
          "rounded-2xl skeleton-shimmer aspect-video",
          className
        )}
      />
    );
  }

  if (variant === "avatar") {
    return (
      <div
        className={cn(
          "w-10 h-10 rounded-full skeleton-shimmer",
          className
        )}
      />
    );
  }

  if (variant === "button") {
    return (
      <div
        className={cn(
          "h-10 w-32 rounded-xl skeleton-shimmer",
          className
        )}
      />
    );
  }

  return null;
}

/**
 * SkeletonGrid — Multiple skeleton cards in a grid layout.
 */
export function SkeletonGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
