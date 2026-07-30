"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useDesignStore } from "@/stores/design-store";
import { STYLES } from "@/lib/data/styles";
import { Badge } from "@/components/ui/badge";
import type { StyleId } from "@/types/design";
import { Check } from "lucide-react";
import Image from "next/image";

/**
 * StyleSelector — World-Class Style Grid Component with Photorealistic Interior Examples.
 *
 * Features:
 * - High-resolution photorealistic interior design example images
 * - Smooth image zoom effect on card hover
 * - Active state: Glowing gold border + spring checkmark
 * - Accessible radiogroup role with full keyboard support
 */

export function StyleSelector() {
  const selectedStyle = useDesignStore((state) => state.selectedStyle);
  const setStyle = useDesignStore((state) => state.setStyle);

  const handleSelect = (id: string) => {
    const styleId = id as StyleId;
    setStyle(selectedStyle === styleId ? null : styleId);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select a design style"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {STYLES.map((style, idx) => {
        const isSelected = selectedStyle === style.id;

        return (
          <motion.button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${style.name} design style: ${style.description}`}
            onClick={() => handleSelect(style.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.04 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group relative w-full text-left rounded-2xl overflow-hidden",
              "border transition-all duration-300 outline-none focus-ring flex flex-col justify-between",
              isSelected
                ? [
                    "border-brand-primary",
                    "shadow-[0_0_24px_hsl(42_78%_60%_/_0.25)]",
                    "ring-2 ring-brand-primary/40",
                  ]
                : [
                    "border-border-subtle hover:border-brand-primary/40",
                    "hover:shadow-[0_8px_32px_hsl(0_0%_0%_/_0.5)]",
                  ]
            )}
          >
            {/* Photorealistic Thumbnail Header */}
            <div
              className="relative h-40 w-full overflow-hidden bg-bg-primary"
              style={{ background: style.gradient }}
            >
              <Image
                src={style.image}
                alt={`${style.name} interior style example`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                unoptimized={style.image.startsWith("http")}
              />

              {/* Gradient Overlay for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Style Name Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                <h3 className="text-white font-extrabold text-base font-[family-name:var(--font-playfair)] tracking-tight drop-shadow-md">
                  {style.name}
                </h3>
              </div>

              {/* Selected Spring Checkmark Badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full gradient-cta flex items-center justify-center shadow-lg z-10"
                >
                  <Check className="w-4 h-4 text-bg-primary" strokeWidth={3.5} />
                </motion.div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-3.5 bg-bg-secondary/95 flex flex-col justify-between flex-1">
              <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 mb-3 font-medium">
                {style.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {style.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[9px] px-2 py-0.5 bg-bg-tertiary text-text-secondary border-none font-bold"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Bottom active line indicator */}
            {isSelected && (
              <motion.div
                layoutId="active-style-accent"
                className="h-1 bg-brand-primary w-full"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
