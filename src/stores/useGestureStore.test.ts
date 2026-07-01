import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGestureStore } from './useGestureStore';
import type { GestureResult, HandTrackingResult } from '@/types';

describe('useGestureStore', () => {
  let nowSpy: any;

  beforeEach(() => {
    // Reset store state
    useGestureStore.setState({
      isTracking: false,
      trackingResult: null,
      currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
      gestureHistory: [],
      fps: 0,
      latency: 0,
    });
    nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const state = useGestureStore.getState();
    expect(state.isTracking).toBe(false);
    expect(state.trackingResult).toBeNull();
    expect(state.currentGesture.type).toBe('none');
    expect(state.gestureHistory).toEqual([]);
    expect(state.fps).toBe(0);
    expect(state.latency).toBe(0);
  });

  it('setTrackingState updates isTracking', () => {
    useGestureStore.getState().setTrackingState(true);
    expect(useGestureStore.getState().isTracking).toBe(true);
  });

  it('updateTrackingData updates metrics and results', () => {
    const mockResult: HandTrackingResult = { landmarks: [], worldLandmarks: [], handedness: 'Right', timestamp: 0 };
    useGestureStore.getState().updateTrackingData(mockResult, 60, 15);
    
    const state = useGestureStore.getState();
    expect(state.trackingResult).toBe(mockResult);
    expect(state.fps).toBe(60);
    expect(state.latency).toBe(15);
  });

  describe('setGesture', () => {
    it('sets a new gesture and updates history', () => {
      nowSpy.mockReturnValue(50);
      const gesture: GestureResult = { type: 'open_palm', confidence: 0.9, timestamp: 50 };
      
      useGestureStore.getState().setGesture(gesture);
      
      const state = useGestureStore.getState();
      expect(state.currentGesture).toEqual(gesture);
      expect(state.gestureHistory).toHaveLength(1);
      expect(state.gestureHistory[0]).toEqual(gesture);
    });

    it('debounces the same gesture type if updated within 100ms', () => {
      nowSpy.mockReturnValue(50);
      const gesture1: GestureResult = { type: 'point', confidence: 0.9, timestamp: 50 };
      useGestureStore.getState().setGesture(gesture1);

      // Fast forward 50ms (within 100ms debounce window)
      nowSpy.mockReturnValue(100);
      const gesture2: GestureResult = { type: 'point', confidence: 0.95, timestamp: 100 };
      useGestureStore.getState().setGesture(gesture2);

      const state = useGestureStore.getState();
      // Should NOT have updated currentGesture because of debounce
      expect(state.currentGesture).toEqual(gesture1);
      // It also should not have appended to history (the code returns early)
      expect(state.gestureHistory).toHaveLength(1);
    });

    it('allows the same gesture type if updated after 100ms', () => {
      nowSpy.mockReturnValue(50);
      const gesture1: GestureResult = { type: 'point', confidence: 0.9, timestamp: 50 };
      useGestureStore.getState().setGesture(gesture1);

      // Fast forward 150ms (> 100ms debounce window)
      nowSpy.mockReturnValue(200);
      const gesture2: GestureResult = { type: 'point', confidence: 0.95, timestamp: 200 };
      useGestureStore.getState().setGesture(gesture2);

      const state = useGestureStore.getState();
      expect(state.currentGesture).toEqual(gesture2);
      expect(state.gestureHistory).toHaveLength(2);
    });

    it('allows different gesture types immediately', () => {
      nowSpy.mockReturnValue(50);
      const gesture1: GestureResult = { type: 'point', confidence: 0.9, timestamp: 50 };
      useGestureStore.getState().setGesture(gesture1);

      // Fast forward 50ms (within debounce window, but different gesture type)
      nowSpy.mockReturnValue(100);
      const gesture2: GestureResult = { type: 'open_palm', confidence: 0.9, timestamp: 100 };
      useGestureStore.getState().setGesture(gesture2);

      const state = useGestureStore.getState();
      expect(state.currentGesture).toEqual(gesture2);
      expect(state.gestureHistory).toHaveLength(2);
    });

    it('anti-flicker: ignores "none" if previous gesture was <200ms ago', () => {
      nowSpy.mockReturnValue(50);
      const pointGesture: GestureResult = { type: 'point', confidence: 0.9, timestamp: 50 };
      useGestureStore.getState().setGesture(pointGesture);

      // Fast forward 100ms (diff between 150 and 50 is 100, which is < 200)
      nowSpy.mockReturnValue(150);
      const noneGesture: GestureResult = { type: 'none', confidence: 0, timestamp: 150 };
      useGestureStore.getState().setGesture(noneGesture);

      const state = useGestureStore.getState();
      // currentGesture should NOT update to 'none' due to anti-flicker
      expect(state.currentGesture).toEqual(pointGesture);
      // However, history is still updated with 'none' (as per implementation)
      expect(state.gestureHistory).toHaveLength(2);
      expect(state.gestureHistory[0]).toEqual(noneGesture);
    });

    it('accepts "none" if previous gesture was >=200ms ago', () => {
      nowSpy.mockReturnValue(50);
      const pointGesture: GestureResult = { type: 'point', confidence: 0.9, timestamp: 50 };
      useGestureStore.getState().setGesture(pointGesture);

      // Fast forward 250ms (diff between 300 and 50 is 250, which is >= 200)
      nowSpy.mockReturnValue(300);
      const noneGesture: GestureResult = { type: 'none', confidence: 0, timestamp: 300 };
      useGestureStore.getState().setGesture(noneGesture);

      const state = useGestureStore.getState();
      // currentGesture SHOULD update to 'none'
      expect(state.currentGesture).toEqual(noneGesture);
      expect(state.gestureHistory).toHaveLength(2);
    });

    it('keeps history at a maximum of 20 entries', () => {
      nowSpy.mockReturnValue(0);
      for (let i = 0; i < 25; i++) {
        nowSpy.mockReturnValue(i * 200); // 200ms gap to avoid debounce/anti-flicker issues
        const gesture: GestureResult = { 
          type: i % 2 === 0 ? 'point' : 'open_palm', 
          confidence: 0.9, 
          timestamp: i * 200 
        };
        useGestureStore.getState().setGesture(gesture);
      }

      const state = useGestureStore.getState();
      expect(state.gestureHistory).toHaveLength(20);
    });
  });
});
