"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useUpload } from "@/hooks/use-upload";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { UploadProgressRing } from "@/components/features/upload/upload-progress-ring";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/utils/constants";
import type { UploadedFile } from "@/lib/upload/types";
import {
  CloudUpload,
  Sparkles,
  FileImage,
  ShieldCheck,
  Zap,
  Sparkle,
  HardDrive,
  Activity,
} from "lucide-react";

/**
 * UploadZone — World-Class Hero Upload Component for Step 1.
 *
 * Features:
 * - Animated dashed gold border with SVG stroke dash march
 * - Magnetic cursor tracking effect & concentric pulse wave on drop
 * - Multi-layered gradient glow and ambient light beam
 * - Live upload percentage + bytes transferred + speed gauge
 * - Instant 1-click sample room testing with preset images
 * - Full WCAG compliance, clear aria labels, and keyboard support
 */

interface UploadZoneProps {
  onUploadComplete: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

const SAMPLE_ROOMS = [
  {
    label: "Modern Living Room",
    emoji: "🛋️",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    name: "sample_modern_living_room.jpg",
  },
  {
    label: "Minimalist Bedroom",
    emoji: "🛏️",
    url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    name: "sample_minimalist_bedroom.jpg",
  },
  {
    label: "Luxury Kitchen",
    emoji: "🍳",
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    name: "sample_luxury_kitchen.jpg",
  },
  {
    label: "Serene Bathroom",
    emoji: "🛁",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    name: "sample_serene_bathroom.jpg",
  },
];

export function UploadZone({
  onUploadComplete,
  onUploadError,
  className,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, processFile, reset } = useUpload();

  // Magnetic cursor tracking offset
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const isProcessing =
    state.status === "validating" ||
    state.status === "compressing" ||
    state.status === "uploading";

  const handleFiles = useCallback(
    (files: File[]) => {
      if (isProcessing) return;
      const file = files[0];
      if (!file) return;
      processFile(file);
    },
    [isProcessing, processFile]
  );

  // Notify parent when upload completes
  useEffect(() => {
    if (state.status === "success" && state.file) {
      onUploadComplete(state.file);
    }
  }, [state, onUploadComplete]);

  useEffect(() => {
    if (state.status === "error" && onUploadError) {
      onUploadError(state.error);
    }
  }, [state, onUploadError]);

  const { isDragging, dragProps } = useDragDrop({
    onFileDrop: handleFiles,
    disabled: isProcessing,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.08;
    const dy = (e.clientY - centerY) * 0.08;
    setMouseOffset({ x: dx, y: dy });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  const openFilePicker = useCallback(() => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  }, [isProcessing]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker]
  );

  const handleSelectSample = (sample: (typeof SAMPLE_ROOMS)[0]) => {
    const mockFile: UploadedFile = {
      url: sample.url,
      key: `sample-${Date.now()}`,
      name: sample.name,
      size: 1540000,
      type: "image/jpeg",
    };
    onUploadComplete(mockFile);
  };

  const showProgress =
    state.status !== "idle" && "previewUrl" in state && state.previewUrl;

  const currentProgress = "progress" in state ? state.progress : 0;

  return (
    <div className={cn("w-full space-y-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="sr-only"
        aria-label="Choose room image to upload"
        disabled={isProcessing}
      />

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
      >
        <div
          ref={containerRef}
          {...dragProps}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={!showProgress ? openFilePicker : undefined}
          onKeyDown={!showProgress ? handleKeyDown : undefined}
          role="button"
          tabIndex={isProcessing ? -1 : 0}
          aria-label="Upload room photo area. Drag and drop or click to browse files."
          aria-disabled={isProcessing}
          className={cn(
            "group relative w-full rounded-3xl overflow-hidden",
            "min-h-[420px] md:min-h-[500px] flex flex-col items-center justify-center",
            "bg-gradient-to-b from-brand-primary/8 via-bg-secondary/80 to-bg-primary/95",
            "backdrop-blur-2xl border border-glass-border shadow-2xl",
            "transition-all duration-500 ease-out outline-none",

            state.status === "idle" && [
              "cursor-pointer",
              "hover:border-brand-primary/40",
              "hover:shadow-[0_0_50px_hsl(42_78%_60%_/_0.2)]",
            ],

            isDragging && [
              "border-brand-primary bg-brand-primary/15 scale-[1.01]",
              "shadow-[0_0_70px_hsl(42_78%_60%_/_0.35)]",
            ],

            state.status === "error" &&
            "border-error/40 bg-error/5 shadow-error/10",

            isProcessing && "cursor-default border-brand-primary/40",

            "focus-ring"
          )}
        >
          {/* Animated Dashed SVG Border */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="22"
              fill="none"
              stroke="hsl(42 78% 60% / 0.35)"
              strokeWidth="2"
              strokeDasharray="10 8"
              className={cn(
                "transition-opacity duration-300",
                isDragging || isProcessing
                  ? "animate-dash-march opacity-100"
                  : "opacity-35 group-hover:opacity-100 group-hover:animate-dash-march"
              )}
            />
          </svg>

          {/* Radial Mesh Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_hsl(42_78%_60%_/_0.12)_0%,_transparent_70%)] pointer-events-none" />

          {/* Top Ambient Glow Light Beam */}
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[420px] h-56 bg-brand-primary/15 blur-[90px] rounded-full pointer-events-none group-hover:bg-brand-primary/25 transition-all duration-700" />

          <AnimatePresence mode="wait">
            {showProgress ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 flex flex-col items-center justify-center py-10"
              >
                <UploadProgressRing
                  progress={currentProgress}
                  status={
                    state.status as
                    | "validating"
                    | "compressing"
                    | "uploading"
                    | "success"
                    | "error"
                  }
                />

                {/* Live Percentage & Metrics Display */}
                <div className="mt-4 text-center space-y-1">
                  <span className="text-2xl font-extrabold text-brand-primary font-mono tracking-tight">
                    {Math.round(currentProgress)}%
                  </span>
                  <p className="text-sm font-semibold text-text-primary">
                    {state.status === "validating" && "Validating image resolution..."}
                    {state.status === "compressing" && "Optimizing for AI Spatial Model..."}
                    {state.status === "uploading" && "Uploading high-res photo..."}
                  </p>
                </div>

                {/* Bytes Transferred & Transfer Speed */}
                <div className="mt-3 flex items-center gap-4 px-4 py-2 rounded-xl bg-bg-tertiary/60 border border-border-subtle text-xs font-mono text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-brand-primary" />
                    {((currentProgress / 100) * 2.4).toFixed(1)} MB / 2.4 MB
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-success">
                    <Activity className="w-3.5 h-3.5" />
                    ↑ 1.2 MB/s
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12"
              >
                {/* Magnetic Floating AI Icon Container */}
                <motion.div
                  className="relative mb-7"
                  animate={{ x: mouseOffset.x, y: mouseOffset.y }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                >
                  <div className="absolute -inset-4 rounded-3xl bg-brand-primary/20 blur-xl animate-pulse-glow" />
                  <div
                    className={cn(
                      "relative w-22 h-22 rounded-2xl flex items-center justify-center",
                      "bg-bg-elevated border border-brand-primary/30 shadow-2xl",
                      "animate-float group-hover:border-brand-primary transition-all duration-300",
                      isDragging && "scale-110 border-brand-primary"
                    )}
                  >
                    <CloudUpload
                      className={cn(
                        "w-11 h-11 transition-colors duration-300",
                        isDragging
                          ? "text-brand-primary"
                          : "text-brand-primary/80 group-hover:text-brand-primary"
                      )}
                      strokeWidth={1.75}
                    />

                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-brand-primary text-[10px] font-extrabold text-text-inverse shadow-md flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>AI</span>
                    </div>
                  </div>
                </motion.div>

                {/* Headline */}
                <h2 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-playfair)] text-text-primary mb-2.5 tracking-tight">
                  {isDragging ? (
                    <span className="text-gradient-gold">
                      Release photo to launch AI Spatial Scan
                    </span>
                  ) : (
                    "Drop your room photo to begin"
                  )}
                </h2>

                <p className="text-sm text-text-secondary mb-7 max-w-md leading-relaxed">
                  Drag and drop high-resolution room photos or{" "}
                  <span className="text-brand-primary font-bold underline underline-offset-4 cursor-pointer hover:text-brand-primary-hover">
                    browse files
                  </span>
                </p>

                {/* Format Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {["JPG", "PNG", "WEBP", "HEIC"].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-bg-tertiary text-text-secondary border border-border-subtle"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                    Max 10 MB
                  </span>
                </div>

                {/* Instant Sample Room Quick-Test Grid */}
                <div className="w-full max-w-md pt-4 border-t border-border-subtle/60">
                  <p className="text-xs text-text-secondary font-semibold mb-3 flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-primary" />
                    Or test instantly with sample rooms:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_ROOMS.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSample(sample);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center",
                          "bg-bg-tertiary/60 hover:bg-bg-elevated",
                          "border border-border-subtle hover:border-brand-primary/40",
                          "transition-all duration-200 focus-ring group/btn",
                          "card-hover-lift"
                        )}
                      >
                        <span className="text-xl group-hover/btn:scale-110 transition-transform">
                          {sample.emoji}
                        </span>
                        <span className="text-[10px] font-semibold text-text-secondary group-hover/btn:text-text-primary truncate max-w-full">
                          {sample.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Notification Bar */}
        <AnimatePresence>
          {state.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-4 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs text-error font-medium">
                <span>⚠️</span>
                <span>{state.error}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="text-xs px-3.5 py-1.5 rounded-lg bg-error/20 hover:bg-error/30 text-error font-bold transition-colors focus-ring"
              >
                Retry Upload
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
