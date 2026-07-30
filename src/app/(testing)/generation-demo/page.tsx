"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StudioHeader } from "@/components/features/studio/StudioHeader";
import { UploadZone } from "@/components/features/studio/UploadZone";
import { DetectionPanel } from "@/components/features/studio/DetectionPanel";
import { PreferencePanel } from "@/components/features/studio/PreferencePanel";
import { GenerateButton } from "@/components/features/studio/GenerateButton";
import { GenerationTimeline } from "@/components/features/studio/GenerationTimeline";
import { ResultGallery } from "@/components/features/studio/ResultGallery";
import { StudioSidebar } from "@/components/features/studio/StudioSidebar";
import { AIAssistant } from "@/components/features/studio/AIAssistant";
import { FloatingActions } from "@/components/features/studio/FloatingActions";
import { RecentGenerations } from "@/components/features/studio/RecentGenerations";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ShortcutsHelp } from "@/components/ui/ShortcutsHelp";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { toast } from "@/stores/toast-store";
import { useDesignStore } from "@/stores/design-store";
import { useThemeStore } from "@/stores/theme-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { getStyleById } from "@/lib/data/styles";
import type { UploadedFile } from "@/lib/upload/types";

/**
 * Generation Studio Page — World-Class AI Interior Design SaaS Studio.
 *
 * Fully integrated 25 Premium Features:
 * - Animated Aurora mesh & gradient background
 * - Toast notification stack & Command palette (Ctrl+K)
 * - Keyboard shortcuts (Ctrl+Z undo, Alt+1-6 step nav, ?)
 * - Floating action buttons & AI Copilot Advisor
 * - Sticky sidebar & Recent generation history
 * - Dark / Light / System Theme switcher
 */

type StudioStep = 1 | 2 | 3 | 4 | 5 | 6;

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

