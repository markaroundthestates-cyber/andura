// ══ MUSCLE BODY ANATOMY — sex-specific front/back path sets for MuscleBodyMap ══
// Extracted from MuscleBodyMap so the component stays readable while carrying
// FOUR figure variants (male/female × front/back). Each variant is a neutral,
// naturally-proportioned human figure on a shared 140 × 340 viewBox following the
// 8-head canon (head ≈ 1/8 height ≈ 42px). NOT a gorilla, NOT a stickman.
//
//   - MALE   : broader shoulders (≈2.2 head-widths), straighter torso, narrower hips.
//   - FEMALE : narrower shoulders, defined waist taper, wider hip ratio.
//
// Both views together paint EVERY Big-11 group on a body (front view cannot show
// spate / fese / picioare-hamstrings / gambe — the back view adds them; gambe
// moved back-only 2026-06-11: the front patch read as a green SHIN — Daniel live),
// so no group is legend-only. Group keys are the engine's canonical Big-11 keys.
//
// Region paths are intentionally drawn as muscle-belly shapes (not just outline
// patches) so a per-region radial gradient reads as anatomical depth in the
// component. Multiple paths can share a group key (e.g. left + right pectoral).

export interface Region {
  group: string;
  /** SVG path `d`. */
  path: string;
}

export interface BodyFigure {
  /** Soft body outline drawn behind the colored regions as a neutral base. */
  silhouette: string;
  /** Colored muscle-belly regions for this view. */
  regions: Region[];
}

export type Sex = 'm' | 'f';
export type View = 'front' | 'back';

// ── MALE — FRONT ──────────────────────────────────────────────────────────────
// Broad clavicle line, square pecs, blocky abs column, straight-tapering quads.
const MALE_FRONT: BodyFigure = {
  silhouette:
    // head
    'M70 30 m-16 0 a16 17 0 1 0 32 0 a16 17 0 1 0 -32 0 ' +
    // neck + traps + shoulders + arms + torso + legs (broad-shouldered outline)
    'M65 47 L75 47 L82 60 Q104 64 114 90 L120 150 L118 196 L106 196 L102 150 ' +
    'Q99 118 92 100 L92 176 L96 262 L91 320 L76 320 L71 262 L69 262 L64 320 ' +
    'L49 320 L44 262 L48 176 L48 100 Q41 118 38 150 L34 196 L22 196 L20 150 ' +
    'L26 90 Q36 64 58 60 Z',
  regions: [
    // CHEST — two square pectoral slabs below the clavicle.
    { group: 'piept', path: 'M50 95 Q70 88 70 92 L70 122 Q59 128 48 123 Q45 107 50 95 Z' },
    { group: 'piept', path: 'M90 95 Q70 88 70 92 L70 122 Q81 128 92 123 Q95 107 90 95 Z' },
    // SHOULDERS — broad rounded deltoid caps.
    { group: 'umeri', path: 'M44 90 Q32 88 28 102 Q26 114 35 118 Q47 112 50 99 Q49 92 44 90 Z' },
    { group: 'umeri', path: 'M96 90 Q108 88 112 102 Q114 114 105 118 Q93 112 90 99 Q91 92 96 90 Z' },
    // CORE / ABS — central column, sternum → pelvis.
    { group: 'core', path: 'M57 126 L83 126 L81 172 Q70 179 59 172 Z' },
    // BICEPS — front of upper arm.
    { group: 'biceps', path: 'M35 120 Q28 124 29 142 Q31 154 39 154 Q43 140 42 125 Q40 120 35 120 Z' },
    { group: 'biceps', path: 'M105 120 Q112 124 111 142 Q109 154 101 154 Q97 140 98 125 Q100 120 105 120 Z' },
    // TRICEPS — outer back edge of upper arm (visible on the silhouette flank).
    { group: 'triceps', path: 'M29 122 Q22 128 24 144 Q26 156 32 154 Q30 140 31 126 Q30 122 29 122 Z' },
    { group: 'triceps', path: 'M111 122 Q118 128 116 144 Q114 156 108 154 Q110 140 109 126 Q110 122 111 122 Z' },
    // FOREARMS — lower arm.
    { group: 'antebrate', path: 'M29 156 Q26 168 29 186 Q33 196 39 194 Q41 176 40 158 Q35 154 29 156 Z' },
    { group: 'antebrate', path: 'M111 156 Q114 168 111 186 Q107 196 101 194 Q99 176 100 158 Q105 154 111 156 Z' },
    // QUADS — front of thighs.
    { group: 'picioare-quads', path: 'M54 182 Q47 206 50 246 Q55 262 64 260 Q68 222 68 184 Q61 180 54 182 Z' },
    { group: 'picioare-quads', path: 'M86 182 Q93 206 90 246 Q85 262 76 260 Q72 222 72 184 Q79 180 86 182 Z' },
    // CALVES — back view only (the front patch sat on the SHIN — Daniel 2026-06-11).
  ],
};

