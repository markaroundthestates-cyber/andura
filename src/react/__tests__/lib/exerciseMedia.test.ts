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

  it('a movement with NO curated image returns null (placeholder, never wrong image)', () => {
    // Genuinely-missing modern machines free-db lacks → placeholder.
    expect(getExerciseMedia('Tibialis Raise')).toBeNull();
    expect(getExerciseMedia('Glute Drive Machine')).toBeNull();
    expect(getExerciseMedia('Some Esoteric Exercise')).toBeNull();
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
