import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DemoControls } from './DemoControls';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import type { PresentationFile } from '@/types';

describe('DemoControls', () => {
  const mockFile: PresentationFile = {
    name: 'demo.pdf',
    totalPages: 3,
    fileSize: 1024,
    loadedAt: 1,
  };

  beforeEach(() => {
    usePresentationStore.getState().reset();
    useAnnotationStore.getState().reset();
    usePresentationStore.getState().setFile(mockFile);
    usePresentationStore.getState().goToPage(2);
  });

  it('moves slides and switches tools in demo mode', () => {
    render(<DemoControls />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(usePresentationStore.getState().currentPage).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(usePresentationStore.getState().currentPage).toBe(2);

    fireEvent.click(screen.getByRole('button', { name: /pen/i }));
    expect(useAnnotationStore.getState().tool).toBe('pen');

    fireEvent.click(screen.getByRole('button', { name: /highlight/i }));
    expect(useAnnotationStore.getState().tool).toBe('highlighter');
  });

  it('clears the current slide from the demo controls', () => {
    const store = useAnnotationStore.getState();
    store.setTool('pen');
    store.startStroke({ x: 0.2, y: 0.2 });
    store.endStroke(2);

    render(<DemoControls />);

    fireEvent.click(screen.getByRole('button', { name: /clear current slide/i }));
    expect(useAnnotationStore.getState().strokes[2]).toBeUndefined();
  });
});