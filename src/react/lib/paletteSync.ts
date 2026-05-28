// ══ PALETTE SYNC — palette picker ↔ documentElement.data-palette ══════════
// Wires the cont → Teme palette selection (localStorage `wv2-palette-theme`)
// to `<html data-palette>`. Mirrors themeSync.ts.
//
// ANDURA PULSE (2026-05-29) — the override palettes are RETIRED. The Pulse
// redesign collapsed the four named palettes into ONE design system (Daniel:
// "doar asta o sa ramana"). The [data-palette="luxury"|"living-body"] token
// blocks in global.css are deleted, so setting data-palette would have NO
// effect. applyPalette therefore CLEARS data-palette for every id; the base
// :root (Pulse light) + [data-theme] light↔dark toggle (themeSync) own the
// look. The PaletteTheme type + STORAGE_KEY are kept so the existing picker +
// persisted selections keep parsing (a stored 'luxury' just resolves to the
// base theme — graceful, no error). A future Phase 2 picker reduction can
// drop the dead ids.
//
// Two entry points (parity themeSync):
//   - `applyInitialPalette()` — synchronous pre-mount read from localStorage.
//   - `<PaletteSync />` — re-applies on mount; live picker updates call
//     `applyPalette(...)` directly (no store subscription — palette lives in
//     plain localStorage, not the zustand settings store).

const STORAGE_KEY = 'wv2-palette-theme';

export type PaletteTheme = 'clasic' | 'living-body' | 'luxury' | 'brain-coach';

/**
 * Clear documentElement.data-palette for any palette id. With the Pulse
 * redesign no palette is an override (the override CSS blocks are retired),
 * so the base :root / [data-theme] light↔dark theme always owns the look.
 * Exported so the picker can apply live on click.
 */
export function applyPalette(_palette: PaletteTheme): void {
  if (typeof document === 'undefined') return;
  delete document.documentElement.dataset.palette;
}

function readPalette(): PaletteTheme {
  // Default = 'brain-coach' (no override → base dark mov look via themeSync),
  // matching SettingsThemes readPaletteTheme + settingsStore DEFAULTS.theme.
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'clasic' || v === 'living-body' || v === 'luxury' || v === 'brain-coach') {
      return v;
    }
  } catch {
    /* localStorage unavailable (SSR / privacy mode) → fall through to default */
  }
  return 'brain-coach';
}

/**
 * Read palette from localStorage synchronously + apply BEFORE React mounts.
 * Prevents a base→palette flash of unstyled content on initial render.
 */
export function applyInitialPalette(): void {
  applyPalette(readPalette());
}

/**
 * React component that re-applies the persisted palette on mount. Picker
 * changes apply live via applyPalette() at click time, so no subscription is
 * needed here — this mainly guards against a missed pre-mount call.
 */
export function PaletteSync(): null {
  applyPalette(readPalette());
  return null;
}
