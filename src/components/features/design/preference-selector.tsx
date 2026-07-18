"use client";

import { cn } from "@/lib/utils/cn";
import type { PreferenceOption } from "@/types/design";

/**
 * PreferenceSelector — Generic single-select option grid.
 *
 * THIS IS THE KEY REUSABLE COMPONENT.
 *
 * Instead of building 5 separate components (RoomTypeSelector,
 * MoodSelector, LightingSelector, BudgetSelector, ColorPaletteSelector),
 * we build ONE component that accepts options as data.
 *
 * Usage:
 *   <PreferenceSelector
 *     label="Mood"
 *     options={MOOD_OPTIONS}
 *     value={mood}
 *     onChange={setMood}
 *   />
 *
 * This is the SAME component used for all 5 preference categories.
 * DRY principle: Don't Repeat Yourself.
 *
 * GENERICS:
 * The <T extends string> makes TypeScript enforce that the value
 * and options have the same type. You can't pass MoodOptions to a
 * selector that expects BudgetRange values.
 */

interface PreferenceSelectorProps<T extends string> {
  label: string;
  options: PreferenceOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Display as compact pills or wider cards */
  variant?: "pill" | "card";
  /** Number of columns in the grid */
  columns?: 2 | 3 | 4;
}

export function PreferenceSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = "pill",
  columns = 3,
}: PreferenceSelectorProps<T>) {
  const handleSelect = (optionValue: T) => {
    // Toggle: clicking the selected option deselects it
    onChange(value === optionValue ? null : optionValue);
  };

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <fieldset className="space-y-2.5">
      <legend className="flex items-center gap-2 text-sm leading-none font-medium text-text-primary select-none mb-1">
        {label}
      </legend>

      <div className={cn("grid gap-2", gridCols[columns])}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return variant === "pill" ? (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "text-sm text-left transition-all duration-200",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                "focus-visible:ring-offset-1 focus-visible:ring-offset-bg-primary",
                isSelected
                  ? "bg-brand-primary/15 border border-brand-primary/40 text-text-primary"
                  : "bg-bg-tertiary/50 border border-border-subtle text-text-secondary hover:bg-bg-tertiary hover:border-border-default"
              )}
            >
              {option.color ? (
                <span
                  className="w-4 h-4 rounded-full shrink-0 border border-white/10"
                  style={{ backgroundColor: option.color }}
                  aria-hidden="true"
                />
              ) : (
                <span className="text-base shrink-0" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          ) : (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl",
                "text-center transition-all duration-200",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                "focus-visible:ring-offset-1 focus-visible:ring-offset-bg-primary",
                isSelected
                  ? "bg-brand-primary/15 border-2 border-brand-primary/40 text-text-primary"
                  : "bg-bg-tertiary/50 border-2 border-border-subtle text-text-secondary hover:bg-bg-tertiary hover:border-border-default"
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                {option.icon}
              </span>
              <span className="text-xs font-medium">{option.label}</span>
              {option.description && (
                <span className="text-[10px] text-text-tertiary leading-tight">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
