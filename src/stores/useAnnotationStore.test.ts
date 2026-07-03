import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAnnotationStore } from './useAnnotationStore';

describe('useAnnotationStore', () => {
  beforeEach(() => {
    useAnnotationStore.getState().reset();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-1234',
    });
  });

  it('initializes with default state', () => {
    const state = useAnnotationStore.getState();
    expect(state.tool).toBe('pointer');
    expect(state.activeColor).toBe('#ef4444');
    expect(state.isDrawing).toBe(false);
    expect(state.strokes).toEqual({});
  });

  it('ignores startStroke when tool is pointer', () => {
    const store = useAnnotationStore.getState();
    store.setTool('pointer');
    store.startStroke({ x: 0.5, y: 0.5 });
    
    expect(useAnnotationStore.getState().isDrawing).toBe(false);
    expect(useAnnotationStore.getState().currentStroke).toBeNull();
  });

  it('creates a pen stroke properly', () => {
    const store = useAnnotationStore.getState();
    store.setTool('pen');
    store.startStroke({ x: 0.5, y: 0.5 });
    
    const state = useAnnotationStore.getState();
    expect(state.isDrawing).toBe(true);
    expect(state.currentStroke).toEqual({
      id: 'test-uuid-1234',
      color: '#ef4444',
      width: 4,
      points: [{ x: 0.5, y: 0.5 }],
      isHighlighter: false,
    });
  });

  it('creates a highlighter stroke with transparency and thickness', () => {
    const store = useAnnotationStore.getState();
    store.setTool('highlighter');
    store.startStroke({ x: 0.5, y: 0.5 });
    
    const state = useAnnotationStore.getState();
    expect(state.isDrawing).toBe(true);
    expect(state.currentStroke).toEqual({
      id: 'test-uuid-1234',
      color: '#ef444480', // 50% opacity added
      width: 16, // 4 * 4
      points: [{ x: 0.5, y: 0.5 }],
      isHighlighter: true,
    });
  });

  it('adds points to existing stroke', () => {
    const store = useAnnotationStore.getState();
    store.setTool('pen');
    store.startStroke({ x: 0.1, y: 0.1 });
    store.addPointToStroke({ x: 0.2, y: 0.2 });
    
    const state = useAnnotationStore.getState();
    expect(state.currentStroke?.points.length).toBe(2);
    expect(state.currentStroke?.points[1]).toEqual({ x: 0.2, y: 0.2 });
  });

  it('ignores addPointToStroke if not drawing', () => {
    const store = useAnnotationStore.getState();
    store.addPointToStroke({ x: 0.2, y: 0.2 });
    expect(useAnnotationStore.getState().currentStroke).toBeNull();
  });

  it('ends stroke and saves to specific page', () => {
    const store = useAnnotationStore.getState();
    store.setTool('pen');
    store.startStroke({ x: 0.1, y: 0.1 });
    store.endStroke(2); // save to page 2
    
    const state = useAnnotationStore.getState();
    expect(state.isDrawing).toBe(false);
    expect(state.currentStroke).toBeNull();
    expect(state.strokes[2]).toBeDefined();
    expect(state.strokes[2].length).toBe(1);
    expect(state.strokes[2][0].id).toBe('test-uuid-1234');
  });

  it('clears specific page without affecting others', () => {
    const store = useAnnotationStore.getState();
    store.setTool('pen');
    
    // Draw on page 1
    store.startStroke({ x: 0.1, y: 0.1 });
    store.endStroke(1);
    
    // Draw on page 2
    store.startStroke({ x: 0.2, y: 0.2 });
    store.endStroke(2);
    
    // Clear page 1
    store.clearPage(1);
    
    const state = useAnnotationStore.getState();
    expect(state.strokes[1]).toBeUndefined();
    expect(state.strokes[2]).toBeDefined();
  });
});
