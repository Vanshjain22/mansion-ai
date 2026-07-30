"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

/**
 * ComparisonSlider — World-Class Draggable Before/After Image Comparison.
 *
 * Features:
 * - Touch & pointer event dragging
 * - Accessible keyboard navigation (ArrowLeft / ArrowRight)
 * - Custom handle with gold reticle glow
 * - WCAG ARIA accessibility tags
 */

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Original",
  afterLabel = "AI Design",
  className,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX);
    const handleTouchMove = (e: TouchEvent) => updatePosition(e.touches[0].clientX);
    const handleEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full rounded-3xl overflow-hidden cursor-col-resize select-none border border-border-subtle shadow-2xl",
        "focus-ring",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label="Before and after room comparison slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 3));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 3));
      }}
    >
      {/* After image (Underneath, 100% width) */}
      {afterUrl && (
        <Image
          src={afterUrl}
          alt={afterLabel}
          fill
          className="object-cover"
          unoptimized
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Before image (Clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        {beforeUrl && (
          <Image
            src={beforeUrl}
            alt={beforeLabel}
            fill
            className="object-cover"
            style={{ maxWidth: "none", width: containerRef.current?.offsetWidth ? `${containerRef.current.offsetWidth}px` : "100%" }}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Gold Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-brand-primary shadow-[0_0_12px_var(--brand-primary)] z-10"
        style={{ left: `${position}%` }}
      >
        {/* Handle Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-elevated border-2 border-brand-primary shadow-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-brand-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M8 5l-5 7 5 7" />
            <path d="M16 5l5 7-5 7" />
          </svg>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold z-20 shadow-md">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-brand-primary text-xs font-bold z-20 shadow-md">
        {afterLabel}
      </div>
    </div>
  );
}
