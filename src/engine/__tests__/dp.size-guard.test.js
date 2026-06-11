// ══ DP SIZE GUARD — growth moratorium ratchet ═══════════════════════════
// dp.js is the legacy monolith (2826 LOC at moratorium time 2026-06). New
// logic must go into dp/<submodule> (21 already exist), NOT into dp.js. This
// test reads dp.js's line count and FAILS if it exceeds DP_LINE_CEILING — a
// ratchet set slightly above current so the file cannot grow.
//
// If you legitimately reduced dp.js below the ceiling, RATCHET DOWN the ceiling
// here to lock in the win. NEVER ratchet UP to admit new dp.js logic — extract
// to a dp/<submodule> instead.
//
// ONE documented exception 2026-06-11 (2850→2854): the id-migration Phase 2 read
// seam. Its LOGIC was extracted to dp/logIdentity.js (per the rule); the +4 here
// is the irreducible CALL-SITE WIRING in getLogs + _loggedExerciseNames (the
// import line + two helper calls + one-line breadcrumbs) — not new logic in
// dp.js. Ratchet-down-only resumes from 2854.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ceiling = current line count. Ratchet DOWN only (one documented +4 exception
// 2026-06-11 for the id-migration call-site wiring — see header).
const DP_LINE_CEILING = 2854;

describe('dp.js growth moratorium', () => {
  it('dp.js stays at or below the line ceiling (extract new logic to dp/<submodule>)', () => {
    const src = readFileSync(resolve(__dirname, '../dp.js'), 'utf8');
    const lineCount = src.split('\n').length;
    expect(lineCount).toBeLessThanOrEqual(DP_LINE_CEILING);
  });
});
