import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const variantStyles = {
  default: 'bg-[var(--gb-bg-elevated)] border border-[var(--gb-border)]',
  elevated: 'bg-[var(--gb-bg-elevated)] shadow-card',
  bordered: 'bg-transparent border border-[var(--gb-border)]',
  glass: 'glass border border-[var(--gb-border)]/50',
} as const;

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
} as const;

/**
 * Flexible card component for content containers.
 * Supports glassmorphism variant for layered UI effects.
 */
function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        hover && [
          'cursor-pointer',
          'hover:border-[var(--gb-border-hover)]',
          'hover:shadow-elevated',
          'hover:-translate-y-0.5',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
