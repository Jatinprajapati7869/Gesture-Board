import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGestureIntegration } from './useGestureIntegration';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

// We need to capture the subscribe callback to trigger it manually
let subscribeCallback: (state: any) => void;
const mockGetState = vi.fn();

vi.mock('@/stores/useGestureStore', () => {
  const mockStore = vi.fn(() => mockGetState());
  (mockStore as any).subscribe = (cb: any) => {
    subscribeCallback = cb;
    return vi.fn(); // unsubscribe
  };
  (mockStore as any).getState = () => mockGetState();
  return { useGestureStore: mockStore };
});

vi.mock('@/stores/usePresentationStore', () => {
  const mockStore = vi.fn();
  (mockStore as any).getState = vi.fn();
  return { usePresentationStore: mockStore };
});

vi.mock('@/stores/useAnnotationStore', () => {
  const mockStore = vi.fn();
  (mockStore as any).getState = vi.fn();
  return { useAnnotationStore: mockStore };
});

vi.mock('@/stores/useSettingsStore', () => {
  const mockStore = vi.fn();
  (mockStore as any).getState = vi.fn();
  return { useSettingsStore: mockStore };
});

describe('useGestureIntegration', () => {
  let mockNextPage: any;
  let mockPrevPage: any;
  let mockSetCursorPosition: any;
  let mockStartStroke: any;
  let mockAddPointToStroke: any;
  let mockEndStroke: any;
  let mockSetTool: any;
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
    mockSetTool = vi.fn();

    // Setup default mock returns for the hooks
    (usePresentationStore as any).mockReturnValue({
      nextPage: mockNextPage,
      prevPage: mockPrevPage,
    });
    (usePresentationStore as any).getState.mockReturnValue({
      currentPage: 1,
    });

    (useSettingsStore as any).mockReturnValue({
      presentationCooldownMs: 500,
      mirrorCamera: false,
    });
    (useSettingsStore as any).getState.mockReturnValue({
      mirrorCamera: false,
    });

    (useAnnotationStore as any).mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
    });
    (useAnnotationStore as any).getState.mockReturnValue({
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      setTool: mockSetTool,
      isDrawing: false,
      tool: 'pointer',
    });

    mockGetState.mockReturnValue({
      currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const triggerState = (trackingResult: any) => {
    subscribeCallback({ trackingResult });
  };

  it('does nothing if no tracking result', () => {
    renderHook(() => useGestureIntegration());
    triggerState(null);
    expect(mockSetCursorPosition).toHaveBeenCalledWith(null);
  });

  it('updates cursor position based on index tip', () => {
    renderHook(() => useGestureIntegration());
    triggerState({
      landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
    });
    expect(mockSetCursorPosition).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });

  it('mirrors cursor position if mirrorCamera is true', () => {
    (useSettingsStore as any).mockReturnValue({ mirrorCamera: true, presentationCooldownMs: 500 });
    (useSettingsStore as any).getState.mockReturnValue({ mirrorCamera: true });
    
    renderHook(() => useGestureIntegration());
    triggerState({
      landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.75 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
    });
    expect(mockSetCursorPosition).toHaveBeenCalledWith({ x: 0.25, y: 0.6 }); // 1 - 0.75 = 0.25
  });

  it('starts stroke on pinch if tool is pen', () => {
    mockGetState.mockReturnValue({
      currentGesture: { type: 'pinch', confidence: 0.9, timestamp: 0 },
    });
    (useAnnotationStore as any).getState.mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      setTool: mockSetTool,
      isDrawing: false,
      tool: 'pen',
    });

    renderHook(() => useGestureIntegration());
    triggerState({
      landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
    });
    expect(mockStartStroke).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });

  it('adds point to stroke on pinch if already drawing and tool is pen', () => {
    mockGetState.mockReturnValue({
      currentGesture: { type: 'pinch', confidence: 0.9, timestamp: 0 },
    });
    (useAnnotationStore as any).getState.mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      setTool: mockSetTool,
      isDrawing: true,
      tool: 'pen',
    });

    renderHook(() => useGestureIntegration());
    triggerState({
      landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
    });
    expect(mockAddPointToStroke).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });

  it('ends stroke if gesture is not pinch and was drawing', () => {
    mockGetState.mockReturnValue({
      currentGesture: { type: 'open_palm', confidence: 0.9, timestamp: 0 },
    });
    (useAnnotationStore as any).getState.mockReturnValue({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      setTool: mockSetTool,
      isDrawing: true,
      tool: 'pen',
    });

    renderHook(() => useGestureIntegration());
    triggerState({ landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) });
    expect(mockEndStroke).toHaveBeenCalledWith(1); // currentPage = 1
  });

  it('triggers nextPage on peace gesture if confidence >= 0.7', () => {
    mockGetState.mockReturnValue({
      currentGesture: { type: 'peace', confidence: 0.8, timestamp: 0 },
    });
    nowSpy.mockReturnValue(1000); // Past cooldown

    renderHook(() => useGestureIntegration());
    triggerState({ landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) });
    expect(mockNextPage).toHaveBeenCalled();
  });

  it('triggers prevPage on open_palm gesture if confidence >= 0.7', () => {
    mockGetState.mockReturnValue({
      currentGesture: { type: 'open_palm', confidence: 0.8, timestamp: 0 },
    });
    nowSpy.mockReturnValue(1000);

    renderHook(() => useGestureIntegration());
    triggerState({ landmarks: Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })) });
    expect(mockPrevPage).toHaveBeenCalled();
  });

  it('respects presentation cooldown', () => {
    const { rerender } = renderHook(() => useGestureIntegration());
    
    // First action
    mockGetState.mockReturnValue({
      currentGesture: { type: 'peace', confidence: 0.8, timestamp: 0 },
    });
    nowSpy.mockReturnValue(1000);
    rerender();
    expect(mockNextPage).toHaveBeenCalledTimes(1);

    // Second action within cooldown (cooldown is 500ms, current time = 1200)
    mockGetState.mockReturnValue({
      currentGesture: { type: 'swipe_right', confidence: 0.8, timestamp: 0 },
    });
    nowSpy.mockReturnValue(1200); 
    rerender();
    expect(mockNextPage).toHaveBeenCalledTimes(1); // Should NOT increase

    // Third action outside cooldown
    mockGetState.mockReturnValue({
      currentGesture: { type: 'peace', confidence: 0.8, timestamp: 1 }, // new reference/timestamp
    });
    nowSpy.mockReturnValue(1600);
    rerender();
    expect(mockNextPage).toHaveBeenCalledTimes(2); // Should increase
  });
  
  it('autoswitches to highlighter on thumbs_up', () => {
    mockGetState.mockReturnValue({
      currentGesture: { type: 'thumbs_up', confidence: 0.9, timestamp: 0 },
    });
    
    let currentTool = 'pointer';
    
    // Set up setTool to dynamically update the mock return
    mockSetTool.mockImplementation((tool: string) => {
      currentTool = tool;
    });

    (useAnnotationStore as any).getState.mockImplementation(() => ({
      setCursorPosition: mockSetCursorPosition,
      startStroke: mockStartStroke,
      addPointToStroke: mockAddPointToStroke,
      endStroke: mockEndStroke,
      setTool: mockSetTool,
      isDrawing: false,
      tool: currentTool,
    }));

    renderHook(() => useGestureIntegration());
    
    triggerState({
      landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i === 8 ? 0.5 : 0, y: i === 8 ? 0.6 : 0, z: 0 })),
    });
    
    expect(mockSetTool).toHaveBeenCalledWith('highlighter');
    expect(mockStartStroke).toHaveBeenCalledWith({ x: 0.5, y: 0.6 });
  });
});
