import { create } from "zustand";

/**
 * TOAST NOTIFICATION STORE
 *
 * Manages a stack of toast notifications with auto-dismiss.
 * Max 5 toasts visible at once; oldest removed on overflow.
 */

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
}

interface ToastStoreState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "createdAt">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const MAX_TOASTS = 5;

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: Date.now(),
    };

    set((state) => {
      const updated = [...state.toasts, newToast];
      // Keep only the latest MAX_TOASTS
      return { toasts: updated.slice(-MAX_TOASTS) };
    });

    // Auto-dismiss after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}));

/**
 * Convenience function to fire a toast from anywhere.
 * Usage: toast({ title: "Saved!", variant: "success" });
 */
export function toast(
  opts: Partial<Omit<Toast, "id" | "createdAt">> & { title: string }
) {
  return useToastStore.getState().addToast({
    variant: opts.variant ?? "default",
    duration: opts.duration ?? 4000,
    ...opts,
  });
}
