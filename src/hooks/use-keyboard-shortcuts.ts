import { useEffect, useState, useCallback } from "react";

/**
 * useKeyboardShortcuts — Global keyboard shortcut system.
 *
 * Registers listeners for: Ctrl+K, Ctrl+Z, Ctrl+Shift+Z,
 * Ctrl+Enter, Escape, Alt+1-6, T, ?
 */

interface ShortcutActions {
  onCommandPalette: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onGenerate?: () => void;
  onEscape?: () => void;
  onStepNav?: (step: number) => void;
  onToggleTheme?: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Ctrl+K / ⌘+K — Command Palette (always works)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        actions.onCommandPalette();
        return;
      }

      // Ctrl+Z — Undo (only outside inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && !isInput) {
        e.preventDefault();
        actions.onUndo();
        return;
      }

      // Ctrl+Shift+Z — Redo (only outside inputs)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z" && !isInput) {
        e.preventDefault();
        actions.onRedo();
        return;
      }

      // Ctrl+Enter — Generate
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        actions.onGenerate?.();
        return;
      }

      // Escape — Close modals
      if (e.key === "Escape") {
        setShowShortcutsHelp(false);
        actions.onEscape?.();
        return;
      }

      // Skip remaining if in input
      if (isInput) return;

      // Alt+1-6 — Step navigation
      if (e.altKey && e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        actions.onStepNav?.(parseInt(e.key));
        return;
      }

      // ? — Show shortcuts help
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsHelp((v) => !v);
        return;
      }
    },
    [actions]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    showShortcutsHelp,
    setShowShortcutsHelp,
  };
}
