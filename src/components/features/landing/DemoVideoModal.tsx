"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Upload,
  Scan,
  Sliders,
  Paintbrush,
  Maximize2,
  Command,
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
} from "lucide-react";

/**
 * DemoVideoModal — World-Class Aesthetic Product Demo Modal.
 *
 * CRITICAL FIX FOR NAVBAR OVERLAP:
 * Uses React createPortal(..., document.body) to mount directly onto document.body,
 * bypassing any parent stacking context or z-index limitations.
 * Stacking z-[99999] + body scroll lock ensures the navbar is completely covered
 * and backdrop blur covers 100% of the viewport.
 */

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Chapter {
  id: number;
  timeSec: number;
  label: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    timeSec: 0,
    label: "Upload",
    title: "1. Drag & Drop Room Photo",
    description: "Upload high-res interior photos in JPG, PNG, WEBP, or HEIC format with AES-256 cloud encryption.",
    icon: Upload,
    badge: "Drag & Drop Hero Zone",
  },
  {
    id: 2,
    timeSec: 6,
    label: "Vision Scan",
    title: "2. AI Room Analysis Scan",
    description: "AI extracts room geometry, detects furniture items, natural lighting direction, wall hex codes, and spatial dimensions.",
    icon: Scan,
    badge: "99.2% Detection Match",
  },
  {
    id: 3,
    timeSec: 12,
    label: "Styles",
    title: "3. Choose 20+ Styles & Custom Prompts",
    description: "Select Japandi, Modern Luxury, Minimalist, or Scandinavian. Customize color palettes, mood, and AI creativity index.",
    icon: Sliders,
    badge: "20+ Architectural Styles",
  },
  {
    id: 4,
    timeSec: 18,
    label: "AI Render",
    title: "4. Fast AI Render Engine",
    description: "Multi-stage raytracing shader pipeline reimagines room structure into photorealistic 4K renders in ~15 seconds.",
    icon: Paintbrush,
    badge: "~15s Render Speed",
  },
  {
    id: 5,
    timeSec: 24,
    label: "Results & Slider",
    title: "5. Interactive Before/After Split Slider",
    description: "Drag the divider to compare original room vs AI transformation. Download 4K Ultra HD exports or share link.",
    icon: Maximize2,
    badge: "4K Ultra HD Export",
  },
  {
    id: 6,
    timeSec: 30,
    label: "Pro Tools",
    title: "6. Command Palette & Copilot Advisor",
    description: "Use Ctrl+K command palette, Ctrl+Z undo/redo history, Dark/Light theme switcher, and AI Copilot Advisor.",
    icon: Command,
    badge: "Ctrl+K Command Hub",
  },
];

