// Wave 2 — interim exercise demo images (public-domain free-exercise-db).
// Locks: (1) a known CORE_AUTO movement resolves to its small webp; (2) a
// movement WITHOUT a curated image stays null (placeholder, never a wrong
// image); (3) the manifest and the actual public/exercise-media/*.webp files
// stay in sync (no dangling slug, no orphan file shown).

import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getExerciseMedia, getExerciseMediaAlt } from '../../lib/exerciseMedia';

const MEDIA_DIR = join(process.cwd(), 'public', 'exercise-media');

describe('exerciseMedia — interim public-domain images', () => {
  it('a curated CORE_AUTO movement resolves to its small webp by slug', () => {
    const m = getExerciseMedia('Flat Barbell Bench');
    expect(m).not.toBeNull();
    expect(m!.url).toBe('/exercise-media/flat-barbell-bench.webp');
    expect(m!.type).toBe('image');
  });

  it('parens/punctuation in the name slugify to match the filename', () => {
    expect(getExerciseMedia('Barbell Back Squat (High Bar)')!.url)
      .toBe('/exercise-media/barbell-back-squat-high-bar.webp');
  });

  it('a movement OUTSIDE the family graph returns null (placeholder, never wrong image)', () => {
    // Unknown name: no metadata, no equipment_alternatives, no alias → honest gap.
    expect(getExerciseMedia('Some Esoteric Exercise')).toBeNull();
  });

  // Daniel 2026-06-04: "daca dau skip pe principal, la NIMIC nu apare poza" — the
  // skip/substitute flow surfaces broad-library variations that have no own photo.
  // They MUST reuse the nearest same-family photo (equipment_alternatives), not show
  // a blank placeholder.
  it('a skip-substitute variation reuses its nearest same-family photo', () => {
    // Single-Arm / Neutral-Grip DB Press → the flat DB press demo (same movement).
    expect(getExerciseMedia('Single-Arm DB Press')!.url).toBe('/exercise-media/flat-db-press.webp');
    expect(getExerciseMedia('Neutral Grip DB Press')!.url).toBe('/exercise-media/flat-db-press.webp');
    // Low-Incline DB Press → the incline DB press demo.
    expect(getExerciseMedia('Low-Incline DB Press')!.url).toBe('/exercise-media/incline-db-press.webp');
    // Decline DB Press → a chest-press sibling (non-null is the contract).
    expect(getExerciseMedia('Decline DB Press')).not.toBeNull();
  });

  // Antagonist-only / alias gaps the family graph can't reach are hand-mapped to
  // the closest covered sibling (Daniel-approved interim "varianta cealalta").
  it('hand-aliased gaps resolve to the closest covered sibling', () => {
    expect(getExerciseMedia('Tibialis Raise')!.url).toBe('/exercise-media/standing-calf-raise-machine.webp');
    expect(getExerciseMedia('Face Pulls')!.url).toBe('/exercise-media/face-pull.webp');
  });

  it('alt text is the RO demonstration label', () => {
    expect(getExerciseMediaAlt('Flat Barbell Bench')).toMatch(/^Demonstratie /);
  });

  // Integrity: every slug the manifest claims must have a real file, and we don't
  // ship orphan webp files that nothing references. Guards against drift between
  // the generator (scripts/_fetch_exercise_media.cjs) and the committed assets.
  it('manifest <-> public/exercise-media files stay in sync (both frames)', () => {
    expect(existsSync(MEDIA_DIR)).toBe(true);
    const all = readdirSync(MEDIA_DIR).filter((f) => f.endsWith('.webp'));
    // Primary frames (start of movement) = *.webp without the -2 suffix.
    const primaries = all.filter((f) => !f.endsWith('-2.webp')).map((f) => f.replace(/\.webp$/, ''));
    expect(primaries.length).toBeGreaterThanOrEqual(80);
    for (const slug of primaries) {
      const m = getExerciseMedia(slug);
      expect(m, `orphan image not in manifest: ${slug}.webp`).not.toBeNull();
      expect(m!.url).toBe(`/exercise-media/${slug}.webp`);
      // The second frame (end of movement) must exist + be wired.
      expect(existsSync(join(MEDIA_DIR, `${slug}-2.webp`)), `missing 2nd frame: ${slug}-2.webp`).toBe(true);
      expect(m!.url2).toBe(`/exercise-media/${slug}-2.webp`);
    }
  });
});
