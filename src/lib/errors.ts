export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
  }
}

export class CameraAccessError extends AppError {
  constructor(reason: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'OverconstrainedError' | string, cause?: Error) {
    let message = 'Failed to access camera.';
    if (reason === 'NotAllowedError') {
      message = 'Camera access was denied. Please allow camera permissions in your browser settings.';
    } else if (reason === 'NotFoundError') {
      message = 'No camera device was found on this system.';
    } else if (reason === 'NotReadableError') {
      message = 'The camera is already in use by another application or tab.';
    }
    
    super(message, `CAMERA_${reason.toUpperCase()}`, 400, true, { reason, cause: cause?.message });
  }
}

export class MediaPipeLoadError extends AppError {
  constructor(cause?: Error) {
    super('Failed to load MediaPipe gesture recognition models from the network.', 'MEDIAPIPE_LOAD_ERROR', 502, true, { cause: cause?.message });
  }
}

// Result Pattern
export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Retry with Exponential Backoff
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 30000, backoffFactor: 2 },
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt) + Math.random() * 500, // jitter
          config.maxDelay,
        );
        config.onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
