"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useDesignStore } from "@/stores/design-store";
import {
  ROOM_TYPE_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  BUDGET_OPTIONS,
  PROMPT_SUGGESTIONS,
} from "@/lib/data/preferences";
import { StyleSelector } from "./StyleSelector";
import type { PreferenceOption } from "@/types/design";
import {
  Home,
  Palette,
  Sparkles,
  Sun,
  Wallet,
  SlidersHorizontal,
  Armchair,
  MessageSquareOff,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

/**
 * PreferencePanel — Step 3: World-Class Design Customization Hub.
 *
 * Features:
 * - Grouped collapsible sections with Lucide icons
 * - Card selection grid with gold glow and spring feedback
 * - Creativity scale slider with live numeric counter
 * - Quick instructions prompt chips
 * - Full WCAG contrast and keyboard navigation support
 */

interface PreferencePanelProps {
  onContinue: () => void;
  className?: string;
}

const FURNITURE_OPTIONS: PreferenceOption<"keep" | "replace" | "mix">[] = [
  { value: "keep", label: "Keep Existing", icon: "🏠", description: "Preserve current room layout" },
  { value: "replace", label: "Replace All", icon: "🔄", description: "All new luxury pieces" },
  { value: "mix", label: "Mix & Match", icon: "🎭", description: "Seamless blend of old & new" },
];

interface SectionProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl glass-premium overflow-hidden border border-border-subtle transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-5 md:p-6",
          "text-left transition-colors duration-200",
          "hover:bg-bg-tertiary/40",
          "focus-ring"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-text-tertiary mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-bg-tertiary/60 border border-border-subtle text-text-tertiary">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="px-5 md:px-6 pb-6 pt-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
  variant = "card",
}: {
  options: PreferenceOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  columns?: 2 | 3 | 4;
  variant?: "pill" | "card";
}) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns])} role="radiogroup">
      {options.map((option) => {
        const isSelected = value === option.value;

        return variant === "card" ? (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(isSelected ? null : option.value)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex flex-col items-center gap-2 p-4.5 rounded-2xl",
              "text-center transition-all duration-200 focus-ring",
              isSelected
                ? [
                    "bg-brand-primary/15 border-2 border-brand-primary/60",
                    "text-text-primary shadow-[0_0_20px_hsl(42_78%_60%_/_0.2)]",
                  ]
                : [
                    "bg-bg-tertiary/40 border-2 border-border-subtle",
                    "text-text-secondary hover:bg-bg-tertiary/80 hover:border-border-default hover:text-text-primary",
                  ]
            )}
          >
            {option.color ? (
              <span
                className="w-7 h-7 rounded-full border-2 border-white/20 shadow-md"
                style={{ backgroundColor: option.color }}
              />
            ) : (
              <span className="text-2xl mb-0.5">{option.icon}</span>
            )}
            <span className="text-xs font-bold">{option.label}</span>
            {option.description && (
              <span className="text-[10px] text-text-tertiary font-medium leading-snug">
                {option.description}
              </span>
            )}
          </motion.button>
        ) : (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(isSelected ? null : option.value)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "text-sm text-left transition-all duration-200 focus-ring",
              isSelected
                ? "bg-brand-primary/15 border border-brand-primary/50 text-text-primary font-bold shadow-sm"
                : "bg-bg-tertiary/40 border border-border-subtle text-text-secondary hover:bg-bg-tertiary/80 hover:text-text-primary"
            )}
          >
            {option.color ? (
              <span
                className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: option.color }}
              />
            ) : (
              <span className="text-lg shrink-0">{option.icon}</span>
            )}
            <div className="min-w-0">
              <span className="block truncate font-bold text-xs">{option.label}</span>
              {option.description && (
                <span className="block text-[10px] text-text-tertiary font-medium truncate">
                  {option.description}
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export function PreferencePanel({ onContinue, className }: PreferencePanelProps) {
  const roomType = useDesignStore((s) => s.roomType);
  const colorPalette = useDesignStore((s) => s.colorPalette);
  const mood = useDesignStore((s) => s.mood);
  const lighting = useDesignStore((s) => s.lighting);
  const budget = useDesignStore((s) => s.budget);
  const selectedStyle = useDesignStore((s) => s.selectedStyle);
  const customPrompt = useDesignStore((s) => s.customPrompt);
  const creativityLevel = useDesignStore((s) => s.creativityLevel);
  const furniturePreference = useDesignStore((s) => s.furniturePreference);
  const negativePrompt = useDesignStore((s) => s.negativePrompt);

  const setRoomType = useDesignStore((s) => s.setRoomType);
  const setColorPalette = useDesignStore((s) => s.setColorPalette);
  const setMood = useDesignStore((s) => s.setMood);
  const setLighting = useDesignStore((s) => s.setLighting);
  const setBudget = useDesignStore((s) => s.setBudget);
  const setCustomPrompt = useDesignStore((s) => s.setCustomPrompt);
  const setCreativityLevel = useDesignStore((s) => s.setCreativityLevel);
  const setFurniturePreference = useDesignStore((s) => s.setFurniturePreference);
  const setNegativePrompt = useDesignStore((s) => s.setNegativePrompt);

  const canContinue = selectedStyle !== null || customPrompt.length > 5;

  const filledCount = [
    selectedStyle,
    roomType,
    colorPalette,
    mood,
    lighting,
    budget,
    customPrompt,
    furniturePreference,
    negativePrompt,
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("w-full max-w-6xl mx-auto space-y-6", className)}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-playfair)] text-text-primary mb-2 tracking-tight">
            Customize Preferences
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto font-medium">
            Fine-tune options to guide the AI spatial generator.{" "}
            {filledCount > 0 && (
              <span className="text-brand-primary font-bold">
                {filledCount} preference{filledCount > 1 ? "s" : ""} selected
              </span>
            )}
          </p>
        </motion.div>
      </div>

      <div className="space-y-4">
        {/* Style Selection */}
        <Section icon={Sparkles} title="Design Aesthetic" subtitle="Choose the overarching architectural style">
          <StyleSelector />
        </Section>

        {/* Room Type */}
        <Section icon={Home} title="Room Category" subtitle="Target space type">
          <OptionGrid
            options={ROOM_TYPE_OPTIONS}
            value={roomType}
            onChange={setRoomType}
            columns={4}
            variant="card"
          />
        </Section>

        {/* Color Palette */}
        <Section icon={Palette} title="Color Palette" subtitle="Harmonious color direction">
          <OptionGrid
            options={COLOR_PALETTE_OPTIONS}
            value={colorPalette}
            onChange={setColorPalette}
            columns={4}
            variant="card"
          />
        </Section>

        {/* Mood */}
        <Section icon={Sparkles} title="Atmosphere & Mood" subtitle="Emotional tone" defaultOpen={false}>
          <OptionGrid
            options={MOOD_OPTIONS}
            value={mood}
            onChange={setMood}
            columns={4}
            variant="card"
          />
        </Section>

        {/* Lighting Mood */}
        <Section icon={Sun} title="Lighting Exposure" subtitle="Daylight & artificial illumination" defaultOpen={false}>
          <OptionGrid
            options={LIGHTING_OPTIONS}
            value={lighting}
            onChange={setLighting}
            columns={3}
            variant="pill"
          />
        </Section>

        {/* Budget */}
        <Section icon={Wallet} title="Budget Tier" subtitle="Furniture & finish tier" defaultOpen={false}>
          <OptionGrid
            options={BUDGET_OPTIONS}
            value={budget}
            onChange={setBudget}
            columns={4}
            variant="card"
          />
        </Section>

        {/* Creativity Level Slider */}
        <Section icon={SlidersHorizontal} title="AI Creativity Index" subtitle="Variance scale (1 = Faithful, 10 = Experimental)" defaultOpen={false}>
          <div className="space-y-3 p-4 rounded-2xl bg-bg-tertiary/40 border border-border-subtle">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-text-tertiary">Faithful Reconstruction</span>
              <span className="px-3 py-1 rounded-full bg-brand-primary/15 text-brand-primary font-mono text-sm">
                Level {creativityLevel} / 10
              </span>
              <span className="text-text-tertiary">Reimagined Concept</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-bg-tertiary cursor-pointer accent-brand-primary focus-ring"
              aria-label="AI Creativity index level"
            />
          </div>
        </Section>

        {/* Furniture Preference */}
        <Section icon={Armchair} title="Furniture Handling" subtitle="Layout preservation rules" defaultOpen={false}>
          <OptionGrid
            options={FURNITURE_OPTIONS}
            value={furniturePreference}
            onChange={setFurniturePreference}
            columns={3}
            variant="card"
          />
        </Section>

        {/* Custom Instructions */}
        <Section icon={Sparkles} title="Custom Instructions" subtitle="Specific additions or design details" defaultOpen={false}>
          <div className="space-y-3">
            <textarea
              value={customPrompt}
              onChange={(e) => {
                if (e.target.value.length <= 500) setCustomPrompt(e.target.value);
              }}
              placeholder="e.g. Add a marble fireplace, warm LED cove lighting, and large indoor ficus trees..."
              rows={3}
              className={cn(
                "w-full p-4 rounded-2xl resize-none text-sm font-medium leading-relaxed",
                "bg-bg-tertiary/50 border border-border-subtle text-text-primary",
                "placeholder:text-text-tertiary",
                "focus:border-brand-primary/50 focus:outline-none focus-ring",
                "transition-all duration-200"
              )}
              aria-label="Custom prompt instructions"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const sep = customPrompt.length > 0 ? ". " : "";
                      const newVal = customPrompt + sep + s;
                      if (newVal.length <= 500) setCustomPrompt(newVal);
                    }}
                    className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-bg-tertiary hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-subtle transition-colors focus-ring"
                  >
                    + {s}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-text-tertiary">
                {customPrompt.length}/500
              </span>
            </div>
          </div>
        </Section>

        {/* Negative Prompt */}
        <Section icon={MessageSquareOff} title="Negative Filter" subtitle="Specify items to strictly omit" defaultOpen={false}>
          <textarea
            value={negativePrompt}
            onChange={(e) => {
              if (e.target.value.length <= 300) setNegativePrompt(e.target.value);
            }}
            placeholder="e.g. Avoid dark colors, no carpet flooring, omit brass hardware..."
            rows={2}
            className={cn(
              "w-full p-4 rounded-2xl resize-none text-sm font-medium leading-relaxed",
              "bg-bg-tertiary/50 border border-border-subtle text-text-primary",
              "placeholder:text-text-tertiary",
              "focus:border-brand-primary/50 focus:outline-none focus-ring",
              "transition-all duration-200"
            )}
            aria-label="Negative prompt instructions"
          />
        </Section>
      </div>

      {/* Continue Action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center pt-6"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl",
            "text-base font-extrabold tracking-wide",
            "transition-all duration-300 focus-ring",
            canContinue
              ? [
                  "gradient-cta text-bg-primary",
                  "shadow-[0_6px_30px_hsl(42_78%_60%_/_0.3)]",
                  "hover:shadow-[0_10px_40px_hsl(42_78%_60%_/_0.45)]",
                  "hover:-translate-y-0.5",
                ]
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed border border-border-subtle"
          )}
          aria-label={canContinue ? "Proceed to AI generation step" : "Select a design style first"}
        >
          {canContinue ? (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Proceed to Generation</span>
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <span>Select a style above to proceed</span>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
