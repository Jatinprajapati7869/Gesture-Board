import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGestureIntegration } from './useGestureIntegration';
import { useGestureStore } from '@/stores/useGestureStore';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

// Mock the zustand stores as functions
vi.mock('@/stores/useGestureStore', () => ({
  useGestureStore: vi.fn(),
}));

vi.mock('@/stores/usePresentationStore', () => ({
  usePresentationStore: vi.fn(),
}));

vi.mock('@/stores/useAnnotationStore', () => ({
  useAnnotationStore: vi.fn(),
}));

vi.mock('@/stores/useSettingsStore', () => ({
  useSettingsStore: vi.fn(),
}));

describe('useGestureIntegration', () => {
  let mockNextPage: any;
  let mockPrevPage: any;
  let mockSetCursorPosition: any;
  let mockStartStroke: any;
  let mockAddPointToStroke: any;
  let mockEndStroke: any;
  let nowSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);

    mockNextPage = vi.fn();
    mockPrevPage = vi.fn();
    mockSetCursorPosition = vi.fn();
    mockStartStroke = vi.fn();
    mockAddPointToStroke = vi.fn();
    mockEndStroke = vi.fn();

    // Setup default mock returns for the hooks
    (usePresentationStore as any).mockReturnValue({
      nextPage: mockNextPage,
      prevPage: mockPrevPage,
      currentPage: 1,
    });

    (useSettingsStore as any).mockReturnValue({
      presentationCooldownMs: 500,
      mirrorCamera: false,
    });

    (useAnnotationStore as any).mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      isDrawing: false,
      tool: 'pointer',
    });

    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
      trackingResult: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing if no tracking result', () => {
    renderHook(() => useGestureIntegration());
    expect(mockSetCursorPosition).toHaveBeenCalledWith(null);
  });

  it('updates cursor position based on index tip', () => {
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
      trackingResult: {
        landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
      },
    });

    renderHook(() => useGestureIntegration());
    expect(mockSetCursorPosition).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });

  it('mirrors cursor position if mirrorCamera is true', () => {
    (useSettingsStore as any).mockReturnValue({ mirrorCamera: true, presentationCooldownMs: 500 });
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
      trackingResult: {
        landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.75 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
      },
    });

    renderHook(() => useGestureIntegration());
    expect(mockSetCursorPosition).toHaveBeenCalledWith({ x: 0.25, y: 0.6 }); // 1 - 0.75 = 0.25
  });

  it('starts stroke on pinch if tool is pen', () => {
    (useAnnotationStore as any).mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      isDrawing: false,
      tool: 'pen',
    });
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'pinch', confidence: 0.9, timestamp: 0 },
      trackingResult: {
        landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
      },
    });

    renderHook(() => useGestureIntegration());
    expect(mockStartStroke).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });

  it('adds point to stroke on pinch if already drawing and tool is pen', () => {
    (useAnnotationStore as any).mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      isDrawing: true,
      tool: 'pen',
    });
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'pinch', confidence: 0.9, timestamp: 0 },
      trackingResult: {
        landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
      },
    });

    renderHook(() => useGestureIntegration());
    expect(mockAddPointToStroke).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });

  it('ends stroke if gesture is not pinch and was drawing', () => {
    (useAnnotationStore as any).mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      isDrawing: true,
      tool: 'pen',
    });
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'open_palm', confidence: 0.9, timestamp: 0 },
      trackingResult: { landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) },
    });

    renderHook(() => useGestureIntegration());
    expect(mockEndStroke).toHaveBeenCalledWith(1); // currentPage = 1
  });

  it('triggers nextPage on peace gesture if confidence >= 0.7', () => {
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'peace', confidence: 0.8, timestamp: 0 },
      trackingResult: { landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) },
    });

    nowSpy.mockReturnValue(1000); // Past cooldown
    renderHook(() => useGestureIntegration());
    expect(mockNextPage).toHaveBeenCalled();
  });

  it('triggers prevPage on open_palm gesture if confidence >= 0.7', () => {
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'open_palm', confidence: 0.8, timestamp: 0 },
      trackingResult: { landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) },
    });

    nowSpy.mockReturnValue(1000);
    renderHook(() => useGestureIntegration());
    expect(mockPrevPage).toHaveBeenCalled();
  });

  it('respects presentation cooldown', () => {
    const { rerender } = renderHook(() => useGestureIntegration());
    
    // First action
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'peace', confidence: 0.8, timestamp: 0 },
      trackingResult: { landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) },
    });
    nowSpy.mockReturnValue(1000);
    rerender();
    expect(mockNextPage).toHaveBeenCalledTimes(1);

    // Second action within cooldown (cooldown is 500ms, current time = 1200)
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'swipe_right', confidence: 0.8, timestamp: 0 },
      trackingResult: { landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) },
    });
    nowSpy.mockReturnValue(1200); 
    rerender();
    expect(mockNextPage).toHaveBeenCalledTimes(1); // Should NOT increase

    // Third action outside cooldown
    (useGestureStore as any).mockReturnValue({
      currentGesture: { type: 'peace', confidence: 0.8, timestamp: 1 }, // new reference/timestamp
      trackingResult: { landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) },
    });
    nowSpy.mockReturnValue(1600);
    rerender();
    expect(mockNextPage).toHaveBeenCalledTimes(2); // Should increase
  });
});
