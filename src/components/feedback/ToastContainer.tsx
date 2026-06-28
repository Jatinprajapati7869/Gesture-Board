import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToastStore } from '@/stores/useToastStore';
import type { ToastType } from '@/types';

const iconMap: Record<ToastType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap: Record<ToastType, string> = {
  info: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  success: 'text-success-500 bg-success-500/10 border-success-500/20',
  warning: 'text-warning-500 bg-warning-500/10 border-warning-500/20',
  error: 'text-error-500 bg-error-500/10 border-error-500/20',
};

/**
 * Toast container — renders all active toasts in the bottom-right corner.
 * Mount once in AppProviders.
 */
function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = iconMap[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border',
              'shadow-elevated backdrop-blur-md',
              'animate-slide-up',
              colorMap[t.type],
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium text-[var(--gb-text-primary)] flex-1">
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-[var(--gb-text-tertiary)] hover:text-[var(--gb-text-secondary)] transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export { ToastContainer };
