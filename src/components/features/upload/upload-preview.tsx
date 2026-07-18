"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/format";
import type { UploadedFile } from "@/lib/upload/types";

/**
 * UploadPreview — Displays the uploaded image with metadata and actions.
 *
 * WHY next/image INSTEAD OF <img>?
 *
 * Next.js's <Image> component provides:
 * 1. Automatic WebP/AVIF conversion (serves the smallest format the browser supports)
 * 2. Lazy loading by default (images below the fold don't load until scrolled to)
 * 3. Blur placeholder while loading (prevents layout shift)
 * 4. Automatic srcset generation (serves smaller images on smaller screens)
 *
 * For blob URLs (our preview), some of these don't apply, but using
 * <Image> consistently means we don't need to decide "should this
 * image use <Image> or <img>?" — the answer is always <Image>.
 *
 * We set `unoptimized={true}` for blob URLs because Next.js can't
 * optimize blob:// URLs through its image pipeline.
 */

interface UploadPreviewProps {
  previewUrl: string;
  file?: UploadedFile;
  onRemove: () => void;
  onReplace: () => void;
  className?: string;
}

export function UploadPreview({
  previewUrl,
  file,
  onRemove,
  onReplace,
  className,
}: UploadPreviewProps) {
  const isBlobUrl = previewUrl.startsWith("blob:");

  return (
    <div className={cn("relative group rounded-xl overflow-hidden", className)}>
      {/* Image container with consistent aspect ratio */}
      <div className="relative aspect-video w-full bg-bg-secondary">
        <Image
          src={previewUrl}
          alt={file?.name || "Uploaded room photo"}
          fill
          className="object-cover"
          unoptimized={isBlobUrl}
          sizes="(max-width: 768px) 100vw, 600px"
        />

        {/* Hover overlay with actions — hidden by default, shown on hover/focus */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center gap-3",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "transition-opacity duration-200"
          )}
        >
          <button
            onClick={onReplace}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-white/10 hover:bg-white/20 text-white",
              "backdrop-blur-sm border border-white/20",
              "transition-colors duration-150",
              "focus-ring"
            )}
            aria-label="Replace this image with a different one"
          >
            Replace
          </button>
          <button
            onClick={onRemove}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-error/20 hover:bg-error/30 text-error",
              "backdrop-blur-sm border border-error/30",
              "transition-colors duration-150",
              "focus-ring"
            )}
            aria-label="Remove this image"
          >
            Remove
          </button>
        </div>
      </div>

      {/* File metadata bar */}
      {file && (
        <div className="px-3 py-2 bg-bg-secondary border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary truncate max-w-[60%]">
              {file.name}
            </span>
            <span className="text-text-tertiary">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
