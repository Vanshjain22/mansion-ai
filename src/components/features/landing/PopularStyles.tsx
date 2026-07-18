"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STYLES = [
  {
    name: "Modern",
    subtitle: "Clean & Elegant",
    image: "/images/landing/style-modern.png",
  },
  {
    name: "Minimalist",
    subtitle: "Simple & Functional",
    image: "/images/landing/style-minimalist.png",
  },
  {
    name: "Scandinavian",
    subtitle: "Light & Airy",
    image: "/images/landing/style-scandinavian.png",
  },
  {
    name: "Industrial",
    subtitle: "Raw & Stylish",
    image: "/images/landing/style-industrial.png",
  },
  {
    name: "Japandi",
    subtitle: "Calm & Harmonious",
    image: "/images/landing/style-japandi.png",
  },
  {
    name: "Luxury",
    subtitle: "Premium & Opulent",
    image: "/images/landing/style-luxury.png",
  },
];

export function PopularStyles() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="features" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)]">
              Explore <span className="text-gradient">Popular Styles</span>
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              Choose from our curated collection of premium interior design styles
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center hover:bg-brand-primary-hover transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {STYLES.map((style, i) => (
            <div
              key={style.name}
              className={`relative shrink-0 w-[200px] sm:w-[220px] group cursor-pointer ${
                i === 0 ? "ring-2 ring-brand-primary rounded-2xl" : ""
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border-default group-hover:border-brand-primary/40 transition-all duration-500">
                <Image
                  src={style.image}
                  alt={`${style.name} interior design style`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="220px"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-base font-bold font-[family-name:var(--font-playfair)] text-white">
                    {style.name}
                  </h3>
                  <p className="text-xs text-white/60">{style.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
