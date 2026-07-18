"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "MansionAI completely changed the way I design interiors for my clients. It's fast, accurate, and the results are stunning!",
    name: "Sarah Johnson",
    role: "Interior Designer",
    initials: "SJ",
    color: "bg-amber-600",
    rating: 5,
  },
  {
    quote:
      "I redesigned my living room in minutes! The AI suggestions were spot on and saved me so much time and money.",
    name: "Michael Chen",
    role: "Homeowner",
    initials: "MC",
    color: "bg-emerald-600",
    rating: 5,
  },
  {
    quote:
      "As an architect, I use MansionAI for concept ideas and presentations. Absolutely game-changing tool!",
    name: "Priya Sharma",
    role: "Architect",
    initials: "PS",
    color: "bg-sky-600",
    rating: 5,
  },
  {
    quote:
      "The quality of AI-generated designs rivals professional staging photos. Our listings sell 40% faster now.",
    name: "David Park",
    role: "Real Estate Agent",
    initials: "DP",
    color: "bg-rose-600",
    rating: 5,
  },
  {
    quote:
      "We've integrated MansionAI into our workflow and it's saved our team hundreds of hours on initial concepts.",
    name: "Elena Rossi",
    role: "Design Studio Lead",
    initials: "ER",
    color: "bg-violet-600",
    rating: 5,
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  // How many cards are visible depends on viewport (we show 3 at most via CSS)
  const maxVisible = 3;
  const maxIndex = Math.max(0, TESTIMONIALS.length - maxVisible);

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)]">
            Loved by{" "}
            <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto text-sm">
            See what professionals and homeowners are saying about MansionAI
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-border-default bg-bg-secondary flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            disabled={activeIndex >= maxIndex}
            className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-border-default bg-bg-secondary flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards Track */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * (100 / maxVisible)}%)`,
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <div className="glass-luxury rounded-2xl p-6 h-full flex flex-col">
                    {/* Quote Icon */}
                    <div className="text-brand-primary/30 mb-4">
                      <Quote className="w-8 h-8" />
                    </div>

                    {/* Quote Text */}
                    <p className="text-text-secondary text-sm leading-relaxed flex-1 mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                      <div
                        className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white`}
                      >
                        {t.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text-primary">
                          {t.name}
                        </div>
                        <div className="text-xs text-text-tertiary">{t.role}</div>
                      </div>
                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star
                            key={j}
                            className="w-3 h-3 text-brand-primary fill-brand-primary"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
