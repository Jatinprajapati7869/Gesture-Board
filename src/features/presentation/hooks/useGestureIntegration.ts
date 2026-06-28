import { useEffect, useRef } from 'react';
import { useGestureStore } from '@/stores/useGestureStore';
import { usePresentationStore } from '@/stores/usePresentationStore';

const COOLDOWN_MS = 1500; // 1.5 second cooldown between slide changes

export function useGestureIntegration() {
  const lastActionTime = useRef<number>(0);
  const { currentGesture } = useGestureStore();
  const { nextPage, prevPage } = usePresentationStore();

  useEffect(() => {
    if (currentGesture.type === 'none' || currentGesture.confidence < 0.7) {
      return;
    }

    const now = performance.now();
    if (now - lastActionTime.current < COOLDOWN_MS) {
      return; // Still in cooldown
    }

    let actionTaken = false;

    // For now, map static gestures to navigation
    // Swipe Right / Peace = Next
    // Swipe Left / Open Palm = Prev
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
      // 'point' and 'pinch' will be used for annotation later
      default:
        break;
    }

    if (actionTaken) {
      lastActionTime.current = now;
    }
  }, [currentGesture, nextPage, prevPage]);
}
