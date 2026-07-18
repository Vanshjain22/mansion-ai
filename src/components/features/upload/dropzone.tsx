"use client";

import { useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useUpload } from "@/hooks/use-upload";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { UploadPreview } from "./upload-preview";
import { UploadStatus } from "./upload-status";
import { UploadProgressRing } from "./upload-progress-ring";
import { AIFeaturePreview } from "./ai-feature-preview";
import { AIVisionAnalysisCard } from "./ai-vision-analysis-card";
import { ROIBudgetBreakdownCard } from "./roi-budget-breakdown-card";
import { SampleRooms } from "./sample-rooms";


import { RecentUploads, addRecentUpload } from "./recent-uploads";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/utils/constants";
import type { UploadConfig, UploadedFile } from "@/lib/upload/types";

/**
 * Dropzone — Luxury AI Upload Experience Component.
 *
 * ENHANCED FEATURES:
 * - Animated dashed border (SVG stroke-dasharray animation)
 * - Multi-layered hover glow & dark glass gradient mesh
 * - Floating AI upload cloud icon with sparkle badge
 * - Format badges (JPG, PNG, WEBP, HEIC) & max size pill
 * - AI Feature Detection Engine preview badges
 * - Sample room thumbnails for 1-click instant testing
 * - High-tech circular AI upload progress ring
 * - Recent uploads history strip
 * - 100% backward compatible logic & callbacks
 */

interface DropzoneProps {
  /** Called when file is successfully uploaded */
  onUploadComplete?: (file: UploadedFile) => void;
  /** Called when an error occurs at any pipeline stage */
  onUploadError?: (error: string) => void;
  /** Override default upload configuration */
  config?: UploadConfig;
  /** Additional CSS classes */
  className?: string;
  /** Disable the dropzone */
  disabled?: boolean;
}

