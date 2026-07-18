"use client";

import { useEffect, useState, useMemo } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

/**
 * GenerationProgressScreen — Premium AI progress visualization.
 *
 * DESIGN HIGHLIGHTS:
 * 1. MULTI-STEP PIPELINE: Maps a linear 0-100% progress score to distinct
 *    logical design phases (Analyzing Layout, Applying Style, Finalizing Render).
 * 2. SCANNING WIREFRAME VISUAL: Displays the user's original image under a
 *    glowing CSS grid overlay and a moving vertical laser line, giving the user
 *    a tactile feel that "computation is actively occurring."
 * 3. ESTIMATED TIME REMAINING: Uses a decay model. AI runs on average for 12 seconds.
 *    The clock counts down from 12s, but slows down near 1s if the server runs long,
 *    ensuring the counter never hits zero or displays negative numbers.
 * 4. FULL CONTROL ACTIONS: Integrated cancel button (POST to cancel route) and
 *    stately retry actions for failed runs.
 */

interface GenerationProgressScreenProps {
  progress: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  originalImageUrl: string;
  errorMessage: string | null;
  onCancel: () => void;
  onRetry: () => void;
  styleName?: string;
  roomTypeName?: string;
}

export interface SubStepItem {
  id: string;
  label: string;
  minProgress: number;
}

export interface StepItem {
  id: number;
  label: string;
  minProgress: number;
  subSteps?: SubStepItem[];
}

const GENERATION_STEPS: StepItem[] = [
  {
    id: 1,
    label: "Analyzing room...",
    minProgress: 0,
    subSteps: [
      { id: "furniture", label: "Furniture detection", minProgress: 5 },
      { id: "walls", label: "Walls & structural boundaries", minProgress: 12 },
      { id: "lighting", label: "Lighting & shadow analysis", minProgress: 18 },
      { id: "windows", label: "Windows & natural illumination", minProgress: 24 },
    ],
  },
  { id: 2, label: "Generating style...", minProgress: 35 },
  { id: 3, label: "Rendering...", minProgress: 60 },
  { id: 4, label: "Refining details...", minProgress: 85 },
  { id: 5, label: "Done", minProgress: 100 },
];


const AVERAGE_GENERATION_SECS = 15;

