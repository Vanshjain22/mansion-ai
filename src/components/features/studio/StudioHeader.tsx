"use client";

import { cn } from "@/lib/utils/cn";
import {
  Upload,
  Scan,
  Sliders,
  Sparkles,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Coins,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/**
 * StudioHeader — World-Class Step progress indicator header.
 *
 * Features:
 * - Interactive step navigation for completed/accessible steps
 * - Active step pulsing gold halo
 * - Accessible WCAG keyboard targets & ARIA live tags
 * - Live Credit balance pill ("Pro • 20 Credits")
 * - Reset workflow button with tooltip
 */

interface StudioHeaderProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  onReset: () => void;
  showReset: boolean;
  userCredits?: number;
}

const STEPS = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "AI Vision Scan", icon: Scan },
  { id: 3, label: "Customize", icon: Sliders },
  { id: 4, label: "Generate", icon: Sparkles },
  { id: 5, label: "Processing", icon: Loader2 },
  { id: 6, label: "Results", icon: CheckCircle2 },
];

export function StudioHeader({
  currentStep,
  onStepClick,
  onReset,
  showReset,
  userCredits = 20,
}: StudioHeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/85 backdrop-blur-2xl transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => onStepClick?.(1)}>
              <div className="absolute -inset-1 rounded-xl bg-brand-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-9 h-9 rounded-xl gradient-cta flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-bg-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold font-[family-name:var(--font-playfair)] text-text-primary tracking-tight">
                  Design Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-mono font-bold text-brand-primary">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary font-medium">
                AI-Powered Interior Design
              </p>
            </div>
          </div>

          {/* Interactive Step Progress Timeline */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Design studio workflow steps"
          >
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              const isClickable = onStepClick && (isCompleted || isActive);

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Button */}
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick(step.id)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Step ${step.id}: ${step.label}`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                      "transition-all duration-300 outline-none focus-ring",
                      isActive && [
                        "bg-brand-primary/20 text-brand-primary",
                        "border border-brand-primary/40",
                        "shadow-[0_0_16px_hsl(42_78%_60%_/_0.2)]",
                      ],
                      isCompleted && [
                        "bg-brand-primary/10 text-brand-primary/90",
                        "hover:bg-brand-primary/20 hover:text-brand-primary cursor-pointer",
                      ],
                      !isActive && !isCompleted && [
                        "text-text-tertiary/70 cursor-not-allowed",
                      ]
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                        isActive && "bg-brand-primary text-bg-primary shadow-sm",
                        isCompleted && "bg-brand-primary/20 text-brand-primary",
                        !isActive && !isCompleted && "bg-bg-tertiary text-text-tertiary"
                      )}
                    >
                      {isCompleted ? (
                        "✓"
                      ) : (
                        <StepIcon
                          className={cn(
                            "w-3 h-3",
                            isActive && step.id === 5 && "animate-spin"
                          )}
                        />
                      )}
                    </div>
                    <span className="hidden lg:inline">{step.label}</span>
                  </button>

                  {/* Connector bar */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-5 lg:w-7 h-0.5 mx-1 rounded-full transition-all duration-500",
                        isCompleted ? "bg-brand-primary/50" : "bg-border-subtle"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Cluster: Credit Balance & Reset */}
          <div className="flex items-center gap-3">
            {/* Credit Balance Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-tertiary/70 border border-border-subtle text-xs font-medium text-text-secondary">
              <Coins className="w-3.5 h-3.5 text-brand-primary" />
              <span className="font-mono font-bold text-text-primary">{userCredits}</span>
              <span className="hidden sm:inline text-text-tertiary">Credits</span>
            </div>

            {/* Start Over Button */}
            {showReset && (
              <button
                type="button"
                onClick={onReset}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold",
                  "text-text-secondary hover:text-text-primary",
                  "bg-bg-tertiary/60 hover:bg-bg-elevated",
                  "border border-border-subtle hover:border-brand-primary/30",
                  "transition-all duration-200 focus-ring"
                )}
                aria-label="Reset design studio to step 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Start Over</span>
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-brand-primary" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-text-tertiary hover:text-error hover:bg-error/10 transition-all"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold gradient-cta text-bg-primary hover:opacity-90 transition-opacity"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