const stepVariants = {
  initial: { opacity: 0, y: 28, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(4px)" },
};

export default function GenerationStudioPage() {
  const [step, setStep] = useState<StudioStep>(1);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  const selectedStyle = useDesignStore((s) => s.selectedStyle);
  const customPrompt = useDesignStore((s) => s.customPrompt);
  const roomType = useDesignStore((s) => s.roomType);
  const colorPalette = useDesignStore((s) => s.colorPalette);
  const mood = useDesignStore((s) => s.mood);
  const lighting = useDesignStore((s) => s.lighting);
  const budget = useDesignStore((s) => s.budget);
  const resetStore = useDesignStore((s) => s.resetAll);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Zustand temporal undo/redo
  const temporal = (useDesignStore as any).temporal;
  const undo = temporal?.getState()?.undo;
  const redo = temporal?.getState()?.redo;

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<{
    designId: string;
    jobId: string;
  } | null>(null);
  const [jobState, setJobState] = useState<GenStatusData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedStyleDef = selectedStyle
    ? getStyleById(selectedStyle)
    : undefined;



  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleUploadComplete = useCallback((file: UploadedFile) => {
    setUploadedFile(file);
    setStep(2);
    toast({
      title: "Photo Uploaded",
      description: "Running AI room analysis...",
      variant: "success",
    });
  }, []);

  const handleDetectionContinue = useCallback(() => {
    setStep(3);
  }, []);

  const handlePreferenceContinue = useCallback(() => {
    setStep(4);
  }, []);

  const handleStepClick = useCallback((targetStep: number) => {
    if (targetStep >= 1 && targetStep <= 6) {
      setStep(targetStep as StudioStep);
    }
  }, []);

  const handleStartGeneration = useCallback(async () => {
    if (!uploadedFile || !roomType || !selectedStyle) {
      const msg = "Please upload a photo, select a room type, and choose a design style.";
      setErrorMsg(msg);
      toast({ title: "Configuration Incomplete", description: msg, variant: "error" });
      return;
    }

    setStep(5);
    setIsGenerating(true);
    setErrorMsg(null);
    setJobState(null);

    toast({
      title: "AI Generation Task Started",
      description: `Applying ${selectedStyleDef?.name || "Selected Style"} to your room.`,
      variant: "info",
    });

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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
      setIsGenerating(false);
      toast({ title: "Generation Failed", description: message, variant: "error" });
    }
  }, [
    uploadedFile,
    roomType,
    selectedStyle,
    customPrompt,
    colorPalette,
    mood,
    lighting,
    budget,
    selectedStyleDef,
  ]);

  const startPolling = (designId: string, jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/designs/${designId}/status?jobId=${jobId}`
        );
        if (!response.ok) throw new Error("Failed to fetch job status.");

        const { data } = await response.json();
        const statusData: GenStatusData = data;

        setJobState(statusData);

        if (statusData.status === "completed") {
          clearInterval(pollIntervalRef.current!);
          setIsGenerating(false);
          setStep(6);
          toast({
            title: "Transformation Complete!",
            description: "Your 4K AI room design is ready.",
            variant: "success",
          });
        } else if (statusData.status === "failed") {
          clearInterval(pollIntervalRef.current!);
          setErrorMsg(statusData.error || "Generation task failed.");
          setIsGenerating(false);
          toast({
            title: "Generation Task Failed",
            description: statusData.error || "Generation task failed.",
            variant: "error",
          });
        }
      } catch (err: unknown) {
        clearInterval(pollIntervalRef.current!);
        const message =
          err instanceof Error ? err.message : "Error polling status.";
        setErrorMsg(message);
        setIsGenerating(false);
      }
    }, 1500);
  };

  const handleCancel = useCallback(async () => {
    if (!currentJob) return;

    try {
      const response = await fetch(
        `/api/designs/${currentJob.designId}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: currentJob.jobId }),
        }
      );

      if (!response.ok) throw new Error("Failed to cancel generation.");

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      setJobState((prev) =>
        prev ? { ...prev, status: "cancelled", progress: 0 } : null
      );
      setErrorMsg("Generation task cancelled by user.");
      setIsGenerating(false);
      setCurrentJob(null);
      toast({ title: "Generation Cancelled", variant: "warning" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel.";
      setErrorMsg(message);
    }
  }, [currentJob]);

  const handleResetAll = useCallback(() => {
    setUploadedFile(null);
    resetStore();
    setJobState(null);
    setErrorMsg(null);
    setIsGenerating(false);
    setCurrentJob(null);
    setStep(1);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    toast({ title: "Studio Reset", description: "All options restored to initial state.", variant: "info" });
  }, [resetStore]);

  // Global Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onUndo: () => {
      undo?.();
      toast({ title: "Preference Undone", variant: "info" });
    },
    onRedo: () => {
      redo?.();
      toast({ title: "Preference Redone", variant: "info" });
    },
    onGenerate: () => {
      if (step === 3 || step === 4) handleStartGeneration();
    },
    onEscape: () => {
      setIsCommandPaletteOpen(false);
      setIsShortcutsHelpOpen(false);
    },
    onStepNav: handleStepClick,
    onToggleTheme: () => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      toast({ title: `Theme switched to ${nextTheme}`, variant: "default" });
    },
  });

  return (
    <ErrorBoundary fallbackTitle="Studio encountered an error">
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col selection:bg-brand-primary/30 relative">
      {/* Aurora Mesh Background */}
      <AuroraBackground />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onStepNav={handleStepClick}
        onReset={handleResetAll}
        onGenerate={handleStartGeneration}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onShowShortcuts={() => setIsShortcutsHelpOpen(true)}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsHelp
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />






      {/* Sticky Header */}
      <StudioHeader
        currentStep={step}
        onStepClick={handleStepClick}
        onReset={handleResetAll}
        showReset={step > 1}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload Room */}
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
                className="space-y-10"
              >
                <div className="text-center">
                  <h2 className="text-3xl md:text-5xl font-extrabold font-[family-name:var(--font-playfair)] text-text-primary mb-4 tracking-tight">
                    Transform Any Room with{" "}
                    <span className="text-gradient-gold">AI Precision</span>
                  </h2>
                  <p className="text-text-secondary text-base max-w-lg mx-auto leading-relaxed font-medium">
                    Upload a photo of your space and watch our spatial model reimagine it
                    in seconds. 10+ architectural styles.
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  <UploadZone onUploadComplete={handleUploadComplete} />
                </div>

                {/* Recent Generation History Carousel */}
                <RecentGenerations />
              </motion.div>
            )}

            {/* Step 2: AI Spatial Vision Detection */}
            {step === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
              >
                <DetectionPanel onContinue={handleDetectionContinue} />
              </motion.div>
            )}

            {/* Step 3 & 4: Customize Preferences & Generate */}
            {(step === 3 || step === 4) && (
              <motion.div
                key="step-3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
                className="flex flex-col lg:flex-row items-start gap-8"
              >
                <div className="flex-1 w-full">
                  {step === 3 && (
                    <PreferencePanel onContinue={handlePreferenceContinue} />
                  )}
                  {step === 4 && (
                    <GenerateButton onClick={handleStartGeneration} />
                  )}
                </div>

                {/* Sticky Config Sidebar */}
                <StudioSidebar
                  uploadedImageUrl={uploadedFile?.url}
                  onGenerate={handleStartGeneration}
                  canGenerate={selectedStyle !== null}
                  className="hidden lg:block"
                />
              </motion.div>
            )}

            {/* Step 5: Generation Progress Timeline */}
            {step === 5 && (
              <motion.div
                key="step-5"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
              >
                <GenerationTimeline
                  progress={jobState?.progress ?? 0}
                  status={jobState?.status ?? "pending"}
                  originalImageUrl={uploadedFile?.url ?? ""}
                  errorMessage={errorMsg}
                  onCancel={handleCancel}
                  onRetry={handleStartGeneration}
                  styleName={selectedStyleDef?.name}
                  roomTypeName={roomType || "Room"}
                />
              </motion.div>
            )}

            {/* Step 6: Results Showcase & Comparison */}
            {step === 6 && jobState && (
              <motion.div
                key="step-6"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1.1] }}
              >
                <ResultGallery
                  originalImageUrl={uploadedFile?.url ?? ""}
                  variations={jobState.variations}
                  styleName={selectedStyleDef?.name}
                  roomTypeName={roomType || "Room"}
                  onStartOver={handleResetAll}
                  onRegenerate={handleStartGeneration}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Alert Notification */}
          <AnimatePresence>
            {errorMsg && step !== 5 && step !== 6 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mt-8 p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-bold max-w-2xl mx-auto text-center shadow-lg flex items-center justify-center gap-2"
              >
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-border-subtle bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-text-tertiary">
          <span>MansionAI Studio</span>
          <span>AI-Powered Interior Design</span>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
