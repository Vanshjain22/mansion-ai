"use client";

import { useDesignStore } from "@/stores/design-store";
import { STYLES } from "@/lib/data/styles";
import { StyleCard } from "./style-card";
import type { StyleId } from "@/types/design";

/**
 * StyleGrid — Grid layout of all available design styles.
 *
 * This component connects the StyleCard presentation components to
 * the Zustand store. It reads the selected style and provides the
 * selection handler.
 *
 * ZUSTAND SELECTOR PATTERN:
 *   const selectedStyle = useDesignStore(state => state.selectedStyle);
 *
 * This only re-renders when `selectedStyle` changes. If `customPrompt`
 * or `mood` changes, this component is NOT re-rendered. This is the
 * key performance advantage over React Context.
 *
 * TOGGLE BEHAVIOR: Clicking the already-selected style deselects it.
 * This is more intuitive than requiring a separate "clear" button.
 */

export function StyleGrid() {
  const selectedStyle = useDesignStore((state) => state.selectedStyle);
  const setStyle = useDesignStore((state) => state.setStyle);

  const handleSelect = (id: string) => {
    const styleId = id as StyleId;
    // Toggle: if already selected, deselect. Otherwise, select.
    setStyle(selectedStyle === styleId ? null : styleId);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select a design style"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
    >
      {STYLES.map((style) => (
        <StyleCard
          key={style.id}
          style={style}
          isSelected={selectedStyle === style.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
