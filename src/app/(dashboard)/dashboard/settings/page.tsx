"use client";

import { useState } from "react";
import { User, Mail, Shield, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

/**
 * Account Settings — Profile editing, password change, and account deletion.
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action is irreversible and all your designs will be permanently deleted."
    );
    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleConfirm !== "DELETE") return;

    // In production, this would call an API route that uses the service role key
    // to delete the user from Supabase Auth and cascade-delete all their data.
    alert("Account deletion requested. Please contact support@mansion-ai.com to complete this process.");
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          Account Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your profile and account preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
          <User className="w-5 h-5 text-brand-primary" />
          <h2 className="font-semibold">Profile Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary/50 border border-border-subtle">
              <Mail className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-secondary">{user?.email || "—"}</span>
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">
              Email cannot be changed for security reasons.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl gradient-cta text-bg-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold">Security</h2>
        </div>

        <div>
          <p className="text-sm text-text-secondary mb-3">
            Authentication is managed through Supabase. Use the link below to reset your password.
          </p>
          <button
            type="button"
            onClick={async () => {
              if (!user?.email) return;
              const supabase = createClient();
              await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/login`,
              });
              alert("Password reset email sent. Check your inbox.");
            }}
            className="px-5 py-2 rounded-xl bg-bg-tertiary border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-primary/30 transition-all"
          >
            Send Password Reset Email
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-error/5 border border-error/20 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-error/20">
          <Trash2 className="w-5 h-5 text-error" />
          <h2 className="font-semibold text-error">Danger Zone</h2>
        </div>

        <div>
          <p className="text-sm text-text-secondary mb-3">
            Once you delete your account, there is no going back. All designs, collections,
            and credits will be permanently removed.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-5 py-2 rounded-xl bg-error/10 border border-error/30 text-sm font-semibold text-error hover:bg-error/20 transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
