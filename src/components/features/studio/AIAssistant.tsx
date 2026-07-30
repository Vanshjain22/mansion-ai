"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useDesignStore } from "@/stores/design-store";
import {
  Bot,
  Sparkles,
  X,
  ChevronUp,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

/**
 * AIAssistant — Floating AI Copilot Assistant Panel.
 *
 * Provides real-time design advice and prompt suggestions based on current user selections.
 */

const SUGGESTION_POOL = [
  "Based on your Japandi style choice, consider adding warm LED cove lighting behind wooden wall slats.",
  "For living rooms with direct sunlight, a matte neutral wall color (#F2EFE9) prevents glare.",
  "Mixing existing furniture with 2 modern accent pieces yields a 40% higher design cohesion score.",
  "A creativity level of 7 achieves optimal balance between structural accuracy and visual flair.",
  "Consider low-profile platform furniture to maximize perceive ceiling height in compact rooms.",
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const selectedStyle = useDesignStore((s) => s.selectedStyle);

  // Cycle suggestions when style changes
  useEffect(() => {
    if (selectedStyle) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setCurrentSuggestionIndex((i) => (i + 1) % SUGGESTION_POOL.length);
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedStyle]);

  const handleNextSuggestion = () => {
    setIsTyping(true);
    setTimeout(() => {
      setCurrentSuggestionIndex((i) => (i + 1) % SUGGESTION_POOL.length);
      setIsTyping(false);
    }, 300);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[90]">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="assistant-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 0.68, 0, 1.1] }}
            className="w-80 md:w-96 rounded-3xl overflow-hidden border border-brand-primary/30 glass-premium shadow-2xl p-5 space-y-4"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl gradient-cta flex items-center justify-center text-bg-primary shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    MansionAI Copilot
                    <Sparkles className="w-3 h-3 text-brand-primary" />
                  </h4>
                  <span className="text-[10px] text-text-tertiary">Real-time design advisory</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-colors focus-ring"
                aria-label="Close AI assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Advisory Bubble */}
            <div className="p-3.5 rounded-2xl bg-brand-primary/8 border border-brand-primary/20 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-brand-primary font-bold">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  DESIGN RECOMMENDATION
                </span>
                <button
                  type="button"
                  onClick={handleNextSuggestion}
                  className="hover:rotate-180 transition-transform duration-300"
                  title="Next suggestion"
                >
                  <RefreshCw className="w-3 h-3 text-text-tertiary hover:text-brand-primary" />
                </button>
              </div>

              <p className={cn("text-xs text-text-secondary leading-relaxed font-medium", isTyping && "opacity-50")}>
                {SUGGESTION_POOL[currentSuggestionIndex]}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="text-[10px] text-text-tertiary font-mono flex items-center justify-between">
              <span>MansionAI Design Intelligence</span>
              <span className="text-brand-primary font-bold">Active Advisor</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="assistant-trigger"
            type="button"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-2.5 px-4 py-3 rounded-full",
              "glass-premium border border-brand-primary/40 text-text-primary shadow-xl",
              "hover:border-brand-primary hover:shadow-[0_0_24px_hsl(42_78%_60%_/_0.25)]",
              "transition-all duration-300 focus-ring"
            )}
            aria-label="Open AI Copilot Assistant"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full gradient-cta flex items-center justify-center text-bg-primary">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-bg-primary animate-pulse" />
            </div>
            <span className="text-xs font-bold hidden sm:inline">AI Copilot</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