// ── MALE — BACK ───────────────────────────────────────────────────────────────
// Mirror outline; paints the posterior chain: spate (lats+upper back), fese
// (glutes), picioare-hamstrings (rear thigh). Shoulders/arms/calves still show.
const MALE_BACK: BodyFigure = {
  silhouette: MALE_FRONT.silhouette,
  regions: [
    // UPPER BACK / LATS — broad V-taper trapezius + latissimus wing.
    { group: 'spate', path: 'M50 92 Q70 86 90 92 L96 120 Q88 150 70 154 Q52 150 44 120 Z' },
    // SHOULDERS — rear deltoid caps.
    { group: 'umeri', path: 'M44 90 Q32 88 28 102 Q26 114 35 118 Q47 112 50 99 Q49 92 44 90 Z' },
    { group: 'umeri', path: 'M96 90 Q108 88 112 102 Q114 114 105 118 Q93 112 90 99 Q91 92 96 90 Z' },
    // TRICEPS — back of upper arm (dominant from behind).
    { group: 'triceps', path: 'M30 120 Q24 124 25 142 Q27 154 35 154 Q39 140 38 125 Q36 120 30 120 Z' },
    { group: 'triceps', path: 'M110 120 Q116 124 115 142 Q113 154 105 154 Q101 140 102 125 Q104 120 110 120 Z' },
    // FOREARMS — lower arm (rear).
    { group: 'antebrate', path: 'M29 156 Q26 168 29 186 Q33 196 39 194 Q41 176 40 158 Q35 154 29 156 Z' },
    { group: 'antebrate', path: 'M111 156 Q114 168 111 186 Q107 196 101 194 Q99 176 100 158 Q105 154 111 156 Z' },
    // GLUTES — two rounded glute masses below the lower back.
    { group: 'fese', path: 'M54 156 Q47 162 49 182 Q56 192 69 188 L69 158 Q62 153 54 156 Z' },
    { group: 'fese', path: 'M86 156 Q93 162 91 182 Q84 192 71 188 L71 158 Q78 153 86 156 Z' },
    // HAMSTRINGS — back of thighs.
    { group: 'picioare-hamstrings', path: 'M54 190 Q49 214 52 250 Q56 262 64 260 Q67 224 67 192 Q61 188 54 190 Z' },
    { group: 'picioare-hamstrings', path: 'M86 190 Q91 214 88 250 Q84 262 76 260 Q73 224 73 192 Q79 188 86 190 Z' },
    // CALVES — rear lower legs.
    { group: 'gambe', path: 'M54 264 Q49 286 54 310 Q58 320 64 318 Q66 290 65 266 Q60 262 54 264 Z' },
    { group: 'gambe', path: 'M86 264 Q91 286 86 310 Q82 320 76 318 Q74 290 75 266 Q80 262 86 264 Z' },
  ],
};

