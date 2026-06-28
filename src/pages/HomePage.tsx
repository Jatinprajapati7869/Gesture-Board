import {
  Hand,
  Presentation,
  Pencil,
  ZoomIn,
  Pointer,
  MonitorPlay,
  ArrowRight,
  Sparkles,
  Code2,
  Zap,
  Shield,
  Cpu,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

interface HomePageProps {
  onNavigate: (page: 'onboarding') => void;
}

const features = [
  {
    icon: Hand,
    title: 'Hand Tracking',
    description: '21-point hand landmark detection in real-time using MediaPipe AI',
    color: 'text-brand-400',
    bgColor: 'bg-brand-500/10',
  },
  {
    icon: Pointer,
    title: 'Laser Pointer',
    description: 'Point at your screen with a virtual laser that follows your finger',
    color: 'text-error-500',
    bgColor: 'bg-error-500/10',
  },
  {
    icon: ZoomIn,
    title: 'Pinch to Zoom',
    description: 'Pinch gesture to zoom into slide content naturally',
    color: 'text-accent-500',
    bgColor: 'bg-accent-500/10',
  },
  {
    icon: Pencil,
    title: 'Air Drawing',
    description: 'Draw annotations on slides using hand gestures in mid-air',
    color: 'text-warning-500',
    bgColor: 'bg-warning-500/10',
  },
  {
    icon: Presentation,
    title: 'PDF Presentations',
    description: 'Upload any PDF and control it entirely with hand gestures',
    color: 'text-success-500',
    bgColor: 'bg-success-500/10',
  },
  {
    icon: MonitorPlay,
    title: 'Presenter View',
    description: 'Professional presenter mode with slide preview and timer',
    color: 'text-brand-300',
    bgColor: 'bg-brand-300/10',
  },
];

const stats = [
  { icon: Zap, value: '30-60', label: 'FPS Tracking', description: 'Real-time performance' },
  { icon: Cpu, value: '<100', label: 'ms Latency', description: 'Instant response' },
  { icon: Shield, value: '100%', label: 'Client-side', description: 'Privacy first' },
];

/**
 * Landing/Home page.
 * Designed to immediately impress — combines hero section,
 * feature grid, and performance stats.
 */
function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-full">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Gradient background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent-400/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-400/4 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20">
          {/* Version badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <Badge variant="brand" dot>
              v0.1.0 — Early Preview
            </Badge>
          </div>

          {/* Headline */}
          <div className="text-center space-y-6 animate-slide-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--gb-text-primary)]">
              Control slides with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-accent-400">
                your hands
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--gb-text-secondary)] leading-relaxed">
              AI-powered hand gesture recognition for presentations.
              Navigate, annotate, zoom, and point — no mouse, keyboard, or
              clicker required.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                icon={<Sparkles />}
                onClick={() => onNavigate('onboarding')}
              >
                Start Presenting
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<Code2 />}
                onClick={() =>
                  window.open('https://github.com', '_blank')
                }
              >
                View Source
              </Button>
            </div>
          </div>

          {/* Gesture demo hint */}
          <div className="mt-16 flex justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-[var(--gb-bg-elevated)] border border-[var(--gb-border)] shadow-card">
              {(['👋 Wave', '👆 Point', '🤏 Pinch', '✌️ Draw', '✊ Fist'] as const).map(
                (gesture, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-2xl" role="img">{gesture.split(' ')[0]}</span>
                    <span className="text-[10px] font-medium text-[var(--gb-text-tertiary)]">
                      {gesture.split(' ')[1]}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="border-y border-[var(--gb-border)] bg-[var(--gb-bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500/10">
                    <Icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[var(--gb-text-primary)] font-mono">
                        {stat.value}
                      </span>
                      <span className="text-sm font-medium text-[var(--gb-text-secondary)]">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--gb-text-tertiary)]">{stat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--gb-text-primary)]">
            Everything you need to present
          </h2>
          <p className="mt-3 text-[var(--gb-text-secondary)] max-w-lg mx-auto">
            Built with MediaPipe AI and optimized for real-time performance.
            Every gesture is detected client-side — your camera feed never leaves your device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                variant="bordered"
                padding="md"
                hover
                className="group"
              >
                <div
                  className={cn(
                    'inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4',
                    'transition-transform duration-200 group-hover:scale-110',
                    feature.bgColor,
                  )}
                >
                  <Icon className={cn('h-5 w-5', feature.color)} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--gb-text-primary)] mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-[var(--gb-text-tertiary)] leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hand className="h-6 w-6 text-brand-500" />
            <h3 className="text-xl font-bold text-[var(--gb-text-primary)]">
              Ready to try it?
            </h3>
          </div>
          <p className="text-sm text-[var(--gb-text-secondary)] mb-6 max-w-md mx-auto">
            Upload a PDF, enable your webcam, and start controlling your
            presentation with hand gestures.
          </p>
          <Button icon={<ArrowRight />} onClick={() => onNavigate('onboarding')}>
            Open Presenter
          </Button>
        </Card>
      </section>
    </div>
  );
}

export { HomePage };
