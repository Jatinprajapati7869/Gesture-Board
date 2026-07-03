import { FilesetResolver, HandLandmarker, type HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { HAND_TRACKING } from '@/lib/constants';
import { withRetry, MediaPipeLoadError } from '@/lib/errors';

class HandLandmarkerService {
  private handLandmarker: HandLandmarker | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.handLandmarker) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await withRetry(
          async () => {
            const vision = await FilesetResolver.forVisionTasks(
              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
            );

            this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: '/models/hand_landmarker.task',
                delegate: 'GPU',
              },
              runningMode: 'VIDEO',
              numHands: HAND_TRACKING.MAX_HANDS,
              minHandDetectionConfidence: HAND_TRACKING.MIN_DETECTION_CONFIDENCE,
              minHandPresenceConfidence: HAND_TRACKING.MIN_TRACKING_CONFIDENCE,
              minTrackingConfidence: HAND_TRACKING.MIN_TRACKING_CONFIDENCE,
            });
          },
          {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 5000,
            backoffFactor: 2,
            onRetry: (attempt, error) => console.warn(`Retrying MediaPipe load (attempt ${attempt}): ${error.message}`),
          }
        );
      } catch (error) {
        console.error('Failed to initialize HandLandmarker after retries:', error);
        throw new MediaPipeLoadError(error instanceof Error ? error : undefined);
      }
    })();

    return this.initPromise;
  }

  detectForVideo(video: HTMLVideoElement, timestamp: number): HandLandmarkerResult | null {
    if (!this.handLandmarker) return null;
    return this.handLandmarker.detectForVideo(video, timestamp);
  }

  close() {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
  }
}

// Export as a singleton
export const handLandmarkerService = new HandLandmarkerService();
