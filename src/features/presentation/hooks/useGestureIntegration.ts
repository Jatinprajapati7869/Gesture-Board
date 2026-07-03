import { useEffect, useRef } from 'react';
import { useGestureStore } from '@/stores/useGestureStore';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';



export function useGestureIntegration() {
  const lastActionTime = useRef<number>(0);
  const { currentGesture } = useGestureStore();
  const { nextPage, prevPage } = usePresentationStore();
  const { presentationCooldownMs } = useSettingsStore();
  const { 
    setCursorPosition, 
    startStroke, 
    addPointToStroke, 
    endStroke
  } = useAnnotationStore();

  useEffect(() => {
    const unsubscribe = useGestureStore.subscribe((state) => {
      const trackingResult = state.trackingResult;
      
      if (!trackingResult || trackingResult.landmarks.length === 0) {
        if (useAnnotationStore.getState().isDrawing) {
          endStroke(usePresentationStore.getState().currentPage);
        }
        setCursorPosition(null);
        return;
      }

      // Get the index finger tip (landmark 8)
      const indexTip = trackingResult.landmarks[8];
      
      // Mirror X coordinate if the camera feed is mirrored
      const point = { x: useSettingsStore.getState().mirrorCamera ? 1 - indexTip.x : indexTip.x, y: indexTip.y };
      setCursorPosition(point);

      const currentType = useGestureStore.getState().currentGesture.type;
      const { isDrawing, tool } = useAnnotationStore.getState();

      if (currentType === 'pinch' || currentType === 'thumbs_up') {
        const expectedTool = currentType === 'thumbs_up' ? 'highlighter' : 'pen';
        
        // Auto-switch tool if using the specific gesture
        if (tool !== expectedTool && currentType === 'thumbs_up') {
          useAnnotationStore.getState().setTool('highlighter');
        }

        // We check the tool again because we might have just updated it, or we might be in 'pinch' 
        // where we only draw if the tool is already 'pen' (to avoid accidental drawing when pointing).
        const currentTool = useAnnotationStore.getState().tool;

        if (currentTool === expectedTool) {
          if (!isDrawing) {
            startStroke(point);
          } else {
            addPointToStroke(point);
          }
        }
      } else {
        if (isDrawing) {
          endStroke(usePresentationStore.getState().currentPage);
        }
      }
    });

    return () => unsubscribe();
  }, [setCursorPosition, startStroke, addPointToStroke, endStroke]);

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
