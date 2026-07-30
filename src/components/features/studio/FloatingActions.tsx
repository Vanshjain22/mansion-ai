"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDesignStore } from "@/stores/design-store";
import { useThemeStore } from "@/stores/theme-store";
import {
  Undo2,
  Redo2,
  Keyboard,
  Sun,
  Moon,
  Command,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

/**
 * FloatingActions — Floating Action Button (FAB) Cluster.
 *
 * Provides quick triggers for Undo, Redo, Theme Switcher, Keyboard Shortcuts, and Command Palette.
 */

interface FloatingActionsProps {
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  className?: string;
}

export function FloatingActions({
  onOpenCommandPalette,
  onOpenShortcuts,
  className,
}: FloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Zustand temporal undo/redo
  const temporal = (useDesignStore as any).temporal;
  const undo = temporal?.getState()?.undo;
  const redo = temporal?.getState()?.redo;
  const pastStates = temporal?.getState()?.pastStates || [];
  const futureStates = temporal?.getState()?.futureStates || [];

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2.5", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end gap-2.5"
          >
            {/* Command Palette Button */}
            <Tooltip content="Command Palette (Ctrl+K)" side="left">
              <button
                type="button"
                onClick={() => {
                  onOpenCommandPalette();
                  setIsOpen(false);
                }}
                className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle text-text-primary shadow-lg flex items-center justify-center hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-all focus-ring"
                aria-label="Open command palette"
              >
                <Command className="w-4 h-4 text-brand-primary" />
              </button>
            </Tooltip>

            {/* Undo Button */}
            <Tooltip content={canUndo ? "Undo (Ctrl+Z)" : "Nothing to undo"} side="left">
              <button
                type="button"
                disabled={!canUndo}
                onClick={() => undo?.()}
                className={cn(
                  "w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle text-text-primary shadow-lg flex items-center justify-center transition-all focus-ring",
                  canUndo
                    ? "hover:bg-bg-tertiary text-text-primary"
                    : "opacity-40 cursor-not-allowed text-text-tertiary"
                )}
                aria-label="Undo preference change"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Redo Button */}
            <Tooltip content={canRedo ? "Redo (Ctrl+Shift+Z)" : "Nothing to redo"} side="left">
              <button
                type="button"
                disabled={!canRedo}
                onClick={() => redo?.()}
                className={cn(
                  "w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle text-text-primary shadow-lg flex items-center justify-center transition-all focus-ring",
                  canRedo
                    ? "hover:bg-bg-tertiary text-text-primary"
                    : "opacity-40 cursor-not-allowed text-text-tertiary"
                )}
                aria-label="Redo preference change"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Theme Toggle Button */}
            <Tooltip content="Toggle Theme (T)" side="left">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle text-text-primary shadow-lg flex items-center justify-center hover:bg-bg-tertiary transition-all focus-ring"
                aria-label="Toggle light/dark theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-brand-primary" />}
              </button>
            </Tooltip>

            {/* Shortcuts Help Button */}
            <Tooltip content="Keyboard Shortcuts (?)" side="left">
              <button
                type="button"
                onClick={() => {
                  onOpenShortcuts();
                  setIsOpen(false);
                }}
                className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle text-text-primary shadow-lg flex items-center justify-center hover:bg-bg-tertiary transition-all focus-ring"
                aria-label="Show keyboard shortcuts help"
              >
                <Keyboard className="w-4 h-4 text-text-secondary" />
              </button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger FAB Button */}
      <Tooltip content={isOpen ? "Close actions" : "Quick Actions"} side="left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 rounded-full gradient-cta text-bg-primary shadow-2xl flex items-center justify-center",
            "transition-transform duration-300 focus-ring",
            isOpen && "rotate-45"
          )}
          aria-label="Toggle floating action buttons"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  );
}
