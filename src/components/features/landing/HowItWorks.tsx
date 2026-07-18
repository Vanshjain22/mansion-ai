"use client";

import { Upload, Palette, Cpu, Download, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: Upload,
    title: "Upload Room",
    description:
      "Upload a clear photo of your room and we'll handle the rest.",
  },
  {
    number: 2,
    icon: Palette,
    title: "Choose Style",
    description:
      "Pick your favorite style and customize your preferences.",
  },
  {
    number: 3,
    icon: Cpu,
    title: "AI Generate",
    description:
      "Our AI transforms your room in under 30 seconds.",
  },
  {
    number: 4,
    icon: Download,
    title: "Download",
    description:
      "Download your high-quality design and make it yours.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-primary/3 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] mb-4">
            How <span className="text-gradient">MansionAI</span> Works
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Transform any room in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center group">
              {/* Connector Arrow (desktop only) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute top-10 -right-3 z-10 text-border-strong">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}

              {/* Step Number Circle */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-bg-tertiary border border-border-default flex items-center justify-center group-hover:border-brand-primary/40 group-hover:bg-brand-primary/5 transition-all duration-500">
                  <step.icon className="w-8 h-8 text-brand-primary" />
                </div>
                {/* Number badge */}
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center text-xs font-bold font-[family-name:var(--font-manrope)]">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-base font-bold font-[family-name:var(--font-playfair)] text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary max-w-[200px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
