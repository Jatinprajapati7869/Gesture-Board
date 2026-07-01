/**
 * Performance monitoring utilities.
 * FPS counter and frame timing for hand tracking optimization.
 */

export class FPSCounter {
  private frames: number[] = [];
  private startIdx = 0;
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

    // Evict frames outside the window using an index (O(1) per tick)
    const cutoff = now - this.windowMs;
    while (this.startIdx < this.frames.length && this.frames[this.startIdx]! < cutoff) {
      this.startIdx++;
    }

    // Compact the array periodically to prevent unbounded growth
    if (this.startIdx > 120) {
      this.frames = this.frames.slice(this.startIdx);
      this.startIdx = 0;
    }
  }

  /** Get current FPS */
  get fps(): number {
    const len = this.frames.length - this.startIdx;
    if (len < 2) return 0;
    return Math.round(
      ((len - 1) * 1000) /
        (this.frames[this.frames.length - 1]! - this.frames[this.startIdx]!),
    );
  }

  /** Reset the counter */
  reset(): void {
    this.frames = [];
    this.startIdx = 0;
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
