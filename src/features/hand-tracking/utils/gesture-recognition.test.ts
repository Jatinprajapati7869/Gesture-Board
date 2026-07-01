import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recognizeGesture } from './gesture-recognition';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { HandLandmark } from '@/types';

// Mock the zustand store
vi.mock('@/stores/useSettingsStore', () => ({
  useSettingsStore: {
    getState: vi.fn(() => ({ gestureSensitivity: 'medium' })),
  },
}));

// Helper to generate a neutral hand (all points at origin for simplicity)
const createNeutralHand = (): HandLandmark[] => {
  return Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
};

// Helper to simulate a finger's state
// indices: tip, pip, mcp (for thumb)
const setFingerState = (
  hand: HandLandmark[],
  tipIdx: number,
  pipIdx: number,
  wristIdx: number,
  isExtended: boolean
) => {
  // If extended, tip is far from wrist, pip is halfway.
  // If curled, tip is close to wrist (same distance as pip or closer)
  const wrist = hand[wristIdx];

  if (isExtended) {
    hand[pipIdx] = { x: wrist.x, y: wrist.y - 0.5, z: 0 };
    hand[tipIdx] = { x: wrist.x, y: wrist.y - 1.0, z: 0 }; // distance = 1.0 (ratio = 2.0)
  } else {
    hand[pipIdx] = { x: wrist.x, y: wrist.y - 0.5, z: 0 };
    hand[tipIdx] = { x: wrist.x, y: wrist.y - 0.2, z: 0 }; // distance = 0.2 (ratio = 0.4)
  }
};

describe('recognizeGesture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSettingsStore.getState as any).mockReturnValue({ gestureSensitivity: 'medium' });
  });

  it('returns none with 0 confidence if landmarks are invalid', () => {
    const result = recognizeGesture([]);
    expect(result.type).toBe('none');
    expect(result.confidence).toBe(0);
  });

  it('recognizes an open palm', () => {
    const hand = createNeutralHand();
    // Extend all fingers
    // Thumb (tip=4, ip=3, mcp=5) -> mcp=5 serves as "wrist" for thumb
    setFingerState(hand, 4, 3, 5, true);
    // Index (tip=8, pip=6)
    setFingerState(hand, 8, 6, 0, true);
    // Middle (tip=12, pip=10)
    setFingerState(hand, 12, 10, 0, true);
    // Ring (tip=16, pip=14)
    setFingerState(hand, 16, 14, 0, true);
    // Pinky (tip=20, pip=18)
    setFingerState(hand, 20, 18, 0, true);

    const result = recognizeGesture(hand);
    expect(result.type).toBe('open_palm');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('recognizes a fist', () => {
    const hand = createNeutralHand();
    // Curl all fingers
    setFingerState(hand, 4, 3, 5, false); // thumb
    setFingerState(hand, 8, 6, 0, false); // index
    setFingerState(hand, 12, 10, 0, false); // middle
    setFingerState(hand, 16, 14, 0, false); // ring
    setFingerState(hand, 20, 18, 0, false); // pinky

    const result = recognizeGesture(hand);
    expect(result.type).toBe('fist');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('recognizes point', () => {
    const hand = createNeutralHand();
    // Only index extended
    setFingerState(hand, 4, 3, 5, false);
    setFingerState(hand, 8, 6, 0, true); // index extended
    setFingerState(hand, 12, 10, 0, false);
    setFingerState(hand, 16, 14, 0, false);
    setFingerState(hand, 20, 18, 0, false);

    const result = recognizeGesture(hand);
    expect(result.type).toBe('point');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('recognizes peace (V)', () => {
    const hand = createNeutralHand();
    // Index and middle extended
    setFingerState(hand, 4, 3, 5, false);
    setFingerState(hand, 8, 6, 0, true); // index
    setFingerState(hand, 12, 10, 0, true); // middle
    setFingerState(hand, 16, 14, 0, false);
    setFingerState(hand, 20, 18, 0, false);

    const result = recognizeGesture(hand);
    expect(result.type).toBe('peace');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('recognizes pinch', () => {
    const hand = createNeutralHand();
    // We need wrist to middle MCP to define hand size
    hand[0] = { x: 0, y: 0, z: 0 }; // wrist
    hand[9] = { x: 0, y: 10, z: 0 }; // middle MCP. Hand size = 10

    setFingerState(hand, 4, 3, 5, true); // thumb extended

    // Thumb tip and index tip close together
    hand[4] = { x: 5, y: 5, z: 0 }; // thumb tip
    hand[8] = { x: 5, y: 5.5, z: 0 }; // index tip (dist = 0.5, normalized = 0.05)
    
    // Make index PIP very far so indexExt evaluates to false (curled)
    hand[6] = { x: 20, y: 20, z: 0 }; 

    const result = recognizeGesture(hand);
    expect(result.type).toBe('pinch');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('adjusts pinch threshold based on sensitivity settings', () => {
    const hand = createNeutralHand();
    hand[0] = { x: 0, y: 0, z: 0 }; // wrist
    hand[9] = { x: 0, y: 10, z: 0 }; // hand size = 10

    setFingerState(hand, 4, 3, 5, true); // thumb extended

    // Set distance to borderline (say 3.5, normalized 0.35)
    hand[4] = { x: 5, y: 5, z: 0 }; 
    hand[8] = { x: 5, y: 8.5, z: 0 }; 

    // Make index PIP very far so indexExt evaluates to false
    hand[6] = { x: 20, y: 20, z: 0 }; 

    // With low sensitivity, threshold is strict (smaller). Distance 0.35 will fail.
    (useSettingsStore.getState as any).mockReturnValue({ gestureSensitivity: 'low' });
    let result = recognizeGesture(hand);
    expect(result.type).toBe('none');

    // With high sensitivity, threshold is loose (larger). Distance 0.35 will pass.
    (useSettingsStore.getState as any).mockReturnValue({ gestureSensitivity: 'high' });
    result = recognizeGesture(hand);
    expect(result.type).toBe('pinch');
  });
});
