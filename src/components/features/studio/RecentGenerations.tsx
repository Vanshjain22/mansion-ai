"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { ComparisonSlider } from "./ComparisonSlider";
import Image from "next/image";
import {
  History,
  Sparkles,
  Maximize2,
  X,
  Trash2,
  ArrowRight,
  Clock,
} from "lucide-react";

/**
 * RecentGenerations — Step 1 Generation History Carousel.
 *
 * Persisted in localStorage. Renders carousel of previous designs or EmptyState illustration.
 */

export interface RecentItem {
  id: string;
  originalUrl: string;
  generatedUrl: string;
  styleName: string;
  roomType: string;
  timestamp: number;
}

const STORAGE_KEY = "mansionai-recent-generations";

export function getRecentGenerations(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentGeneration(item: Omit<RecentItem, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentGenerations();
    const newItem: RecentItem = {
      ...item,
      id: `gen-${Date.now()}`,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...current].slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save generation to history", err);
  }
}

export function RecentGenerations({ className }: { className?: string }) {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [activeItem, setActiveItem] = useState<RecentItem | null>(null);

  useEffect(() => {
    const all = getRecentGenerations();
    // Filter out items with missing or invalid image URLs
    const valid = all.filter(
      (item) => item.generatedUrl && item.originalUrl && item.generatedUrl.length > 1 && item.originalUrl.length > 1
    );
    setItems(valid);
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  if (items.length === 0) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto mt-12", className)}>
        <div className="rounded-3xl glass-premium border border-border-subtle p-6">
          <EmptyState
            icon={<History className="w-8 h-8 text-brand-primary" />}
            title="No Previous Generations Yet"
            description="Your generated room redesigns will automatically be saved here for quick comparison."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-5xl mx-auto mt-12 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <History className="w-4 h-4 text-brand-primary" />
          Recent AI Generations
        </h3>
        <button
          type="button"
          onClick={handleClearHistory}
          className="text-xs text-text-tertiary hover:text-error flex items-center gap-1 transition-colors focus-ring"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            className="snap-start shrink-0 w-64 rounded-2xl overflow-hidden border border-border-subtle glass-premium cursor-pointer group"
            onClick={() => setActiveItem(item)}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-bg-primary">
              <Image
                src={item.generatedUrl}
                alt={item.styleName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
                onError={(e) => {
                  // Hide broken images gracefully
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="p-3 bg-bg-secondary/90">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-text-primary">
                  {item.styleName}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[10px] text-text-tertiary capitalize">
                {item.roomType.replace("_", " ")}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden glass-premium border border-border-subtle p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  {activeItem.styleName} — {activeItem.roomType.replace("_", " ")}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-xl bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ComparisonSlider
                beforeUrl={activeItem.originalUrl}
                afterUrl={activeItem.generatedUrl}
                beforeLabel="Original Room"
                afterLabel={activeItem.styleName}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
