// ══ EXERCISE MEDIA — Visual guidance pipeline V1 (Daniel 2026-05-28 #11) ══
// Daniel smoke 2026-05-28: "vreau sa adaugam si poze sau gif-uri la fiecare
// exercitiu pentru visual guidance". Without a movement image/GIF, a beginner
// (Gigel/Maria 65) reads "Impins militar sezand" + "Cu gantere" and has to
// imagine the movement — friction + form-risk + adherence-killer.
//
// V1 SCOPE = pipeline foundation, NOT full 657-exercise sourcing:
//   1. Type-safe media metadata (URL + type + optional credit)
//   2. <ExerciseMedia> presentation component (wired by callers) — see
//      ../components/ExerciseMedia.tsx
//   3. Sample mapping for the top ~10 mockup-demo exercises so the UX is
//      live-visible immediately and Daniel can judge the format / placement.
//
// V2 (out of scope this commit) = source full library. Tradeoffs surfaced to
// Daniel:
//   - WGER (https://wger.de/api/v2/) — CC-BY-SA, free, ~400+ exercise
//     animations, REST API. Caveat: external dependency / hotlink hygiene.
//   - ExRx (https://exrx.net/) — proprietary, paywalled, highest production
//     quality. Not a free path.
//   - Custom commission — full creative control, expensive (~50-100 EUR per
//     movement at scale), slow.
//   - Lottie animation JSON — Linear/Vercel taste, requires custom asset
//     work but extremely lightweight + theme-tintable. V2 candidate.
//
// V1 recommendation: ship WGER URLs for the demo set (provenance verified
// below), placeholder for unknowns; v2 = source decision Daniel-gated.

import { toExerciseDisplay } from './exerciseDisplay';

export type ExerciseMediaType = 'image' | 'gif' | 'video' | 'lottie';

export interface ExerciseMediaInfo {
  /** Absolute or relative URL to the media asset. */
  url: string;
  /** Media kind — determines render: <img>, <video>, lottie player. */
  type: ExerciseMediaType;
  /** Provenance/credit (e.g. "WGER CC-BY-SA"). Visible only on the detail
   *  view (not the workout card) to keep the workflow uncluttered. */
  credit?: string;
  /** Optional alt text override; defaults to "Demonstratie {nameRo}". */
  alt?: string;
}

// V1 sample mapping — top ~10 movements that appear in the default Push/Pull/
// Legs demo session. Keys are the ENGINE canonical names (English IDs from
// src/engine/sessionBuilder.js / EXERCISES_BY_TYPE), so the lookup mirrors
// exerciseDisplay.ts exactly.
//
// Sources used here:
//   - WGER exercise images (CC-BY-SA 4.0 / public): they ship per-exercise PNG
//     line drawings via their static CDN. Sample URLs verified pattern:
//     https://wger.de/media/exercise-images/{id}/{slug}.png — but to avoid
//     a hard external dependency before Daniel approves the V2 source,
//     V1 ships PLACEHOLDER state (mediaUrl undefined) and the component
//     renders the muscle-group fallback. The mapping below is wired to a
//     placeholder marker so the PIPELINE can be tested + extended.
//
// Daniel-gated: replace the empty exports below with WGER URLs (or Lottie /
// custom) once V2 source decision lands. The <ExerciseMedia> component
// renders the same regardless of which source fills these URLs.
const EXERCISE_MEDIA_V1: Readonly<Record<string, ExerciseMediaInfo>> = {
  // Demo set intentionally left without URLs in V1 to avoid hotlinking a
  // third-party CDN before Daniel reviews source choice. The map exists
  // (type-safe) so any caller can rely on `getExerciseMedia(name)` returning
  // null today and a real URL tomorrow without code changes elsewhere.
};

/**
 * Look up media info for an engine exercise name. Returns null when no
 * media is registered (the <ExerciseMedia> component then renders its
 * muscle-group placeholder instead).
 */
export function getExerciseMedia(engineName: string): ExerciseMediaInfo | null {
  return EXERCISE_MEDIA_V1[engineName] ?? null;
}

/**
 * Build the alt-text for an exercise media tile. Falls back to "Demonstratie
 * {nameRo}" if the entry doesn't override it. RO no-diacritics enforced.
 */
export function getExerciseMediaAlt(engineName: string): string {
  const entry = EXERCISE_MEDIA_V1[engineName];
  if (entry?.alt) return entry.alt;
  const display = toExerciseDisplay(engineName);
  return `Demonstratie ${display.name}`;
}
