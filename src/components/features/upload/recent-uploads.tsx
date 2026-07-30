"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/format";
import type { UploadedFile } from "@/lib/upload/types";

export interface RecentItem {
  id: string;
  name: string;
  size: number;
  url: string;
  timestamp: number;
  uploadedFile: UploadedFile;
}

const STORAGE_KEY = "mansion_ai_recent_uploads";

interface RecentUploadsProps {
  onSelectRecent: (file: UploadedFile) => void;
  className?: string;
}

export function RecentUploads({ onSelectRecent, className }: RecentUploadsProps) {
  const [recents, setRecents] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecents(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecents([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recents.filter((item) => item.id !== id);
    setRecents(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  if (recents.length === 0) return null;

  return (
    <div className={cn("space-y-2.5 pt-4 border-t border-border-subtle", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-text-primary">
            Recent Room Uploads
          </span>
          <span className="text-[10px] font-mono text-text-tertiary px-1.5 py-0.5 rounded bg-bg-tertiary">
            {recents.length}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-[11px] text-text-tertiary hover:text-error transition-colors"
        >
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {recents.slice(0, 4).map((item) => {
          const isBlobUrl = item.url.startsWith("blob:");

          return (
            <div
              key={item.id}
              onClick={() => onSelectRecent(item.uploadedFile)}
              className={cn(
                "group relative flex items-center gap-3 p-2.5 rounded-xl border border-border-subtle",
                "bg-bg-secondary/60 hover:bg-bg-secondary hover:border-brand-primary/40",
                "transition-all duration-200 cursor-pointer shadow-sm"
              )}
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-bg-tertiary">
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized={isBlobUrl}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text-primary truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-text-tertiary flex items-center gap-2 mt-1">
                  <span>{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => handleRemoveItem(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-error transition-opacity"
                title="Remove from history"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Helper function to add item to recent uploads storage */
export function addRecentUpload(uploadedFile: UploadedFile, previewUrl: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const list: RecentItem[] = stored ? JSON.parse(stored) : [];

    const newItem: RecentItem = {
      id: uploadedFile.key || `rec_${Date.now()}`,
      name: uploadedFile.name,
      size: uploadedFile.size,
      url: previewUrl || uploadedFile.url,
      timestamp: Date.now(),
      uploadedFile,
    };


    // Filter out duplicate by name or id
    const filtered = list.filter(
      (item) => item.name !== uploadedFile.name && item.id !== newItem.id
    );

    const updated = [newItem, ...filtered].slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}