export function GenerationProgressScreen({
  progress,
  status,
  originalImageUrl,
  errorMessage,
  onCancel,
  onRetry,
  styleName = "Selected Style",
  roomTypeName = "Room",
}: GenerationProgressScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // ── Timer Effect ──
  // Track seconds elapsed while the job is active
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "processing" || status === "pending") {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  // ── Estimated Time Remaining ──
  // We use a decay countdown model so the timer doesn't hit 0 or negative
  const estimatedTimeRemaining = useMemo(() => {
    const rawRemaining = AVERAGE_GENERATION_SECS - elapsedTime;
    if (rawRemaining > 2) return `${rawRemaining}s`;
    // If generation is taking longer than expected, show "Few seconds..."
    return "A few seconds...";
  }, [elapsedTime]);

  // ── Step State Resolver ──
  // Determines if each step is completed, active, or pending based on progress
  const getStepState = (step: StepItem) => {
    if (status === "failed") {
      // If we failed, mark the current active step as failed, and upcoming as pending
      const isActive = progress >= step.minProgress && (
        step.id === GENERATION_STEPS.length || progress < (GENERATION_STEPS[step.id]?.minProgress ?? 100)
      );
      if (isActive) return "failed";
      if (progress >= step.minProgress) return "completed";
      return "pending";
    }

    // Standard progress mapping
    const nextStep = GENERATION_STEPS[step.id]; // Since id is 1-indexed, this gets the next step item
    const nextMinProgress = nextStep ? nextStep.minProgress : 100;

    if (progress >= nextMinProgress) {
      return "completed";
    }
    if (progress >= step.minProgress) {
      return "active";
    }
    return "pending";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-bg-secondary rounded-2xl border border-border-subtle shadow-lg animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Scanner Room Container (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
                AI Generation active
              </span>
              {(status === "processing" || status === "pending") && (
                <span className="text-xs text-text-tertiary">
                  Est. time remaining: <strong className="text-text-secondary">{estimatedTimeRemaining}</strong>
                </span>
              )}
            </div>

            {/* Room Scanner Visualization Container */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border-default bg-bg-primary">
              
              {/* Target Room Photo */}
              <Image
                src={originalImageUrl}
                alt="Room being generated"
                fill
                className="object-cover opacity-40 blur-[1px]"
                unoptimized
              />

              {/* Glowing Tech Grid Overlay */}
              <div 
                className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] animate-grid-pulse" 
                aria-hidden="true"
              />

              {/* Scanning Laser Line */}
              {(status === "processing" || status === "pending") && (
                <div 
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_12px_var(--brand-primary)] animate-laser-scan"
                  aria-hidden="true"
                />
              )}

              {/* Focus target overlays (Corner crosshairs) */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brand-primary/40" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brand-primary/40" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-brand-primary/40" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-brand-primary/40" />
            </div>
          </div>

          {/* Preset Context labels */}
          <div className="mt-4 p-3.5 rounded-xl bg-bg-tertiary/50 border border-border-subtle flex justify-between text-xs text-text-secondary">
            <div>
              <span className="text-text-tertiary block">Target Space:</span>
              <strong className="capitalize text-text-primary">{roomTypeName.replace("_", " ")}</strong>
            </div>
            <div className="text-right">
              <span className="text-text-tertiary block">Selected Style:</span>
              <strong className="text-text-primary">{styleName}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Step Tracking Pipeline (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
                Reimagining Details
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Our design model is modifying details based on your constraints.
              </p>
            </div>

            <ProgressBar value={progress} showValue size="lg" className="my-4" />

            {/* Steps Timeline Grid */}
            <div className="space-y-2.5" role="list">
              {GENERATION_STEPS.map((step) => {
                const stepState = getStepState(step);

                return (

                  <div key={step.id} className="space-y-1.5">
                    <div
                      className={cn(
                        "flex items-center gap-3.5 p-2 rounded-xl transition-all duration-200",
                        stepState === "active" && "bg-bg-tertiary/60 border border-border-subtle",
                        stepState === "pending" && "opacity-50"
                      )}
                      role="listitem"
                    >
                      {/* Circle icon bullet state */}
                      <div className="flex-shrink-0">
                        {stepState === "completed" && (
                          <div className="w-6 h-6 rounded-full bg-success/20 border border-success/40 flex items-center justify-center text-success text-xs font-bold animate-in zoom-in-50 duration-200">
                            ✓
                          </div>
                        )}
                        {stepState === "active" && (
                          <div className="w-6 h-6 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary animate-pulse">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                          </div>
                        )}
                        {stepState === "pending" && (
                          <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-tertiary text-xs font-semibold">
                            {step.id}
                          </div>
                        )}
                        {stepState === "failed" && (
                          <div className="w-6 h-6 rounded-full bg-error/20 border border-error/40 flex items-center justify-center text-error text-xs font-bold">
                            ✕
                          </div>
                        )}
                      </div>

                      <span
                        className={cn(
                          "text-sm font-medium",
                          stepState === "completed" && "text-text-secondary line-through opacity-70",
                          stepState === "active" && "text-text-primary font-semibold text-gradient-gold",
                          stepState === "pending" && "text-text-tertiary",
                          stepState === "failed" && "text-error font-semibold"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Sub-steps (Furniture detection, Walls, Lighting, Windows) */}
                    {step.subSteps && (
                      <div className="ml-9 space-y-1 pl-3 border-l-2 border-brand-primary/20">
                        {step.subSteps.map((sub) => {
                          const isSubDone = progress >= sub.minProgress;
                          const isSubActive = progress >= (sub.minProgress - 4) && progress < sub.minProgress;

                          return (
                            <div
                              key={sub.id}
                              className={cn(
                                "flex items-center gap-2 text-xs transition-colors duration-200",
                                isSubDone ? "text-text-secondary" : isSubActive ? "text-brand-primary font-medium" : "text-text-tertiary/60"
                              )}
                            >
                              <span className="text-[10px]">
                                {isSubDone ? "⚡" : isSubActive ? "⏳" : "◦"}
                              </span>
                              <span className={cn(isSubDone && "line-through opacity-80")}>
                                {sub.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Action buttons (Footer of progress card) */}
          <div className="pt-4 border-t border-border-subtle flex gap-3">
            {status === "failed" ? (
              <button
                onClick={onRetry}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors focus-ring"
              >
                Retry Generation
              </button>
            ) : (
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-bg-tertiary hover:bg-bg-elevated hover:text-error text-text-secondary border border-border-subtle transition-colors focus-ring"
              >
                Cancel Generation Task
              </button>
            )}
          </div>

          {/* Failed details display */}
          {status === "failed" && errorMessage && (
            <div className="p-3 rounded-xl bg-error/5 border border-error/20 text-xs text-error">
              <strong>Failure Details:</strong> {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
