import type { Metadata } from "next";
import { AuthCard } from "@/components/features/auth/auth-card";
import { AuthShowcase } from "@/components/features/auth/auth-showcase";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a MansionAI account and get 10 free AI interior design credits.",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <AuthCard initialMode="register" />
      <AuthShowcase />
    </div>
  );
}
