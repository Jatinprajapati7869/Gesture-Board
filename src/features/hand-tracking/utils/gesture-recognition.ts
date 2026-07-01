import type { HandLandmark, GestureResult } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { distance3D, clamp } from '@/lib/math';
import { GESTURES } from '@/lib/constants';

// Landmark indices
const FINGERTIPS = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
const FINGER_PIPS = [6, 10, 14, 18]; // PIP joints for the above fingers
const THUMB_TIP = 4;
const THUMB_IP = 3;
const WRIST = 0;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;

/**
 * Returns a 0–1 "extension ratio" indicating how extended a finger is.
 * 0 = fully curled, 1 = fully extended. Values can slightly exceed 1.
 */
function fingerExtensionRatio(landmarks: HandLandmark[], tipIdx: number, pipIdx: number): number {
  const wrist = landmarks[WRIST];
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  
  if (!wrist || !tip || !pip) return 0;
  
  const tipDist = distance3D(wrist, tip);
  const pipDist = distance3D(wrist, pip);
  
  if (pipDist === 0) return 0;
  
  // Ratio > 1 means extended, < 1 means curled. Normalize to a 0–1 confidence range.
  return tipDist / pipDist;
}

/**
 * Whether a finger is considered "extended" (ratio > 1.0).
 */
function isFingerExtended(landmarks: HandLandmark[], tipIdx: number, pipIdx: number): boolean {
  return fingerExtensionRatio(landmarks, tipIdx, pipIdx) > 1.0;
}

/**
 * Returns a 0–1 ratio for thumb extension.
 */
function thumbExtensionRatio(landmarks: HandLandmark[]): number {
  const tip = landmarks[THUMB_TIP];
  const ip = landmarks[THUMB_IP];
  const indexMcp = landmarks[INDEX_MCP];
  
  if (!tip || !ip || !indexMcp) return 0;
  
  const tipDist = distance3D(indexMcp, tip);
  const ipDist = distance3D(indexMcp, ip);
  
  if (ipDist === 0) return 0;
  return tipDist / ipDist;
}

function isThumbExtended(landmarks: HandLandmark[]): boolean {
  return thumbExtensionRatio(landmarks) > 1.0;
}

/**
 * Computes a dynamic confidence for finger-count gestures.
 * 
 * For each finger that is supposed to be extended, we add its extension ratio (capped at 1).
 * For each finger that is supposed to be curled, we add (1 - its extension ratio, capped at 0–1).
 * The result is averaged across all 5 digits to get a 0–1 confidence.
 */
function computeFingerConfidence(
  landmarks: HandLandmark[],
  expectedExtended: boolean[],  // [thumb, index, middle, ring, pinky]
): number {
  const thumbRatio = thumbExtensionRatio(landmarks);
  const fingerRatios = FINGERTIPS.map((tip, i) => fingerExtensionRatio(landmarks, tip, FINGER_PIPS[i]));
  
  const allRatios = [thumbRatio, ...fingerRatios];
  let score = 0;
  
  for (let i = 0; i < 5; i++) {
    const ratio = allRatios[i];
    if (expectedExtended[i]) {
      // Extended finger: higher ratio = more confidence
      score += clamp(ratio - 0.5, 0, 1); // 0.5–1.5 range mapped to 0–1
    } else {
      // Curled finger: lower ratio = more confidence
      score += clamp(1.5 - ratio, 0, 1); // inversely proportional
    }
  }
  
  return clamp(score / 5, 0, 1);
}

/**
 * Recognizes gestures based on 21 hand landmarks.
 * Returns a GestureResult with dynamically computed confidence.
 */
export function recognizeGesture(landmarks: HandLandmark[]): GestureResult {
  if (!landmarks || landmarks.length !== 21) {
    return { type: 'none', confidence: 0, timestamp: performance.now() };
  }

  // 1. Determine which fingers are extended
  const thumbExt = isThumbExtended(landmarks);
  const indexExt = isFingerExtended(landmarks, FINGERTIPS[0], FINGER_PIPS[0]);
  const middleExt = isFingerExtended(landmarks, FINGERTIPS[1], FINGER_PIPS[1]);
  const ringExt = isFingerExtended(landmarks, FINGERTIPS[2], FINGER_PIPS[2]);
  const pinkyExt = isFingerExtended(landmarks, FINGERTIPS[3], FINGER_PIPS[3]);

  const extendedFingersCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // 2. Classify based on extended fingers with dynamic confidence

  // OPEN PALM: All fingers extended
  if (extendedFingersCount === 4 && thumbExt) {
    const confidence = computeFingerConfidence(landmarks, [true, true, true, true, true]);
    return { type: 'open_palm', confidence, timestamp: performance.now() };
  }

  // FIST: No fingers extended
  if (extendedFingersCount === 0 && !thumbExt) {
    const confidence = computeFingerConfidence(landmarks, [false, false, false, false, false]);
    return { type: 'fist', confidence, timestamp: performance.now() };
  }

  // POINT: Only index finger extended
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    const confidence = computeFingerConfidence(landmarks, [false, true, false, false, false]);
    return { type: 'point', confidence, timestamp: performance.now() };
  }

  // PEACE / V: Index and middle extended, others closed
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    const confidence = computeFingerConfidence(landmarks, [false, true, true, false, false]);
    return { type: 'peace', confidence, timestamp: performance.now() };
  }

  // PINCH: Distance between thumb tip and index tip is very small
  const thumbIndexDist = distance3D(landmarks[THUMB_TIP], landmarks[FINGERTIPS[0]]);
  // Normalize threshold based on hand size (distance from wrist to middle MCP)
  const handSize = distance3D(landmarks[WRIST], landmarks[MIDDLE_MCP]); 
  
  const { gestureSensitivity } = useSettingsStore.getState();
  let pinchThreshold = GESTURES.PINCH_THRESHOLD * 5; // Base threshold (~0.3 normalized)
  if (gestureSensitivity === 'low') pinchThreshold *= 0.67;
  if (gestureSensitivity === 'high') pinchThreshold *= 1.33;
  
  const normalizedDist = handSize > 0 ? thumbIndexDist / handSize : 1;
  if (normalizedDist < pinchThreshold) {
    // Confidence is inversely proportional to distance: closer pinch = higher confidence
    const confidence = clamp(1 - (normalizedDist / pinchThreshold), 0.5, 1);
    return { type: 'pinch', confidence, timestamp: performance.now() };
  }

  return { type: 'none', confidence: 0, timestamp: performance.now() };
}

