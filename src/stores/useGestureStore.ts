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
      // Avoid duplicate gesture events if it's the exact same type and very close in time, unless needed
      // Actually we just record it. We'll manage debounce in the gesture engine.
      const newHistory = [gesture, ...state.gestureHistory].slice(0, 10);
      return { currentGesture: gesture, gestureHistory: newHistory };
    }),
}));
