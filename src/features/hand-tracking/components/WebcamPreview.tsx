import { useEffect, useRef } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useHandTracking } from '../hooks/useHandTracking';
import { useGestureStore } from '@/stores/useGestureStore';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamPreviewProps {
  className?: string;
}

export function WebcamPreview({ className }: WebcamPreviewProps) {
  const { videoRef, stream, error, isInitializing, startCamera, stopCamera } = useWebcam({
    width: 640,
    height: 480,
  });
  
  const { startTracking, stopTracking } = useHandTracking(videoRef);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Start tracking automatically when stream is available
  useEffect(() => {
    if (stream) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [stream, startTracking, stopTracking]);

  // Handle canvas drawing outside of React render cycle for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const unsubscribe = useGestureStore.subscribe((state) => {
        const trackingResult = state.trackingResult;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!trackingResult) return;

        const { landmarks } = trackingResult;
        
        // Draw landmarks
        ctx.save();
        
        // Draw connections (skeleton)
        const connections = [
          // Thumb
          [0, 1], [1, 2], [2, 3], [3, 4],
          // Index
          [0, 5], [5, 6], [6, 7], [7, 8],
          // Middle
          [9, 10], [10, 11], [11, 12],
          // Ring
          [13, 14], [14, 15], [15, 16],
          // Pinky
          [17, 18], [18, 19], [19, 20],
          // Palm base
          [0, 17], [5, 9], [9, 13], [13, 17]
        ];

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'; // brand-500
        ctx.lineWidth = 3;

        for (const [startIdx, endIdx] of connections) {
          const start = landmarks[startIdx];
          const end = landmarks[endIdx];
          
          if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
            ctx.stroke();
          }
        }

        // Draw points
        ctx.fillStyle = '#ffffff';
        for (const lm of landmarks) {
          ctx.beginPath();
          ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        ctx.restore();
      });

    return () => unsubscribe();
  }, []);

  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-black/90 aspect-video flex items-center justify-center border border-[var(--gb-border)]', className)}>
      {error ? (
        <div className="text-center p-4 text-error-500 flex flex-col items-center gap-2">
          <CameraOff className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">{error.message}</p>
          <Button variant="secondary" size="sm" onClick={startCamera} className="mt-2">
            Retry
          </Button>
        </div>
      ) : !stream ? (
        <div className="text-center p-4">
          <Button onClick={startCamera} loading={isInitializing} icon={<Camera />}>
            Enable Camera
          </Button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
          />
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={stopCamera}
              className="bg-black/50 text-white hover:bg-black/70 hover:text-error-400 backdrop-blur-md rounded-full h-8 w-8"
              aria-label="Turn off camera"
            >
              <CameraOff className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