// ── FEMALE — FRONT ──────────────────────────────────────────────────────────────
// Narrower shoulders, defined waist taper at the core, wider hip ratio. Same
// 8-head height; proportions shifted, never exaggerated.
const FEMALE_FRONT: BodyFigure = {
  silhouette:
    // head
    'M70 30 m-15 0 a15 16 0 1 0 30 0 a15 16 0 1 0 -30 0 ' +
    // neck + narrower shoulders + waist taper + wider hips + legs
    'M66 47 L74 47 L80 60 Q98 64 106 92 L111 148 L109 192 L99 192 L95 148 ' +
    'Q92 120 87 102 L84 132 Q82 150 86 168 L94 260 L89 320 L75 320 L71 264 ' +
    'L69 264 L65 320 L51 320 L46 260 L54 168 Q58 150 56 132 L53 102 ' +
    'Q48 120 45 148 L41 192 L31 192 L29 148 L34 92 Q42 64 60 60 Z',
  regions: [
    // CHEST — softer rounded upper-chest mass.
    { group: 'piept', path: 'M51 96 Q70 90 70 94 L70 120 Q60 127 50 121 Q47 107 51 96 Z' },
    { group: 'piept', path: 'M89 96 Q70 90 70 94 L70 120 Q80 127 90 121 Q93 107 89 96 Z' },
    // SHOULDERS — narrower deltoid caps.
    { group: 'umeri', path: 'M47 92 Q37 90 34 102 Q32 112 40 116 Q49 110 51 100 Q50 94 47 92 Z' },
    { group: 'umeri', path: 'M93 92 Q103 90 106 102 Q108 112 100 116 Q91 110 89 100 Q90 94 93 92 Z' },
    // CORE / ABS — narrow waisted column.
    { group: 'core', path: 'M59 124 L81 124 L78 168 Q70 174 62 168 Z' },
    // BICEPS — front of upper arm (slimmer).
    { group: 'biceps', path: 'M38 118 Q32 122 33 138 Q35 150 42 150 Q45 138 44 124 Q42 119 38 118 Z' },
    { group: 'biceps', path: 'M102 118 Q108 122 107 138 Q105 150 98 150 Q95 138 96 124 Q98 119 102 118 Z' },
    // TRICEPS — outer back edge of upper arm.
    { group: 'triceps', path: 'M33 120 Q27 126 28 142 Q30 152 35 150 Q33 138 34 124 Q33 120 33 120 Z' },
    { group: 'triceps', path: 'M107 120 Q113 126 112 142 Q110 152 105 150 Q107 138 106 124 Q107 120 107 120 Z' },
    // FOREARMS — lower arm.
    { group: 'antebrate', path: 'M33 152 Q30 162 33 180 Q37 190 42 188 Q44 172 43 154 Q38 150 33 152 Z' },
    { group: 'antebrate', path: 'M107 152 Q110 162 107 180 Q103 190 98 188 Q96 172 97 154 Q102 150 107 152 Z' },
    // QUADS — front of thighs (wider hip origin, taper to knee).
    { group: 'picioare-quads', path: 'M55 178 Q48 202 51 244 Q56 260 65 258 Q68 220 67 180 Q61 176 55 178 Z' },
    { group: 'picioare-quads', path: 'M85 178 Q92 202 89 244 Q84 260 75 258 Q72 220 73 180 Q79 176 85 178 Z' },
    // CALVES — back view only (the front patch sat on the SHIN — Daniel 2026-06-11).
  ],
};

