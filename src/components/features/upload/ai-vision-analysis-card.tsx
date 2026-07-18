"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { UploadedFile } from "@/lib/upload/types";

interface AIVisionAnalysisCardProps {
  file?: UploadedFile;
  previewUrl?: string;
  className?: string;
  onAttributeChange?: (key: string, value: string) => void;
}

export interface VisionAnalysisData {
  roomType: string;
  roomTypeConfidence: number;
  layoutComplexity: "Low" | "Medium" | "High";
  complexityScore: number; // 1 to 5
  detectedFurniture: Array<{ name: string; confidence: number; count: number }>;
  naturalLighting: string;
  lightingConfidence: number;
  floorMaterial: string;
  floorConfidence: number;
  wallColor: string;
  wallColorHex: string;
  wallColorConfidence: number;
  overallConfidence: number;
  dimensionsEstimate: string;
}

const DEFAULT_SIMULATED_ANALYSIS: VisionAnalysisData = {
  roomType: "Living Room",
  roomTypeConfidence: 99.2,
  layoutComplexity: "Medium",
  complexityScore: 3,
  detectedFurniture: [
    { name: "Sofa / Sectional", confidence: 98.4, count: 1 },
    { name: "Coffee Table", confidence: 96.1, count: 1 },
    { name: "Floor Lamp", confidence: 93.8, count: 2 },
    { name: "Accent Chair", confidence: 91.5, count: 1 },
    { name: "TV Console", confidence: 89.2, count: 1 },
    { name: "Area Rug", confidence: 87.6, count: 1 },
  ],
  naturalLighting: "Direct Sunlight (South-West Window)",
  lightingConfidence: 97.8,
  floorMaterial: "Oak Hardwood Parquet",
  floorConfidence: 95.4,
  wallColor: "Warm Off-White Sand",
  wallColorHex: "#F2EFE9",
  wallColorConfidence: 98.1,
  overallConfidence: 98.6,
  dimensionsEstimate: "4.8m × 6.2m (~30 m²)",
};

