import { useEffect, useRef, useCallback } from 'react';
import { handLandmarkerService } from '../services/HandLandmarkerService';
import { useGestureStore } from '@/stores/useGestureStore';
import { FPSCounter, FrameTimer } from '@/lib/performance';
import type { HandTrackingResult } from '@/types';
import { toast } from '@/stores/useToastStore';

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const isTracking = useGestureStore((s) => s.isTracking);
  const setTrackingState = useGestureStore((s) => s.setTrackingState);
  const updateTrackingData = useGestureStore((s) => s.updateTrackingData);
  
  const requestRef = useRef<number>(0);
  const fpsCounter = useRef(new FPSCounter());
  const timer = useRef(new FrameTimer());
  const lastVideoTime = useRef(-1);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    
    // Stop loop if tracking is disabled or video is not ready
    if (!isTracking || !video || video.readyState < 2) {
      if (isTracking && video) {
        requestRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    try {
      timer.current.start();
      
      // Only process if a new frame is available
      const currentTime = video.currentTime;
      if (currentTime !== lastVideoTime.current) {
        lastVideoTime.current = currentTime;
        
        const result = handLandmarkerService.detectForVideo(video, performance.now());
        fpsCounter.current.tick();
        
        if (result && result.landmarks && result.landmarks.length > 0) {
          const trackingResult: HandTrackingResult = {
            landmarks: result.landmarks[0],
            worldLandmarks: result.worldLandmarks[0],
            handedness: result.handednesses[0][0].categoryName === 'Left' ? 'Left' : 'Right',
            timestamp: performance.now(),
          };
          updateTrackingData(trackingResult, fpsCounter.current.fps, timer.current.elapsed());
        } else {
          updateTrackingData(null, fpsCounter.current.fps, timer.current.elapsed());
        }
      }
      
      // Schedule next frame
      requestRef.current = requestAnimationFrame(processFrame);
    } catch (error) {
      console.error('Error in hand tracking loop:', error);
      toast.error('Hand tracking encountered an error.');
      setTrackingState(false);
    }
  }, [isTracking, videoRef, setTrackingState, updateTrackingData]);

  // Start/Stop tracking loop
  useEffect(() => {
    if (isTracking) {
      handLandmarkerService.initialize().then(() => {
        requestRef.current = requestAnimationFrame(processFrame);
      }).catch(() => {
        toast.error('Failed to load MediaPipe model');
        setTrackingState(false);
      });
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isTracking, processFrame, setTrackingState]);

  return {
    startTracking: () => setTrackingState(true),
    stopTracking: () => setTrackingState(false),
  };
}