export function Dropzone({
  onUploadComplete,
  onUploadError,
  config,
  className,
  disabled = false,
}: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, processFile, reset, removeFile } = useUpload(config);

  const isProcessing =
    state.status === "validating" ||
    state.status === "compressing" ||
    state.status === "uploading";

  const handleFiles = useCallback(
    (files: File[]) => {
      if (disabled || isProcessing) return;

      const file = files[0];
      if (!file) return;

      processFile(file);
    },
    [disabled, isProcessing, processFile]
  );

  // Notify parent & store in recent uploads history when upload completes
  useEffect(() => {
    if (state.status === "success") {
      addRecentUpload(state.file, state.previewUrl);
      if (onUploadComplete) {
        onUploadComplete(state.file);
      }
    } else if (state.status === "error" && onUploadError) {
      onUploadError(state.error);
    }
  }, [state, onUploadComplete, onUploadError]);


  const { isDragging, dragProps } = useDragDrop({
    onFileDrop: handleFiles,
    disabled: disabled || isProcessing,
  });

  const openFilePicker = useCallback(() => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  }, [disabled, isProcessing]);

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

  const handleReplace = useCallback(() => {
    removeFile();
    setTimeout(() => openFilePicker(), 50);
  }, [removeFile, openFilePicker]);

  const handleRecentSelect = useCallback(
    (uploadedFile: UploadedFile) => {
      if (onUploadComplete) {
        onUploadComplete(uploadedFile);
      }
    },
    [onUploadComplete]
  );

  // ── Success State: Show UploadPreview + GPT Vision Analysis Card ──
  if (state.status === "success") {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <UploadPreview
          previewUrl={state.previewUrl}
          file={state.file}
          onRemove={removeFile}
          onReplace={handleReplace}
        />
        <AIVisionAnalysisCard file={state.file} previewUrl={state.previewUrl} />
        <RecentUploads onSelectRecent={handleRecentSelect} />
        <ROIBudgetBreakdownCard />
      </div>
    );
  }



  const showPreview =
    state.status !== "idle" && "previewUrl" in state && state.previewUrl;

  return (
    <div className={cn("w-full space-y-5", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="sr-only"
        aria-label="Choose an image file to upload"
        disabled={disabled || isProcessing}
      />

      {/* Main Luxury Dropzone Container with Gradient Background & Glow */}
      <div
        {...dragProps}
        onClick={!showPreview ? openFilePicker : undefined}
        onKeyDown={!showPreview ? handleKeyDown : undefined}
        role="button"
        tabIndex={disabled || isProcessing ? -1 : 0}
        aria-label="Upload room photo area. Drag and drop or click to browse."
        aria-disabled={disabled || isProcessing}
        className={cn(
          "group relative w-full rounded-2xl overflow-hidden p-6 md:p-8",
          "bg-gradient-to-b from-brand-primary/10 via-bg-secondary/70 to-bg-primary/90",
          "backdrop-blur-xl border border-glass-border shadow-2xl",
          "transition-all duration-300 ease-out outline-none",
          
          // Hover glow & state effects
          state.status === "idle" && [
            "hover:shadow-[0_0_40px_hsl(42_78%_60%_/_0.2)]",
            "hover:border-brand-primary/50 cursor-pointer",
          ],
          isDragging && [
            "border-brand-primary bg-brand-primary/20 scale-[1.01]",
            "shadow-[0_0_50px_hsl(42_78%_60%_/_0.35)]",
          ],
          state.status === "error" && "border-error/50 bg-error/5 shadow-error/10",
          isProcessing && "border-brand-primary/40 cursor-default",
          disabled && "opacity-50 cursor-not-allowed",
          "focus-visible:ring-2 focus-visible:ring-brand-primary"
        )}
      >
        {/* Animated Dashed Border (SVG Overlay) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="14"
            fill="none"
            stroke="hsl(42 78% 60% / 0.4)"
            strokeWidth="2"
            strokeDasharray="8 8"
            className={cn(
              "transition-opacity duration-300",
              isDragging || isProcessing ? "animate-dash-march opacity-100" : "opacity-40 group-hover:opacity-100 group-hover:animate-dash-march"
            )}
          />
        </svg>

        {/* Subtle Background Grid Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/15 via-transparent to-transparent pointer-events-none" />

        {/* Ambient Top Light Beam */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-brand-primary/20 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-primary/30 transition-all duration-500" />

        {showPreview ? (
          /* ── Processing State: Circular Progress Ring & Preview ── */
          <div className="relative z-10 flex flex-col items-center justify-center py-4">
            <UploadProgressRing
              progress={"progress" in state ? state.progress : 0}
              status={
                state.status as
                  | "validating"
                  | "compressing"
                  | "uploading"
                  | "success"
                  | "error"
              }
            />
          </div>
        ) : (
          /* ── Idle / Error State: Premium AI Drop Prompt ── */
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {/* Floating AI Upload Icon */}
            <div className="relative mb-5">
              {/* Outer Pulsing Ambient Halo */}
              <div className="absolute -inset-2 rounded-2xl bg-brand-primary/20 blur-lg animate-pulse-glow group-hover:scale-110 transition-transform duration-300" />

              {/* Floating Container */}
              <div
                className={cn(
                  "relative w-20 h-20 rounded-2xl flex items-center justify-center",
                  "bg-bg-elevated border border-brand-primary/30 shadow-xl",
                  "animate-float group-hover:border-brand-primary transition-colors duration-300",
                  isDragging && "scale-110 border-brand-primary"
                )}
              >
                {/* Cloud & Arrow SVG */}
                <svg
                  className={cn(
                    "w-10 h-10 transition-colors duration-300",
                    isDragging ? "text-brand-primary" : "text-brand-primary/90 group-hover:text-brand-primary"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V3.75m0 0L7.5 8.25M12 3.75l4.5 4.5M4.5 19.5h15"
                  />
                </svg>

                {/* AI Sparkle Badge Overlay */}
                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-brand-primary text-[10px] font-bold text-text-inverse shadow-md flex items-center gap-0.5">
                  <span>✨</span>
                  <span>AI</span>
                </div>
              </div>
            </div>

            {/* Headline Prompt */}
            <h3 className="text-base font-semibold font-[family-name:var(--font-outfit)] text-text-primary mb-1">
              {isDragging ? (
                <span className="text-gradient-gold">Release image to start AI Scan</span>
              ) : (
                "Drop your room photo to transform"
              )}
            </h3>

            <p className="text-xs text-text-secondary mb-4 max-w-sm">
              Drag and drop high-resolution room photos or{" "}
              <span className="text-brand-primary font-medium underline underline-offset-4 cursor-pointer hover:text-brand-primary-hover">
                browse files
              </span>
            </p>

            {/* Supported Formats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
              {["JPG", "PNG", "WEBP", "HEIC"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-bg-tertiary/80 text-text-secondary border border-border-subtle"
                >
                  {fmt}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                Max 10MB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error state alert & retry */}
      {state.status === "error" && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-error">
            <span>⚠️</span>
            <span>{state.error}</span>
          </div>
          <button
            onClick={reset}
            className="text-xs px-3 py-1 rounded-lg bg-error/20 hover:bg-error/30 text-error font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Status indicator (if processing) */}
      {state.status !== "idle" && state.status !== "error" && (
        <UploadStatus state={state} />
      )}


      {/* AI Feature Detection Capabilities Bar */}
      {state.status === "idle" && <AIFeaturePreview />}

      {/* Try with Sample Room Thumbnails Selector */}
      {state.status === "idle" && (
        <SampleRooms onSelectSample={(file) => processFile(file)} disabled={disabled} />
      )}

      {/* Recent Uploads Section */}
      {state.status === "idle" && (
        <RecentUploads onSelectRecent={handleRecentSelect} />
      )}

      {/* Financial ROI & Budget Breakdown Matrix */}
      {state.status === "idle" && <ROIBudgetBreakdownCard />}
    </div>
  );
}

