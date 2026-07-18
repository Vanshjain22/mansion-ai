"use client";

import { cn } from "@/lib/utils/cn";

/**
 * MasonryGrid — Performant CSS-native Masonry layout.
 *
 * THE HOISTING PROBLEM:
 * standard grid systems crop images or leave jagged whitespace blocks.
 * Masonry flows items vertically in columns like a newspaper page.
 *
 * TRADEOFF (CSS vs JS Masonry):
 * - JS Masonry (e.g. Masonry.js, Packery): Calculates item heights in a loop
 *   and updates absolute positions on resize. Heavy, layout thrashing, flashes.
 * - CSS Masonry (columns-count): Simple, responsive, hardware-accelerated.
 *   Cons: Items flow Top-to-Bottom then Left-to-Right (down the column first).
 *
 * For a design showcase, CSS columns is the *superior* engineering choice.
 * It is zero-JS, responsive natively, and renders at 60fps immediately.
 */

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  return (
    <div
      className={cn(
        // Renders columns based on container width
        "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5",
        "gap-6 [column-fill:_balance]",
        "w-full",
        className
      )}
    >
      {/* 
        We map child elements. Each child wrapper MUST have:
        - break-inside: avoid (prevents card from splitting across columns)
        - margin-bottom: spacing between vertical cards
      */}
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return (
          <div className="break-inside-avoid mb-6 w-full inline-block">
            {child}
          </div>
        );
      })}
    </div>
  );
}

import React from "react";
