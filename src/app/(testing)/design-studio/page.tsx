"use client";

import { StyleGrid } from "@/components/features/design/style-grid";
import { DesignSidebar } from "@/components/features/design/design-sidebar";
import { useDesignStore } from "@/stores/design-store";
import { getStyleById } from "@/lib/data/styles";
import { cn } from "@/lib/utils/cn";

/**
 * Design Studio — Complete style selection + preferences page.
 *
 * LAYOUT:
 * Desktop: Two-column layout (main content + sidebar)
 * Mobile: Single column, sidebar below styles
 *
 * This page demonstrates the full Phase 2B feature set:
 * - Style card grid with selection state
 * - All preference selectors
 * - Custom prompt with AI suggestions
 * - Zustand-powered state management
 * - Full responsive behavior
 */

export default function DesignStudioPage() {
  const selectedStyle = useDesignStore((state) => state.selectedStyle);
  const customPrompt = useDesignStore((state) => state.customPrompt);
  const roomType = useDesignStore((state) => state.roomType);

  const selectedStyleDef = selectedStyle
    ? getStyleById(selectedStyle)
    : undefined;

  // Can generate when at least a style OR custom prompt is provided
  const canGenerate = selectedStyle !== null || customPrompt.length > 10;

  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">
            <span className="text-gradient">Design Studio</span>
          </h1>
          <p className="text-text-secondary mt-1">
            Choose a style and customize your room transformation.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column — Style Grid */}
          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] text-text-primary">
                  Choose a Style
                </h2>
                <p className="text-sm text-text-tertiary mt-0.5">
                  Select a design aesthetic for your room
                </p>
              </div>

              {selectedStyleDef && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: selectedStyleDef.accentColor }}
                  />
                  <span className="text-sm text-text-primary font-medium">
                    {selectedStyleDef.name}
                  </span>
                </div>
              )}
            </div>

            <StyleGrid />
          </section>

          {/* Right Column — Preferences Sidebar */}
          <section className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-8">
              <div className="p-5 rounded-2xl glass">
                <DesignSidebar />
              </div>

              {/* Generate Button */}
              <button
                disabled={!canGenerate}
                className={cn(
                  "w-full mt-4 py-3.5 px-6 rounded-xl",
                  "text-base font-semibold",
                  "transition-all duration-300",
                  "focus-ring",
                  canGenerate
                    ? [
                        "bg-brand-primary hover:bg-brand-primary-hover text-white",
                        "shadow-[0_4px_20px_hsl(265_83%_57%/0.3)]",
                        "hover:shadow-[0_6px_28px_hsl(265_83%_57%/0.4)]",
                        "hover:-translate-y-0.5",
                        "animate-pulse-glow",
                      ]
                    : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                )}
              >
                {canGenerate ? "✨ Generate Design" : "Select a style to begin"}
              </button>

              {/* Config Summary (debug/preview) */}
              {canGenerate && (
                <div className="mt-4 p-4 rounded-xl bg-bg-secondary border border-border-subtle">
                  <p className="text-xs text-text-tertiary mb-2 font-medium">
                    Generation Preview
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedStyleDef
                      ? selectedStyleDef.promptTemplate.replace(
                          "{room_type}",
                          roomType?.replace("_", " ") || "room"
                        )
                      : customPrompt}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
