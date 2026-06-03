// ══ REACTIVE THEME (RN port) — runtime light/dark re-tint ══════════════════
// The PWA keys every component off CSS custom props that flip between :root
// (light) and [data-theme="dark"] (dark). RN/NativeWind has no CSS variables,
// so lib/tokens.ts pre-calc'd BOTH palettes as static hex. This module is the
// runtime selector the web's CSS cascade did for free: a `useTheme()` hook that
// reads the user's choice from the REAL settingsStore (theme: light/dark/auto)
// and returns the matching palette bundle. Components that call useTheme()
// re-render on toggle (zustand selector + RN useColorScheme subscription), so
// flipping the Appearance switch re-tints the UI live.
//
// 'auto' resolves to the OS scheme via NativeWind's useColorScheme (which mirrors
// RN Appearance + the manually-set scheme). The provider (applyThemeColorScheme,
// wired in app/_layout.tsx) keeps NativeWind's colorScheme in lockstep with the
// store so `dark:`-style classes and the token hook flip together.

import { useEffect, useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import { useSettingsStore } from '../../src/react/stores/settingsStore';
import type { Theme } from '../../src/react/stores/settingsStore';
import {
  accent,
  dark,
  light,
  surface,
  surfaceLight,
  status,
  statusLight,
  mixDark,
  mixLight,
  varMapDark,
  varMapLight,
  varColor as varColorBase,
} from './tokens';

/** The full per-theme color bundle a component needs. Core palette fields are
 *  spread in (paper, ink, brick, …) PLUS the grouped surface/status/mix sets so
 *  one `colors` object covers every chrome read. accent is theme-agnostic.
 *  Member types are widened to `string` so the dark + light bundles (whose hex
 *  are `as const` literals) are structurally interchangeable under one type. */
export interface ThemeColors {
  paper: string;
  paper2: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  lineStrong: string;
  brick: string;
  brickDark: string;
  olive: string;
  deep: string;
  aquaInk: string;
  emberInk: string;
  onAccent: string;
  warn: string;
  surface: { base: string; s2: string };
  status: Record<keyof typeof status, string>;
  mix: { brick16: string; brick55: string };
  accent: typeof accent;
  /** Resolve a web CSS-var string against THIS theme (e.g. varColor('--aqua')). */
  varColor: (cssVar: string) => string;
}

const DARK_COLORS: ThemeColors = {
  ...dark,
  surface,
  status,
  mix: mixDark,
  accent,
  varColor: (v) => varColorBase(v, varMapDark),
};

const LIGHT_COLORS: ThemeColors = {
  ...light,
  surface: surfaceLight,
  status: statusLight,
  mix: mixLight,
  accent,
  varColor: (v) => varColorBase(v, varMapLight),
};

/** Resolve the effective dark/light boolean for a stored Theme value. 'auto'
 *  defers to the OS scheme (NativeWind useColorScheme → RN Appearance). */
function resolveIsDark(theme: Theme, systemScheme: 'light' | 'dark' | undefined): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return systemScheme !== 'light'; // 'auto' → follow OS; default to dark
}

/** Reactive theme hook. Re-renders the caller whenever the stored theme or the
 *  OS color scheme changes, returning the matching palette bundle + isDark. */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const theme = useSettingsStore((s) => s.theme);
  const { colorScheme } = useColorScheme();
  const isDark = resolveIsDark(theme, colorScheme);
  const colors = useMemo(() => (isDark ? DARK_COLORS : LIGHT_COLORS), [isDark]);
  return { colors, isDark };
}

/** Imperative palette read for non-reactive call sites (selectors / one-shot
 *  helpers). Prefer `useTheme()` inside components so they re-tint on toggle. */
export function getThemeColors(theme: Theme, systemScheme?: 'light' | 'dark'): ThemeColors {
  return resolveIsDark(theme, systemScheme) ? DARK_COLORS : LIGHT_COLORS;
}

/** Sync NativeWind's runtime colorScheme to the stored theme. Mount ONCE at the
 *  app root so NativeWind `dark:` utilities + the StatusBar follow the store:
 *  'dark'/'light' force the scheme, 'auto' hands control back to the OS
 *  ('system'). Runs on every theme change so the Appearance toggle applies live. */
export function useThemeColorSchemeSync(): void {
  const theme = useSettingsStore((s) => s.theme);
  const { setColorScheme } = useColorScheme();
  useEffect(() => {
    // Non-fatal: NativeWind setColorScheme can throw on some web configs
    // (e.g. missing darkMode:'class'). The useTheme() palette still re-tints
    // from the store, so a sync failure must never white-screen boot.
    try {
      setColorScheme(theme === 'auto' ? 'system' : theme);
    } catch {
      /* ignore — store-driven palette remains authoritative */
    }
  }, [theme, setColorScheme]);
}
