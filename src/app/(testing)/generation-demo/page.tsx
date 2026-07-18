"use client";

import { useState, useEffect, useRef } from "react";
import { Dropzone } from "@/components/features/upload/dropzone";
import { DesignSidebar } from "@/components/features/design/design-sidebar";
import { useDesignStore } from "@/stores/design-store";
import { getStyleById } from "@/lib/data/styles";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils/cn";
import type { UploadedFile } from "@/lib/upload/types";
import Image from "next/image";
import { GenerationProgressScreen } from "@/components/features/design/generation-progress-screen";

/**
 * Generation Demo Page — Testing ground for the complete E2E AI pipeline.
 *
 * Combines Phase 2A (Upload) and Phase 2B (Preferences) and Phase 2C (Queue & AI)
 * into a single unified workspace.
 *
 * E2E FLOW:
 * 1. User uploads room image → receives public URL.
 * 2. User selects design options (Style, Mood, lighting, etc.).
 * 3. User clicks "Generate Design" → calls POST /api/designs/generate.
 * 4. API creates a database entry, queues worker task, returns Job & Design IDs.
 * 5. Page starts polling GET /api/designs/[designId]/status?jobId=... every 2s.
 * 6. Progress bar updates (10% → 30% → 50% → 70% → 90% → 100%).
 * 7. On complete, displays original and AI-generated image side-by-side.
 * 8. User can cancel generating at any time.
 */

interface GenStatusData {
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  error: string | null;
  variations: Array<{
    id: string;
    generatedImageUrl: string;
    aiProvider: string;
    aiModel: string;
    inferenceTimeMs: number;
  }>;
}

