"use client";

import { cn } from "@/lib/utils/cn";
import { Sparkles } from "lucide-react";

/**
 * EmptyState — Illustrated placeholder for empty sections.
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-bg-tertiary/60 border border-border-subtle flex items-center justify-center">
          {icon || <Sparkles className="w-8 h-8 text-text-tertiary" />}
        </div>
        {/* Floating sparkles */}
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary/20 flex items-center justify-center animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-brand-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-5">
        {description}
      </p>

      {action}
    </div>
  );
}
