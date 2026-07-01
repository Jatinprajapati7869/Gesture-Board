import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
}

/**
 * Toggle switch component with accessible label support.
 * Uses CSS transitions for smooth animation.
 */
function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  id,
}: ToggleProps) {
  const toggleId = id ?? `toggle-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  const trackSize = size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-[22px]';
  const thumbSize =
    size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]';
  const thumbTranslate = size === 'sm' ? 'translate-x-3.5' : 'translate-x-[18px]';

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        'inline-flex items-center gap-3 select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <button
        id={toggleId}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full',
          'transition-colors duration-200 ease-out',
          'focus-ring',
          trackSize,
          checked
            ? 'bg-brand-500'
            : 'bg-surface-tertiary border border-border-default',
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-out',
            'translate-x-0.5',
            thumbSize,
            checked && thumbTranslate,
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-tertiary">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

export { Toggle, type ToggleProps };
