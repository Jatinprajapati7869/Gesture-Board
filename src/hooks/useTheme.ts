import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme store with localStorage persistence.
 *
 * Supports three modes:
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 * - 'system': Follow OS preference via matchMedia
 *
 * The `resolved` field always contains the actual applied theme
 * (never 'system'), making it safe to use in conditionals.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolved: 'dark',

      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        applyThemeToDOM(resolved);
        set({ theme, resolved });
      },

      toggleTheme: () => {
        const current = get().resolved;
        const next = current === 'dark' ? 'light' : 'dark';
        applyThemeToDOM(next);
        set({ theme: next, resolved: next });
      },
    }),
    {
      name: 'gestureboard-theme',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

/** Resolve 'system' theme to an actual light/dark value */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Apply the theme class to the document root */
function applyThemeToDOM(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

/**
 * Hook to initialize theme on mount and listen for system changes.
 * Call once in AppProviders.
 */
export function useThemeInit(): void {
  const { theme } = useThemeStore();

  // Apply theme on mount (handles persisted state from localStorage)
  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyThemeToDOM(resolved);
    useThemeStore.setState({ resolved });
  }, [theme]);

  // Listen for OS theme changes when in 'system' mode
  const handleSystemChange = useCallback(
    (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const resolved = e.matches ? 'dark' : 'light';
        applyThemeToDOM(resolved);
        useThemeStore.setState({ resolved });
      }
    },
    [theme],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', handleSystemChange);
    return () => mq.removeEventListener('change', handleSystemChange);
  }, [handleSystemChange]);
}

/**
 * Convenience hook for components that need theme info.
 * Uses Zustand selectors to prevent unnecessary re-renders.
 */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const resolved = useThemeStore((s) => s.resolved);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return { theme, resolved, setTheme, toggleTheme };
}
