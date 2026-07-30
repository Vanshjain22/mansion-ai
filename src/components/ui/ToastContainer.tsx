"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore, type ToastVariant } from "@/stores/toast-store";
import { cn } from "@/lib/utils/cn";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  X,
} from "lucide-react";

/**
 * ToastContainer — Fixed overlay rendering toast notification stack.
 * Portal-positioned at bottom-right with slide-in animation.
 */

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ElementType; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
  },
  error: {
    icon: XCircle,
    bg: "bg-error/10",
    border: "border-error/30",
    text: "text-error",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
  },
  info: {
    icon: Info,
    bg: "bg-info/10",
    border: "border-info/30",
    text: "text-info",
  },
  default: {
    icon: Sparkles,
    bg: "bg-brand-primary/10",
    border: "border-brand-primary/30",
    text: "text-brand-primary",
  },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-3rem)] pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const config = VARIANT_CONFIG[t.variant];
          const Icon = config.icon;

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 0.68, 0, 1.1],
              }}
              className={cn(
                "pointer-events-auto relative p-4 rounded-2xl backdrop-blur-xl",
                "border shadow-lg",
                config.bg,
                config.border
              )}
              role="alert"
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.text)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-lg hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-colors shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-dismiss progress bar */}
              {t.duration > 0 && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: t.duration / 1000, ease: "linear" }}
                  className={cn(
                    "absolute bottom-0 left-4 right-4 h-0.5 rounded-full origin-left",
                    config.text.replace("text-", "bg-"),
                    "opacity-30"
                  )}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
