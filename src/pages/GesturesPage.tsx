import { WebcamPreview } from '@/features/hand-tracking';
import { Card, Badge } from '@/components/ui';
import { useGestureStore } from '@/stores/useGestureStore';

export function GesturesPage() {
  const { currentGesture, fps, latency, isTracking } = useGestureStore();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Gesture Recognition
        </h1>
        <p className="text-text-secondary">
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
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Current Gesture</p>
                <div className="flex items-center gap-3">
                  <Badge variant={currentGesture.type !== 'none' ? 'brand' : 'default'} className="capitalize text-base px-4 py-1">
                    {currentGesture.type.replace('_', ' ')}
                  </Badge>
                  {currentGesture.type !== 'none' && (
                    <span className="text-sm text-text-secondary">
                      {(currentGesture.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-default">
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">FPS</p>
                  <p className="font-mono text-xl text-text-primary">
                    {isTracking ? Math.round(fps) : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">Latency</p>
                  <p className="font-mono text-xl text-text-primary">
                    {isTracking ? Math.round(latency) : '--'} <span className="text-sm text-text-tertiary">ms</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
