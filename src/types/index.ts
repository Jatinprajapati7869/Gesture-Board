/**
 * Global type definitions for GestureBoard.
 * Shared across all feature modules.
 */

// ── Theme ──
export type Theme = 'light' | 'dark' | 'system';

// ── Gesture Types ──
export type GestureType =
  | 'none'
  | 'point'
  | 'open_palm'
  | 'fist'
  | 'pinch'
  | 'peace'
  | 'swipe_left'
  | 'swipe_right';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  timestamp: number;
}

// ── Hand Landmarks ──
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingResult {
  landmarks: HandLandmark[];
  worldLandmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  timestamp: number;
}

// ── Presentation ──
export interface Slide {
  id: string;
  pageNumber: number;
  thumbnail?: string;
}

export interface PresentationFile {
  name: string;
  totalPages: number;
  fileSize: number;
  loadedAt: number;
}

// ── Annotations ──
export interface DrawingPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  slideId: string;
}

// ── Gesture Mapping ──
export interface GestureAction {
  gesture: GestureType;
  action: string;
  label: string;
  description: string;
  enabled: boolean;
}

// ── App Mode ──
export type AppMode = 'setup' | 'presenting' | 'calibrating';

// ── Toast / Notification ──
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
