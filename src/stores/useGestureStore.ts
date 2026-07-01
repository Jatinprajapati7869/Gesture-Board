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
      
      // Debounce: don't update if it's the same gesture type and we just updated < 100ms ago
      if (
        state.currentGesture.type === gesture.type && 
        now - state.currentGesture.timestamp < 100
      ) {
        return state;
      }
      
      // Update history (keep last 20 entries)
      const newHistory = [gesture, ...state.gestureHistory].slice(0, 20);

      // Anti-flicker: hold the previous gesture for 200ms before accepting 'none'
      // This prevents visual jitter from brief recognition gaps (e.g. point → none → point)
      if (gesture.type === 'none') {
        if (now - state.currentGesture.timestamp < 200) {
          return { gestureHistory: newHistory };
        }
      }

      return { currentGesture: gesture, gestureHistory: newHistory };
    }),
}));
