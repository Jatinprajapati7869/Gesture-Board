import { Card, Button } from '@/components/ui';
import { useSettingsStore, type GestureSensitivity } from '@/stores/useSettingsStore';
import { Settings, RefreshCw } from 'lucide-react';

export function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gb-text-primary)] tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand-500" />
            Settings
          </h1>
          <p className="text-[var(--gb-text-secondary)] mt-2">
            Customize your presentation and gesture tracking experience.
          </p>
        </div>
        <Button variant="secondary" onClick={settings.resetToDefaults}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tracking Settings */}
        <Card title="Tracking & Camera" padding="md">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--gb-text-primary)]">
                Camera Mirroring
              </label>
              <p className="text-xs text-[var(--gb-text-tertiary)] mb-2">
                Flips the camera feed horizontally. Recommended so movements feel like looking in a mirror.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant={settings.mirrorCamera ? 'primary' : 'secondary'} 
                  onClick={() => settings.setMirrorCamera(true)}
                  className="flex-1"
                >
                  Mirrored
                </Button>
                <Button 
                  variant={!settings.mirrorCamera ? 'primary' : 'secondary'} 
                  onClick={() => settings.setMirrorCamera(false)}
                  className="flex-1"
                >
                  Unmirrored
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--gb-border)]">
              <label className="text-sm font-medium text-[var(--gb-text-primary)]">
                Gesture Sensitivity
              </label>
              <p className="text-xs text-[var(--gb-text-tertiary)] mb-2">
                Higher sensitivity makes gestures easier to trigger but might cause false positives.
              </p>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as GestureSensitivity[]).map(level => (
                  <Button 
                    key={level}
                    variant={settings.gestureSensitivity === level ? 'primary' : 'secondary'} 
                    onClick={() => settings.setGestureSensitivity(level)}
                    className="flex-1 capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-[var(--gb-border)]">
              <label className="text-sm font-medium text-[var(--gb-text-primary)] flex items-center justify-between">
                <span>Show Confidence Metrics</span>
                <input 
                  type="checkbox" 
                  checked={settings.showConfidence}
                  onChange={(e) => settings.setShowConfidence(e.target.checked)}
                  className="rounded border-[var(--gb-border)] bg-[var(--gb-bg-tertiary)] text-brand-500 focus:ring-brand-500"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Presentation Settings */}
        <Card title="Presentation Controls" padding="md">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--gb-text-primary)]">
                Slide Transition Cooldown (ms)
              </label>
              <p className="text-xs text-[var(--gb-text-tertiary)] mb-2">
                The minimum time required between slide transitions to prevent rapid skipping.
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="500" 
                  max="3000" 
                  step="100"
                  value={settings.presentationCooldownMs}
                  onChange={(e) => settings.setPresentationCooldownMs(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono text-sm w-12 text-right text-[var(--gb-text-secondary)]">
                  {settings.presentationCooldownMs}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