export default function GenerationDemoPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  
  // Design store preferences
  const selectedStyle = useDesignStore((state) => state.selectedStyle);
  const customPrompt = useDesignStore((state) => state.customPrompt);
  const roomType = useDesignStore((state) => state.roomType);
  const colorPalette = useDesignStore((state) => state.colorPalette);
  const mood = useDesignStore((state) => state.mood);
  const lighting = useDesignStore((state) => state.lighting);
  const budget = useDesignStore((state) => state.budget);
  const resetStore = useDesignStore((state) => state.resetAll);

  // Job queue state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<{ designId: string; jobId: string } | null>(null);
  const [jobState, setJobState] = useState<GenStatusData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedStyleDef = selectedStyle ? getStyleById(selectedStyle) : undefined;
  const canGenerate = uploadedFile !== null && (selectedStyle !== null || customPrompt.length > 5) && !isGenerating;

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleStartGeneration = async () => {
    if (!uploadedFile || !roomType || !selectedStyle) {
      setErrorMsg("Please upload a photo, select a Room Type, and choose a Style first.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setJobState(null);

    try {
      const response = await fetch("/api/designs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImageUrl: uploadedFile.url,
          roomType,
          styleId: selectedStyle,
          customPrompt,
          colorPalette,
          mood,
          lighting,
          budget,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Failed to submit request.");
      }

      const { data } = await response.json();
      const { designId, jobId } = data;

      setCurrentJob({ designId, jobId });
      startPolling(designId, jobId);

    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsGenerating(false);
    }
  };

  const startPolling = (designId: string, jobId: string) => {
    // Clear any existing poll loops
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/designs/${designId}/status?jobId=${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job status.");
        }

        const { data } = await response.json();
        const statusData: GenStatusData = data;

        setJobState(statusData);

        if (statusData.status === "completed") {
          clearInterval(pollIntervalRef.current!);
          setIsGenerating(false);
        } else if (statusData.status === "failed") {
          clearInterval(pollIntervalRef.current!);
          setErrorMsg(statusData.error || "Generation task failed.");
          setIsGenerating(false);
        }
      } catch (err: any) {
        clearInterval(pollIntervalRef.current!);
        setErrorMsg(err.message || "Error polling status.");
        setIsGenerating(false);
      }
    }, 1500); // Poll every 1.5s
  };

  const handleCancelGeneration = async () => {
    if (!currentJob) return;

    try {
      const response = await fetch(`/api/designs/${currentJob.designId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: currentJob.jobId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel generation job.");
      }

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      
      setJobState((prev) => prev ? { ...prev, status: "cancelled", progress: 0 } : null);
      setErrorMsg("Generation was cancelled by the user.");
      setIsGenerating(false);
      setCurrentJob(null);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cancel.");
    }
  };

  const handleResetAll = () => {
    setUploadedFile(null);
    resetStore();
    setJobState(null);
    setErrorMsg(null);
    setIsGenerating(false);
    setCurrentJob(null);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">
              <span className="text-gradient">E2E Generation Studio</span>
            </h1>
            <p className="text-text-secondary mt-1">
              Upload room, choose styles, watch progress in real-time, and view results.
            </p>
          </div>
          {(uploadedFile || selectedStyle || jobState) && (
            <button
              onClick={handleResetAll}
              className="px-4 py-2 rounded-xl bg-bg-tertiary hover:bg-bg-elevated text-text-secondary transition-colors focus-ring"
            >
              Reset Studio
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Upload & Results */}
          <div className="flex-1 min-w-0 space-y-8">
            
            {/* Upload Area */}
            {!jobState && (
              <section className="p-6 rounded-2xl glass">
                <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] text-text-primary mb-4">
                  1. Upload Room Photo
                </h2>
                <Dropzone
                  onUploadComplete={setUploadedFile}
                  onUploadError={(err) => setErrorMsg(err)}
                />
              </section>
            )}

            {/* AI Generation Progress State */}
            {isGenerating && jobState && (
              <GenerationProgressScreen
                progress={jobState.progress}
                status={jobState.status}
                originalImageUrl={uploadedFile!.url}
                errorMessage={errorMsg}
                onCancel={handleCancelGeneration}
                onRetry={handleStartGeneration}
                styleName={selectedStyleDef?.name}
                roomTypeName={roomType || "Room"}
              />
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-error/5 border border-error/20 text-error text-sm">
                <strong>Error: </strong> {errorMsg}
              </div>
            )}

            {/* Result Visualizer (Side-by-side compare) */}
            {jobState?.status === "completed" && jobState.variations.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-success">
                    ✨ Transformation Complete!
                  </h2>
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold transition-all shadow-md focus-ring"
                  >
                    Design Another Room
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div className="rounded-2xl overflow-hidden border border-border-subtle bg-bg-secondary">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={uploadedFile!.url}
                        alt="Original Room"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-3 bg-bg-tertiary/50 border-t border-border-subtle">
                      <p className="text-xs text-text-secondary font-medium">Original Room</p>
                    </div>
                  </div>

                  {/* Generated Image */}
                  <div className="rounded-2xl overflow-hidden border border-brand-primary bg-bg-secondary shadow-[0_0_24px_hsl(265_83%_57%/0.15)] animate-in zoom-in-95 duration-500">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={jobState.variations[0].generatedImageUrl}
                        alt="AI Reimagined Room"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-3 bg-brand-primary/10 border-t border-brand-primary/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-brand-primary font-bold">AI Design ({selectedStyleDef?.name})</p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">
                          Model: {jobState.variations[0].aiModel} • Time: {(jobState.variations[0].inferenceTimeMs / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Right Side: Options Panel */}
          {!jobState && (
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="lg:sticky lg:top-8">
                <div className="p-5 rounded-2xl glass">
                  <DesignSidebar />
                </div>

                <button
                  disabled={!canGenerate}
                  onClick={handleStartGeneration}
                  className={cn(
                    "w-full mt-4 py-3.5 px-6 rounded-xl",
                    "text-base font-semibold",
                    "transition-all duration-300",
                    "focus-ring",
                    canGenerate
                      ? [
                          "bg-brand-primary hover:bg-brand-primary-hover text-white",
                          "shadow-[0_4px_20px_hsl(265_83%_57%/0.3)]",
                          "hover:-translate-y-0.5",
                          "animate-pulse-glow",
                        ]
                      : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                  )}
                >
                  {canGenerate ? "✨ Generate Design" : "Upload photo & select style"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
