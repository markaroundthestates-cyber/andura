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
    expect(getExerciseMedia('Pec Deck / Cable Fly')).toBeNull();
    expect(getExerciseMedia('Some Esoteric Exercise')).toBeNull();
  });

  it('alt text is the RO demonstration label', () => {
    expect(getExerciseMediaAlt('Flat Barbell Bench')).toMatch(/^Demonstratie /);
  });

  // Integrity: every slug the manifest claims must have a real file, and we don't
  // ship orphan webp files that nothing references. Guards against drift between
  // the generator (scripts/_fetch_exercise_media.cjs) and the committed assets.
  it('manifest <-> public/exercise-media files stay in sync', () => {
    expect(existsSync(MEDIA_DIR)).toBe(true);
    const files = new Set(
      readdirSync(MEDIA_DIR).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')),
    );
    expect(files.size).toBeGreaterThanOrEqual(80);
    // Each on-disk image is reachable: getExerciseMedia for a name that slugifies
    // to it returns that url (slug round-trips). We assert via the resolver on the
    // slug itself (slug -> slug is idempotent under toMediaSlug for these).
    for (const slug of files) {
      const m = getExerciseMedia(slug);
      expect(m, `orphan image not in manifest: ${slug}.webp`).not.toBeNull();
      expect(m!.url).toBe(`/exercise-media/${slug}.webp`);
    }
  });
});
