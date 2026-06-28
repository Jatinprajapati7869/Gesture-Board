/**
 * Application-wide constants.
 * Centralized to avoid magic numbers and enable easy tuning.
 */

// ── MediaPipe ──
export const HAND_TRACKING = {
  /** Maximum number of hands to detect */
  MAX_HANDS: 1,
  /** Minimum detection confidence (0-1) */
  MIN_DETECTION_CONFIDENCE: 0.7,
  /** Minimum tracking confidence (0-1) */
  MIN_TRACKING_CONFIDENCE: 0.5,
  /** Target FPS for hand tracking inference */
  TARGET_FPS: 30,
  /** Number of landmarks per hand */
  LANDMARKS_PER_HAND: 21,
} as const;

// ── Gesture Recognition ──
export const GESTURES = {
  /** Smoothing factor for exponential moving average (0 = no smoothing, 1 = full smoothing) */
  EMA_ALPHA: 0.3,
  /** Minimum confidence to trigger a gesture action */
  MIN_CONFIDENCE: 0.75,
  /** Cooldown between same gesture triggers (ms) */
  COOLDOWN_MS: 500,
  /** Minimum swipe velocity (normalized units/frame) */
  MIN_SWIPE_VELOCITY: 0.02,
  /** Maximum pinch distance to trigger pinch (normalized) */
  PINCH_THRESHOLD: 0.06,
  /** Finger extension angle threshold (degrees) */
  EXTENSION_ANGLE_THRESHOLD: 160,
  /** Finger curl angle threshold (degrees) */
  CURL_ANGLE_THRESHOLD: 90,
} as const;

// ── Canvas ──
export const CANVAS = {
  /** Laser pointer radius (px) */
  POINTER_RADIUS: 8,
  /** Laser pointer color */
  POINTER_COLOR: 'oklch(0.65 0.30 25)',
  /** Laser pointer glow radius */
  POINTER_GLOW_RADIUS: 20,
  /** Default pen width for annotations */
  DEFAULT_PEN_WIDTH: 3,
  /** Default pen color */
  DEFAULT_PEN_COLOR: '#ffffff',
} as const;

// ── Presentation ──
export const PRESENTATION = {
  /** Transition duration between slides (ms) */
  TRANSITION_DURATION: 400,
  /** Maximum zoom level */
  MAX_ZOOM: 3,
  /** Minimum zoom level */
  MIN_ZOOM: 1,
  /** Zoom step per pinch increment */
  ZOOM_STEP: 0.1,
  /** Maximum file size for PDF upload (50MB) */
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  /** Supported file types */
  SUPPORTED_TYPES: ['application/pdf'] as string[],
} as const;

// ── UI ──
export const UI = {
  /** Sidebar width (px) */
  SIDEBAR_WIDTH: 280,
  /** Sidebar collapsed width (px) */
  SIDEBAR_COLLAPSED_WIDTH: 64,
  /** Status bar height (px) */
  STATUSBAR_HEIGHT: 32,
  /** Toast auto-dismiss duration (ms) */
  TOAST_DURATION: 3000,
  /** Webcam preview default size */
  WEBCAM_PREVIEW_SIZE: 200,
} as const;

// ── App Metadata ──
export const APP = {
  NAME: 'GestureBoard',
  DESCRIPTION:
    'Control presentations using hand gestures detected by your webcam.',
  VERSION: '0.1.0',
  GITHUB_URL: 'https://github.com/yourusername/gestureboard',
} as const;
