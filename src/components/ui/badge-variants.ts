import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-ring',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-interactive-primary text-text-inverse hover:bg-interactive-primary-hover',
        brand:
          'border-transparent bg-interactive-primary text-text-inverse hover:bg-interactive-primary-hover',
        secondary:
          'border-transparent bg-interactive-secondary text-text-primary hover:bg-interactive-secondary-hover',
        destructive:
          'border-transparent bg-feedback-error text-text-inverse hover:bg-feedback-error/90',
        outline: 'text-text-primary border-border-default',
        success: 'border-transparent bg-feedback-success/20 text-feedback-success hover:bg-feedback-success/30',
        warning: 'border-transparent bg-feedback-warning/20 text-feedback-warning hover:bg-feedback-warning/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
