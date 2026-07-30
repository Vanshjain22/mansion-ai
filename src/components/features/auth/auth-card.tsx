"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface AuthCardProps {
  initialMode?: "login" | "register";
}

export function AuthCard({ initialMode = "login" }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Touched states for validation UX
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // ── Validation helpers ──

  const passwordErrors = useCallback(
    (pass: string): string[] => {
      if (mode === "login") return [];
      const errors: string[] = [];
      if (pass.length > 0 && pass.length < 8)
        errors.push("At least 8 characters");
      return errors;
    },
    [mode]
  );

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passStrength = getPasswordStrength(password);
  const currentPasswordErrors = passwordErrors(password);
  const confirmPasswordError =
    confirmPasswordTouched &&
    confirmPassword.length > 0 &&
    confirmPassword !== password
      ? "Passwords do not match"
      : null;

  const isRegisterFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    confirmPassword === password &&
    agreeTerms;

  const isLoginFormValid =
    email.trim().length > 0 && password.length > 0;

  // ── Clear state on mode switch ──
  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setAuthError(null);
    setSuccessMsg(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setForgotPasswordMode(false);
    router.replace(newMode === "login" ? "/login" : "/register");
  };

  // ── Forgot Password ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsLoading(true);
    setAuthError(null);
    setSuccessMsg(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail,
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );
      if (error) throw error;

      setSuccessMsg(
        "Password reset email sent. Check your inbox and follow the link to reset your password."
      );
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Main Auth Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // prevent double-submit

    // Client-side validation guard for register
    if (mode === "register") {
      if (password.length < 8) {
        setAuthError("Password must be at least 8 characters.");
        return;
      }
      if (confirmPassword !== password) {
        setAuthError("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);
    setAuthError(null);
    setSuccessMsg(null);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setSuccessMsg("Welcome back! Redirecting to Studio...");
        setTimeout(() => router.push("/generation-demo"), 800);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) throw error;

        setSuccessMsg(
          "Account created! Check your email to verify your account, then sign in."
        );
      }
    } catch (err: any) {
      // Map common Supabase error messages to user-friendly text
      const msg = err.message || "Authentication failed. Please try again.";
      if (msg.includes("Invalid login credentials")) {
        setAuthError("Invalid email or password. Please try again.");
      } else if (msg.includes("User already registered")) {
        setAuthError("This email is already registered. Try signing in instead.");
      } else if (msg.includes("Email not confirmed")) {
        setAuthError("Please check your email and confirm your account first.");
      } else {
        setAuthError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google OAuth ──
  const handleGoogleAuth = async () => {
    setSocialLoading("Google");
    setAuthError(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;
      // If we get here without error, the browser will be redirected to Google.
      // No need to clear socialLoading — page will navigate away.
    } catch (err: any) {
      const msg = err.message || "Google sign-in failed.";
      if (msg.includes("Provider not enabled") || msg.includes("provider is not enabled")) {
        setAuthError(
          "Google sign-in is not yet configured. Please use email and password."
        );
      } else {
        setAuthError(msg);
      }
      setSocialLoading(null);
    }
  };

  // ── Forgot Password UI ──
  if (forgotPasswordMode) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-bg-secondary/90 border border-glass-border shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        {/* Top Gold Shimmer Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-amber-300 to-brand-primary" />

        {/* Success/Error Banners */}
        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}
        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
            Reset your password
          </h1>
          <p className="text-xs text-text-tertiary mt-1">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-tertiary/50 border border-border-default text-xs text-text-primary placeholder:text-text-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !forgotEmail.trim()}
            className={cn(
              "w-full py-3 px-6 rounded-xl mt-2",
              "text-sm font-semibold text-text-inverse",
              "bg-brand-primary hover:bg-brand-primary-hover transition-all duration-300",
              "gold-glow flex items-center justify-center gap-2",
              "focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-text-inverse" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setForgotPasswordMode(false);
            setAuthError(null);
            setSuccessMsg(null);
          }}
          className="w-full mt-4 text-xs text-text-tertiary hover:text-brand-primary text-center transition-colors"
        >
          ← Back to Sign In
        </button>
      </div>
    );
  }

  // ── Main Auth Card ──
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-bg-secondary/90 border border-glass-border shadow-2xl backdrop-blur-2xl relative overflow-hidden">
      {/* Top Gold Shimmer Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-amber-300 to-brand-primary" />

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {authError && (
        <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-bg-tertiary border border-border-subtle mb-6">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
            mode === "login"
              ? "bg-brand-primary text-text-inverse shadow-md gold-glow"
              : "text-text-tertiary hover:text-text-secondary"
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
            mode === "register"
              ? "bg-brand-primary text-text-inverse shadow-md gold-glow"
              : "text-text-tertiary hover:text-text-secondary"
          )}
        >
          Create Account
        </button>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-xs text-text-tertiary mt-1">
          {mode === "login"
            ? "Enter your credentials to access your design studio"
            : "Get started with AI-powered interior design"}
        </p>
      </div>

      {/* Google OAuth */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading || !!socialLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-bg-tertiary/70 hover:bg-bg-elevated border border-border-subtle hover:border-brand-primary/40 text-text-secondary hover:text-text-primary text-xs font-medium transition-all focus-ring disabled:opacity-50"
        >
          {socialLoading === "Google" ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9c-.6-1.7-1-3.6-1-5.6z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <span className="relative z-10 px-3 bg-bg-secondary text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          or continue with email
        </span>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name (Register Mode Only) */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary block">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-tertiary/50 border border-border-default text-xs text-text-primary placeholder:text-text-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-tertiary/50 border border-border-default text-xs text-text-primary placeholder:text-text-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-secondary block">
              Password
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(true);
                  setForgotEmail(email);
                  setAuthError(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-brand-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="••••••••••••"
              className={cn(
                "w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-tertiary/50 border text-xs text-text-primary placeholder:text-text-tertiary focus:ring-1 transition-all outline-none",
                passwordTouched && currentPasswordErrors.length > 0
                  ? "border-error/60 focus:border-error focus:ring-error/30"
                  : "border-border-default focus:border-brand-primary focus:ring-brand-primary"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password validation hint (Register only) */}
          {mode === "register" && passwordTouched && currentPasswordErrors.length > 0 && (
            <p className="text-[11px] text-error/80 flex items-center gap-1 pt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {currentPasswordErrors[0]}
            </p>
          )}

          {/* Password Strength Indicator (Register Mode Only) */}
          {mode === "register" && password.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5 h-1.5 w-full">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "flex-1 h-full rounded-full transition-all duration-300",
                      step <= passStrength
                        ? passStrength <= 2
                          ? "bg-amber-400"
                          : passStrength === 3
                            ? "bg-cyan-400"
                            : "bg-emerald-400"
                        : "bg-bg-tertiary"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-text-tertiary font-mono block">
                {passStrength <= 1
                  ? "Weak password"
                  : passStrength === 2 || passStrength === 3
                    ? "Medium strength"
                    : "Strong password"}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password (Register Only) */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                placeholder="••••••••••••"
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-tertiary/50 border text-xs text-text-primary placeholder:text-text-tertiary focus:ring-1 transition-all outline-none",
                  confirmPasswordError
                    ? "border-error/60 focus:border-error focus:ring-error/30"
                    : "border-border-default focus:border-brand-primary focus:ring-brand-primary"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-[11px] text-error/80 flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {confirmPasswordError}
              </p>
            )}
          </div>
        )}

        {/* Checkbox Options */}
        {mode === "login" ? (
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border-default bg-bg-tertiary text-brand-primary focus:ring-brand-primary accent-brand-primary"
            />
            <span className="text-xs text-text-secondary select-none">
              Keep me signed in on this device
            </span>
          </label>
        ) : (
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-border-default bg-bg-tertiary text-brand-primary focus:ring-brand-primary accent-brand-primary mt-0.5"
            />
            <span className="text-[11px] text-text-secondary select-none leading-relaxed">
              I agree to MansionAI&apos;s{" "}
              <a href="#" className="text-brand-primary underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-brand-primary underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isLoading ||
            (mode === "register" && !isRegisterFormValid) ||
            (mode === "login" && !isLoginFormValid)
          }
          className={cn(
            "w-full py-3 px-6 rounded-xl mt-2",
            "text-sm font-semibold text-text-inverse",
            "bg-brand-primary hover:bg-brand-primary-hover transition-all duration-300",
            "gold-glow flex items-center justify-center gap-2",
            "focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-text-inverse" />
              <span>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            </>
          ) : (
            <>
              <span>
                {mode === "login" ? "Sign In to Studio" : "Create Account"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
