// ══ PALETTE SYNC — palette picker ↔ documentElement.data-palette ══════════
// Wires the cont → Teme palette selection (localStorage `wv2-palette-theme`)
// to `<html data-palette>` so the override blocks in global.css can react.
// Mirrors themeSync.ts.
//
// Two of the four palettes are OVERRIDES with their own fixed dark look:
//   - 'luxury'      → data-palette="luxury"
//   - 'living-body' → data-palette="living-body"
// The other two use NO data-palette so the base :root / [data-theme] light↔dark
// toggle (themeSync) owns them:
//   - 'clasic'      → attribute removed
//   - 'brain-coach' → attribute removed (default)
//
// Two entry points (parity themeSync):
//   - `applyInitialPalette()` — synchronous pre-mount read from localStorage to
//     prevent a palette flash on first paint (anti-FOUC).
//   - `<PaletteSync />` — re-applies on mount; live picker updates call
//     `applyPalette(...)` directly (no store subscription — palette lives in
//     plain localStorage, not the zustand settings store).

const STORAGE_KEY = 'wv2-palette-theme';

export type PaletteTheme = 'clasic' | 'living-body' | 'luxury' | 'brain-coach';

const OVERRIDE_PALETTES: ReadonlySet<PaletteTheme> = new Set(['luxury', 'living-body']);

/**
 * Set (or clear) documentElement.data-palette for a palette id. Override
 * palettes get the attribute; clasic/brain-coach remove it so the base
 * light/dark theme applies. Exported so the picker can apply live on click.
 */
export function applyPalette(palette: PaletteTheme): void {
  if (typeof document === 'undefined') return;
  if (OVERRIDE_PALETTES.has(palette)) {
    document.documentElement.dataset.palette = palette;
  } else {
    delete document.documentElement.dataset.palette;
  }
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
