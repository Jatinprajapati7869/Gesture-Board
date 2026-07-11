import { describe, it, expect, beforeEach } from 'vitest';
import { usePresentationStore } from './usePresentationStore';
import type { PresentationFile } from '@/types';

describe('usePresentationStore', () => {
  beforeEach(() => {
    usePresentationStore.getState().reset();
  });

  const mockFile: PresentationFile = {
    name: 'test.pdf',
    totalPages: 3,
    fileSize: 1024,
    loadedAt: 1,
  };

  it('initializes with default state', () => {
    const state = usePresentationStore.getState();
    expect(state.file).toBeNull();
    expect(state.currentPage).toBe(1);
    expect(state.pdfDocument).toBeNull();
  });

  it('sets file correctly', () => {
    usePresentationStore.getState().setFile(mockFile);
    expect(usePresentationStore.getState().file).toEqual(mockFile);
  });

  it('sets total pages when file exists', () => {
    usePresentationStore.getState().setFile(mockFile);
    usePresentationStore.getState().setTotalPages(5);
    expect(usePresentationStore.getState().file?.totalPages).toBe(5);
  });

  it('ignores setTotalPages when no file exists', () => {
    usePresentationStore.getState().setTotalPages(5);
    expect(usePresentationStore.getState().file).toBeNull();
  });

  it('navigates to next page respecting boundaries', () => {
    usePresentationStore.getState().setFile(mockFile); // totalPages = 3
    
    usePresentationStore.getState().nextPage();
    expect(usePresentationStore.getState().currentPage).toBe(2);
    
    usePresentationStore.getState().nextPage();
    expect(usePresentationStore.getState().currentPage).toBe(3);
    
    // Should not exceed total pages
    usePresentationStore.getState().nextPage();
    expect(usePresentationStore.getState().currentPage).toBe(3);
  });

  it('navigates to previous page respecting boundaries', () => {
    usePresentationStore.getState().setFile(mockFile);
    usePresentationStore.getState().goToPage(2);
    
    usePresentationStore.getState().prevPage();
    expect(usePresentationStore.getState().currentPage).toBe(1);
    
    // Should not go below page 1
    usePresentationStore.getState().prevPage();
    expect(usePresentationStore.getState().currentPage).toBe(1);
  });

  it('goes to specific page respecting boundaries', () => {
    usePresentationStore.getState().setFile(mockFile); // totalPages = 3
    
    usePresentationStore.getState().goToPage(2);
    expect(usePresentationStore.getState().currentPage).toBe(2);
    
    // Out of bounds - should be ignored
    usePresentationStore.getState().goToPage(5);
    expect(usePresentationStore.getState().currentPage).toBe(2);
    
    usePresentationStore.getState().goToPage(0);
    expect(usePresentationStore.getState().currentPage).toBe(2);
  });

  it('resets state correctly', () => {
    usePresentationStore.getState().setFile(mockFile);
    usePresentationStore.getState().goToPage(2);
    
    usePresentationStore.getState().reset();
    
    const state = usePresentationStore.getState();
    expect(state.file).toBeNull();
    expect(state.currentPage).toBe(1);
    expect(state.pdfDocument).toBeNull();
  });
});