const TOTAL_DURATION = 36; // 36 seconds total demo loop

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeChapter, setActiveChapter] = useState<Chapter>(CHAPTERS[0]);

  // Mount check for SSR / Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Demo playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2 * playbackSpeed;
          if (next >= TOTAL_DURATION) {
            return 0; // Loop demo
          }
          return next;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed]);

  // Auto-sync active chapter based on current time
  useEffect(() => {
    for (let i = CHAPTERS.length - 1; i >= 0; i--) {
      if (currentTime >= CHAPTERS[i].timeSec) {
        setActiveChapter(CHAPTERS[i]);
        break;
      }
    }
  }, [currentTime]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0);
      setIsPlaying(true);
      setActiveChapter(CHAPTERS[0]);
    }
  }, [isOpen]);

  const handleJumpToChapter = (ch: Chapter) => {
    setCurrentTime(ch.timeSec);
    setActiveChapter(ch);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const ChapterIcon = activeChapter.icon;
  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8"
          onClick={onClose}
        >
          {/* Ultra-dark full-screen backdrop blur overlay */}
          <div className="fixed inset-0 bg-black/92 backdrop-blur-2xl" />

          {/* Main Portal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 0.68, 0, 1.1] }}
            className="relative w-full max-w-5xl rounded-3xl overflow-hidden glass-premium border border-border-subtle shadow-[0_0_90px_hsl(42_78%_60%_/_0.2)] flex flex-col max-h-[90vh] bg-bg-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-cta flex items-center justify-center text-bg-primary shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-[family-name:var(--font-playfair)] text-text-primary">
                    MansionAI Interactive Product Demo
                  </h3>
                  <p className="text-[11px] text-text-tertiary font-medium">
                    End-to-End AI Interior Design Studio Walkthrough
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  30s Walkthrough
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-bg-tertiary hover:bg-bg-elevated text-text-tertiary hover:text-text-primary transition-colors focus-ring"
                  aria-label="Close demo modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Scene Bar */}
            <div className="px-6 py-3 bg-bg-tertiary/40 border-b border-border-subtle flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0">
                  <ChapterIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    {activeChapter.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-snug line-clamp-1">
                    {activeChapter.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-[10px] font-mono font-bold">
                  {activeChapter.badge}
                </span>
                <span className="text-xs font-mono text-text-tertiary">
                  {activeChapter.id}/6
                </span>
              </div>
            </div>

            {/* Animated Interactive Video Screen */}
            <div className="relative aspect-video w-full bg-black overflow-hidden group flex items-center justify-center">
              <AnimatePresence mode="wait">
                {/* Scene 1: Upload */}
                {activeChapter.id === 1 && (
                  <motion.div
                    key="scene-1"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full p-8 flex flex-col items-center justify-center bg-gradient-to-b from-brand-primary/10 via-bg-secondary to-bg-primary"
                  >
                    <div className="w-full max-w-md p-8 rounded-3xl border-2 border-dashed border-brand-primary/50 bg-bg-elevated/60 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl space-y-4">
                      <div className="w-16 h-16 rounded-2xl gradient-cta flex items-center justify-center text-bg-primary shadow-lg animate-float">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-text-primary">
                        Drop your room photo to begin
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Supports high-res JPG, PNG, WEBP • Max 10MB
                      </p>
                      <div className="flex gap-2 pt-2">
                        <span className="px-3 py-1 rounded-full bg-brand-primary/15 text-brand-primary text-[10px] font-mono font-bold">
                          AES-256 Encrypted
                        </span>
                        <span className="px-3 py-1 rounded-full bg-success/15 text-success text-[10px] font-mono font-bold">
                          Instant Vectoring
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Scene 2: Vision Scan */}
                {activeChapter.id === 2 && (
                  <motion.div
                    key="scene-2"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src="/images/landing/hero-before.png"
                      alt="Vision Scan"
                      fill
                      className="object-cover opacity-80"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_20px_var(--brand-primary)] animate-laser-scan" />

                    <div className="absolute top-[35%] left-[25%] p-2 rounded-xl bg-black/70 backdrop-blur-md border border-brand-primary text-xs font-mono font-bold text-brand-primary shadow-lg animate-pulse">
                      🛋️ Sofa / Sectional [99.2%]
                    </div>
                    <div className="absolute bottom-[25%] right-[30%] p-2 rounded-xl bg-black/70 backdrop-blur-md border border-success text-xs font-mono font-bold text-success shadow-lg animate-pulse">
                      ☀️ South-West Sunlight [97.8%]
                    </div>
                  </motion.div>
                )}

                {/* Scene 3: Styles */}
                {activeChapter.id === 3 && (
                  <motion.div
                    key="scene-3"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full p-6 bg-bg-secondary flex flex-col justify-center"
                  >
                    <div className="max-w-3xl mx-auto space-y-4 w-full">
                      <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                        <span>Select Architectural Aesthetic</span>
                        <span className="text-brand-primary font-mono">20+ Styles Available</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: "Japandi", img: "/images/landing/style-japandi.png" },
                          { name: "Modern Luxury", img: "/images/landing/style-luxury.png" },
                          { name: "Minimalist", img: "/images/landing/style-minimalist.png" },
                        ].map((s, idx) => (
                          <div
                            key={s.name}
                            className={cn(
                              "relative aspect-video rounded-2xl overflow-hidden border-2 shadow-xl",
                              idx === 1 ? "border-brand-primary ring-2 ring-brand-primary/40" : "border-border-subtle"
                            )}
                          >
                            <Image src={s.img} alt={s.name} fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex items-end justify-between">
                              <span className="text-xs font-bold text-white">{s.name}</span>
                              {idx === 1 && (
                                <span className="w-5 h-5 rounded-full gradient-cta text-bg-primary flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Scene 4: AI Render */}
                {activeChapter.id === 4 && (
                  <motion.div
                    key="scene-4"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full flex items-center justify-center bg-bg-primary"
                  >
                    <Image
                      src="/images/landing/hero-after.png"
                      alt="Render"
                      fill
                      className="object-cover opacity-40 blur-xs"
                      unoptimized
                    />
                    <div className="relative z-10 p-8 rounded-3xl glass-premium border border-brand-primary/40 text-center space-y-4 max-w-sm shadow-2xl">
                      <div className="w-14 h-14 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary mx-auto animate-spin">
                        <Paintbrush className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-text-primary">
                        AI Shader Pipeline Active
                      </h4>
                      <div className="w-full bg-bg-tertiary h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-primary to-brand-primary-hover h-full w-3/4 rounded-full animate-pulse" />
                      </div>
                      <span className="text-xs font-mono text-brand-primary font-bold block">
                        Applying Shaders & Raytracing • ~12s
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Scene 5: Results & Split Slider */}
                {activeChapter.id === 5 && (
                  <motion.div
                    key="scene-5"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src="/images/landing/hero-after.png"
                      alt="After"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: "50%" }}
                    >
                      <Image
                        src="/images/landing/hero-before.png"
                        alt="Before"
                        fill
                        className="object-cover"
                        style={{ maxWidth: "none", width: "100%" }}
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-brand-primary shadow-[0_0_12px_var(--brand-primary)]">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-bg-primary font-bold text-xs flex items-center justify-center shadow-lg">
                        ↔
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/60 text-white text-xs font-bold">
                      Before
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-black/60 text-brand-primary text-xs font-bold">
                      After (4K Ultra HD)
                    </div>
                  </motion.div>
                )}

                {/* Scene 6: Pro Tools */}
                {activeChapter.id === 6 && (
                  <motion.div
                    key="scene-6"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full p-8 bg-bg-secondary flex items-center justify-center"
                  >
                    <div className="w-full max-w-lg p-6 rounded-2xl glass-premium border border-border-subtle shadow-2xl space-y-4 font-mono">
                      <div className="flex items-center justify-between text-xs text-brand-primary font-bold border-b border-border-subtle pb-2">
                        <span className="flex items-center gap-1.5">
                          <Command className="w-4 h-4" />
                          Command Palette (Ctrl+K)
                        </span>
                        <span>Shortcut Hub</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-brand-primary/15 text-text-primary flex items-center justify-between">
                          <span>Go to Customize Preferences</span>
                          <kbd className="px-2 py-0.5 rounded bg-bg-tertiary text-[10px]">Alt+3</kbd>
                        </div>
                        <div className="p-2.5 rounded-xl bg-bg-tertiary text-text-secondary flex items-center justify-between">
                          <span>Undo Preference Change</span>
                          <kbd className="px-2 py-0.5 rounded bg-bg-tertiary text-[10px]">Ctrl+Z</kbd>
                        </div>
                        <div className="p-2.5 rounded-xl bg-bg-tertiary text-text-secondary flex items-center justify-between">
                          <span>Toggle Light / Dark Theme</span>
                          <kbd className="px-2 py-0.5 rounded bg-bg-tertiary text-[10px]">T</kbd>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Big Hover Play/Pause Overlay */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <div className="w-16 h-16 rounded-full bg-brand-primary/90 text-bg-primary shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </div>
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="px-6 py-3.5 bg-bg-secondary border-t border-border-subtle space-y-3 shrink-0">
              {/* Progress Scrubber */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={TOTAL_DURATION}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded-full appearance-none bg-bg-tertiary cursor-pointer accent-brand-primary focus-ring"
                  aria-label="Seek time"
                />
                <div
                  className="absolute top-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-brand-primary via-brand-primary-hover to-brand-primary pointer-events-none"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Controls Cluster */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-xl bg-bg-tertiary hover:bg-bg-elevated text-text-primary transition-colors focus-ring"
                    aria-label={isPlaying ? "Pause demo" : "Play demo"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-bg-tertiary hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors focus-ring"
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-xs font-mono font-bold text-text-tertiary min-w-[70px]">
                    {Math.floor(currentTime)}s / {TOTAL_DURATION}s
                  </span>
                </div>

                {/* Chapter Timestamps */}
                <div className="hidden md:flex items-center gap-1.5">
                  {CHAPTERS.map((ch) => {
                    const isActive = activeChapter.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleJumpToChapter(ch)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all focus-ring",
                          isActive
                            ? "bg-brand-primary text-bg-primary shadow-sm"
                            : "bg-bg-tertiary/60 text-text-tertiary hover:text-text-primary"
                        )}
                      >
                        {ch.label}
                      </button>
                    );
                  })}
                </div>

                {/* Speed Multiplier */}
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                  className="px-3 py-1 rounded-xl bg-bg-tertiary/80 hover:bg-bg-elevated text-xs font-mono font-bold text-brand-primary border border-border-subtle focus-ring"
                >
                  {playbackSpeed}x Speed
                </button>
              </div>
            </div>

            {/* Bottom Footer CTA */}
            <div className="px-6 py-4 bg-bg-primary/95 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  No credit card required
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                  AI Vision Engine
                </span>
              </div>

              <Link
                href="/generation-demo"
                onClick={onClose}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl",
                  "text-xs font-extrabold tracking-wide",
                  "gradient-cta text-bg-primary shadow-lg",
                  "hover:-translate-y-0.5 transition-all duration-200 focus-ring"
                )}
              >
                <span>Try Mansion AI Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
