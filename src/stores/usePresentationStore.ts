import { create } from 'zustand';
import type { PresentationFile } from '@/types';

interface PresentationState {
  file: PresentationFile | null;
  currentPage: number;
  pdfDocument: any | null; // We use any here to avoid tying the store tightly to pdfjs-dist types
  
  // Actions
  setFile: (file: PresentationFile | null) => void;
  setPdfDocument: (doc: any | null) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  file: null,
  currentPage: 1,
  pdfDocument: null,
  
  setFile: (file) => set({ file }),
  setPdfDocument: (pdfDocument) => set({ pdfDocument }),
  
  nextPage: () => {
    const { currentPage, file } = get();
    if (file && currentPage < file.totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },
  
  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
  
  goToPage: (page) => {
    const { file } = get();
    if (file && page >= 1 && page <= file.totalPages) {
      set({ currentPage: page });
    }
  },
  
  reset: () => set({ file: null, currentPage: 1, pdfDocument: null }),
}));
