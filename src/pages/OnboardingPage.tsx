import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { WebcamPreview } from '@/features/hand-tracking';
import { useGestureStore } from '@/stores/useGestureStore';
import { CheckCircle2, Circle, ArrowRight, Camera, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

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

  // 1. Listen for the correct gesture and mark step as complete
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

  // 2. Once a step is marked complete, wait 1 second then advance
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--gb-bg-primary)]">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Instructions */}
        <div className="space-y-8">
          <div>
            <Badge variant="brand" className="mb-4">Calibration & Training</Badge>
            <h1 className="text-4xl font-bold text-[var(--gb-text-primary)] tracking-tight">
              Let's test your setup
            </h1>
            <p className="text-lg text-[var(--gb-text-secondary)] mt-4">
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
                  padding="md"
                  className={cn(
                    "transition-all duration-300 relative overflow-hidden",
                    isActive ? "ring-2 ring-brand-500 shadow-brand-500/20" : "",
                    isLocked ? "opacity-50 grayscale" : "",
                    isCompleted ? "bg-green-500/10 border-green-500/20" : ""
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className={cn("w-6 h-6", isActive ? "text-brand-500 animate-pulse" : "text-[var(--gb-text-tertiary)]")} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--gb-text-primary)]">
                        {step.title}
                        {isActive && <Badge variant="default" className="ml-3 text-xs">Waiting for gesture...</Badge>}
                      </h3>
                      <p className="text-sm text-[var(--gb-text-secondary)] mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress indicator bar at bottom */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-1 bg-brand-500/20 w-full overflow-hidden">
                      <div className="h-full bg-brand-500 w-1/2 animate-[ping-pong_2s_ease-in-out_infinite]" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {allCompleted && (
            <div className="pt-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={onComplete}
              >
                Start Presenting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Side: Camera Preview */}
        <div className="space-y-6 sticky top-8">
          <Card padding="none" className="overflow-hidden bg-black aspect-video relative border-2 border-[var(--gb-border)] shadow-2xl">
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[var(--gb-bg-primary)] p-6 text-center">
                <Camera className="w-12 h-12 text-brand-500 mb-4" />
                <h3 className="text-xl font-semibold text-[var(--gb-text-primary)] mb-2">Camera Required</h3>
                <p className="text-[var(--gb-text-secondary)] mb-6 max-w-sm">
                  Please allow camera access and wait for the AI model to initialize.
                </p>
              </div>
            )}
            <WebcamPreview className="w-full h-full object-cover" />
            
            {isCameraActive && (
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Badge variant="brand" className="bg-black/60 backdrop-blur-md">
                  Camera Active
                </Badge>
                {currentGesture.type !== 'none' && (
                  <Badge variant="default" className="bg-black/60 backdrop-blur-md border-brand-500 text-brand-500">
                    Detected: {currentGesture.type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            )}
          </Card>
          
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--gb-text-secondary)]">
              <strong className="text-[var(--gb-text-primary)]">Pro Tip:</strong> Make sure your hand is well-lit and clearly visible in the camera frame. Gestures are recognized best when your hand is about 2-3 feet from the lens.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
