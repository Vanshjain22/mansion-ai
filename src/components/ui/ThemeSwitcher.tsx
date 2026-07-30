"use client";

import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils/cn";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ThemeSwitcher — Animated toggle pill for Dark / Light / System themes.
 */

export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const options = [
    { id: "dark", label: "Dark", icon: Moon },
    { id: "light", label: "Light", icon: Sun },
    { id: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div
      className={cn(
        "flex items-center p-1 rounded-full bg-bg-tertiary/70 border border-border-subtle text-xs font-semibold",
        className
      )}
      role="radiogroup"
      aria-label="Select theme"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors duration-200 focus-ring",
              isActive ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
            )}
            title={`${opt.label} mode`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active-pill"
                className="absolute inset-0 rounded-full bg-bg-elevated border border-border-subtle shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
