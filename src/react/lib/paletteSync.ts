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

// ── PULSE ACCENT PICKER (2026-05-29) ──────────────────────────────────────
// The retired multi-palette system is replaced by a single Pulse accent
// picker (Cont > Appearance): the user swaps the PRIMARY accent (--brick) at
// runtime among the four Pulse hues. The app keys every accent off --brick
// (global.css), so overriding --brick on documentElement re-tints the whole
// app live. Persisted in the settings store ('wv2-settings-store'.accent);
// applied pre-mount here (anti-FOUC) + re-applied by PaletteSync on mount.
// 'volt' = the theme default (no override needed) — clears any stale override.
import type { Accent } from '../stores/settingsStore';

const SETTINGS_KEY = 'wv2-settings-store';

// Raw Pulse hues (mockup index.html <style>). Volt is the theme default so it
// clears the override; the others set --brick on documentElement.
const ACCENT_HEX: Record<Exclude<Accent, 'volt'>, string> = {
  aqua: '#4fd6e8',
  ember: '#ff7d52',
  violet: '#a98bff',
};

/**
 * Override the primary accent (--brick) on documentElement. 'volt' (default)
 * clears the override so the base [data-theme] token owns the look. Exported
 * so the Appearance picker can apply live on click.
 *
 * Beyond --brick (which re-tints text/icons/borders), the picker must also
 * re-derive --grad-pulse — the PRIMARY gradient (global.css defines it ONCE as
 * volt→aqua) that paints every gradient CTA, selected toggle, avatar ring and
 * notification day-pill. Without this, picking Ember/Violet left every gradient
 * surface stuck on volt-green→aqua while only --brick-keyed elements re-tinted.
 */
export function applyAccent(accent: Accent): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (accent === 'volt') {
    el.style.removeProperty('--brick');
    el.style.removeProperty('--grad-pulse');
    return;
  }
  const hex = ACCENT_HEX[accent];
  el.style.setProperty('--brick', hex);
  // Re-tint the primary gradient from the chosen hue → --aqua (same 135deg shape
  // as the base --grad-pulse), so gradient CTAs follow the accent, not just brick.
  el.style.setProperty(
    '--grad-pulse',
    `linear-gradient(135deg, ${hex} 0%, color-mix(in oklab, ${hex} 72%, var(--aqua)) 100%)`,
  );
}

function readAccent(): Accent {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { accent?: Accent } };
      const a = parsed.state?.accent;
      if (a === 'volt' || a === 'aqua' || a === 'ember' || a === 'violet') return a;
    }
  } catch {
    /* localStorage unavailable / parse failure → default accent */
  }
  return 'volt';
}

/** Read the persisted accent + apply BEFORE React mounts (anti-FOUC). */
export function applyInitialAccent(): void {
  applyAccent(readAccent());
}

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
  // Pulse accent picker — apply the persisted primary accent pre-mount too.
  applyInitialAccent();
}

/**
 * React component that re-applies the persisted palette on mount. Picker
 * changes apply live via applyPalette() at click time, so no subscription is
 * needed here — this mainly guards against a missed pre-mount call.
 */
export function PaletteSync(): null {
  applyPalette(readPalette());
  applyAccent(readAccent());
  return null;
}
