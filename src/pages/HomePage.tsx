import { ArrowRight, Code2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface HomePageProps {
  onNavigate: (page: 'onboarding') => void;
}

const GESTURES = [
  {
    gesture: '👋',
    name: 'Wave',
    action: 'Navigate slides',
    detail: 'Swipe left or right to move between slides without touching anything.',
  },
  {
    gesture: '👆',
    name: 'Point',
    action: 'Laser pointer',
    detail: 'Raise your index finger and a red dot follows it on screen.',
  },
  {
    gesture: '🤏',
    name: 'Pinch',
    action: 'Zoom in',
    detail: 'Pinch your thumb and index finger to magnify any part of a slide.',
  },
  {
    gesture: '✌️',
    name: 'Draw',
    action: 'Annotate live',
    detail: 'Hold two fingers up and draw directly on your slide in mid-air.',
  },
  {
    gesture: '✊',
    name: 'Fist',
    action: 'Pause tracking',
    detail: 'Close your fist to freeze the cursor. Open it to resume.',
  },
] as const;

const STATS = [
  { value: '30–60', unit: 'fps', label: 'tracking speed' },
  { value: '<100', unit: 'ms', label: 'gesture latency' },
  { value: '100%', unit: '', label: 'client-side' },
] as const;

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-full">
      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary">
          Control slides with your hands
        </h1>

        <p className="mt-6 max-w-xl mx-auto text-lg text-text-secondary leading-relaxed">
          Step back from the laptop. Swipe through slides, draw annotations, and
          point at content — all with hand gestures your webcam picks up in
          real time. Nothing to install, nothing to pair.
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <Button size="lg" onClick={() => onNavigate('onboarding')}>
            Start presenting
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              window.open('https://github.com', '_blank')
            }
          >
            <Code2 className="mr-2 h-5 w-5" />
            Source
          </Button>
        </div>
      </section>

      {/* ── Gesture reference ── */}
      <section className="border-y border-border-default bg-surface-secondary">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-8">
            Five gestures, zero hardware
          </h2>

          <div className="flex flex-col gap-6">
            {GESTURES.map(({ gesture, name, action, detail }) => (
              <div
                key={name}
                className="flex items-start gap-4"
              >
                <span
                  className="text-3xl leading-none mt-0.5 shrink-0"
                  role="img"
                  aria-label={name}
                >
                  {gesture}
                </span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {name}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      — {action}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Telemetry strip ── */}
      <section className="border-b border-border-default">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between sm:justify-start sm:gap-12">
          {STATS.map(({ value, unit, label }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-medium text-text-primary">
                {value}
              </span>
              {unit && (
                <span className="font-mono text-xs text-text-tertiary">
                  {unit}
                </span>
              )}
              <span className="text-xs text-text-tertiary ml-1">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-lg text-text-secondary mb-6">
          Upload a PDF, turn on your webcam, and start.
        </p>
        <Button onClick={() => onNavigate('onboarding')}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Open presenter
        </Button>
      </section>
    </div>
  );
}

export { HomePage };
