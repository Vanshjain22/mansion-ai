"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ProgressBar } from "@/components/ui/progress-bar";
import Image from "next/image";
import {
  Upload,
  Scan,
  Sofa,
  LayoutGrid,
  Paintbrush,
  Maximize,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  RotateCcw,
  Clock,
} from "lucide-react";

/**
 * GenerationTimeline — World-Class Real-Time Progress Timeline with Step-Level Time Tracking.
 */

interface GenerationTimelineProps {
  progress: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  originalImageUrl: string;
  errorMessage: string | null;
  onCancel: () => void;
  onRetry: () => void;
  styleName?: string;
  roomTypeName?: string;
}

interface TimelineStep {
  id: number;
  label: string;
  icon: React.ElementType;
  minProgress: number;
  estimatedSecs: number;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { id: 1, label: "Uploading to AI cloud pipeline", icon: Upload, minProgress: 0, estimatedSecs: 2 },
  { id: 2, label: "Extracting room geometry & vectors", icon: Scan, minProgress: 12, estimatedSecs: 2 },
  { id: 3, label: "Analyzing furniture & lighting", icon: Sofa, minProgress: 25, estimatedSecs: 3 },
  { id: 4, label: "Generating layout variations", icon: LayoutGrid, minProgress: 40, estimatedSecs: 3 },
  { id: 5, label: "Applying style shaders & materials", icon: Paintbrush, minProgress: 60, estimatedSecs: 3 },
  { id: 6, label: "Upscaling to 4K resolution", icon: Maximize, minProgress: 85, estimatedSecs: 2 },
  { id: 7, label: "Finalizing render output", icon: CheckCircle2, minProgress: 100, estimatedSecs: 1 },
];

const AVERAGE_SECS = 15;

export function GenerationTimeline({
  progress,
  status,
  originalImageUrl,
  errorMessage,
  onCancel,
  onRetry,
  styleName = "Selected Style",
  roomTypeName = "Room",
}: GenerationTimelineProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "processing" || status === "pending") {
      timer = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  const estimatedRemaining = useMemo(() => {
    const raw = AVERAGE_SECS - elapsedTime;
    if (raw > 2) return `~${raw}s remaining`;
    return "Finalizing render...";
  }, [elapsedTime]);

  const getStepState = (step: TimelineStep) => {
    if (status === "failed") {
      const nextStep = TIMELINE_STEPS.find((s) => s.id === step.id + 1);
      const nextMin = nextStep ? nextStep.minProgress : 100;
      if (progress >= step.minProgress && progress < nextMin) return "failed";
      if (progress >= nextMin) return "completed";
      return "pending";
    }

    const nextStep = TIMELINE_STEPS.find((s) => s.id === step.id + 1);
    const nextMin = nextStep ? nextStep.minProgress : 100;

    if (progress >= nextMin) return "completed";
    if (progress >= step.minProgress) return "active";
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          AI Spatial Generator Active
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-playfair)] text-text-primary mb-2 tracking-tight">
          Reimagining Your Space
        </h2>
        <p className="text-text-secondary text-sm font-medium">
          Transforming room with{" "}
          <span className="text-brand-primary font-bold">{styleName}</span> style
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 glass-premium rounded-3xl p-6 md:p-8 border border-border-subtle shadow-2xl">
        {/* Left Visual Room Scanner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-subtle bg-bg-primary shadow-inner">
            <Image
              src={originalImageUrl}
              alt="Room photo undergoing AI transformation"
              fill
              className="object-cover opacity-50 blur-[0.5px]"
              unoptimized
            />

            {/* Grid Overlay */}
            <div
              className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] animate-grid-pulse"
              aria-hidden="true"
            />

            {/* Laser Scan Line */}
            {(status === "processing" || status === "pending") && (
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_16px_var(--brand-primary)] animate-laser-scan"
                aria-hidden="true"
              />
            )}

            {/* Target Reticle */}
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-brand-primary" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-brand-primary" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-brand-primary" />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-brand-primary" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-brand-primary/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-brand-primary/50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Time Clock Pill */}
          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-bg-tertiary/60 border border-border-subtle">
            <div className="flex items-center gap-1.5 text-text-tertiary font-mono">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              <span>Elapsed: <strong className="text-text-primary font-mono">{elapsedTime}s</strong></span>
            </div>
            <div className="text-right font-mono font-bold text-brand-primary">
              {estimatedRemaining}
            </div>
          </div>
        </div>

        {/* Right Vertical Timeline Steps */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary font-bold">Generation Progress</span>
                <span className="text-sm font-extrabold text-brand-primary font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
              <ProgressBar value={progress} size="lg" className="h-2.5" />
            </div>

            {/* Steps List */}
            <div className="space-y-1.5" role="list" aria-label="Generation timeline steps">
              {TIMELINE_STEPS.map((step) => {
                const stepState = getStepState(step);
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.id * 0.04, duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300",
                      stepState === "active" &&
                      "bg-brand-primary/12 border border-brand-primary/30 shadow-[0_0_16px_hsl(42_78%_60%_/_0.1)]",
                      stepState === "failed" &&
                      "bg-error/10 border border-error/30",
                      stepState === "pending" && "opacity-45"
                    )}
                    role="listitem"
                  >
                    <div className="flex-shrink-0">
                      <AnimatePresence mode="wait">
                        {stepState === "completed" && (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 450, damping: 15 }}
                            className="w-7 h-7 rounded-full bg-success/20 border border-success/40 flex items-center justify-center text-success"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.div>
                        )}
                        {stepState === "active" && (
                          <motion.div
                            key="active"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.1, 1] }}
                            transition={{ duration: 0.4 }}
                            className="w-7 h-7 rounded-full bg-brand-primary/25 border border-brand-primary/50 flex items-center justify-center text-brand-primary animate-pulse"
                          >
                            <StepIcon className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                        {stepState === "pending" && (
                          <div className="w-7 h-7 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-tertiary">
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {stepState === "failed" && (
                          <div className="w-7 h-7 rounded-full bg-error/20 border border-error/40 flex items-center justify-center text-error">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    <span
                      className={cn(
                        "text-xs md:text-sm font-semibold flex-1",
                        stepState === "completed" && "text-text-secondary line-through opacity-70",
                        stepState === "active" && "text-text-primary font-bold text-gradient-gold",
                        stepState === "pending" && "text-text-tertiary",
                        stepState === "failed" && "text-error font-bold"
                      )}
                    >
                      {step.label}
                    </span>

                    {stepState === "completed" && (
                      <span className="text-[10px] font-mono text-success font-bold">~{step.estimatedSecs}s</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 mt-4 border-t border-border-subtle flex gap-3">
            {status === "failed" ? (
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl",
                  "text-sm font-bold gradient-cta text-bg-primary focus-ring shadow-lg"
                )}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Generation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                  "text-xs font-bold text-text-secondary hover:text-error",
                  "bg-bg-tertiary/60 hover:bg-error/15 border border-border-subtle hover:border-error/30",
                  "transition-all duration-200 focus-ring"
                )}
              >
                <X className="w-4 h-4" />
                <span>Cancel Generation Task</span>
              </button>
            )}
          </div>

          {status === "failed" && errorMessage && (
            <div className="mt-3 p-3.5 rounded-xl bg-error/10 border border-error/30 text-xs text-error font-medium">
              <strong>Error Details:</strong> {errorMessage}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
