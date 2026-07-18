import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";

export function CTABanner() {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background with gold gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-bg-tertiary to-brand-accent/5" />
          <div className="absolute inset-[1px] rounded-3xl bg-bg-secondary" />

          {/* Glow Effects */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-brand-primary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-brand-accent/5 rounded-full blur-[80px]" />

          {/* Content */}
          <div className="relative px-8 py-14 sm:px-12 sm:py-18 lg:px-20 lg:py-20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left */}
              <div className="text-center lg:text-left max-w-lg">
                <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/15 border border-brand-primary/25 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-xs font-medium font-[family-name:var(--font-manrope)] text-text-tertiary tracking-widest uppercase">
                    {APP_NAME}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] mb-4 leading-tight">
                  Ready to{" "}
                  <span className="text-gradient">Transform</span>{" "}
                  Your Space?
                </h2>

                <p className="text-text-secondary text-sm lg:text-base">
                  Join thousands of homeowners and designers creating
                  beautiful spaces with the power of AI.
                </p>
              </div>

              {/* Right — CTA */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/generation-demo"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-text-inverse font-bold font-[family-name:var(--font-manrope)] text-base rounded-xl hover:bg-brand-primary-hover transition-all duration-300 gold-glow animate-pulse-glow"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-xs text-text-tertiary">
                  No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
