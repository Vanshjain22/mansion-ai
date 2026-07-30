"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Search,
  Upload,
  Scan,
  Sliders,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Keyboard,
  ArrowRight,
  Command,
} from "lucide-react";

/**
 * CommandPalette — Ctrl+K searchable command modal.
 *
 * Fuzzy-match search, keyboard navigation (arrows + enter),
 * recent commands, glass card styling.
 */

interface CommandAction {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onStepNav: (step: number) => void;
  onReset: () => void;
  onGenerate: () => void;
  onToggleTheme: () => void;
  onShowShortcuts: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onStepNav,
  onReset,
  onGenerate,
  onToggleTheme,
  onShowShortcuts,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandAction[] = [
    {
      id: "upload",
      label: "Go to Upload Step",
      icon: Upload,
      shortcut: "Alt+1",
      action: () => { onStepNav(1); onClose(); },
      category: "Navigation",
    },
    {
      id: "detection",
      label: "Go to AI Detection",
      icon: Scan,
      shortcut: "Alt+2",
      action: () => { onStepNav(2); onClose(); },
      category: "Navigation",
    },
    {
      id: "customize",
      label: "Go to Customize",
      icon: Sliders,
      shortcut: "Alt+3",
      action: () => { onStepNav(3); onClose(); },
      category: "Navigation",
    },
    {
      id: "generate",
      label: "Generate AI Design",
      icon: Sparkles,
      shortcut: "Ctrl+Enter",
      action: () => { onGenerate(); onClose(); },
      category: "Actions",
    },
    {
      id: "reset",
      label: "Reset Studio",
      icon: RotateCcw,
      action: () => { onReset(); onClose(); },
      category: "Actions",
    },
    {
      id: "theme",
      label: "Toggle Theme",
      icon: Sun,
      shortcut: "T",
      action: () => { onToggleTheme(); onClose(); },
      category: "Settings",
    },
    {
      id: "shortcuts",
      label: "Show Keyboard Shortcuts",
      icon: Keyboard,
      shortcut: "?",
      action: () => { onShowShortcuts(); onClose(); },
      category: "Help",
    },
  ];

  const filtered = query.length === 0
    ? commands
    : commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, selectedIndex, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 0.68, 0, 1.1] }}
            className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden border border-border-subtle glass-premium shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
              <Search className="w-5 h-5 text-text-tertiary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                aria-label="Search commands"
              />
              <kbd className="px-2 py-0.5 rounded-md bg-bg-tertiary text-[10px] font-mono font-bold text-text-tertiary border border-border-subtle">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center text-text-tertiary text-sm">
                  No commands found for &quot;{query}&quot;
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const CmdIcon = cmd.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-brand-primary/15 text-text-primary"
                          : "text-text-secondary hover:bg-bg-tertiary/50"
                      )}
                    >
                      <CmdIcon className={cn("w-4 h-4 shrink-0", isSelected && "text-brand-primary")} />
                      <span className="flex-1 text-sm font-medium">
                        {cmd.label}
                      </span>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded-md bg-bg-tertiary text-[10px] font-mono text-text-tertiary border border-border-subtle">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-brand-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-tertiary">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-bg-tertiary text-[9px] font-mono border border-border-subtle">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-bg-tertiary text-[9px] font-mono border border-border-subtle">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>MansionAI Command Palette</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
