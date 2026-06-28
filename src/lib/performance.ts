/**
 * Performance monitoring utilities.
 * FPS counter and frame timing for hand tracking optimization.
 */

export class FPSCounter {
  private frames: number[] = [];
  private readonly windowMs: number;

  /**
   * @param windowMs - Time window to average FPS over (default 1000ms)
   */
  constructor(windowMs = 1000) {
    this.windowMs = windowMs;
  }

  /** Record a frame tick. Call once per frame. */
  tick(): void {
    const now = performance.now();
    this.frames.push(now);

    // Evict frames outside the window
    const cutoff = now - this.windowMs;
    while (this.frames.length > 0 && this.frames[0]! < cutoff) {
      this.frames.shift();
    }
  }

  /** Get current FPS */
  get fps(): number {
    if (this.frames.length < 2) return 0;
    return Math.round(
      ((this.frames.length - 1) * 1000) /
        (this.frames[this.frames.length - 1]! - this.frames[0]!),
    );
  }

  /** Reset the counter */
  reset(): void {
    this.frames = [];
  }
}

/**
 * Simple frame timer for measuring operation latency.
 */
export class FrameTimer {
  private startTime = 0;

  start(): void {
    this.startTime = performance.now();
  }

  /** Returns elapsed time in milliseconds */
  elapsed(): number {
    return performance.now() - this.startTime;
  }
}
