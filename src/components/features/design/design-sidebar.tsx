"use client";

import { useDesignStore } from "@/stores/design-store";
import { Separator } from "@/components/ui/separator";
import { PreferenceSelector } from "./preference-selector";
import { PromptInput } from "./prompt-input";
import {
  ROOM_TYPE_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  BUDGET_OPTIONS,
} from "@/lib/data/preferences";
import { cn } from "@/lib/utils/cn";
import { getStyleById } from "@/lib/data/styles";

/**
 * DesignSidebar — All design preferences in a scrollable panel.
 *
 * COMPOSITION PATTERN:
 * This component doesn't contain any business logic itself.
 * It's a pure COMPOSITION of:
 * - PreferenceSelector (used 5 times with different data)
 * - PromptInput (custom text)
 * - ConfigSummary (preview of current selections)
 *
 * This is the "Orchestrator" pattern: a component whose job is to
 * arrange other components and connect them to the store. It doesn't
 * have its own state or complex logic.
 */

export function DesignSidebar() {
  const roomType = useDesignStore((state) => state.roomType);
  const colorPalette = useDesignStore((state) => state.colorPalette);
  const mood = useDesignStore((state) => state.mood);
  const lighting = useDesignStore((state) => state.lighting);
  const budget = useDesignStore((state) => state.budget);
  const selectedStyle = useDesignStore((state) => state.selectedStyle);
  const customPrompt = useDesignStore((state) => state.customPrompt);

  const setRoomType = useDesignStore((state) => state.setRoomType);
  const setColorPalette = useDesignStore((state) => state.setColorPalette);
  const setMood = useDesignStore((state) => state.setMood);
  const setLighting = useDesignStore((state) => state.setLighting);
  const setBudget = useDesignStore((state) => state.setBudget);
  const resetAll = useDesignStore((state) => state.resetAll);

  const selectedStyleDef = selectedStyle
    ? getStyleById(selectedStyle)
    : undefined;

  // Count how many preferences are filled (for the summary badge)
  const filledCount = [
    selectedStyle,
    roomType,
    colorPalette,
    mood,
    lighting,
    budget,
    customPrompt,
  ].filter(Boolean).length;

  return (
    <aside className="w-full space-y-6">
      {/* Header with selection summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] text-text-primary">
            Customize
          </h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            {filledCount > 0
              ? `${filledCount} preference${filledCount > 1 ? "s" : ""} set`
              : "No preferences set yet"}
          </p>
        </div>
        {filledCount > 0 && (
          <button
            onClick={resetAll}
            className={cn(
              "text-xs px-3 py-1 rounded-md",
              "text-text-tertiary hover:text-error",
              "bg-bg-tertiary/50 hover:bg-error/10",
              "transition-colors duration-150",
              "focus-ring"
            )}
          >
            Reset all
          </button>
        )}
      </div>

      {/* Selected style summary */}
      {selectedStyleDef && (
        <div className="p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
          <p className="text-xs text-text-tertiary mb-0.5 font-medium">Selected style</p>
          <p className="text-sm font-semibold text-text-primary tracking-tight">
            {selectedStyleDef.name}
          </p>
        </div>
      )}

      <Separator className="bg-border-subtle" />

      {/* Room Type */}
      <PreferenceSelector
        label="Room Type"
        options={ROOM_TYPE_OPTIONS}
        value={roomType}
        onChange={setRoomType}
        variant="pill"
        columns={2}
      />

      <Separator className="bg-border-subtle" />

      {/* Color Palette */}
      <PreferenceSelector
        label="Color Palette"
        options={COLOR_PALETTE_OPTIONS}
        value={colorPalette}
        onChange={setColorPalette}
        variant="pill"
        columns={2}
      />

      <Separator className="bg-border-subtle" />

      {/* Mood */}
      <PreferenceSelector
        label="Mood"
        options={MOOD_OPTIONS}
        value={mood}
        onChange={setMood}
        variant="card"
        columns={4}
      />

      <Separator className="bg-border-subtle" />

      {/* Lighting */}
      <PreferenceSelector
        label="Lighting"
        options={LIGHTING_OPTIONS}
        value={lighting}
        onChange={setLighting}
        variant="pill"
        columns={3}
      />

      <Separator className="bg-border-subtle" />

      {/* Budget */}
      <PreferenceSelector
        label="Budget Range"
        options={BUDGET_OPTIONS}
        value={budget}
        onChange={setBudget}
        variant="card"
        columns={4}
      />

      <Separator className="bg-border-subtle" />

      {/* Custom Prompt */}
      <PromptInput />
    </aside>
  );
}
