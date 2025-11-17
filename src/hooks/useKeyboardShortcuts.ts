/**
 * Keyboard Shortcuts Hook
 *
 * Provides keyboard navigation for efficient workflow.
 * Can be disabled via feature flags.
 */

import { useEffect } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (event: KeyboardEvent) => void;
  description: string;
}

/**
 * Register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!isFeatureEnabled('keyboardShortcuts') || !enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matches =
          event.key === shortcut.key &&
          (shortcut.ctrl === undefined || event.ctrlKey === shortcut.ctrl) &&
          (shortcut.meta === undefined || event.metaKey === shortcut.meta) &&
          (shortcut.shift === undefined || event.shiftKey === shortcut.shift) &&
          (shortcut.alt === undefined || event.altKey === shortcut.alt);

        if (matches) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Common keyboard shortcuts for dialogs
 */
export function useDialogShortcuts(
  onSave?: () => void,
  onClose?: () => void,
  enabled: boolean = true
) {
  const shortcuts: KeyboardShortcut[] = [];

  if (onClose) {
    shortcuts.push({
      key: 'Escape',
      handler: onClose,
      description: 'Close dialog',
    });
  }

  if (onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      meta: true,
      handler: (e) => {
        e.preventDefault();
        onSave();
      },
      description: 'Save changes (Ctrl/Cmd+S)',
    });

    shortcuts.push({
      key: 'Enter',
      ctrl: true,
      meta: true,
      handler: (e) => {
        e.preventDefault();
        onSave();
      },
      description: 'Save and close (Ctrl/Cmd+Enter)',
    });
  }

  useKeyboardShortcuts(shortcuts, enabled);
}

/**
 * Table navigation shortcuts
 */
export function useTableNavigation(
  totalRows: number,
  selectedIndex: number,
  onSelect: (index: number) => void,
  onOpen?: (index: number) => void,
  enabled: boolean = true
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'ArrowDown',
      handler: () => {
        if (selectedIndex < totalRows - 1) {
          onSelect(selectedIndex + 1);
        }
      },
      description: 'Move down',
    },
    {
      key: 'ArrowUp',
      handler: () => {
        if (selectedIndex > 0) {
          onSelect(selectedIndex - 1);
        }
      },
      description: 'Move up',
    },
  ];

  if (onOpen) {
    shortcuts.push({
      key: 'Enter',
      handler: () => {
        if (selectedIndex >= 0) {
          onOpen(selectedIndex);
        }
      },
      description: 'Open selected item',
    });
  }

  useKeyboardShortcuts(shortcuts, enabled);
}

/**
 * Global navigation shortcuts
 */
export function useGlobalShortcuts(
  onRefresh?: () => void,
  onNew?: () => void,
  enabled: boolean = true
) {
  const shortcuts: KeyboardShortcut[] = [];

  if (onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      meta: true,
      handler: (e) => {
        e.preventDefault();
        onRefresh();
      },
      description: 'Refresh data (Ctrl/Cmd+R)',
    });
  }

  if (onNew) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      meta: true,
      handler: (e) => {
        e.preventDefault();
        onNew();
      },
      description: 'Create new (Ctrl/Cmd+N)',
    });
  }

  useKeyboardShortcuts(shortcuts, enabled);
}
