import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: string;
}

/**
 * Keyboard shortcut indicator.
 * Renders like ⌘K or Ctrl+K in a styled key cap.
 */
function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[20px] h-5 px-1.5',
        'rounded border',
        'bg-[var(--gb-bg-secondary)] border-[var(--gb-border)]',
        'text-[10px] font-mono font-medium text-[var(--gb-text-tertiary)]',
        'shadow-[0_1px_0_1px_var(--gb-border)]',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd, type KbdProps };
