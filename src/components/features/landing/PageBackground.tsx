"use client";

import { useEffect, useRef } from "react";

/**
 * PageBackground — Cinematic depth layer
 *
 * Renders behind all page content as a fixed/absolute layer.
 * Composed of multiple stacked effects:
 *
 *  1. Dark gradient base (warm-tinted, not flat black)
 *  2. Radial spotlight (hero area focus)
 *  3. Golden mesh dots (very subtle, architectural)
 *  4. Noise texture (film grain feel)
 *  5. Architectural grid lines
 *  6. Floating particles (canvas-based, performant)
 */
export function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Floating particles on a canvas — GPU-friendly, no DOM thrash
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      opacity: number;
      gold: boolean;
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 40;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = document.documentElement.scrollHeight;
    };

    const init = () => {
      resize();
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -Math.random() * 0.25 - 0.05,
          r: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.05,
          gold: Math.random() > 0.6,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `hsla(42, 78%, 60%, ${p.opacity})`
          : `hsla(0, 0%, 100%, ${p.opacity * 0.5})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();

    // Resize canvas when page height or window changes
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* 1. Base gradient — warm dark, not flat black */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              hsl(30 8% 3%) 0%,
              hsl(240 10% 2%) 30%,
              hsl(0 0% 2%) 60%,
              hsl(30 6% 3%) 100%
            )
          `,
        }}
      />

      {/* 2. Radial spotlight — warm gold focus on hero area */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 50% at 70% 15%,
              hsl(42 78% 60% / 0.04) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 60% 40% at 20% 80%,
              hsl(0 72% 50% / 0.02) 0%,
              transparent 60%
            ),
            radial-gradient(
              ellipse 100% 60% at 50% 50%,
              hsl(42 78% 60% / 0.015) 0%,
              transparent 50%
            )
          `,
        }}
      />

      {/* 3. Golden mesh dots — architectural dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(
              circle 1px at center,
              hsl(42 78% 60%) 0%,
              transparent 100%
            )
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 4. Noise texture — film grain via SVG filter */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]">
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#noise-filter)"
        />
      </svg>

      {/* 5. Architectural grid lines — faint structural lines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              hsl(42 78% 60% / 0.5) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              hsl(42 78% 60% / 0.3) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Finer inner grid */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              hsl(0 0% 100% / 0.4) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              hsl(0 0% 100% / 0.4) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* 6. Floating particles — canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Top vignette fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              transparent 0%,
              transparent 85%,
              hsl(0 0% 2%) 100%
            )
          `,
        }}
      />
    </div>
  );
}
