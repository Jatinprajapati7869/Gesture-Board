import { create } from 'zustand';
import type { Toast, ToastType } from '@/types';

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

/**
 * Toast notification store.
 * Auto-dismisses after a configurable duration.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (type, message, duration = 3000) => {
    const id = `toast-${++toastCounter}`;
    const toast: Toast = { id, type, message, duration };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

/** Convenience function for triggering toasts from anywhere */
export const toast = {
  info: (message: string) => useToastStore.getState().addToast('info', message),
  success: (message: string) =>
    useToastStore.getState().addToast('success', message),
  warning: (message: string) =>
    useToastStore.getState().addToast('warning', message),
  error: (message: string) =>
    useToastStore.getState().addToast('error', message),
};
