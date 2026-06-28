import {
  type ReactNode,
  type HTMLAttributes,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { cn } from '@/lib/cn';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayMs?: number;
}

/**
 * Lightweight tooltip component.
 * Positions itself automatically relative to the trigger element.
 * No external tooltip library needed — keeps bundle small.
 */
function Tooltip({
  content,
  children,
  side = 'top',
  delayMs = 400,
  className,
  ...props
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), delayMs);
  }, [delayMs]);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const sideStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap',
            'rounded-md px-2.5 py-1.5',
            'text-xs font-medium',
            'bg-[var(--gb-text-primary)] text-[var(--gb-text-inverse)]',
            'shadow-elevated',
            'animate-fade-in pointer-events-none',
            sideStyles[side],
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip, type TooltipProps };
