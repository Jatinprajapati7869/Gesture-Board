import { create } from 'zustand';
import type { HandTrackingResult, GestureResult } from '@/types';

interface GestureState {
  // Hand tracking data
  isTracking: boolean;
  trackingResult: HandTrackingResult | null;
  
  // Gesture data
  currentGesture: GestureResult;
  gestureHistory: GestureResult[];
  
  // Performance metrics
  fps: number;
  latency: number;
  
  // Actions
  setTrackingState: (isTracking: boolean) => void;
  updateTrackingData: (result: HandTrackingResult | null, fps: number, latency: number) => void;
  setGesture: (gesture: GestureResult) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
  isTracking: false,
  trackingResult: null,
  currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
  gestureHistory: [],
  fps: 0,
  latency: 0,
  
  setTrackingState: (isTracking) => set({ isTracking }),
  
  updateTrackingData: (trackingResult, fps, latency) => 
    set({ trackingResult, fps, latency }),
    
  setGesture: (gesture) => 
    set((state) => {
      const now = performance.now();
      
      // Don't update if it's exactly the same and we just updated < 100ms ago
      // This is a simple debounce
      if (
        state.currentGesture.type === gesture.type && 
        now - state.currentGesture.timestamp < 100
      ) {
        return state;
      }
      
      // Update history
      const newHistory = [gesture, ...state.gestureHistory].slice(0, 20);
      
      // Dynamic Swipe Detection (Simple heuristic)
      // If we see an open_palm move significantly across the X axis in a short time
      
      if (gesture.type === 'open_palm' && state.trackingResult && state.trackingResult.landmarks) {
        // We can examine tracking result history if we stored it, but for a simple swipe:
        // We just check if there's a fast X movement. 
        // For a more robust swipe, we should track palm center over time.
        // I will implement a basic version where gesture-recognition.ts handles static, and here we could handle dynamic.
        // Actually, let's keep it simple for now and rely on static gestures, or add swipe logic to gesture-recognition.ts later.
      }

      // To prevent flickering (e.g. point -> none -> point in 3 frames), we require a gesture to be seen 
      // multiple times, OR we just trust the confidence. The gesture-recognition currently sets high confidence.
      // We will just commit it if it's not 'none' or if it's 'none' for a bit of time.
      if (gesture.type === 'none') {
        if (now - state.currentGesture.timestamp < 200) {
          // hold the previous gesture for 200ms to avoid flicker
          return { gestureHistory: newHistory };
        }
      }

      return { currentGesture: gesture, gestureHistory: newHistory };
    }),
}));
