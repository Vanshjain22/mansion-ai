import type { Metadata } from "next";
import { AuthCard } from "@/components/features/auth/auth-card";
import { AuthShowcase } from "@/components/features/auth/auth-showcase";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your MansionAI account to access your interior design studio.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <AuthCard initialMode="login" />
      <AuthShowcase />
    </div>
  );
}
