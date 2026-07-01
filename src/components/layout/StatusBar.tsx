import { Badge } from '@/components/ui';

import { useGestureStore } from '@/stores/useGestureStore';

/**
 * Status bar at the bottom of the app.
 * Shows FPS, gesture status, and connection info.
 * Updated by Zustand stores — no prop drilling.
 */
function StatusBar() {
  const { isTracking, fps, latency, currentGesture } = useGestureStore();

  return (
    <div className="flex items-center justify-between px-4 h-8 bg-surface-secondary border-t border-border-default text-[11px] text-text-tertiary">
      <div className="flex items-center gap-3">
        <Badge variant={isTracking ? 'success' : 'default'}>
          {isTracking && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
          {isTracking ? 'Camera Active' : 'Camera Off'}
        </Badge>
        <span className="text-text-tertiary">
          Gestures:{' '}
          <span className="text-text-secondary capitalize">
            {currentGesture?.type || 'Idle'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span>
          FPS:{' '}
          <span className="font-mono text-text-secondary">
            {isTracking ? Math.round(fps) : '--'}
          </span>
        </span>
        <span>
          Latency:{' '}
          <span className="font-mono text-text-secondary">
            {isTracking ? Math.round(latency) : '--'}ms
          </span>
        </span>
        <span className="text-text-tertiary">v0.1.0</span>
      </div>
    </div>
  );
}

export { StatusBar };
