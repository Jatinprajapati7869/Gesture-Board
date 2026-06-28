import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebcamOptions {
  width?: number;
  height?: number;
  fps?: number;
}

export function useWebcam(options: UseWebcamOptions = {}) {
  const { width = 1280, height = 720, fps = 30 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const startCamera = useCallback(async () => {
    if (stream) return;
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

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to access camera'));
    } finally {
      setIsInitializing(false);
    }
  }, [width, height, fps, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    stream,
    error,
    isInitializing,
    startCamera,
    stopCamera,
  };
}
