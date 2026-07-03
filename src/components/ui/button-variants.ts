import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-interactive-primary text-text-inverse hover:bg-interactive-primary-hover',
        secondary: 'bg-interactive-secondary text-text-primary hover:bg-interactive-secondary-hover',
        destructive: 'bg-feedback-error text-text-inverse hover:bg-feedback-error/90',
        ghost: 'hover:bg-interactive-secondary text-text-primary',
        link: 'text-text-brand underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