export function AIVisionAnalysisCard({
  file,
  previewUrl,
  className,
}: AIVisionAnalysisCardProps) {

  const [activeTab, setActiveTab] = useState<"analysis" | "json">("analysis");
  const [data, setData] = useState<VisionAnalysisData>(DEFAULT_SIMULATED_ANALYSIS);
  const [isScanning, setIsScanning] = useState(false);

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const rawJsonOutput = JSON.stringify(
    {
      model: "gpt-4o-vision-spatial-v2",
      timestamp: new Date().toISOString(),
      image_filename: file?.name || "room_photo.jpg",
      overall_confidence: data.overallConfidence / 100,
      analysis: {
        room_type: { value: data.roomType, confidence: data.roomTypeConfidence / 100 },
        layout_complexity: { value: data.layoutComplexity, score: data.complexityScore },
        estimated_dimensions: data.dimensionsEstimate,
        natural_lighting: { value: data.naturalLighting, confidence: data.lightingConfidence / 100 },
        floor_material: { value: data.floorMaterial, confidence: data.floorConfidence / 100 },
        wall_color: { value: data.wallColor, hex: data.wallColorHex, confidence: data.wallColorConfidence / 100 },
        detected_objects: data.detectedFurniture.map((f) => ({
          label: f.name,
          confidence: f.confidence / 100,
          quantity: f.count,
        })),
      },
    },
    null,
    2
  );

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border border-border-default",
        "bg-gradient-to-b from-bg-secondary via-bg-primary to-bg-secondary",
        "shadow-2xl backdrop-blur-xl transition-all duration-300",
        className
      )}
    >
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-brand-primary to-cyan-500" />

      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-border-subtle bg-bg-tertiary/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          {/* GPT Vision Badge Icon */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 via-brand-primary/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-400">👁️</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold font-[family-name:var(--font-outfit)] text-text-primary tracking-wide">
                GPT-4o Vision • Spatial Analysis
              </h3>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {data.overallConfidence}% Confidence
              </span>
            </div>
            <p className="text-[10px] text-text-tertiary">
              Automatic room geometry & element detection
            </p>
          </div>
        </div>

        {/* Tab Controls & Re-scan */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-bg-primary border border-border-subtle text-[11px]">
            <button
              onClick={() => setActiveTab("analysis")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium",
                activeTab === "analysis"
                  ? "bg-bg-tertiary text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              Visual Inspector
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-mono",
                activeTab === "json"
                  ? "bg-bg-tertiary text-emerald-400 shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              JSON
            </button>
          </div>

          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="p-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-elevated text-text-secondary hover:text-brand-primary border border-border-subtle transition-colors text-xs"
            title="Re-analyze image"
          >
            <span className={cn("inline-block", isScanning && "animate-spin")}>
              🔄
            </span>
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      {activeTab === "analysis" ? (
        <div className="p-5 space-y-5">
          {/* Scanning Progress Overlay (if rescanning) */}
          {isScanning && (
            <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-xs text-brand-primary flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              <span>Scanning room feature vectors with GPT Vision...</span>
            </div>
          )}

          {/* Key Attribute Cards (Top Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Room Type */}
            <div className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-brand-primary/30 transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-tertiary block mb-1">
                Room Type
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  🛋️ {data.roomType}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {data.roomTypeConfidence}%
                </span>
              </div>
            </div>

            {/* 2. Layout Complexity */}
            <div className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-brand-primary/30 transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-tertiary block mb-1">
                Layout Complexity
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  📐 {data.layoutComplexity}
                </span>
                {/* 5-bar meter */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-3 rounded-full",
                        i <= data.complexityScore
                          ? "bg-brand-primary"
                          : "bg-bg-elevated"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Floor Material */}
            <div className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-brand-primary/30 transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-tertiary block mb-1">
                Floor Material
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary truncate">
                  🪵 {data.floorMaterial}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                  {data.floorConfidence}%
                </span>
              </div>
            </div>

            {/* 4. Wall Color */}
            <div className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-subtle hover:border-brand-primary/30 transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-tertiary block mb-1">
                Wall Color
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-border-default shadow-sm"
                    style={{ backgroundColor: data.wallColorHex }}
                  />
                  <span className="text-xs font-semibold text-text-primary truncate">
                    {data.wallColor}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {data.wallColorHex}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Natural Lighting & Dimensions */}
          <div className="p-3.5 rounded-xl bg-bg-tertiary/30 border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-amber-400">
                ☀️
              </span>
              <div>
                <span className="text-text-tertiary block text-[10px] font-mono">
                  NATURAL LIGHTING & EXPOSURE
                </span>
                <span className="font-medium text-text-primary">
                  {data.naturalLighting}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <span className="text-text-tertiary block text-[10px] font-mono">
                  ESTIMATED DIMENSIONS
                </span>
                <span className="font-mono font-medium text-brand-primary">
                  {data.dimensionsEstimate}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Detected Furniture Objects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <span>🔍</span> Detected Furniture & Objects
              </span>
              <span className="text-[10px] font-mono text-text-tertiary">
                {data.detectedFurniture.length} Items Identified
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.detectedFurniture.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-tertiary border border-border-subtle hover:border-brand-primary/40 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-text-primary">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary bg-bg-primary px-1.5 py-0.5 rounded">
                    {item.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* JSON Inspector View */
        <div className="p-4 bg-bg-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-emerald-400">
              // OpenAI Vision API JSON Payload
            </span>
            <span className="text-[10px] font-mono text-text-tertiary">
              application/json
            </span>
          </div>
          <pre className="p-4 rounded-xl bg-bg-secondary border border-border-subtle font-mono text-xs text-text-secondary overflow-auto max-h-80 leading-relaxed">
            <code>{rawJsonOutput}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
