"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * ErrorBoundary — Catches render errors and shows a user-friendly fallback
 * instead of the raw React error screen.
 */

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2 font-[family-name:var(--font-playfair)]">
            {this.props.fallbackTitle || "Something went wrong"}
          </h2>
          <p className="text-sm text-text-secondary max-w-md mb-6">
            An unexpected error occurred. Please try refreshing or click the
            button below to retry.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-text-inverse font-semibold text-sm hover:bg-brand-primary-hover transition-all focus-ring"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-6 max-w-lg text-left">
              <summary className="text-xs text-text-tertiary cursor-pointer hover:text-text-secondary">
                Technical Details
              </summary>
              <pre className="mt-2 p-4 rounded-xl bg-bg-tertiary text-xs text-error font-mono overflow-auto max-h-48 border border-border-subtle">
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
