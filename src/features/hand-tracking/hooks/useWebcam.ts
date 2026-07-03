import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraAccessError, type AppError } from '@/lib/errors';

interface UseWebcamOptions {
  width?: number;
  height?: number;
  fps?: number;
}

export function useWebcam(options: UseWebcamOptions = {}) {
  const { width = 1280, height = 720, fps = 30 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    setIsInitializing(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: fps },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      if (err instanceof DOMException) {
        setError(new CameraAccessError(err.name, err));
      } else {
        setError(new CameraAccessError('UnknownError', err instanceof Error ? err : undefined));
      }
    } finally {
      setIsInitializing(false);
    }
  }, [width, height, fps]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    videoRef,
    stream,
    error,
    isInitializing,
    startCamera,
    stopCamera,
  };
}
