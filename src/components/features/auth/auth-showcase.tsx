"use client";

import { Sparkles, CheckCircle2, Lock, Palette, Eye } from "lucide-react";

export function AuthShowcase() {
  const highlights = [
    {
      title: "AI-Powered Room Remodeling",
      desc: "Transform room photos into personalized interior design concepts.",
      icon: <Palette className="w-4 h-4 text-brand-primary" />,
    },
    {
      title: "Smart Design Preferences",
      desc: "Customize style, mood, lighting, color palette and budget preferences.",
      icon: <Eye className="w-4 h-4 text-brand-primary" />,
    },
    {
      title: "High-Quality Design Visualization",
      desc: "Generate polished interior concepts for inspiration and planning.",
      icon: <Sparkles className="w-4 h-4 text-brand-primary" />,
    },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-b from-bg-secondary/90 via-bg-tertiary/70 to-bg-secondary/90 border border-glass-border shadow-2xl backdrop-blur-2xl relative overflow-hidden h-full min-h-[580px]">
      {/* Background Gold Ambient Beams */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-primary/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-accent/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header & Tagline */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI DESIGN STUDIO</span>
        </div>

        <h2 className="text-2xl xl:text-3xl font-bold font-[family-name:var(--font-playfair)] text-text-primary leading-tight">
          Transform Spaces with <br />
          <span className="text-gradient">AI-Powered Design</span>
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Upload a room photo, choose your style preferences, and let AI generate personalized interior design concepts.
        </p>
      </div>

      {/* Feature List */}
      <div className="relative z-10 space-y-4 my-6">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-bg-primary/40 border border-border-subtle hover:border-brand-primary/30 transition-all duration-300 group"
          >
            <div className="p-2 rounded-xl bg-bg-tertiary border border-border-subtle shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                {item.title}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
              </h4>
              <p className="text-[11px] text-text-tertiary mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom — Tagline & Real Trust Indicators */}
      <div className="relative z-10 space-y-4 pt-4 border-t border-border-subtle/70">
        <p className="text-sm italic text-text-secondary leading-relaxed font-[family-name:var(--font-playfair)]">
          Your space. Your style. Reimagined with AI.
        </p>

        <div className="flex items-center gap-4 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand-primary/70" />
            <span>Secure authentication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary/70" />
            <span>Private workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary/70" />
            <span>Personalized designs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
