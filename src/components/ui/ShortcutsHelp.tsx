"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

/**
 * ShortcutsHelp — Modal overlay showing all keyboard shortcuts.
 */

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Alt", "1-6"], label: "Jump to step 1–6" },
      { keys: ["Ctrl", "K"], label: "Open command palette" },
      { keys: ["Esc"], label: "Close modal / cancel" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["Ctrl", "Enter"], label: "Generate AI design" },
      { keys: ["Ctrl", "Z"], label: "Undo preference change" },
      { keys: ["Ctrl", "Shift", "Z"], label: "Redo preference change" },
    ],
  },
  {
    title: "Settings",
    shortcuts: [
      { keys: ["?"], label: "Toggle this shortcuts panel" },
    ],
  },
];

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[190] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden border border-border-subtle glass-premium shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Close shortcuts help"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1.5">
                    {group.shortcuts.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-xs text-text-secondary font-medium">
                          {s.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {s.keys.map((key) => (
                            <kbd
                              key={key}
                              className="px-2 py-0.5 rounded-md bg-bg-tertiary text-[10px] font-mono font-bold text-text-primary border border-border-subtle min-w-[24px] text-center"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle text-center text-[10px] text-text-tertiary">
              Press <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary text-[9px] font-mono border border-border-subtle">?</kbd> to toggle this panel
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
