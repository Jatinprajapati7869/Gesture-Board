import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FPSCounter, FrameTimer } from './performance';

describe('FPSCounter', () => {
  let counter: FPSCounter;
  let nowSpy: any;

  beforeEach(() => {
    counter = new FPSCounter(100); // 100ms window
    nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates 0 FPS initially', () => {
    expect(counter.fps).toBe(0);
  });

  it('calculates FPS correctly for steady frames', () => {
    for (let i = 0; i < 11; i++) {
      nowSpy.mockReturnValue(i * 10);
      counter.tick();
    }
    expect(counter.fps).toBe(100);
  });

  it('evicts old frames outside the window', () => {
    for (let i = 0; i <= 15; i++) {
      nowSpy.mockReturnValue(i * 10);
      counter.tick();
    }
    expect(counter.fps).toBe(100);
  });

  it('compacts array periodically', () => {
    for (let i = 0; i <= 300; i++) {
      nowSpy.mockReturnValue(i);
      counter.tick();
    }
    expect(counter.fps).toBe(1000);
  });

  it('resets correctly', () => {
    counter.tick();
    nowSpy.mockReturnValue(10);
    counter.tick();
    expect(counter.fps).toBeGreaterThan(0);

    counter.reset();
    expect(counter.fps).toBe(0);
  });
});

describe('FrameTimer', () => {
  let nowSpy: any;

  beforeEach(() => {
    nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('measures elapsed time correctly', () => {
    const timer = new FrameTimer();
    timer.start();
    
    nowSpy.mockReturnValue(50);
    expect(timer.elapsed()).toBe(50);
    
    nowSpy.mockReturnValue(120);
    expect(timer.elapsed()).toBe(120);
  });
});
