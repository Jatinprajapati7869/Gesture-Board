import { useEffect, useRef } from 'react';
import { useGestureStore } from '@/stores/useGestureStore';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';



export function useGestureIntegration() {
  const lastActionTime = useRef<number>(0);
  const { currentGesture, trackingResult } = useGestureStore();
  const { nextPage, prevPage, currentPage } = usePresentationStore();
  const { presentationCooldownMs, mirrorCamera } = useSettingsStore();
  const { 
    setCursorPosition, 
    startStroke, 
    addPointToStroke, 
    endStroke, 
    isDrawing,
    tool
  } = useAnnotationStore();

  // Handle drawing and cursor updates
  useEffect(() => {
    if (!trackingResult || trackingResult.landmarks.length === 0) {
      if (isDrawing) {
        endStroke(currentPage);
      }
      setCursorPosition(null);
      return;
    }

    // Get the index finger tip (landmark 8)
    const indexTip = trackingResult.landmarks[8];
    
    // Mirror X coordinate if the camera feed is mirrored
    const point = { x: mirrorCamera ? 1 - indexTip.x : indexTip.x, y: indexTip.y };
    setCursorPosition(point);

    if (currentGesture.type === 'pinch') {
      if (!isDrawing && tool === 'pen') {
        startStroke(point);
      } else if (isDrawing && tool === 'pen') {
        addPointToStroke(point);
      }
    } else {
      if (isDrawing) {
        endStroke(currentPage);
      }
    }
  }, [trackingResult, currentGesture.type, currentPage, tool, isDrawing, mirrorCamera, setCursorPosition, startStroke, addPointToStroke, endStroke]);

  // Handle slide navigation with cooldowns
  useEffect(() => {
    if (currentGesture.type === 'none' || currentGesture.confidence < 0.7) {
      return;
    }

    const now = performance.now();
    if (now - lastActionTime.current < presentationCooldownMs) {
      return; // Still in cooldown
    }

    let actionTaken = false;

    switch (currentGesture.type) {
      case 'peace':
      case 'swipe_right':
        nextPage();
        actionTaken = true;
        break;
      case 'open_palm':
      case 'swipe_left':
        prevPage();
        actionTaken = true;
        break;
      default:
        break;
    }

    if (actionTaken) {
      lastActionTime.current = now;
    }
  }, [currentGesture, nextPage, prevPage, presentationCooldownMs]);
}
