// ══ PULSE FONT LOADER (RN port) ════════════════════════════════════════════
// The PWA self-hosts three Pulse families via @fontsource (.woff2) — see
// src/styles/global.css @font-face L30-60:
//   - Space Grotesk Variable → display/headings (--font-display)
//   - Manrope Variable        → body (--font-body)
//   - Space Mono 400/700      → labels/mono numerals (--font-mono)
//
// expo-font on NATIVE needs .ttf/.otf (woff2 is not supported), and @fontsource
// ships ONLY .woff2, so the actual .ttf files are NOT in the repo yet. This
// loader is scaffolded against `mobile/assets/fonts/<name>.ttf`; until those
// files land, `loadPulseFonts()` no-ops gracefully (the app falls back to the
// system font and is NOT blocked). The token family names (SpaceGrotesk /
// Manrope / SpaceMono in lib/tokens.ts + tailwind.config.js) already match the
// keys below, so dropping the .ttf files in is a zero-code change.
//
// 🚩 FLAG (Wave 2): add these files, then flip USE_PULSE_FONTS to true —
//   mobile/assets/fonts/SpaceGrotesk-Variable.ttf
//   mobile/assets/fonts/Manrope-Variable.ttf
//   mobile/assets/fonts/SpaceMono-Regular.ttf
//   mobile/assets/fonts/SpaceMono-Bold.ttf

// Flip to true once the .ttf files exist under assets/fonts/. Kept false so the
// static `require()`s below stay commented and the bundler does not fail on
// missing assets during Wave 2 (nav-shell-only) verification.
export const USE_PULSE_FONTS = false;

/**
 * Returns the expo-font map. While USE_PULSE_FONTS is false this is empty, so
 * `useFonts({})` resolves instantly and the shell renders with system fonts.
 * When the .ttf files land, uncomment the requires and flip the flag.
 */
export function pulseFontMap(): Record<string, number> {
  if (!USE_PULSE_FONTS) return {};
  return {
    // SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Variable.ttf'),
    // Manrope: require('../assets/fonts/Manrope-Variable.ttf'),
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // 'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
  };
}