// ── FEMALE — BACK ────────────────────────────────────────────────────────────────
const FEMALE_BACK: BodyFigure = {
  silhouette: FEMALE_FRONT.silhouette,
  regions: [
    // UPPER BACK / LATS — narrower than male, still a V toward the waist.
    { group: 'spate', path: 'M52 92 Q70 87 88 92 L93 118 Q86 146 70 150 Q54 146 47 118 Z' },
    // SHOULDERS — rear deltoid caps.
    { group: 'umeri', path: 'M47 92 Q37 90 34 102 Q32 112 40 116 Q49 110 51 100 Q50 94 47 92 Z' },
    { group: 'umeri', path: 'M93 92 Q103 90 106 102 Q108 112 100 116 Q91 110 89 100 Q90 94 93 92 Z' },
    // TRICEPS — back of upper arm.
    { group: 'triceps', path: 'M34 120 Q28 124 29 142 Q31 152 38 152 Q42 138 41 124 Q39 119 34 120 Z' },
    { group: 'triceps', path: 'M106 120 Q112 124 111 142 Q109 152 102 152 Q98 138 99 124 Q101 119 106 120 Z' },
    // FOREARMS — lower arm (rear).
    { group: 'antebrate', path: 'M33 152 Q30 162 33 180 Q37 190 42 188 Q44 172 43 154 Q38 150 33 152 Z' },
    { group: 'antebrate', path: 'M107 152 Q110 162 107 180 Q103 190 98 188 Q96 172 97 154 Q102 150 107 152 Z' },
    // GLUTES — wider, rounder mass (hip ratio).
    { group: 'fese', path: 'M53 152 Q45 160 48 182 Q56 193 69 189 L69 154 Q61 149 53 152 Z' },
    { group: 'fese', path: 'M87 152 Q95 160 92 182 Q84 193 71 189 L71 154 Q79 149 87 152 Z' },
    // HAMSTRINGS — back of thighs.
    { group: 'picioare-hamstrings', path: 'M55 191 Q50 214 53 248 Q57 260 65 258 Q67 222 66 192 Q61 188 55 191 Z' },
    { group: 'picioare-hamstrings', path: 'M85 191 Q90 214 87 248 Q83 260 75 258 Q73 222 74 192 Q79 188 85 191 Z' },
    // CALVES — rear lower legs.
    { group: 'gambe', path: 'M55 262 Q50 284 55 308 Q59 318 65 316 Q67 288 66 264 Q61 260 55 262 Z' },
    { group: 'gambe', path: 'M85 262 Q90 284 85 308 Q81 318 75 316 Q73 288 74 264 Q79 260 85 262 Z' },
  ],
};

/** Resolve the figure for a given sex + view (defaults male/front). */
export function getBodyFigure(sex: Sex, view: View): BodyFigure {
  if (sex === 'f') return view === 'back' ? FEMALE_BACK : FEMALE_FRONT;
  return view === 'back' ? MALE_BACK : MALE_FRONT;
}

// ══ PHOTOREAL GLOW REGIONS ════════════════════════════════════════════════════
// The shipped body map is a photoreal grey-anatomy IMAGE (public/body/<sex>-<view>
// .webp) with a colored recovery GLOW painted on top per Big-11 group. Each glow
// is a soft radial blob centered on that muscle, placed with NORMALIZED (0-1)
// coordinates read off the ref-*.jpg color guides — { cx, cy } is the glow center
// as a fraction of the image box (x left→right, y top→bottom), r is its radius as
// a fraction of the box WIDTH. Bilateral muscles get two blobs (left + right).
//
// Coordinates were calibrated against the 4 neutral renders + the ref color maps:
// arms hang at the sides, shoulders ≈0.27 down, chest ≈0.30, core ≈0.40, glutes
// ≈0.50 (back), quads/hams ≈0.62, calves ≈0.82. Same body pose for both sexes
// (the renders share framing), so one coordinate set per VIEW serves both.

export interface GlowRegion {
  group: string;
  /** Glow center X as a fraction of the image box (0 = left, 1 = right). */
  cx: number;
  /** Glow center Y as a fraction of the image box (0 = top, 1 = bottom). */
  cy: number;
  /** Glow radius as a fraction of the image box WIDTH. */
  r: number;
}

