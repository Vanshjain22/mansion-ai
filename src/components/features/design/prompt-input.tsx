"use client";

import { useDesignStore } from "@/stores/design-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PROMPT_SUGGESTIONS } from "@/lib/data/preferences";
import { cn } from "@/lib/utils/cn";

/**
 * PromptInput — Custom prompt textarea with AI suggestion chips.
 *
 * DESIGN:
 * - Full-width textarea with generous padding for comfort
 * - Clickable suggestion chips below for users who don't know what to type
 * - Character counter that changes color as limit approaches
 * - Suggestions are APPENDED to existing text (not replaced)
 *
 * WHY SUGGESTION CHIPS?
 * Most users stare at blank text fields. Suggestions reduce friction
 * by giving them a starting point. They can modify the suggestion
 * after clicking it. This is the same pattern ChatGPT uses for
 * conversation starters.
 */

const MAX_PROMPT_LENGTH = 500;

export function PromptInput() {
  const customPrompt = useDesignStore((state) => state.customPrompt);
  const setCustomPrompt = useDesignStore((state) => state.setCustomPrompt);

  const handleSuggestionClick = (suggestion: string) => {
    const separator = customPrompt.length > 0 ? ". " : "";
    const newPrompt = customPrompt + separator + suggestion;
    if (newPrompt.length <= MAX_PROMPT_LENGTH) {
      setCustomPrompt(newPrompt);
    }
  };

  const charCount = customPrompt.length;
  const isNearLimit = charCount > MAX_PROMPT_LENGTH * 0.8;
  const isAtLimit = charCount >= MAX_PROMPT_LENGTH;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="custom-prompt"
          className="text-sm font-medium text-text-primary"
        >
          Custom Instructions
        </Label>
        <span
          className={cn(
            "text-xs transition-colors",
            isAtLimit
              ? "text-error"
              : isNearLimit
                ? "text-warning"
                : "text-text-tertiary"
          )}
        >
          {charCount}/{MAX_PROMPT_LENGTH}
        </span>
      </div>

      <Textarea
        id="custom-prompt"
        value={customPrompt}
        onChange={(e) => {
          if (e.target.value.length <= MAX_PROMPT_LENGTH) {
            setCustomPrompt(e.target.value);
          }
        }}
        placeholder="Describe any specific changes you'd like... (e.g., 'Add more plants and use warm lighting')"
        className={cn(
          "min-h-[100px] resize-none p-3.5 text-sm leading-relaxed",
          "bg-bg-tertiary/50 border-border-default text-text-primary",
          "placeholder:text-text-tertiary",
          "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        )}
        aria-describedby="prompt-suggestions"
      />

      {/* AI Suggestion Chips */}
      <div id="prompt-suggestions" className="space-y-2">
        <p className="text-xs text-text-tertiary font-medium flex items-center gap-1.5">
          <span>✨</span> Quick suggestions — click to add:
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isAtLimit}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                "bg-bg-tertiary hover:bg-bg-elevated text-text-secondary hover:text-text-primary",
                "border border-border-subtle hover:border-border-default",
                "transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "focus-ring"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
