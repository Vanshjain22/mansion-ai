"use client";

import { cn } from "@/lib/utils/cn";
import type { UploadState } from "@/lib/upload/types";

/**
 * UploadStatus — Displays contextual feedback for each pipeline phase.
 *
 * This component maps each UploadState status to a visual indicator.
 * It uses the discriminated union from our types — TypeScript guarantees
 * we handle every status (add a new status = compile error here).
 *
 * COLOR CODING follows universal conventions:
 * - Violet (brand) → in progress
 * - Green → success
 * - Red → error
 * Users subconsciously understand these without reading the text.
 */

interface UploadStatusProps {
  state: UploadState;
  className?: string;
}

const statusConfig: Record<
  UploadState["status"],
  { icon: string; color: string }
> = {
  idle: { icon: "📷", color: "text-text-tertiary" },
  validating: { icon: "🔍", color: "text-brand-primary" },
  compressing: { icon: "⚙️", color: "text-brand-primary" },
  uploading: { icon: "☁️", color: "text-brand-primary" },
  success: { icon: "✅", color: "text-success" },
  error: { icon: "⚠️", color: "text-error" },
};

function getStatusMessage(state: UploadState): string {
  switch (state.status) {
    case "idle":
      return "Drag & drop an image or click to browse";
    case "validating":
      return "Checking file...";
    case "compressing":
      return `Optimizing image... ${state.progress}%`;
    case "uploading":
      return `Uploading... ${state.progress}%`;
    case "success":
      return "Upload complete!";
    case "error":
      return state.error;
  }
}

export function UploadStatus({ state, className }: UploadStatusProps) {
  const { icon, color } = statusConfig[state.status];
  const message = getStatusMessage(state);

  return (
    <div
      className={cn("flex items-center gap-2 text-sm", color, className)}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
