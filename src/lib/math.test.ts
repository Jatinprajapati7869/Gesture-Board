import { describe, it, expect } from 'vitest';
import {
  distance2D,
  distance3D,
  angleBetween,
  ema,
  emaPoint2D,
  clamp,
  lerp,
  mapRange,
  velocity2D,
} from './math';

describe('math utilities', () => {
  describe('distance2D', () => {
    it('calculates the Euclidean distance between two 2D points', () => {
      expect(distance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance2D({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(5);
    });

    it('returns 0 if points are the same', () => {
      expect(distance2D({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
    });
  });

  describe('distance3D', () => {
    it('calculates the Euclidean distance between two 3D points', () => {
      expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 2, y: 3, z: 6 })).toBe(7);
    });

    it('returns 0 if points are the same', () => {
      expect(distance3D({ x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 })).toBe(0);
    });
  });

  describe('angleBetween', () => {
    it('calculates the angle in degrees between three points', () => {
      // 90 degree angle
      const a = { x: 0, y: 1 };
      const b = { x: 0, y: 0 };
      const c = { x: 1, y: 0 };
      expect(angleBetween(a, b, c)).toBe(90);

      // 180 degree straight line
      const d = { x: -1, y: 0 };
      expect(angleBetween(d, b, c)).toBe(180);
    });

    it('returns 0 if magnitudes are zero', () => {
      expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });
  });

  describe('ema (Exponential Moving Average)', () => {
    it('applies smoothing correctly', () => {
      expect(ema(10, 5, 0.5)).toBe(7.5);
      expect(ema(10, 5, 1)).toBe(10); // alpha 1 = no smoothing
      expect(ema(10, 5, 0)).toBe(5);  // alpha 0 = full smoothing (ignore current)
    });
  });

  describe('emaPoint2D', () => {
    it('applies EMA to both X and Y', () => {
      const current = { x: 10, y: 20 };
      const previous = { x: 0, y: 0 };
      expect(emaPoint2D(current, previous, 0.5)).toEqual({ x: 5, y: 10 });
    });
  });

  describe('clamp', () => {
    it('clamps values within the specified range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp (Linear Interpolation)', () => {
    it('interpolates correctly between two values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('clamps t between 0 and 1', () => {
      expect(lerp(0, 10, 1.5)).toBe(10);
      expect(lerp(0, 10, -0.5)).toBe(0);
    });
  });

  describe('mapRange', () => {
    it('maps a value from one range to another', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(0, 0, 10, 100, 200)).toBe(100);
      expect(mapRange(10, 0, 10, 100, 200)).toBe(200);
    });
  });

  describe('velocity2D', () => {
    it('calculates velocity over time', () => {
      expect(velocity2D({ x: 0, y: 0 }, { x: 10, y: 0 }, 100)).toEqual({ x: 0.1, y: 0 });
      expect(velocity2D({ x: 0, y: 0 }, { x: 0, y: 100 }, 50)).toEqual({ x: 0, y: 2 });
    });

    it('returns 0 velocity if deltaMs is 0', () => {
      expect(velocity2D({ x: 0, y: 0 }, { x: 10, y: 10 }, 0)).toEqual({ x: 0, y: 0 });
    });
  });
});
