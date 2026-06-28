import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--gb-bg-tertiary)] text-[var(--gb-text-secondary)] border border-[var(--gb-border)]',
  brand: 'bg-brand-500/10 text-brand-500 border border-brand-500/20',
  success: 'bg-success-500/10 text-success-500 border border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-500 border border-warning-500/20',
  error: 'bg-error-500/10 text-error-500 border border-error-500/20',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--gb-text-tertiary)]',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

/**
 * Status badge component with optional pulsing dot indicator.
 * Perfect for showing gesture confidence levels and connection status.
 */
function Badge({
  children,
  variant = 'default',
  dot = false,
  size = 'sm',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantStyles[variant],
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full animate-pulse-soft',
            dotColors[variant],
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
