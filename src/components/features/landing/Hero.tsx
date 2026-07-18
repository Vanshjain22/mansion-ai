"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  Play,
  Clock,
  Palette,
  MonitorCheck,
  Cpu,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";

const HERO_STATS = [
  { icon: Clock, value: "30 sec", label: "Average Time" },
  { icon: Palette, value: "20+", label: "Design Styles" },
  { icon: MonitorCheck, value: "4K", label: "High Quality" },
  { icon: Cpu, value: "AI", label: "Powered" },
];

export function Hero() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    []
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updateSlider(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [updateSlider]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    },
    [isDragging, updateSlider]
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Auto-animate the slider on mount to hint interactivity
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    if (hasAnimated) return;
    const timer = setTimeout(() => {
      setSliderPos(30);
      setTimeout(() => {
        setSliderPos(70);
        setTimeout(() => {
          setSliderPos(50);
          setHasAnimated(true);
        }, 600);
      }, 600);
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasAnimated]);

  return (
    <section
      id="hero"
      className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden"
    >
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-center">
          {/* ─── Left Column — Copy ─── */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/5 mb-6">
              <span className="text-brand-primary text-xs">✦</span>
              <span className="text-xs font-medium font-[family-name:var(--font-manrope)] text-brand-primary tracking-widest uppercase">
                AI-Powered Interior Design
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-playfair)] leading-[1.1] mb-6">
              Design Your{" "}
              <br className="hidden sm:block" />
              Dream Space{" "}
              <br className="hidden sm:block" />
              <span className="text-gradient">with AI</span>
            </h1>

            {/* Description */}
            <p className="text-text-secondary text-base lg:text-lg max-w-lg mb-8 leading-relaxed">
              Upload a photo of your room and let our AI transform it into
              stunning, photorealistic interiors in less than 30 seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/generation-demo"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-primary text-text-inverse font-semibold font-[family-name:var(--font-manrope)] text-sm rounded-xl hover:bg-brand-primary-hover transition-all duration-300 gold-glow"
              >
                <Upload className="w-4 h-4" />
                Upload Your Room
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 border border-border-default text-text-primary font-medium font-[family-name:var(--font-manrope)] text-sm rounded-xl hover:bg-bg-tertiary hover:border-border-strong transition-all duration-300 glass">
                <div className="w-5 h-5 rounded-full border border-text-secondary/40 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-text-secondary ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[
                  "bg-amber-600",
                  "bg-emerald-600",
                  "bg-sky-600",
                  "bg-rose-600",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-bg-primary flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {["S", "M", "A", "P"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-brand-primary fill-brand-primary"
                    />
                  ))}
                </div>
                <p className="text-xs text-text-tertiary">
                  <span className="text-text-secondary font-medium">10,000+</span>{" "}
                  happy homeowners and designers trust MansionAI
                </p>
              </div>
            </div>
          </div>

          {/* ─── Right Column — Interactive Before/After Showcase ─── */}
          <div
            className="animate-slide-in-right"
            style={{ animationDelay: "200ms" }}
          >
            {/* Outer Glow Wrapper */}
            <div className="relative">
              {/* Soft golden glow behind the showcase */}
              <div className="absolute -inset-4 bg-brand-primary/6 rounded-[2.5rem] blur-2xl pointer-events-none" />
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-primary/15 via-transparent to-brand-primary/8 rounded-[2rem] pointer-events-none" />

              {/* Main Showcase Container */}
              <div
                ref={containerRef}
                className="relative rounded-3xl overflow-hidden border border-brand-primary/15 shadow-2xl cursor-col-resize select-none"
                style={{
                  boxShadow:
                    "0 0 80px hsl(42 78% 60% / 0.07), 0 20px 60px hsl(0 0% 0% / 0.5)",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                {/* ── Image Layers ── */}
                <div className="aspect-[16/10] relative">
                  {/* After Image (bottom layer — fully visible) */}
                  <Image
                    src="/images/landing/hero-after.png"
                    alt="Room after AI transformation"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 55vw"
                    draggable={false}
                  />

                  {/* Before Image (top layer — clipped by slider) */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden z-10"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: containerRef.current
                          ? `${containerRef.current.offsetWidth}px`
                          : "600px",
                      }}
                    >
                      <Image
                        src="/images/landing/hero-before.png"
                        alt="Room before AI transformation"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 55vw"
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* ── Slider Line & Handle ── */}
                  <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    {/* Vertical line */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/80 shadow-lg" />

                    {/* Drag Handle */}
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full pointer-events-auto
                        bg-white/95 backdrop-blur-md shadow-xl border-2 border-white
                        flex items-center justify-center gap-0.5
                        transition-transform duration-200
                        ${isDragging ? "scale-110" : "hover:scale-105"}`}
                      style={{
                        boxShadow:
                          "0 0 20px hsl(42 78% 60% / 0.3), 0 4px 16px hsl(0 0% 0% / 0.3)",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        className="text-neutral-700"
                      >
                        <path
                          d="M6 4L2 9L6 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 4L16 9L12 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* ── Glass Label: "Before" ── */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-white text-xs font-semibold font-[family-name:var(--font-manrope)] tracking-wide">
                      Before
                    </div>
                  </div>

                  {/* ── Glass Label: "After" ── */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-4 py-1.5 rounded-full bg-brand-primary/80 backdrop-blur-xl border border-brand-primary/40 text-white text-xs font-semibold font-[family-name:var(--font-manrope)] tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      After
                    </div>
                  </div>

                  {/* ── Floating Badge: AI Processing ── */}
                  <div className="absolute bottom-16 left-4 z-10 animate-float">
                    <div className="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-brand-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] text-white/60 font-[family-name:var(--font-manrope)]">
                          AI Processing
                        </div>
                        <div className="text-xs font-bold text-white font-[family-name:var(--font-manrope)]">
                          &lt; 30 seconds
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Floating Badge: Quality ── */}
                  <div
                    className="absolute bottom-16 right-4 z-10 animate-float"
                    style={{ animationDelay: "1.5s" }}
                  >
                    <div className="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-[10px] text-white/60 font-[family-name:var(--font-manrope)]">
                          Output Quality
                        </div>
                        <div className="text-xs font-bold text-white font-[family-name:var(--font-manrope)]">
                          4K Ultra HD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Stats Strip ── */}
                <div className="bg-black/60 backdrop-blur-2xl border-t border-white/5">
                  <div className="grid grid-cols-4 divide-x divide-white/5">
                    {HERO_STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center py-3.5 px-2"
                      >
                        <stat.icon className="w-4 h-4 text-brand-primary mb-1" />
                        <span className="text-sm font-bold text-white font-[family-name:var(--font-manrope)]">
                          {stat.value}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
