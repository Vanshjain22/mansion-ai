"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export interface SampleRoom {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const SAMPLE_ROOMS: SampleRoom[] = [
  {
    id: "sample-modern-living",
    name: "Modern Living Room",
    category: "Living Room",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-minimal-bedroom",
    name: "Minimalist Bedroom",
    category: "Bedroom",
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-scandi-lounge",
    name: "Scandinavian Lounge",
    category: "Lounge",
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-luxury-kitchen",
    name: "Luxury Villa Interior",
    category: "Kitchen & Dining",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
  },
];

interface SampleRoomsProps {
  onSelectSample: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function SampleRooms({
  onSelectSample,
  disabled = false,
  className,
}: SampleRoomsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSampleClick = async (sample: SampleRoom, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || loadingId) return;

    try {
      setLoadingId(sample.id);

      // Fetch the sample image and create a real File object
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const fileName = `${sample.id}.jpg`;
      const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });

      onSelectSample(file);
    } catch (err) {
      console.error("Failed to load sample image file", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
          <span>🖼️</span> Don&apos;t have a photo? Try a sample room:
        </span>
        <span className="text-[10px] text-text-tertiary">1-Click Instant AI Test</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SAMPLE_ROOMS.map((sample) => {
          const isLoading = loadingId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={(e) => handleSampleClick(sample, e)}
              disabled={disabled || !!loadingId}
              className={cn(
                "group relative aspect-[4/3] rounded-lg overflow-hidden border border-border-subtle",
                "bg-bg-secondary hover:border-brand-primary/60 transition-all duration-200 text-left",
                "focus-ring cursor-pointer hover:shadow-md hover:scale-[1.02]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Image
                src={sample.url}
                alt={sample.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
                unoptimized
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Label */}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-white truncate drop-shadow-sm">
                  {sample.name}
                </span>
                {isLoading && (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Instant Try Badge */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-medium text-black bg-brand-primary px-1.5 py-0.5 rounded shadow-sm">
                  Try Room
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
