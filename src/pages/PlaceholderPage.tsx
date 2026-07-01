import { Card } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
  description: string;
  milestone: string;
}

/**
 * Placeholder page for features coming in future milestones.
 * Shows a clean "coming soon" state instead of empty content.
 */
function PlaceholderPage({ title, description, milestone }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <Card variant="bordered" padding="lg" className="max-w-md text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-brand-500/10 flex items-center justify-center">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          {description}
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-tertiary text-text-tertiary border border-border-default">
          Coming in {milestone}
        </span>
      </Card>
    </div>
  );
}

export { PlaceholderPage };
