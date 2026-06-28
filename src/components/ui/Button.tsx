import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-500 text-white',
    'hover:bg-brand-600 active:bg-brand-700',
    'shadow-soft hover:shadow-card',
  ].join(' '),
  secondary: [
    'bg-[var(--gb-bg-tertiary)] text-[var(--gb-text-primary)]',
    'border border-[var(--gb-border)]',
    'hover:bg-[var(--gb-hover-bg)] hover:border-[var(--gb-border-hover)]',
    'active:bg-[var(--gb-active-bg)]',
  ].join(' '),
  ghost: [
    'text-[var(--gb-text-secondary)]',
    'hover:bg-[var(--gb-hover-bg)] hover:text-[var(--gb-text-primary)]',
    'active:bg-[var(--gb-active-bg)]',
  ].join(' '),
  danger: [
    'bg-error-500 text-white',
    'hover:bg-error-500/90 active:bg-error-500/80',
    'shadow-soft',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-base gap-2.5 rounded-lg',
  icon: 'h-9 w-9 rounded-lg justify-center',
};

/**
 * Primary button component with variants, sizes, and loading state.
 * Follows the design language of Linear/Vercel.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium',
          'transition-all duration-150 ease-out',
          'focus-ring cursor-pointer',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variant & size
          variantStyles[variant],
          sizeStyles[size],
          // Loading state
          loading && 'pointer-events-none',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
