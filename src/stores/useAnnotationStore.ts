import { create } from 'zustand';
import type { Point, Stroke } from '@/types';

export type AnnotationTool = 'pointer' | 'pen' | 'eraser';

interface AnnotationState {
  tool: AnnotationTool;
  activeColor: string;
  strokeWidth: number;
  
  // Page index -> Array of strokes
  strokes: Record<number, Stroke[]>;
  currentStroke: Stroke | null;
  cursorPosition: Point | null; // Normalized 0-1
  isDrawing: boolean;
  
  // Actions
  setTool: (tool: AnnotationTool) => void;
  setColor: (color: string) => void;
  setCursorPosition: (pos: Point | null) => void;
  
  startStroke: (point: Point) => void;
  addPointToStroke: (point: Point) => void;
  endStroke: (page: number) => void;
  
  clearPage: (page: number) => void;
  reset: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  tool: 'pointer',
  activeColor: '#ef4444', // Red by default
  strokeWidth: 4,
  
  strokes: {},
  currentStroke: null,
  cursorPosition: null,
  isDrawing: false,
  
  setTool: (tool) => set({ tool }),
  setColor: (activeColor) => set({ activeColor }),
  setCursorPosition: (cursorPosition) => set({ cursorPosition }),
  
  startStroke: (point) => {
    const { tool, activeColor, strokeWidth } = get();
    if (tool !== 'pen') return;
    
    set({
      isDrawing: true,
      currentStroke: {
        id: crypto.randomUUID(),
        color: activeColor,
        width: strokeWidth,
        points: [point]
      },
      cursorPosition: point
    });
  },
  
  addPointToStroke: (point) => {
    const { isDrawing, currentStroke } = get();
    if (!isDrawing || !currentStroke) return;
    
    set({
      cursorPosition: point,
      currentStroke: {
        ...currentStroke,
        points: [...currentStroke.points, point]
      }
    });
  },
  
  endStroke: (page) => {
    const { isDrawing, currentStroke, strokes } = get();
    if (!isDrawing || !currentStroke) return;
    
    const pageStrokes = strokes[page] || [];
    
    set({
      isDrawing: false,
      currentStroke: null,
      strokes: {
        ...strokes,
        [page]: [...pageStrokes, currentStroke]
      }
    });
  },
  
  clearPage: (page) => {
    const { strokes } = get();
    const newStrokes = { ...strokes };
    delete newStrokes[page];
    set({ strokes: newStrokes });
  },
  
  reset: () => set({ 
    strokes: {}, 
    currentStroke: null, 
    cursorPosition: null, 
    isDrawing: false 
  })
}));
