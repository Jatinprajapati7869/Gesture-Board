import { type ReactNode, useState, useCallback, useEffect } from 'react';
import { Sidebar, type NavPage } from './Sidebar';
import { StatusBar } from './StatusBar';


interface AppLayoutProps {
  children: (currentPage: NavPage, navigate: (page: NavPage) => void) => ReactNode;
}

/**
 * Root layout component.
 * Manages the sidebar, main content area, and status bar.
 * Handles keyboard navigation (1-5 for page switching).
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');

  const handleNavigate = useCallback((page: NavPage) => {
    setCurrentPage(page);
  }, []);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const pageMap: Record<string, NavPage> = {
      '1': 'home',
      '2': 'present',
      '3': 'gestures',
      '4': 'settings',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const page = pageMap[e.key];
      if (page) {
        setCurrentPage(page);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--gb-bg)]">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children(currentPage, handleNavigate)}</main>

        {/* Status bar */}
        <StatusBar />
      </div>
    </div>
  );
}

