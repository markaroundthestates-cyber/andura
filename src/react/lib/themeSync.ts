// ══ THEME SYNC — settings-store ↔ documentElement.data-theme ══════════════
// Wires `useSettingsStore.theme` to `<html data-theme>` so CSS variants in
// `global.css` can react. Resolves 'auto' via prefers-color-scheme media query.
//
// Two entry points:
//   - `applyInitialTheme()` — synchronous pre-mount read from localStorage to
//     prevent FOUC light→dark flash.
//   - `<ThemeSync />` — React component that subscribes to store changes +
//     handles prefers-color-scheme transitions when theme is 'auto'.

import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { Theme } from '../stores/settingsStore';

const STORE_KEY = 'wv2-settings-store';

function resolveAutoTheme(): 'light' | 'dark' {
  // No matchMedia (SSR / old browser) → fall back to dark (mov default look).
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  const actual: 'light' | 'dark' = theme === 'auto' ? resolveAutoTheme() : theme;
  document.documentElement.dataset.theme = actual;
}

/**
 * Read theme from localStorage synchronously + apply BEFORE React mounts.
 * Prevents light→dark flash of unstyled content on initial render.
 */
export function applyInitialTheme(): void {
  // Default = 'dark' (Brain Coach mov look, CEO pick 2026-05-27). Falls back to
  // dark for a fresh user (no persisted store) or a parse failure, matching the
  // settingsStore DEFAULTS.theme. A user who picked light keeps it (persisted).
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      applyTheme('dark');
      return;
    }
    const parsed = JSON.parse(raw) as { state?: { theme?: Theme } };
    const theme = parsed.state?.theme ?? 'dark';
    applyTheme(theme);
  } catch {
    applyTheme('dark');
  }
}

/**
 * React component that keeps documentElement data-theme in sync with the
 * persisted store. Also listens to prefers-color-scheme when theme is 'auto'.
 */
export function ThemeSync(): null {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (): void => applyTheme('auto');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);

  return null;
}
