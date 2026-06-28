import { WebcamPreview } from '@/features/hand-tracking';
import { Card } from '@/components/ui';

export function GesturesPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[var(--gb-text-primary)] tracking-tight">
          Gesture Recognition
        </h1>
        <p className="text-[var(--gb-text-secondary)]">
          Test and calibrate hand tracking. Enable your camera to see real-time skeleton overlay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md" variant="glass">
            <WebcamPreview />
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card title="Tracking Status" padding="md">
            <div className="space-y-4">
              <p className="text-sm text-[var(--gb-text-secondary)]">
                Status indicator and live metrics will appear here.
              </p>
              {/* Future: Add live data bindings here */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
