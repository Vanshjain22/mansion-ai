"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ComparisonSlider } from "./ComparisonSlider";
import { saveRecentGeneration } from "./RecentGenerations";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  Download,
  Heart,
  Maximize2,
  Share2,
  RotateCcw,
  Sparkles,
  Clock,
  Cpu,
  ArrowRight,
  Check,
  X,
  Star,
} from "lucide-react";

/**
 * ResultGallery — World-Class Output Showcase & Comparison Experience.
 *
 * Features:
 * - Gold confetti celebration particle burst on initial load
 * - Auto-saves output to Recent Generations history
 * - Interactive 1-5 Star rating feedback prompt
 * - Share to Twitter / X pre-filled link
 * - Fullscreen zoom modal overlay
 */

interface Variation {
  id: string;
  generatedImageUrl: string;
  aiProvider: string;
  aiModel: string;
  inferenceTimeMs: number;
}

interface ResultGalleryProps {
  originalImageUrl: string;
  variations: Variation[];
  styleName?: string;
  roomTypeName?: string;
  onStartOver: () => void;
  onRegenerate?: () => void;
  className?: string;
}

export function ResultGallery({
  originalImageUrl,
  variations,
  styleName = "AI Design",
  roomTypeName = "Room",
  onStartOver,
  onRegenerate,
  className,
}: ResultGalleryProps) {
  const confettiFired = useRef(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const primary = variations[0];

  // Auto-save to recent history & fire gold confetti burst on mount
  useEffect(() => {
    if (confettiFired.current || variations.length === 0) return;
    confettiFired.current = true;

    // Save to history
    saveRecentGeneration({
      originalUrl: originalImageUrl,
      generatedUrl: primary.generatedImageUrl,
      styleName,
      roomType: roomTypeName,
    });

    // Fire gold confetti
    const duration = 2200;
    const end = Date.now() + duration;
    const colors = ["#D4AF37", "#FFD700", "#F0C040", "#E8B330", "#FFFFFF"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.75 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.75 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    setTimeout(frame, 200);
  }, [variations, originalImageUrl, styleName, roomTypeName, primary]);

  if (variations.length === 0) return null;

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Check out my room redesigned in ${styleName} style using Mansion AI!`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn("w-full max-w-6xl mx-auto space-y-10", className)}
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 0.68, 0, 1.1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Transformation Complete in {(primary.inferenceTimeMs / 1000).toFixed(1)}s</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-[family-name:var(--font-playfair)] text-text-primary mb-3 tracking-tight">
            Your <span className="text-gradient-gold">{styleName}</span> Space
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto font-medium">
            Your {roomTypeName.replace("_", " ")} reimagined with AI precision. Compare slider, download 4K export, or share.
          </p>
        </motion.div>
      </div>

      {/* Before / After Slider Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-brand-primary" />
            Interactive Before / After Slider
          </h3>
          <span className="text-xs text-text-tertiary font-mono">Drag handle to compare</span>
        </div>
        <ComparisonSlider
          beforeUrl={originalImageUrl}
          afterUrl={primary.generatedImageUrl}
          beforeLabel="Original Room"
          afterLabel={`${styleName} AI Design`}
        />
      </motion.div>

      {/* Side-by-Side Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Original Photo */}
        <div className="rounded-3xl overflow-hidden border border-border-subtle bg-bg-secondary flex flex-col justify-between">
          <div className="relative aspect-video w-full">
            <Image
              src={originalImageUrl}
              alt="Original room photo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-bg-tertiary/40">
            <p className="text-xs font-bold text-text-secondary">Original Photo</p>
          </div>
        </div>

        {/* AI Generated Photo */}
        <div className="rounded-3xl overflow-hidden border-2 border-brand-primary/40 bg-bg-secondary shadow-[0_0_40px_hsl(42_78%_60%_/_0.15)] flex flex-col justify-between">
          <div className="relative aspect-video w-full group">
            <Image
              src={primary.generatedImageUrl}
              alt="AI Reimagined Room Design"
              fill
              className="object-cover"
              unoptimized
            />

            {/* Hover overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md text-white transition-all focus-ring"
                title="Fullscreen view"
                aria-label="Open full screen view"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsFavorited(!isFavorited)}
                className={cn(
                  "p-3 rounded-2xl backdrop-blur-md transition-all focus-ring",
                  isFavorited
                    ? "bg-brand-accent text-white"
                    : "bg-white/20 hover:bg-white/35 text-white"
                )}
                title="Save to favorites"
                aria-label="Save to favorites"
              >
                <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md text-white transition-all focus-ring"
                title="Share design link"
                aria-label="Share design link"
              >
                {copiedShare ? <Check className="w-5 h-5 text-success" /> : <Share2 className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={handleTwitterShare}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md text-white transition-all focus-ring"
                title="Share to Twitter / X"
                aria-label="Share to Twitter"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-brand-primary/20 bg-brand-primary/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-brand-primary">
                AI Design — {styleName}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-secondary">
                  <Cpu className="w-3 h-3 text-brand-primary" />
                  {primary.aiModel}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-secondary">
                  <Clock className="w-3 h-3 text-brand-primary" />
                  {(primary.inferenceTimeMs / 1000).toFixed(1)}s
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleDownload(
                  primary.generatedImageUrl,
                  `mansionai-${styleName.toLowerCase().replace(/\s/g, "-")}.jpg`
                )
              }
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl",
                "text-xs font-bold",
                "gradient-cta text-bg-primary shadow-md",
                "hover:-translate-y-0.5 transition-all duration-200 focus-ring"
              )}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 4K</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Interactive 1-5 Star Rating Section */}
      <div className="p-5 rounded-3xl glass-premium border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto text-center sm:text-left">
        <div>
          <h4 className="text-xs font-bold text-text-primary">How did the AI perform?</h4>
          <p className="text-[11px] text-text-tertiary">Rate this transformation to tune your future results</p>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setUserRating(star)}
              className="p-1 text-text-tertiary hover:text-brand-primary transition-colors focus-ring"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-transform hover:scale-125",
                  userRating && userRating >= star && "text-brand-primary fill-brand-primary"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Share Toast Notification */}
      <AnimatePresence>
        {copiedShare && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-bold text-center max-w-sm mx-auto flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Design link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className={cn(
              "inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl",
              "text-sm font-bold",
              "bg-bg-tertiary/70 hover:bg-bg-elevated text-text-primary",
              "border border-border-subtle hover:border-brand-primary/30",
              "transition-all duration-200 focus-ring"
            )}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Regenerate Variation</span>
          </button>
        )}
        <button
          type="button"
          onClick={onStartOver}
          className={cn(
            "inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl",
            "text-sm font-extrabold tracking-wide",
            "gradient-cta text-bg-primary shadow-xl",
            "hover:-translate-y-0.5 transition-all duration-300 focus-ring"
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Design Another Room</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus-ring"
              aria-label="Close full screen view"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative max-w-5xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={primary.generatedImageUrl}
                alt="AI Reimagined Room Fullscreen"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