// Centers (cx, cy) were SAMPLED from Daniel's own color-coded muscle maps
// (one paint per sex × view, public/body source images) — each Big-11 group
// painted a distinct color, then the median pixel center per color region taken
// as a fraction of the image box (scripts/admin/_sample_muscle_map.cjs). Radii
// are the prior hand-tuned blob sizes (kept — Daniel's note was about POSITION,
// not size; the +21% render multiplier in MuscleBodyMap is applied separately).
// Two manual nudges over the raw sample: FRONT shoulders are pulled outboard onto
// the deltoid cap (the orange paint wraps inboard over the clavicle, dragging the
// centroid toward the sternum), and FRONT core is snapped to body-center.
// Sex-specific now (4 tables) because the maps genuinely differ — female narrower
// shoulders, different chest/hip ratios.
const MALE_FRONT_GLOWS: GlowRegion[] = [
  // Shoulders: enlarged + seated on the deltoid cap (the small outboard blob read
  // as "uncolored" over the bright delt under the screen blend — Daniel live).
  // cy 0.285→0.24 (Daniel live 2026-06-11: glow sat ~0.3cm low on the delt/biceps
  // boundary; the cap center reads ≈0.24 on the male render).
  { group: 'umeri', cx: 0.32, cy: 0.24, r: 0.1 },
  { group: 'umeri', cx: 0.68, cy: 0.24, r: 0.1 },
  { group: 'piept', cx: 0.431, cy: 0.256, r: 0.095 },
  { group: 'piept', cx: 0.564, cy: 0.256, r: 0.095 },
  { group: 'biceps', cx: 0.326, cy: 0.32, r: 0.06 },
  { group: 'biceps', cx: 0.669, cy: 0.322, r: 0.06 },
  { group: 'triceps', cx: 0.298, cy: 0.326, r: 0.05 },
  { group: 'triceps', cx: 0.694, cy: 0.332, r: 0.05 },
  { group: 'antebrate', cx: 0.28, cy: 0.405, r: 0.06 },
  { group: 'antebrate', cx: 0.716, cy: 0.407, r: 0.06 },
  { group: 'core', cx: 0.5, cy: 0.364, r: 0.1 },
  { group: 'picioare-quads', cx: 0.402, cy: 0.552, r: 0.085 },
  { group: 'picioare-quads', cx: 0.592, cy: 0.551, r: 0.085 },
  // CALVES — intentionally NOT painted on the front (Daniel live 2026-06-11: the
  // front blob read as a green TIBIA; gambe paints on the BACK view, which keeps
  // every Big-11 group on a body).
];

const MALE_BACK_GLOWS: GlowRegion[] = [
  // BACK is one engine group (spate = traps + lats + erectors + intercostals);
  // a single blob left the traps/lats/lower-back grey, so it's spread across the
  // whole posterior chain — all the SAME back-recovery color (Daniel live).
  { group: 'spate', cx: 0.49, cy: 0.205, r: 0.09 }, // traps / upper back
  { group: 'spate', cx: 0.405, cy: 0.315, r: 0.085 }, // lat (left)
  { group: 'spate', cx: 0.585, cy: 0.315, r: 0.085 }, // lat (right)
  { group: 'spate', cx: 0.49, cy: 0.4, r: 0.08 }, // lower back / erectors
  { group: 'spate', cx: 0.37, cy: 0.4, r: 0.05 }, // intercostals (left)
  { group: 'spate', cx: 0.62, cy: 0.4, r: 0.05 }, // intercostals (right)
  { group: 'umeri', cx: 0.344, cy: 0.233, r: 0.075 },
  { group: 'umeri', cx: 0.645, cy: 0.236, r: 0.075 },
  { group: 'triceps', cx: 0.316, cy: 0.335, r: 0.06 },
  { group: 'triceps', cx: 0.676, cy: 0.324, r: 0.06 },
  { group: 'antebrate', cx: 0.259, cy: 0.415, r: 0.06 },
  { group: 'antebrate', cx: 0.734, cy: 0.417, r: 0.06 },
  { group: 'fese', cx: 0.398, cy: 0.459, r: 0.085 },
  { group: 'fese', cx: 0.587, cy: 0.459, r: 0.085 },
  { group: 'picioare-hamstrings', cx: 0.394, cy: 0.604, r: 0.085 },
  { group: 'picioare-hamstrings', cx: 0.605, cy: 0.597, r: 0.085 },
  { group: 'gambe', cx: 0.399, cy: 0.729, r: 0.065 },
  { group: 'gambe', cx: 0.589, cy: 0.726, r: 0.065 },
];

