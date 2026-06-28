/**
 * Vector math, smoothing, and geometric utilities.
 * Used by gesture recognition engine for landmark analysis.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

/** Calculate Euclidean distance between two 2D points */
export function distance2D(a: Point2D, b: Point2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Calculate Euclidean distance between two 3D points */
export function distance3D(a: Point3D, b: Point3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

/** Calculate angle between three points (in degrees). B is the vertex. */
export function angleBetween(a: Point2D, b: Point2D, c: Point2D): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dotProduct = ba.x * bc.x + ba.y * bc.y;
  const magnitudeBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magnitudeBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  if (magnitudeBA === 0 || magnitudeBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeBA * magnitudeBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

/**
 * Exponential Moving Average (EMA) smoother.
 * Reduces jitter in landmark positions while maintaining responsiveness.
 *
 * @param current - Current raw value
 * @param previous - Previous smoothed value
 * @param alpha - Smoothing factor (0 = full smoothing/laggy, 1 = no smoothing/raw)
 */
export function ema(current: number, previous: number, alpha: number): number {
  return alpha * current + (1 - alpha) * previous;
}

/** Apply EMA to a 2D point */
export function emaPoint2D(
  current: Point2D,
  previous: Point2D,
  alpha: number,
): Point2D {
  return {
    x: ema(current.x, previous.x, alpha),
    y: ema(current.y, previous.y, alpha),
  };
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Map a value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Calculate velocity between two points over a time delta */
export function velocity2D(
  a: Point2D,
  b: Point2D,
  deltaMs: number,
): Point2D {
  if (deltaMs === 0) return { x: 0, y: 0 };
  return {
    x: (b.x - a.x) / deltaMs,
    y: (b.y - a.y) / deltaMs,
  };
}
