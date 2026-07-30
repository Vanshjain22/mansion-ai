"use client";

/**
 * AuroraBackground — Animated multi-orb gradient mesh background.
 *
 * Three gradient orbs (gold, violet, cyan) floating on independent paths.
 * Fixed behind all content, respects prefers-reduced-motion.
 */

export function AuroraBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Gold orb — top center */}
      <div
        className="absolute top-[-10%] left-[40%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px] animate-aurora-1 motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(circle, hsl(42 78% 60%) 0%, transparent 70%)",
        }}
      />

      {/* Violet orb — bottom left */}
      <div
        className="absolute top-[50%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px] animate-aurora-2 motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(circle, hsl(280 60% 55%) 0%, transparent 70%)",
        }}
      />

      {/* Cyan orb — bottom right */}
      <div
        className="absolute top-[60%] right-[-5%] w-[450px] h-[450px] rounded-full opacity-[0.04] blur-[110px] animate-aurora-3 motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(circle, hsl(190 80% 50%) 0%, transparent 70%)",
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