const FEMALE_FRONT_GLOWS: GlowRegion[] = [
  // Shoulders: enlarged + seated on the deltoid (see MALE_FRONT note).
  // cy 0.305→0.26 (same ~0.3cm lift as male — the cap center reads ≈0.25-0.26 on
  // the female render; the sampled paint wrapped low).
  { group: 'umeri', cx: 0.34, cy: 0.26, r: 0.095 },
  { group: 'umeri', cx: 0.66, cy: 0.26, r: 0.095 },
  { group: 'piept', cx: 0.44, cy: 0.258, r: 0.095 },
  { group: 'piept', cx: 0.554, cy: 0.256, r: 0.095 },
  { group: 'biceps', cx: 0.347, cy: 0.308, r: 0.06 },
  { group: 'biceps', cx: 0.647, cy: 0.308, r: 0.06 },
  { group: 'triceps', cx: 0.323, cy: 0.326, r: 0.05 },
  { group: 'triceps', cx: 0.671, cy: 0.328, r: 0.05 },
  { group: 'antebrate', cx: 0.3, cy: 0.407, r: 0.06 },
  { group: 'antebrate', cx: 0.695, cy: 0.405, r: 0.06 },
  { group: 'core', cx: 0.5, cy: 0.369, r: 0.1 },
  { group: 'picioare-quads', cx: 0.402, cy: 0.543, r: 0.085 },
  { group: 'picioare-quads', cx: 0.592, cy: 0.542, r: 0.085 },
  // CALVES — intentionally NOT painted on the front (see MALE_FRONT_GLOWS note).
];

const FEMALE_BACK_GLOWS: GlowRegion[] = [
  // BACK spread across the whole posterior chain (see MALE_BACK note) — narrower.
  { group: 'spate', cx: 0.487, cy: 0.23, r: 0.085 }, // traps / upper back
  { group: 'spate', cx: 0.415, cy: 0.33, r: 0.08 }, // lat (left)
  { group: 'spate', cx: 0.578, cy: 0.33, r: 0.08 }, // lat (right)
  { group: 'spate', cx: 0.487, cy: 0.42, r: 0.075 }, // lower back / erectors
  { group: 'spate', cx: 0.39, cy: 0.42, r: 0.045 }, // intercostals (left)
  { group: 'spate', cx: 0.605, cy: 0.42, r: 0.045 }, // intercostals (right)
  { group: 'umeri', cx: 0.367, cy: 0.238, r: 0.075 },
  { group: 'umeri', cx: 0.63, cy: 0.239, r: 0.075 },
  { group: 'triceps', cx: 0.333, cy: 0.311, r: 0.06 },
  { group: 'triceps', cx: 0.654, cy: 0.297, r: 0.06 },
  { group: 'antebrate', cx: 0.288, cy: 0.42, r: 0.06 },
  { group: 'antebrate', cx: 0.703, cy: 0.411, r: 0.06 },
  { group: 'fese', cx: 0.412, cy: 0.461, r: 0.085 },
  { group: 'fese', cx: 0.578, cy: 0.461, r: 0.085 },
  { group: 'picioare-hamstrings', cx: 0.408, cy: 0.601, r: 0.085 },
  { group: 'picioare-hamstrings', cx: 0.584, cy: 0.602, r: 0.085 },
  { group: 'gambe', cx: 0.412, cy: 0.74, r: 0.065 },
  { group: 'gambe', cx: 0.572, cy: 0.738, r: 0.065 },
];

/** Public path to the photoreal neutral base for a sex + view. */
export function getBodyImageSrc(sex: Sex, view: View): string {
  const s = sex === 'f' ? 'female' : 'male';
  return `/body/${s}-${view}.webp`;
}

/** Normalized glow placement for a given sex + view (sampled from the ref maps). */
export function getGlowRegions(sex: Sex, view: View): GlowRegion[] {
  if (sex === 'f') return view === 'back' ? FEMALE_BACK_GLOWS : FEMALE_FRONT_GLOWS;
  return view === 'back' ? MALE_BACK_GLOWS : MALE_FRONT_GLOWS;
}
