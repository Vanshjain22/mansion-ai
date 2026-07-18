"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * React Error Boundary Class Component.
 *
 * WHY A CLASS COMPONENT?
 *
 * React still does not support functional components for Error Boundaries.
 * The lifecycle methods `componentDidCatch` and `getDerivedStateFromError`
 * are strictly limited to Class Components.
 *
 * DESIGN:
 * - Renders a sleek, dark-themed alert box.
 * - Displays a refresh button to recover state without doing a full reload.
 */

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ERROR BOUNDARY] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={cn(
            "p-6 rounded-2xl bg-bg-secondary border border-error/20 flex flex-col items-center text-center space-y-4 max-w-md mx-auto my-8 animate-fade-in-up",
            this.props.className
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="w-12 h-12 rounded-xl bg-error/15 flex items-center justify-center text-error">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-[family-name:var(--font-playfair)] text-text-primary">
              Something went wrong
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              An error occurred rendering this component. You can try refreshing it below.
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-elevated hover:text-text-primary text-text-secondary text-xs transition-colors border border-border-subtle focus-ring"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try reload</span>
          </button>

          {process.env.NODE_ENV !== "production" && this.state.error && (
            <pre className="w-full mt-4 p-3 rounded bg-bg-primary text-left text-[10px] text-error font-mono overflow-auto max-h-40 border border-border-subtle leading-tight">
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
