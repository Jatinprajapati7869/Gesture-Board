import { useState } from 'react';
import {
  Hand,
  Presentation,
  Settings,
  Layers,
  Gauge,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tooltip, Kbd } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { APP } from '@/lib/constants';

export type NavPage = 'home' | 'present' | 'gestures' | 'canvas' | 'settings' | 'onboarding';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

interface NavItem {
  id: NavPage;
  label: string;
  icon: typeof Hand;
  shortcut?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: Gauge, shortcut: '1' },
  { id: 'present', label: 'Present', icon: Presentation, shortcut: '2' },
  { id: 'gestures', label: 'Gestures', icon: Hand, shortcut: '3' },
  { id: 'canvas', label: 'Canvas', icon: Layers, shortcut: '4' },
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: '5' },
];

/**
 * Collapsible sidebar navigation.
 * Collapsed state shows icons only with tooltips.
 * Expanded state shows labels and keyboard shortcuts.
 */
function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { resolved, toggleTheme } = useTheme();

  return (
    <aside
      className={cn(
        'flex flex-col h-full',
        'bg-[var(--gb-sidebar-bg)] border-r border-[var(--gb-sidebar-border)]',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 h-14 border-b border-[var(--gb-sidebar-border)]',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 shrink-0">
          <Hand className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--gb-text-primary)] truncate">
            {APP.NAME}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          const button = (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg',
                'text-sm font-medium transition-all duration-150',
                'focus-ring cursor-pointer',
                collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-10',
                isActive
                  ? 'bg-brand-500/10 text-brand-500'
                  : 'text-[var(--gb-text-secondary)] hover:bg-[var(--gb-hover-bg)] hover:text-[var(--gb-text-primary)]',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
                </>
              )}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} content={item.label} side="right">
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* Bottom actions */}
      <div className="py-3 px-2 space-y-1 border-t border-[var(--gb-sidebar-border)]">
        {/* Theme toggle */}
        <Tooltip
          content={resolved === 'dark' ? 'Light mode' : 'Dark mode'}
          side={collapsed ? 'right' : 'top'}
        >
          <button
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg',
              'text-sm font-medium transition-all duration-150',
              'text-[var(--gb-text-secondary)] hover:bg-[var(--gb-hover-bg)] hover:text-[var(--gb-text-primary)]',
              'focus-ring cursor-pointer',
              collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-10',
            )}
          >
            {resolved === 'dark' ? (
              <Sun className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <Moon className="h-[18px] w-[18px] shrink-0" />
            )}
            {!collapsed && <span className="flex-1 text-left">Theme</span>}
          </button>
        </Tooltip>

        {/* Collapse toggle */}
        <Tooltip
          content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          side={collapsed ? 'right' : 'top'}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg',
              'text-sm font-medium transition-all duration-150',
              'text-[var(--gb-text-secondary)] hover:bg-[var(--gb-hover-bg)] hover:text-[var(--gb-text-primary)]',
              'focus-ring cursor-pointer',
              collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-10',
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
            )}
            {!collapsed && <span className="flex-1 text-left">Collapse</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

export { Sidebar, type SidebarProps };
