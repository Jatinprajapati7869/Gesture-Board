import type { HandLandmark, GestureResult } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';

// Constants for gesture geometry
const FINGERTIPS = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
const FINGER_PIPS = [6, 10, 14, 18]; // PIP joints for the above fingers
const THUMB_TIP = 4;
const THUMB_IP = 3;
const WRIST = 0;

/**
 * Calculates Euclidean distance between two 3D points
 */
function getDistance(p1: HandLandmark, p2: HandLandmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

/**
 * Checks if a specific finger is extended by comparing the distance
 * from the wrist to the fingertip vs the wrist to the PIP joint.
 */
function isFingerExtended(landmarks: HandLandmark[], tipIdx: number, pipIdx: number): boolean {
  const wrist = landmarks[WRIST];
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  
  if (!wrist || !tip || !pip) return false;
  
  // A finger is generally extended if its tip is further from the wrist than its PIP joint
  return getDistance(wrist, tip) > getDistance(wrist, pip);
}

/**
 * Checks if the thumb is extended.
 * Thumb geometry is different from other fingers, often relying on the x-coordinate
 * relative to other joints depending on handedness, but distance to wrist works decently as a simple heuristic.
 */
function isThumbExtended(landmarks: HandLandmark[]): boolean {
  const wrist = landmarks[WRIST];
  const tip = landmarks[THUMB_TIP];
  const ip = landmarks[THUMB_IP];
  
  if (!wrist || !tip || !ip) return false;
  
  // For thumb, we check if the tip is further from the index base (MCP) than the IP joint
  const indexMcp = landmarks[5];
  if (!indexMcp) return false;
  
  return getDistance(indexMcp, tip) > getDistance(indexMcp, ip);
}

/**
 * Recognizes gestures based on 21 hand landmarks.
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

  // Count extended non-thumb fingers
  const extendedFingersCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // 2. Classify based on extended fingers
  
  // OPEN PALM: All fingers extended
  if (extendedFingersCount === 4 && thumbExt) {
    return { type: 'open_palm', confidence: 0.9, timestamp: performance.now() };
  }

  // FIST: No fingers extended (thumb may or may not be extended)
  if (extendedFingersCount === 0 && !thumbExt) {
    return { type: 'fist', confidence: 0.9, timestamp: performance.now() };
  }

  // POINT: Only index finger extended
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    return { type: 'point', confidence: 0.9, timestamp: performance.now() };
  }

  // PEACE / V: Index and middle extended, others closed
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    return { type: 'peace', confidence: 0.9, timestamp: performance.now() };
  }

  // PINCH: Distance between thumb tip and index tip is very small
  const thumbIndexDist = getDistance(landmarks[THUMB_TIP], landmarks[FINGERTIPS[0]]);
  // Normalize threshold based on hand size (distance from wrist to middle MCP)
  const handSize = getDistance(landmarks[WRIST], landmarks[9]); 
  
  const { gestureSensitivity } = useSettingsStore.getState();
  let pinchThreshold = 0.3;
  if (gestureSensitivity === 'low') pinchThreshold = 0.2;
  if (gestureSensitivity === 'high') pinchThreshold = 0.4;
  
  if (thumbIndexDist < handSize * pinchThreshold) {
    return { type: 'pinch', confidence: 0.85, timestamp: performance.now() };
  }

  // If no specific static gesture matches, return none. 
  // Dynamic gestures (swipes) are handled by examining history over time, not single frames.
  return { type: 'none', confidence: 0, timestamp: performance.now() };
}
