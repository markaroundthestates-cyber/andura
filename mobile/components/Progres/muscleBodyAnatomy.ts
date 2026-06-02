// ══ MUSCLE BODY ANATOMY (RN port) — sex-specific glow regions + image sources ══
// RN twin of src/react/components/Progres/muscleBodyAnatomy.ts. The PURE data —
// per-view Big-11 GLOW REGION coordinates (normalized 0-1) — is identical to the
// web module (single anatomical source of truth). Two web-only bits change:
//   1. getBodyImageSrc returned a public URL string (`/body/<sex>-<view>.webp`);
//      RN bundles assets, so it returns the static `require()` module id (number)
//      that <Image source={...}> consumes.
//   2. The hand-drawn SVG fallback figure (getBodyFigure) was the web's <img>
//      onError graceful-degrade. Bundled RN assets via require() always resolve
//      (they're packaged), so the fallback figure paths are NOT ported — they
//      would never render. The discrete glow placement is what the RN body map
//      paints on top of the photoreal base.

export type Sex = 'm' | 'f';
export type View = 'front' | 'back';

// ══ PHOTOREAL GLOW REGIONS ════════════════════════════════════════════════════
// Each glow is a soft radial blob centered on a muscle, placed with NORMALIZED
// (0-1) coordinates: { cx, cy } is the glow center as a fraction of the image box
// (x left→right, y top→bottom), r is its radius as a fraction of the box WIDTH.
// Bilateral muscles get two blobs (left + right). Same coordinates as the web —
// calibrated against the 4 neutral renders. One set per VIEW serves both sexes
// (the renders share framing).

export interface GlowRegion {
  group: string;
  /** Glow center X as a fraction of the image box (0 = left, 1 = right). */
  cx: number;
  /** Glow center Y as a fraction of the image box (0 = top, 1 = bottom). */
  cy: number;
  /** Glow radius as a fraction of the image box WIDTH. */
  r: number;
}

// Image-space body landmarks (the renders are framed near-identically per view).
const FRONT_GLOWS: GlowRegion[] = [
  // SHOULDERS — deltoid caps, outer top of torso.
  { group: 'umeri', cx: 0.315, cy: 0.285, r: 0.075 },
  { group: 'umeri', cx: 0.685, cy: 0.285, r: 0.075 },
  // CHEST — two pectoral masses below the clavicle.
  { group: 'piept', cx: 0.42, cy: 0.305, r: 0.095 },
  { group: 'piept', cx: 0.58, cy: 0.305, r: 0.095 },
  // BICEPS — front upper arm.
  { group: 'biceps', cx: 0.285, cy: 0.355, r: 0.06 },
  { group: 'biceps', cx: 0.715, cy: 0.355, r: 0.06 },
  // TRICEPS — outer/back upper-arm edge (slightly outboard of biceps).
  { group: 'triceps', cx: 0.245, cy: 0.36, r: 0.05 },
  { group: 'triceps', cx: 0.755, cy: 0.36, r: 0.05 },
  // FOREARMS — lower arm.
  { group: 'antebrate', cx: 0.265, cy: 0.46, r: 0.06 },
  { group: 'antebrate', cx: 0.735, cy: 0.46, r: 0.06 },
  // CORE / ABS — central column.
  { group: 'core', cx: 0.5, cy: 0.41, r: 0.1 },
  // QUADS — front of thighs.
  { group: 'picioare-quads', cx: 0.42, cy: 0.62, r: 0.085 },
  { group: 'picioare-quads', cx: 0.58, cy: 0.62, r: 0.085 },
  // CALVES — lower legs.
  { group: 'gambe', cx: 0.435, cy: 0.84, r: 0.055 },
  { group: 'gambe', cx: 0.565, cy: 0.84, r: 0.055 },
];

const BACK_GLOWS: GlowRegion[] = [
  // UPPER BACK / LATS — broad V across the upper torso.
  { group: 'spate', cx: 0.5, cy: 0.32, r: 0.13 },
  // SHOULDERS — rear deltoid caps.
  { group: 'umeri', cx: 0.315, cy: 0.285, r: 0.075 },
  { group: 'umeri', cx: 0.685, cy: 0.285, r: 0.075 },
  // TRICEPS — back of upper arm (dominant from behind).
  { group: 'triceps', cx: 0.255, cy: 0.37, r: 0.06 },
  { group: 'triceps', cx: 0.745, cy: 0.37, r: 0.06 },
  // FOREARMS — lower arm (rear).
  { group: 'antebrate', cx: 0.265, cy: 0.46, r: 0.06 },
  { group: 'antebrate', cx: 0.735, cy: 0.46, r: 0.06 },
  // GLUTES — two rounded masses below the lower back.
  { group: 'fese', cx: 0.44, cy: 0.505, r: 0.085 },
  { group: 'fese', cx: 0.56, cy: 0.505, r: 0.085 },
  // HAMSTRINGS — back of thighs.
  { group: 'picioare-hamstrings', cx: 0.43, cy: 0.65, r: 0.085 },
  { group: 'picioare-hamstrings', cx: 0.57, cy: 0.65, r: 0.085 },
  // CALVES — rear lower legs.
  { group: 'gambe', cx: 0.43, cy: 0.83, r: 0.065 },
  { group: 'gambe', cx: 0.57, cy: 0.83, r: 0.065 },
];

// RN bundled assets — static require() ids per sex + view (Metro resolves webp
// natively). Indexed below by getBodyImage. The require calls are top-level so
// Metro statically bundles each asset.
const BODY_IMAGES = {
  m: {
    front: require('../../assets/body/male-front.webp'),
    back: require('../../assets/body/male-back.webp'),
  },
  f: {
    front: require('../../assets/body/female-front.webp'),
    back: require('../../assets/body/female-back.webp'),
  },
} as const;

/** RN image source (require module id) for the photoreal neutral base. */
export function getBodyImage(sex: Sex, view: View): number {
  const s = sex === 'f' ? 'f' : 'm';
  return BODY_IMAGES[s][view];
}

/** Normalized glow placement for a given view (shared across sexes — same pose). */
export function getGlowRegions(view: View): GlowRegion[] {
  return view === 'back' ? BACK_GLOWS : FRONT_GLOWS;
}
