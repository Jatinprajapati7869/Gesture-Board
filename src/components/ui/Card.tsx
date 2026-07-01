import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brand' | 'glass' | 'bordered';
  title?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, padding, variant, title, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('rounded-xl border border-border-default bg-surface-elevated text-text-primary shadow-card', className, padding === 'none' ? 'p-0' : padding === 'md' ? 'p-6' : padding === 'lg' ? 'p-8' : padding === 'sm' ? 'p-4' : '')}
      {...props}
    >
      {title && (
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          <h3 className="font-semibold leading-none tracking-tight text-lg">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight text-lg', className)}
      {...props}
    />
  );
});
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  );
});
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
});
CardFooter.displayName = 'CardFooter';
