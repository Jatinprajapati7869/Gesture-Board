import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { WebcamPreview } from '@/features/hand-tracking';
import { useGestureStore } from '@/stores/useGestureStore';
import { CheckCircle2, Circle, ArrowRight, Camera, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingPageProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  { id: 'peace', title: 'Next Slide', description: 'Hold up a Peace sign (Index and Middle fingers) to advance to the next slide.', requiredGesture: 'peace' },
  { id: 'palm', title: 'Previous Slide', description: 'Hold up an Open Palm (All fingers extended) to return to the previous slide.', requiredGesture: 'open_palm' },
  { id: 'point', title: 'Laser Pointer', description: 'Extend only your Index finger to project a laser pointer onto the screen.', requiredGesture: 'point' },
  { id: 'pinch', title: 'Draw Ink', description: 'Pinch your Thumb and Index finger together to draw digital ink.', requiredGesture: 'pinch' },
];

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { currentGesture, trackingResult } = useGestureStore();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const isCameraActive = trackingResult !== null;

  useEffect(() => {
    if (!isCameraActive || currentStepIndex >= TUTORIAL_STEPS.length) return;
    const currentStepId = TUTORIAL_STEPS[currentStepIndex].id;

    if (completedSteps.has(currentStepId)) return;

    const currentRequiredGesture = TUTORIAL_STEPS[currentStepIndex].requiredGesture;
    
    if (currentGesture.type === currentRequiredGesture && currentGesture.confidence > 0.8) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(currentStepId);
        return newSet;
      });
    }
  }, [currentGesture.type, currentGesture.confidence, currentGesture.timestamp, isCameraActive, currentStepIndex, completedSteps]);

  useEffect(() => {
    if (currentStepIndex >= TUTORIAL_STEPS.length) return;
    const currentStepId = TUTORIAL_STEPS[currentStepIndex].id;

    if (completedSteps.has(currentStepId)) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => Math.min(prev + 1, TUTORIAL_STEPS.length));
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [completedSteps, currentStepIndex]);

  const allCompleted = completedSteps.size === TUTORIAL_STEPS.length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-surface-primary p-8">
      <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <Badge variant="default" className="mb-4">Calibration & Training</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-text-primary">
              Let's test your setup
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              Before you start your presentation, we need to make sure the AI can clearly see your hands and that you know the controls.
            </p>
          </div>

          <div className="space-y-4">
            {TUTORIAL_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = completedSteps.has(step.id);
              const isLocked = !isCameraActive || (!isActive && !isCompleted);

              return (
                <Card 
                  key={step.id} 
                  className={cn(
                    'relative overflow-hidden transition-all duration-300',
                    isActive ? 'ring-2 ring-interactive-primary shadow-interactive-primary/20' : '',
                    isLocked ? 'opacity-50 grayscale' : '',
                    isCompleted ? 'border-feedback-success/20 bg-feedback-success/10' : ''
                  )}
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-feedback-success" />
                      ) : (
                        <Circle className={cn('h-6 w-6', isActive ? 'animate-pulse text-interactive-primary' : 'text-text-tertiary')} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {step.title}
                        {isActive && <Badge variant="secondary" className="ml-3 text-xs">Waiting for gesture...</Badge>}
                      </h3>
                      <p className="mt-1 text-sm text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-interactive-primary/20">
                      <div className="h-full w-1/2 animate-[ping-pong_2s_ease-in-out_infinite] bg-interactive-primary" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {allCompleted && (
            <div className="animate-in fade-in slide-in-from-bottom-4 pt-6 duration-700">
              <Button 
                variant="primary" 
                size="lg" 
                className="h-14 w-full text-lg"
                onClick={onComplete}
              >
                Start Presenting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="sticky top-8 space-y-6">
          <Card className="relative aspect-video overflow-hidden rounded-xl border-2 border-border-default bg-black p-0 shadow-2xl">
            {!isCameraActive && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-primary p-6 text-center">
                <Camera className="mb-4 h-12 w-12 text-interactive-primary" />
                <h3 className="mb-2 text-xl font-semibold text-text-primary">Camera Required</h3>
                <p className="mb-6 max-w-sm text-text-secondary">
                  Please allow camera access and wait for the AI model to initialize.
                </p>
                <Button variant="primary" onClick={onComplete}>
                  Continue without camera
                </Button>
              </div>
            )}
            <WebcamPreview className="h-full w-full object-cover" />
            {isCameraActive && (
              <div className="absolute left-4 top-4 z-10 flex gap-2">
                <Badge variant="default" className="bg-black/60 backdrop-blur-md">
                  Camera Active
                </Badge>
                {currentGesture.type !== 'none' && (
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-interactive-primary">
                    Detected: {currentGesture.type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            )}
          </Card>
          
          <div className="flex items-start gap-3 rounded-xl border border-interactive-primary/20 bg-interactive-primary/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-interactive-primary" />
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Pro Tip:</strong> Make sure your hand is well-lit and clearly visible in the camera frame. Gestures are recognized best when your hand is about 2-3 feet from the lens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}