import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GestureSensitivity = 'low' | 'medium' | 'high';

interface SettingsState {
  // Camera & Tracking
  mirrorCamera: boolean;
  gestureSensitivity: GestureSensitivity;
  showConfidence: boolean;
  
  // Presentation
  presentationCooldownMs: number;
  
  // Actions
  setMirrorCamera: (mirror: boolean) => void;
  setGestureSensitivity: (sensitivity: GestureSensitivity) => void;
  setShowConfidence: (show: boolean) => void;
  setPresentationCooldownMs: (ms: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  mirrorCamera: true,
  gestureSensitivity: 'medium' as GestureSensitivity,
  showConfidence: true,
  presentationCooldownMs: 1500,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      
      setMirrorCamera: (mirrorCamera) => set({ mirrorCamera }),
      setGestureSensitivity: (gestureSensitivity) => set({ gestureSensitivity }),
      setShowConfidence: (showConfidence) => set({ showConfidence }),
      setPresentationCooldownMs: (presentationCooldownMs) => set({ presentationCooldownMs }),
      
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'gestureboard-settings',
    }
  )
);
