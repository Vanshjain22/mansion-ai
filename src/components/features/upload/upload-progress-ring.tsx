"use client";

import { cn } from "@/lib/utils/cn";

interface UploadProgressRingProps {
  progress: number;
  status: "validating" | "compressing" | "uploading" | "success" | "error";
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const statusLabels: Record<string, { title: string; subtitle: string }> = {
  validating: {
    title: "AI Room Scan",
    subtitle: "Validating resolution & format...",
  },
  compressing: {
    title: "Optimizing Details",
    subtitle: "Enhancing spatial resolution...",
  },
  uploading: {
    title: "AI Model Sync",
    subtitle: "Preparing neural spatial graph...",
  },
  success: {
    title: "Analysis Ready",
    subtitle: "Room uploaded successfully",
  },
  error: {
    title: "Upload Interrupted",
    subtitle: "Check file and try again",
  },
};

export function UploadProgressRing({
  progress,
  status,
  className,
  size = 140,
  strokeWidth = 8,
}: UploadProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const currentInfo = statusLabels[status] || statusLabels.uploading;

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Circular Progress & Laser Beam Container */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Outer glowing aura */}
        <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-xl animate-pulse-glow" />

        {/* Outer spinning AI ring */}
        <div className="absolute -inset-2 rounded-full border border-brand-primary/30 border-t-brand-primary animate-spin-slow" />

        {/* SVG Progress Circle */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 relative z-10"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-bg-elevated"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glowing Gradient Progress Stroke */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(42, 78%, 60%)" />
              <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
              <stop offset="100%" stopColor="hsl(48, 90%, 70%)" />
            </linearGradient>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#goldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Central percentage & spark */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-gradient-gold">
            {Math.round(progress)}%
          </span>
          <span className="text-[10px] font-mono tracking-widest text-text-tertiary uppercase mt-0.5">
            {status === "compressing" ? "OPT" : status === "validating" ? "SCAN" : "SYNC"}
          </span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-1 max-w-xs">
        <h4 className="text-sm font-semibold text-text-primary flex items-center justify-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-primary animate-ping" />
          {currentInfo.title}
        </h4>
        <p className="text-xs text-text-secondary">{currentInfo.subtitle}</p>
      </div>

      {/* Mini Pipeline Steps */}
      <div className="flex items-center gap-2 pt-1 text-[11px]">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full border transition-all",
            status === "validating"
              ? "bg-brand-primary/20 text-brand-primary border-brand-primary/40 font-medium"
              : "bg-bg-tertiary text-text-tertiary border-border-subtle"
          )}
        >
          1. Validate
        </span>
        <span className="text-text-tertiary">→</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full border transition-all",
            status === "compressing"
              ? "bg-brand-primary/20 text-brand-primary border-brand-primary/40 font-medium"
              : "bg-bg-tertiary text-text-tertiary border-border-subtle"
          )}
        >
          2. Optimize
        </span>
        <span className="text-text-tertiary">→</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full border transition-all",
            status === "uploading"
              ? "bg-brand-primary/20 text-brand-primary border-brand-primary/40 font-medium"
              : "bg-bg-tertiary text-text-tertiary border-border-subtle"
          )}
        >
          3. Store
        </span>
      </div>
    </div>
  );
}
