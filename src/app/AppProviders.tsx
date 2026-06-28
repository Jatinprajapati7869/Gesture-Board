import { type ReactNode } from 'react';
import { useThemeInit } from '@/hooks/useTheme';
import { ToastContainer } from '@/components/feedback/ToastContainer';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper.
 * Initializes theme system and renders global UI elements
 * (toasts, modals, etc.) that exist outside the page flow.
 */
function AppProviders({ children }: AppProvidersProps) {
  // Initialize theme (applies class to <html>, listens for OS changes)
  useThemeInit();

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

export { AppProviders };
